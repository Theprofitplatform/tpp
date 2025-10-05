/**
 * Cloudflare Pages Function for Keyword Research
 * Analyzes seed keywords and returns relevant keyword suggestions
 *
 * Data sources (in priority order):
 * 1. Claude AI + Google Autocomplete (FREE - uses your Anthropic API key)
 * 2. DataForSEO API (paid - requires credentials)
 * 3. Sample data (fallback for demo/preview)
 */

import { generateKeywordsWithClaude } from './keyword-research-claude.js';
import { fetchDataForSEOKeywords } from './keyword-research-dataforseo-direct.js';

// Static keyword database (fallback)
const defaultKeywords = [
  // Primary SEO Services Keywords
  { keyword: 'digital marketing Sydney', volume: '2900', difficulty: 'Medium', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'SEO services Sydney', volume: '1600', difficulty: 'Medium', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'SEO agency Sydney', volume: '1300', difficulty: 'Medium', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'Google Ads management Sydney', volume: '720', difficulty: 'Low', intent: 'Buyer', priority: 'high', type: 'short' },
  { keyword: 'web design Sydney', volume: '3600', difficulty: 'High', intent: 'Mixed', priority: 'medium', type: 'short' },
  { keyword: 'digital marketing agency Sydney', volume: '880', difficulty: 'Medium', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'SEO consultant Sydney', volume: '390', difficulty: 'Low', intent: 'Commercial', priority: 'medium', type: 'short' },
  { keyword: 'PPC management Sydney', volume: '210', difficulty: 'Low', intent: 'Buyer', priority: 'medium', type: 'short' },
  { keyword: 'local SEO Sydney', volume: '320', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'search engine optimization Sydney', volume: '480', difficulty: 'Medium', intent: 'Commercial', priority: 'medium', type: 'short' },

  // Service-Specific Keywords
  { keyword: 'Google My Business optimization Sydney', volume: '170', difficulty: 'Low', intent: 'Buyer', priority: 'high', type: 'long-tail' },
  { keyword: 'website SEO audit Sydney', volume: '140', difficulty: 'Low', intent: 'Buyer', priority: 'high', type: 'short' },
  { keyword: 'link building services Sydney', volume: '110', difficulty: 'Low', intent: 'Buyer', priority: 'medium', type: 'short' },
  { keyword: 'content marketing Sydney', volume: '320', difficulty: 'Medium', intent: 'Commercial', priority: 'medium', type: 'short' },

  // Long-tail Question-Based Keywords
  { keyword: 'how much does SEO cost in Sydney', volume: '90', difficulty: 'Low', intent: 'Informational', priority: 'high', type: 'long-tail' },
  { keyword: 'best SEO agency in Sydney', volume: '260', difficulty: 'Medium', intent: 'Commercial', priority: 'high', type: 'long-tail' },
  { keyword: 'how to rank on Google Sydney', volume: '70', difficulty: 'Low', intent: 'Informational', priority: 'medium', type: 'long-tail' },
  { keyword: 'what is local SEO', volume: '1000', difficulty: 'Low', intent: 'Informational', priority: 'medium', type: 'short' },
  { keyword: 'how long does SEO take to work', volume: '880', difficulty: 'Low', intent: 'Informational', priority: 'medium', type: 'long-tail' },
  { keyword: 'Google Ads vs SEO which is better', volume: '320', difficulty: 'Low', intent: 'Informational', priority: 'high', type: 'long-tail' },
  { keyword: 'how to get more customers online', volume: '590', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'long-tail' },
  { keyword: 'how to improve website ranking', volume: '720', difficulty: 'Low', intent: 'Informational', priority: 'medium', type: 'long-tail' },

  // Location-Based Long-tail
  { keyword: 'small business marketing Sydney', volume: '480', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'affordable SEO Sydney', volume: '170', difficulty: 'Low', intent: 'Buyer', priority: 'high', type: 'short' },
  { keyword: 'cheap Google Ads Sydney', volume: '90', difficulty: 'Low', intent: 'Buyer', priority: 'medium', type: 'short' },
  { keyword: 'local business marketing Sydney', volume: '210', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'ecommerce SEO Sydney', volume: '140', difficulty: 'Low', intent: 'Buyer', priority: 'medium', type: 'short' },
  { keyword: 'Shopify SEO Sydney', volume: '110', difficulty: 'Low', intent: 'Buyer', priority: 'medium', type: 'short' },

  // Suburb-specific keywords
  { keyword: 'SEO services Parramatta', volume: '50', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'digital marketing Bondi', volume: '30', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'SEO agency Manly', volume: '20', difficulty: 'Low', intent: 'Commercial', priority: 'medium', type: 'short' },
  { keyword: 'marketing agency Chatswood', volume: '40', difficulty: 'Low', intent: 'Commercial', priority: 'high', type: 'short' },
  { keyword: 'SEO Penrith', volume: '30', difficulty: 'Low', intent: 'Commercial', priority: 'medium', type: 'short' },
  { keyword: 'digital marketing Liverpool', volume: '35', difficulty: 'Low', intent: 'Commercial', priority: 'medium', type: 'short' },
];

// Generate location-based keyword variations
function generateLocationVariations(baseKeyword, location) {
  const variations = [];
  const locationLower = location.toLowerCase();

  // If location is not "Sydney, Australia", add specific suburb variations
  if (!locationLower.includes('sydney, australia')) {
    const suburb = location.split(',')[0].trim();
    variations.push({
      keyword: `${baseKeyword} ${suburb}`,
      volume: Math.floor(Math.random() * 100 + 20).toString(),
      difficulty: 'Low',
      intent: 'Commercial',
      priority: 'high',
      type: baseKeyword.split(' ').length > 3 ? 'long-tail' : 'short'
    });

    variations.push({
      keyword: `${baseKeyword} near ${suburb}`,
      volume: Math.floor(Math.random() * 50 + 10).toString(),
      difficulty: 'Low',
      intent: 'Commercial',
      priority: 'medium',
      type: 'long-tail'
    });
  }

  return variations;
}

// Filter keywords by intent
function filterByIntent(keywords, intent) {
  if (intent === 'all') return keywords;

  const intentMap = {
    'commercial': ['Commercial', 'Buyer', 'Mixed'],
    'informational': ['Informational'],
    'transactional': ['Buyer'],
    'navigational': ['Commercial']
  };

  const allowedIntents = intentMap[intent] || [];
  return keywords.filter(kw => allowedIntents.includes(kw.intent));
}

// Generate keyword clusters
function generateClusters(keywords) {
  const clusters = {
    'SEO Services': [],
    'Google Ads': [],
    'Web Design': [],
    'Local SEO': [],
    'Content Marketing': [],
    'Questions & Research': []
  };

  keywords.forEach(kw => {
    const keywordLower = kw.keyword.toLowerCase();

    if (keywordLower.includes('seo') && !keywordLower.includes('google ads')) {
      clusters['SEO Services'].push(kw.keyword);
    } else if (keywordLower.includes('google ads') || keywordLower.includes('ppc')) {
      clusters['Google Ads'].push(kw.keyword);
    } else if (keywordLower.includes('web design') || keywordLower.includes('website')) {
      clusters['Web Design'].push(kw.keyword);
    } else if (keywordLower.includes('local') || keywordLower.includes('google my business')) {
      clusters['Local SEO'].push(kw.keyword);
    } else if (keywordLower.includes('content') || keywordLower.includes('marketing')) {
      clusters['Content Marketing'].push(kw.keyword);
    } else if (keywordLower.includes('how') || keywordLower.includes('what') || keywordLower.includes('why')) {
      clusters['Questions & Research'].push(kw.keyword);
    }
  });

  // Convert to array format and filter empty clusters
  return Object.entries(clusters)
    .filter(([name, keywords]) => keywords.length > 0)
    .map(([name, keywords]) => ({ name, keywords: keywords.slice(0, 8) }));
}

// Main research function
function researchKeywords(seedKeyword, location, intent) {
  try {
    let allKeywords = [...defaultKeywords];

    // Filter keywords related to the seed keyword
    const seedLower = seedKeyword.toLowerCase();
    let relevantKeywords = allKeywords.filter(kw => {
      const kwLower = kw.keyword.toLowerCase();
      const seedWords = seedLower.split(' ');
      return seedWords.some(word => kwLower.includes(word));
    });

    // If no relevant keywords found, return broader results
    if (relevantKeywords.length === 0) {
      relevantKeywords = allKeywords.slice(0, 20);
    }

    // Add location variations
    const locationVariations = generateLocationVariations(seedKeyword, location);
    relevantKeywords = [...relevantKeywords, ...locationVariations];

    // Filter by intent
    relevantKeywords = filterByIntent(relevantKeywords, intent);

    // Sort by priority and volume
    relevantKeywords.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return parseInt(b.volume) - parseInt(a.volume);
    });

    // Limit to 30 results
    relevantKeywords = relevantKeywords.slice(0, 30);

    // Calculate average volume
    const avgVolume = relevantKeywords.length > 0
      ? Math.floor(relevantKeywords.reduce((sum, kw) => sum + parseInt(kw.volume), 0) / relevantKeywords.length)
      : 0;

    // Generate clusters
    const clusters = generateClusters(relevantKeywords);

    return {
      keywords: relevantKeywords,
      avgVolume: avgVolume.toString(),
      clusters
    };
  } catch (error) {
    console.error('❌ Error in keyword research:', error);
    throw error;
  }
}

export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, location, intent } = await request.json();

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    let dataSource = 'sample';

    // Priority 1: Try Claude AI (FREE - uses your Anthropic API key)
    try {
      if (env.ANTHROPIC_API_KEY) {
        console.log('🤖 Using Claude AI + Google Autocomplete (FREE)');
        result = await generateKeywordsWithClaude(env, keyword, location || 'Sydney, Australia', intent || 'all');
        dataSource = result.dataSource || 'claude-ai';
      } else if (env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD) {
        // Priority 2: DataForSEO API (paid fallback)
        console.log('📊 Using DataForSEO API (paid)');
        result = await fetchDataForSEOKeywords(env, keyword, location || 'Sydney, Australia');
        dataSource = 'dataforseo';
      } else {
        // Priority 3: Sample data
        console.log('⚠️ No API keys configured, using sample data');
        throw new Error('NO_API_KEYS_CONFIGURED');
      }
    } catch (apiError) {
      // Fallback to sample data on any error
      console.log('⚠️ API error, falling back to sample data:', apiError.message);
      result = researchKeywords(keyword, location || 'Sydney, Australia', intent || 'all');
      dataSource = 'sample';
    }

    // Add metadata about data source
    result.dataSource = dataSource;

    // Set data quality label
    if (dataSource === 'dataforseo') {
      result.dataQuality = 'real';
    } else if (dataSource === 'claude-ai' || dataSource.includes('claude')) {
      result.dataQuality = 'ai-enhanced';
    } else {
      result.dataQuality = 'sample';
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': dataSource.includes('claude') ? 'public, max-age=1800' : dataSource === 'dataforseo' ? 'public, max-age=3600' : 'public, max-age=300',
          'X-Data-Source': dataSource,
          'X-Data-Quality': result.dataQuality,
        }
      }
    );

  } catch (error) {
    console.error('Keyword Research error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to research keywords'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
