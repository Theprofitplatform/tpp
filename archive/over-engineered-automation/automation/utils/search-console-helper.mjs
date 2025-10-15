/**
 * Google Search Console Helper
 * Fetches search performance data for blog posts
 *
 * Setup Instructions:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 * 2. Enable "Google Search Console API"
 * 3. Create Service Account with appropriate permissions
 * 4. Download JSON key file
 * 5. Add service account email to Search Console property (Settings > Users and permissions)
 * 6. Set SEARCH_CONSOLE_SITE_URL and SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY in .env.local
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const SEARCH_CONSOLE_SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL; // e.g., "https://theprofitplatform.com.au"
const SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY = process.env.SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY;

/**
 * Get access token from service account
 */
async function getAccessToken() {
  try {
    let credentials;

    // Parse service account key
    if (SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY.startsWith('{')) {
      credentials = JSON.parse(SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY);
    } else {
      // Assume it's a file path
      const { default: fs } = await import('fs/promises');
      const keyContent = await fs.readFile(SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY, 'utf-8');
      credentials = JSON.parse(keyContent);
    }

    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtClaim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const { default: jwt } = await import('jsonwebtoken');
    const token = jwt.sign(jwtClaim, credentials.private_key, {
      algorithm: 'RS256',
      header: jwtHeader
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
      })
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('❌ Search Console auth error:', error.message);
    throw error;
  }
}

/**
 * Fetch search performance data for a blog post
 * @param {string} slug - Blog post slug
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Search performance data
 */
export async function getPostSearchPerformance(slug, days = 30) {
  if (!SEARCH_CONSOLE_SITE_URL) {
    console.warn('⚠️  SEARCH_CONSOLE_SITE_URL not configured, skipping Search Console data');
    return null;
  }

  try {
    const accessToken = await getAccessToken();

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      startDate,
      endDate,
      dimensions: ['page', 'query'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'contains',
              expression: `/blog/${slug}`
            }
          ]
        }
      ],
      rowLimit: 100
    };

    const encodedSiteUrl = encodeURIComponent(SEARCH_CONSOLE_SITE_URL);
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Search Console API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!data.rows || data.rows.length === 0) {
      return {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        topKeywords: [],
        hasData: false
      };
    }

    // Aggregate data
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;
    const keywords = [];

    data.rows.forEach(row => {
      totalClicks += row.clicks || 0;
      totalImpressions += row.impressions || 0;
      totalPosition += row.position || 0;

      if (row.keys && row.keys[1]) {
        keywords.push({
          query: row.keys[1],
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          position: Math.round(row.position) || 0,
          ctr: row.ctr || 0
        });
      }
    });

    const avgPosition = data.rows.length > 0 ? totalPosition / data.rows.length : 0;
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Sort keywords by clicks
    keywords.sort((a, b) => b.clicks - a.clicks);

    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCtr,
      position: Math.round(avgPosition * 10) / 10,
      topKeywords: keywords.slice(0, 10),
      hasData: true,
      period: `${days} days`
    };
  } catch (error) {
    console.error(`❌ Error fetching Search Console data for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Fetch search performance for multiple posts
 * @param {Array<string>} slugs - Array of blog post slugs
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Map of slug → search performance
 */
export async function getBulkSearchPerformance(slugs, days = 30) {
  const results = {};

  for (const slug of slugs) {
    const performance = await getPostSearchPerformance(slug, days);
    if (performance) {
      results[slug] = performance;
    }
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Get top performing pages from Search Console
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Top pages by clicks
 */
export async function getTopSearchPages(days = 30) {
  if (!SEARCH_CONSOLE_SITE_URL) {
    console.warn('⚠️  SEARCH_CONSOLE_SITE_URL not configured, skipping Search Console data');
    return [];
  }

  try {
    const accessToken = await getAccessToken();

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      startDate,
      endDate,
      dimensions: ['page'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'contains',
              expression: '/blog/'
            }
          ]
        }
      ],
      rowLimit: 20
    };

    const encodedSiteUrl = encodeURIComponent(SEARCH_CONSOLE_SITE_URL);
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Search Console API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rows) {
      return [];
    }

    return data.rows.map(row => ({
      page: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: Math.round(row.position * 10) / 10
    })).sort((a, b) => b.clicks - a.clicks);
  } catch (error) {
    console.error('❌ Error fetching top search pages:', error.message);
    return [];
  }
}

/**
 * Get keyword opportunities (high impressions, low clicks)
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Keywords with opportunity for improvement
 */
export async function getKeywordOpportunities(days = 30) {
  if (!SEARCH_CONSOLE_SITE_URL) {
    return [];
  }

  try {
    const accessToken = await getAccessToken();

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'contains',
              expression: '/blog/'
            }
          ]
        }
      ],
      rowLimit: 100
    };

    const encodedSiteUrl = encodeURIComponent(SEARCH_CONSOLE_SITE_URL);
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Search Console API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rows) {
      return [];
    }

    // Find keywords with high impressions but low CTR (position 5-20)
    const opportunities = data.rows
      .filter(row => row.impressions > 100 && row.position > 5 && row.position <= 20)
      .map(row => ({
        query: row.keys[0],
        page: row.keys[1],
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: (row.ctr || 0) * 100,
        position: Math.round(row.position),
        opportunity: row.impressions * (1 - row.ctr) // Potential clicks if CTR improves
      }))
      .sort((a, b) => b.opportunity - a.opportunity)
      .slice(0, 20);

    return opportunities;
  } catch (error) {
    console.error('❌ Error fetching keyword opportunities:', error.message);
    return [];
  }
}
