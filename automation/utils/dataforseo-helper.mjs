/**
 * DataForSEO API Helper
 * Real keyword research data integration
 *
 * Setup:
 * 1. Sign up at https://dataforseo.com/
 * 2. Get your login/password from dashboard
 * 3. Add to .env.local:
 *    DATAFORSEO_LOGIN=your_login
 *    DATAFORSEO_PASSWORD=your_password
 *
 * Pricing: ~$0.05-0.075 per keyword research request
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const API_BASE = 'https://api.dataforseo.com/v3';

function getAuthHeader() {
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Get keyword ideas and search volume for a seed keyword
 */
export async function getKeywordIdeas(keyword, location = 'Australia', language = 'en') {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not configured. Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to .env.local');
  }

  const requestBody = [{
    keyword,
    location_name: location,
    language_name: language,
    include_seed_keyword: true,
    include_serp_info: true,
    limit: 100,
    filters: [
      ["keyword_info.search_volume", ">", 10] // Only keywords with 10+ searches/month
    ],
    order_by: ["keyword_info.search_volume,desc"]
  }];

  try {
    const response = await fetch(`${API_BASE}/keywords_data/google_ads/search_volume/live`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message}`);
    }

    const results = data.tasks[0]?.result;
    if (!results || results.length === 0) {
      return [];
    }

    return results.map(item => ({
      keyword: item.keyword,
      searchVolume: item.keyword_info?.search_volume || 0,
      competition: item.keyword_info?.competition || 'UNKNOWN',
      competitionIndex: item.keyword_info?.competition_index || 0,
      cpcUsd: item.keyword_info?.cpc || 0,
      lowTopOfPageBid: item.keyword_info?.low_top_of_page_bid_usd || 0,
      highTopOfPageBid: item.keyword_info?.high_top_of_page_bid_usd || 0,
      monthlySearches: item.keyword_info?.monthly_searches || []
    }));
  } catch (err) {
    throw new Error(`Failed to fetch keyword data: ${err.message}`);
  }
}

/**
 * Get SERP analysis for a keyword
 */
export async function getSerpAnalysis(keyword, location = 'Australia') {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not configured');
  }

  const requestBody = [{
    keyword,
    location_name: location,
    language_name: 'English',
    device: 'desktop',
    os: 'windows',
    depth: 100
  }];

  try {
    const response = await fetch(`${API_BASE}/serp/google/organic/live/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message}`);
    }

    const items = data.tasks[0]?.result[0]?.items || [];

    return items
      .filter(item => item.type === 'organic')
      .map(item => ({
        position: item.rank_absolute,
        url: item.url,
        domain: item.domain,
        title: item.title,
        description: item.description,
        breadcrumb: item.breadcrumb,
        isAmp: item.is_amp || false,
        rating: item.rating?.value || null
      }));
  } catch (err) {
    throw new Error(`Failed to fetch SERP data: ${err.message}`);
  }
}

/**
 * Get related keywords and questions
 */
export async function getRelatedKeywords(keyword, location = 'Australia') {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not configured');
  }

  const requestBody = [{
    keyword,
    location_name: location,
    language_name: 'English',
    include_seed_keyword: false,
    filters: [
      ["keyword_info.search_volume", ">", 5]
    ],
    limit: 50
  }];

  try {
    const response = await fetch(`${API_BASE}/keywords_data/google_ads/keywords_for_keywords/live`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message}`);
    }

    const results = data.tasks[0]?.result;
    if (!results || results.length === 0) {
      return [];
    }

    return results.map(item => ({
      keyword: item.keyword,
      searchVolume: item.keyword_info?.search_volume || 0,
      competition: item.keyword_info?.competition || 'UNKNOWN'
    }));
  } catch (err) {
    throw new Error(`Failed to fetch related keywords: ${err.message}`);
  }
}

/**
 * Get comprehensive keyword research for blog post planning
 */
export async function researchKeyword(keyword, location = 'Australia') {
  console.log(`\n🔍 Researching keyword: "${keyword}"\n`);

  const [ideas, related, serp] = await Promise.all([
    getKeywordIdeas(keyword, location),
    getRelatedKeywords(keyword, location).catch(() => []),
    getSerpAnalysis(keyword, location).catch(() => [])
  ]);

  const mainKeywordData = ideas.find(k => k.keyword.toLowerCase() === keyword.toLowerCase()) || ideas[0];

  return {
    mainKeyword: {
      keyword,
      searchVolume: mainKeywordData?.searchVolume || 0,
      competition: mainKeywordData?.competition || 'UNKNOWN',
      difficulty: serp.length > 0 ? 'See SERP analysis' : 'Unknown',
      cpcUsd: mainKeywordData?.cpcUsd || 0
    },
    relatedKeywords: ideas.slice(0, 20),
    questions: related.filter(k =>
      k.keyword.toLowerCase().includes('how') ||
      k.keyword.toLowerCase().includes('what') ||
      k.keyword.toLowerCase().includes('why') ||
      k.keyword.toLowerCase().includes('when') ||
      k.keyword.toLowerCase().includes('where')
    ).slice(0, 10),
    topCompetitors: serp.slice(0, 10),
    contentSuggestions: {
      targetWordCount: serp.length > 0 ? 'Match top 3 competitors' : '1500-2500',
      includeQuestions: related.filter(k => k.keyword.includes('?')).length > 0,
      recommendedFormat: serp.some(s => s.title.includes('Guide') || s.title.includes('How to')) ?
        'Comprehensive guide' : 'Informative article'
    }
  };
}

/**
 * Get keyword difficulty score
 */
export async function getKeywordDifficulty(keywords, location = 'Australia') {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not configured');
  }

  const requestBody = [{
    keywords: Array.isArray(keywords) ? keywords : [keywords],
    location_name: location,
    language_name: 'English'
  }];

  try {
    const response = await fetch(`${API_BASE}/dataforseo_labs/google/keyword_difficulty/live`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message}`);
    }

    const results = data.tasks[0]?.result || [];

    return results.map(item => ({
      keyword: item.keyword,
      difficulty: item.keyword_difficulty,
      difficultyLevel:
        item.keyword_difficulty >= 80 ? 'Very Hard' :
        item.keyword_difficulty >= 60 ? 'Hard' :
        item.keyword_difficulty >= 40 ? 'Medium' :
        item.keyword_difficulty >= 20 ? 'Easy' : 'Very Easy'
    }));
  } catch (err) {
    throw new Error(`Failed to get keyword difficulty: ${err.message}`);
  }
}

export default {
  getKeywordIdeas,
  getSerpAnalysis,
  getRelatedKeywords,
  researchKeyword,
  getKeywordDifficulty
};
