#!/usr/bin/env node

/**
 * Automated SEO Rank Tracker
 * Tracks keyword rankings using Google Search Console API (free)
 * Generates weekly/monthly reports automatically
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const CONFIG = {
  // Google Search Console settings
  siteUrl: 'https://theprofitplatform.com.au',
  credentialsPath: './automation/config/gsc-credentials.json', // Service account JSON

  // Keywords to track
  keywords: [
    // Primary keywords
    'digital marketing sydney',
    'seo sydney',
    'google ads sydney',
    'web design sydney',
    'marketing agency sydney',

    // Service + location
    'seo bondi',
    'seo parramatta',
    'seo north sydney',
    'digital marketing parramatta',
    'google ads bondi',
    'web design north shore',

    // Long-tail
    'local seo sydney',
    'small business marketing sydney',
    'seo agency sydney',
    'google ads agency sydney',
    'website design sydney',

    // Near me variants
    'digital marketing agency near me',
    'seo services near me',
    'google ads specialist near me',
  ],

  // Tracking settings
  dataDir: './automation/data/rankings',
  reportDir: './automation/reports',
  daysToCheck: 7, // Last 7 days
  device: 'ALL', // or 'MOBILE', 'DESKTOP', 'TABLET'
};

/**
 * Get rankings from Google Search Console
 */
async function getRankingsFromGSC() {
  console.log('📊 Fetching rankings from Google Search Console...\n');

  try {
    // Load service account credentials
    const credentials = JSON.parse(
      await fs.readFile(CONFIG.credentialsPath, 'utf-8')
    );

    // Authorize
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - CONFIG.daysToCheck);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Query GSC for each keyword
    const results = [];

    for (const keyword of CONFIG.keywords) {
      console.log(`   Checking: "${keyword}"`);

      try {
        const response = await searchconsole.searchanalytics.query({
          siteUrl: CONFIG.siteUrl,
          requestBody: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: ['query', 'page'],
            dimensionFilterGroups: [{
              filters: [{
                dimension: 'query',
                expression: keyword,
                operator: 'equals',
              }],
            }],
            rowLimit: 5, // Top 5 pages for this keyword
          },
        });

        const rows = response.data.rows || [];

        if (rows.length > 0) {
          const topResult = rows[0];
          results.push({
            keyword,
            position: topResult.position,
            clicks: topResult.clicks,
            impressions: topResult.impressions,
            ctr: topResult.ctr,
            page: topResult.keys[1],
            date: formatDate(endDate),
          });
        } else {
          results.push({
            keyword,
            position: null,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            page: null,
            date: formatDate(endDate),
            note: 'Not ranking in top 100',
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`      ❌ Error for "${keyword}":`, error.message);
        results.push({
          keyword,
          position: null,
          error: error.message,
          date: formatDate(endDate),
        });
      }
    }

    return results;

  } catch (error) {
    console.error('❌ GSC API Error:', error.message);
    throw error;
  }
}

/**
 * Fallback: Manual rank checker (if GSC not set up yet)
 */
async function manualRankChecker() {
  console.log('⚠️  Using manual rank checking (limited accuracy)\n');
  console.log('📝 To enable automated tracking:');
  console.log('   1. Create Google Cloud project');
  console.log('   2. Enable Search Console API');
  console.log('   3. Create service account');
  console.log('   4. Download JSON credentials');
  console.log('   5. Add service account to GSC as user\n');

  // Return template data structure
  return CONFIG.keywords.map(keyword => ({
    keyword,
    position: null,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    page: null,
    date: new Date().toISOString().split('T')[0],
    note: 'Manual tracking required - GSC not configured',
  }));
}

/**
 * Load historical rankings
 */
async function loadHistoricalData() {
  const dataFiles = await fs.readdir(CONFIG.dataDir).catch(() => []);
  const allData = [];

  for (const file of dataFiles) {
    if (file.endsWith('.json')) {
      const data = JSON.parse(
        await fs.readFile(path.join(CONFIG.dataDir, file), 'utf-8')
      );
      allData.push(...data);
    }
  }

  return allData;
}

/**
 * Calculate ranking changes
 */
function calculateChanges(current, historical) {
  const changes = current.map(curr => {
    const prev = historical
      .filter(h => h.keyword === curr.keyword)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (!prev || !prev.position || !curr.position) {
      return {
        ...curr,
        change: 0,
        trend: 'new',
      };
    }

    const change = prev.position - curr.position; // Positive = improvement

    return {
      ...curr,
      previousPosition: prev.position,
      change,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  });

  return changes;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(data, stats) {
  const trendEmoji = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    if (trend === 'new') return '🆕';
    return '➡️';
  };

  const rankingRows = data
    .sort((a, b) => (a.position || 999) - (b.position || 999))
    .map(item => {
      const changeText = item.change > 0
        ? `+${item.change} positions`
        : item.change < 0
        ? `${item.change} positions`
        : item.trend === 'new'
        ? 'New tracking'
        : 'No change';

      return `
        <tr>
          <td>${item.keyword}</td>
          <td style="font-weight: bold; color: ${item.position && item.position <= 10 ? '#2ecc71' : item.position && item.position <= 20 ? '#f39c12' : '#e74c3c'};">
            ${item.position ? `#${Math.round(item.position)}` : 'Not ranking'}
          </td>
          <td>${item.previousPosition ? `#${Math.round(item.previousPosition)}` : '-'}</td>
          <td>${trendEmoji(item.trend)} ${changeText}</td>
          <td>${item.impressions || 0}</td>
          <td>${item.clicks || 0}</td>
          <td>${item.ctr ? (item.ctr * 100).toFixed(1) + '%' : '0%'}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
    .container { max-width: 1200px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; flex: 1; margin: 0 10px; }
    .stat-value { font-size: 2.5em; font-weight: bold; }
    .stat-label { font-size: 0.9em; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #667eea; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f9f9f9; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 SEO Ranking Report - The Profit Platform</h1>
    <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Period:</strong> Last ${CONFIG.daysToCheck} days</p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${stats.totalKeywords}</div>
        <div class="stat-label">Keywords Tracked</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.top10Keywords}</div>
        <div class="stat-label">Top 10 Rankings</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.improved}</div>
        <div class="stat-label">Improved 📈</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.declined}</div>
        <div class="stat-label">Declined 📉</div>
      </div>
    </div>

    <h2>Keyword Rankings</h2>
    <table>
      <thead>
        <tr>
          <th>Keyword</th>
          <th>Current Position</th>
          <th>Previous Position</th>
          <th>Change</th>
          <th>Impressions</th>
          <th>Clicks</th>
          <th>CTR</th>
        </tr>
      </thead>
      <tbody>
        ${rankingRows}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated by The Profit Platform SEO Automation System</p>
      <p>Next report: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting SEO Rank Tracking Automation\n');

  // Ensure directories exist
  await fs.mkdir(CONFIG.dataDir, { recursive: true });
  await fs.mkdir(CONFIG.reportDir, { recursive: true });

  // Get current rankings
  let currentRankings;
  try {
    currentRankings = await getRankingsFromGSC();
  } catch (error) {
    console.log('⚠️  GSC not available, using manual mode');
    currentRankings = await manualRankChecker();
  }

  // Load historical data
  const historical = await loadHistoricalData();

  // Calculate changes
  const dataWithChanges = calculateChanges(currentRankings, historical);

  // Calculate statistics
  const stats = {
    totalKeywords: dataWithChanges.length,
    top10Keywords: dataWithChanges.filter(d => d.position && d.position <= 10).length,
    top20Keywords: dataWithChanges.filter(d => d.position && d.position <= 20).length,
    improved: dataWithChanges.filter(d => d.trend === 'up').length,
    declined: dataWithChanges.filter(d => d.trend === 'down').length,
    stable: dataWithChanges.filter(d => d.trend === 'stable').length,
    new: dataWithChanges.filter(d => d.trend === 'new').length,
  };

  console.log('\n📊 RANKING SUMMARY:');
  console.log(`   Keywords tracked: ${stats.totalKeywords}`);
  console.log(`   Top 10 rankings: ${stats.top10Keywords}`);
  console.log(`   Top 20 rankings: ${stats.top20Keywords}`);
  console.log(`   Improved: ${stats.improved} 📈`);
  console.log(`   Declined: ${stats.declined} 📉`);
  console.log(`   Stable: ${stats.stable} ➡️`);

  // Save current data
  const today = new Date().toISOString().split('T')[0];
  const dataPath = path.join(CONFIG.dataDir, `rankings-${today}.json`);
  await fs.writeFile(dataPath, JSON.stringify(dataWithChanges, null, 2));
  console.log(`\n💾 Saved data: ${dataPath}`);

  // Generate HTML report
  const htmlReport = generateHTMLReport(dataWithChanges, stats);
  const reportPath = path.join(CONFIG.reportDir, `rank-report-${today}.html`);
  await fs.writeFile(reportPath, htmlReport);
  console.log(`📄 Generated report: ${reportPath}`);

  // Generate CSV export
  const csvHeaders = 'Keyword,Current Position,Previous Position,Change,Trend,Impressions,Clicks,CTR,Page,Date\n';
  const csvRows = dataWithChanges.map(d =>
    `"${d.keyword}",${d.position || ''},${d.previousPosition || ''},${d.change || 0},"${d.trend}",${d.impressions || 0},${d.clicks || 0},${d.ctr || 0},"${d.page || ''}","${d.date}"`
  ).join('\n');

  const csvPath = path.join(CONFIG.reportDir, `rank-data-${today}.csv`);
  await fs.writeFile(csvPath, csvHeaders + csvRows);
  console.log(`📄 Generated CSV: ${csvPath}`);

  console.log('\n🎉 Rank tracking complete!');
  console.log('\n📧 TO AUTOMATE:');
  console.log('   1. Run this script weekly: Add to crontab');
  console.log('      0 9 * * 1 cd /path/to/project && node automation/scripts/rank-tracker.mjs');
  console.log('   2. Email report automatically:');
  console.log('      - Use nodemailer to send HTML report');
  console.log('      - Or upload to Google Drive + share link');
  console.log('   3. Dashboard integration:');
  console.log('      - Import CSV to Google Sheets');
  console.log('      - Create charts/graphs');
  console.log('      - Auto-refresh weekly');
}

main().catch(console.error);
