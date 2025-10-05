const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'ranking-history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize history file if it doesn't exist
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({ checks: [] }, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rank checking endpoint
app.post('/api/rank-check', async (req, res) => {
  try {
    const { keyword, website, location = 'Australia', device = 'desktop' } = req.body;

    if (!keyword || !website) {
      return res.status(400).json({ 
        error: 'Missing required fields: keyword and website are required' 
      });
    }

    // Normalize website URL
    const normalizedWebsite = website.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Call SerpAPI
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      return res.status(500).json({ error: 'SerpAPI key not configured' });
    }

    // Perform desktop search if needed
    let desktopResults = null;
    if (device === 'desktop' || device === 'both') {
      desktopResults = await searchGoogle(keyword, location, 'desktop', serpApiKey);
    }

    // Perform mobile search if needed
    let mobileResults = null;
    if (device === 'mobile' || device === 'both') {
      mobileResults = await searchGoogle(keyword, location, 'mobile', serpApiKey);
    }

    // Find rankings
    const desktopRank = desktopResults ? findRanking(desktopResults.organic_results, normalizedWebsite) : null;
    const mobileRank = mobileResults ? findRanking(mobileResults.organic_results, normalizedWebsite) : null;

    // Extract top 10
    const top10 = extractTop10(desktopResults || mobileResults, normalizedWebsite);

    // Extract SERP features
    const serpFeatures = extractSerpFeatures(desktopResults || mobileResults);

    // Find top competitor
    const topCompetitor = findTopCompetitor(top10, normalizedWebsite);

    const timestamp = new Date().toISOString();
    const responseData = {
      keyword,
      website: normalizedWebsite,
      desktopRank,
      mobileRank,
      top10,
      serpFeatures,
      topCompetitor,
      timestamp
    };

    // Save to history
    try {
      saveRankingHistory({
        keyword,
        website: normalizedWebsite,
        location,
        device,
        desktopRank,
        mobileRank,
        timestamp
      });
    } catch (historyError) {
      console.error('Failed to save history:', historyError.message);
      // Continue anyway - don't fail the request
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Rank check error:', error.message);
    res.status(500).json({ 
      error: 'Failed to check rankings',
      message: error.message 
    });
  }
});

// Helper function to search Google via SerpAPI
async function searchGoogle(keyword, location, device, apiKey) {
  const params = {
    engine: 'google',
    q: keyword,
    location: location,
    device: device,
    api_key: apiKey,
    num: 100  // Get top 100 results
  };

  const response = await axios.get('https://serpapi.com/search', { params });
  return response.data;
}

// Helper function to find ranking position
function findRanking(organicResults, targetWebsite) {
  if (!organicResults || !Array.isArray(organicResults)) return null;

  for (let i = 0; i < organicResults.length; i++) {
    const result = organicResults[i];
    const resultDomain = (result.link || result.displayed_link || '')
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .split('/')[0];

    if (resultDomain.includes(targetWebsite) || targetWebsite.includes(resultDomain)) {
      return i + 1;  // Position is index + 1
    }
  }

  return null;  // Not found in top 100
}

// Helper function to extract top 10 results
function extractTop10(results, userWebsite) {
  if (!results || !results.organic_results) return [];

  return results.organic_results.slice(0, 10).map((result, index) => {
    const domain = (result.link || result.displayed_link || '')
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .split('/')[0];

    return {
      position: index + 1,
      url: domain,
      title: result.title || 'Unknown',
      snippet: result.snippet || '',
      isUser: domain.includes(userWebsite) || userWebsite.includes(domain)
    };
  });
}

// Helper function to extract SERP features
function extractSerpFeatures(results) {
  if (!results) return {
    featuredSnippet: false,
    peopleAlsoAsk: false,
    localPack: false,
    imagePack: false
  };

  return {
    featuredSnippet: !!(results.answer_box || results.featured_snippet),
    peopleAlsoAsk: !!(results.related_questions && results.related_questions.length > 0),
    localPack: !!(results.local_results && results.local_results.places && results.local_results.places.length > 0),
    imagePack: !!(results.inline_images && results.inline_images.length > 0)
  };
}

// Helper function to find top competitor
function findTopCompetitor(top10, userWebsite) {
  if (!top10 || top10.length === 0) return 'N/A';

  // Find first non-user website
  const topCompetitor = top10.find(result => !result.isUser);
  return topCompetitor ? topCompetitor.url : 'N/A';
}

// Speed test endpoint
app.post('/api/speed-test', async (req, res) => {
  try {
    const { url, strategy = 'desktop' } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'Missing required field: url is required'
      });
    }

    const pageSpeedKey = process.env.PAGESPEED_API_KEY;
    if (!pageSpeedKey) {
      return res.status(500).json({ error: 'PageSpeed Insights API key not configured' });
    }

    // Call PageSpeed Insights API
    const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const params = {
      url: url,
      key: pageSpeedKey,
      strategy: strategy,
      category: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    const response = await axios.get(apiUrl, { params });
    const data = response.data;

    // Extract key metrics
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult?.categories || {};
    const audits = lighthouseResult?.audits || {};

    // Extract Core Web Vitals
    const metrics = {
      fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
      lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
      tbt: audits['total-blocking-time']?.displayValue || 'N/A',
      cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      si: audits['speed-index']?.displayValue || 'N/A',
      tti: audits['interactive']?.displayValue || 'N/A'
    };

    // Extract scores
    const scores = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100)
    };

    // Extract opportunities
    const opportunities = Object.entries(audits)
      .filter(([key, audit]) => audit.score !== null && audit.score < 0.9 && audit.details?.overallSavingsMs > 0)
      .map(([key, audit]) => ({
        title: audit.title,
        description: audit.description,
        savings: audit.details?.overallSavingsMs ? `${(audit.details.overallSavingsMs / 1000).toFixed(2)}s` : 'N/A',
        score: Math.round((audit.score || 0) * 100)
      }))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        url: url,
        strategy: strategy,
        scores: scores,
        metrics: metrics,
        opportunities: opportunities,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Speed test error:', error.message);
    res.status(500).json({
      error: 'Failed to run speed test',
      message: error.message
    });
  }
});

// Ranking history endpoints
app.get('/api/ranking-history', (req, res) => {
  try {
    const { keyword, website } = req.query;

    if (!keyword || !website) {
      return res.status(400).json({
        error: 'Missing required parameters: keyword and website are required'
      });
    }

    const normalizedWebsite = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const history = getRankingHistory(keyword, normalizedWebsite);

    res.json({
      success: true,
      data: {
        keyword,
        website: normalizedWebsite,
        history: history,
        count: history.length
      }
    });
  } catch (error) {
    console.error('History retrieval error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve ranking history',
      message: error.message
    });
  }
});

app.delete('/api/ranking-history', (req, res) => {
  try {
    const { keyword, website } = req.query;

    if (!keyword || !website) {
      return res.status(400).json({
        error: 'Missing required parameters: keyword and website are required'
      });
    }

    const normalizedWebsite = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    deleteRankingHistory(keyword, normalizedWebsite);

    res.json({
      success: true,
      message: 'History deleted successfully'
    });
  } catch (error) {
    console.error('History deletion error:', error.message);
    res.status(500).json({
      error: 'Failed to delete ranking history',
      message: error.message
    });
  }
});

// Helper functions for ranking history
function saveRankingHistory(data) {
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

  history.checks.push(data);

  // Keep only last 100 checks per keyword/website combo to prevent file from growing too large
  const keywordWebsiteChecks = history.checks.filter(
    c => c.keyword === data.keyword && c.website === data.website
  );

  if (keywordWebsiteChecks.length > 100) {
    // Remove oldest checks
    const checksToRemove = keywordWebsiteChecks.slice(0, keywordWebsiteChecks.length - 100);
    history.checks = history.checks.filter(c => !checksToRemove.includes(c));
  }

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function getRankingHistory(keyword, website) {
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

  return history.checks
    .filter(c => c.keyword === keyword && c.website === website)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function deleteRankingHistory(keyword, website) {
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

  history.checks = history.checks.filter(
    c => !(c.keyword === keyword && c.website === website)
  );

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Start server
app.listen(PORT, () => {
  console.log(`✓ Rank Tracker API running on http://localhost:${PORT}`);
  console.log(`✓ SerpAPI key configured: ${process.env.SERPAPI_KEY ? 'Yes' : 'No'}`);
  console.log(`✓ PageSpeed API key configured: ${process.env.PAGESPEED_API_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;
