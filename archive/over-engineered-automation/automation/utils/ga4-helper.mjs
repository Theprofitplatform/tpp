/**
 * Google Analytics 4 (GA4) Helper
 * Fetches traffic and engagement data for blog posts
 *
 * Setup Instructions:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 * 2. Enable "Google Analytics Data API"
 * 3. Create Service Account with "Viewer" role
 * 4. Download JSON key file
 * 5. Add service account email to GA4 property (Admin > Property > Property Access Management)
 * 6. Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_KEY in .env.local
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID; // e.g., "properties/123456789"
const GA4_SERVICE_ACCOUNT_KEY = process.env.GA4_SERVICE_ACCOUNT_KEY; // JSON string or file path

/**
 * Get access token from service account
 */
async function getAccessToken() {
  try {
    let credentials;

    // Parse service account key
    if (GA4_SERVICE_ACCOUNT_KEY.startsWith('{')) {
      credentials = JSON.parse(GA4_SERVICE_ACCOUNT_KEY);
    } else {
      // Assume it's a file path
      const { default: fs } = await import('fs/promises');
      const keyContent = await fs.readFile(GA4_SERVICE_ACCOUNT_KEY, 'utf-8');
      credentials = JSON.parse(keyContent);
    }

    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtClaim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Note: This is a simplified version
    // In production, use the 'google-auth-library' package instead
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
    console.error('❌ GA4 auth error:', error.message);
    throw error;
  }
}

/**
 * Fetch blog post analytics from GA4
 * @param {string} slug - Blog post slug (e.g., "how-to-optimise-google-business-profile")
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Analytics data
 */
export async function getPostAnalytics(slug, days = 30) {
  if (!GA4_PROPERTY_ID) {
    console.warn('⚠️  GA4_PROPERTY_ID not configured, skipping GA4 data');
    return null;
  }

  try {
    const accessToken = await getAccessToken();

    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      dateRanges: [{ startDate, endDate: today }],
      dimensions: [
        { name: 'pagePath' }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'engagementRate' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: `/blog/${slug}`
          }
        }
      }
    };

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`,
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
      throw new Error(`GA4 API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!data.rows || data.rows.length === 0) {
      return {
        pageviews: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        engagementRate: 0,
        hasData: false
      };
    }

    const row = data.rows[0];
    return {
      pageviews: parseInt(row.metricValues[0].value) || 0,
      avgSessionDuration: parseFloat(row.metricValues[1].value) || 0,
      bounceRate: parseFloat(row.metricValues[2].value) * 100 || 0, // Convert to percentage
      engagementRate: parseFloat(row.metricValues[3].value) * 100 || 0,
      hasData: true,
      period: `${days} days`
    };
  } catch (error) {
    console.error(`❌ Error fetching GA4 data for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Fetch analytics for multiple posts
 * @param {Array<string>} slugs - Array of blog post slugs
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Map of slug → analytics
 */
export async function getBulkPostAnalytics(slugs, days = 30) {
  const results = {};

  for (const slug of slugs) {
    const analytics = await getPostAnalytics(slug, days);
    if (analytics) {
      results[slug] = analytics;
    }
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Get top performing posts
 * @param {number} limit - Number of top posts to return
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Top posts by pageviews
 */
export async function getTopPosts(limit = 10, days = 30) {
  if (!GA4_PROPERTY_ID) {
    console.warn('⚠️  GA4_PROPERTY_ID not configured, skipping GA4 data');
    return [];
  }

  try {
    const accessToken = await getAccessToken();

    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      dateRanges: [{ startDate, endDate: today }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'engagementRate' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: '/blog/'
          }
        }
      },
      orderBys: [
        {
          metric: {
            metricName: 'screenPageViews'
          },
          desc: true
        }
      ],
      limit
    };

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`,
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
      throw new Error(`GA4 API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rows) {
      return [];
    }

    return data.rows.map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      pageviews: parseInt(row.metricValues[0].value),
      avgSessionDuration: parseFloat(row.metricValues[1].value),
      engagementRate: parseFloat(row.metricValues[2].value) * 100
    }));
  } catch (error) {
    console.error('❌ Error fetching top posts:', error.message);
    return [];
  }
}
