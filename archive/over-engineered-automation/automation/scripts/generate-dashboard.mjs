#!/usr/bin/env node
/**
 * Analytics Dashboard Generator
 * Creates visual HTML dashboard with charts and insights
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function generateDashboard() {
  console.log('\n📊 Generating Analytics Dashboard...\n');
  console.log('━'.repeat(60));

  // Load all data
  const reportPath = path.join(projectRoot, 'automation/performance-report.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));

  let insights = null;
  try {
    const insightsPath = path.join(projectRoot, 'automation/insights-report.json');
    insights = JSON.parse(await fs.readFile(insightsPath, 'utf-8'));
  } catch (err) {
    // No insights available
  }

  let alerts = null;
  try {
    const alertsPath = path.join(projectRoot, 'automation/performance-alerts.json');
    alerts = JSON.parse(await fs.readFile(alertsPath, 'utf-8'));
  } catch (err) {
    // No alerts available
  }

  // Prepare chart data
  const categoryData = {};
  report.posts.forEach(p => {
    if (!categoryData[p.category]) {
      categoryData[p.category] = { posts: 0, views: 0 };
    }
    categoryData[p.category].posts++;
    categoryData[p.category].views += p.analytics?.pageviews || 0;
  });

  const topPosts = [...report.posts]
    .sort((a, b) => (b.analytics?.pageviews || 0) - (a.analytics?.pageviews || 0))
    .slice(0, 10);

  const recentPosts = [...report.posts]
    .filter(p => p.daysSince < 30)
    .sort((a, b) => a.daysSince - b.daysSince);

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Analytics Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin: 10px 0;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .chart-container {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .chart-container h2 {
      margin-bottom: 20px;
      color: #333;
    }
    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .alert {
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .alert-critical { background: #fee; border-left: 4px solid #c00; }
    .alert-warning { background: #ffc; border-left: 4px solid #fa0; }
    .alert-success { background: #efe; border-left: 4px solid #0a0; }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-high { background: #fee; color: #c00; }
    .badge-medium { background: #ffc; color: #850; }
    .badge-low { background: #efe; color: #050; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Blog Analytics Dashboard</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Posts</div>
        <div class="stat-value">${report.summary.totalPosts}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Pageviews</div>
        <div class="stat-value">${(report.analytics?.totalPageviews || 0).toLocaleString()}</div>
        <div class="stat-label">Last 30 days</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Engagement Rate</div>
        <div class="stat-value">${(report.analytics?.avgEngagementRate || 0).toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Word Count</div>
        <div class="stat-value">${report.summary.avgWordCount}</div>
      </div>
    </div>

    ${alerts ? `
    <div class="chart-container">
      <h2>🔔 Active Alerts</h2>
      ${alerts.alerts.slice(0, 10).map(a => `
        <div class="alert alert-${a.severity}">
          <strong>${a.message}</strong><br>
          <small>${a.title}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="grid-2">
      <div class="chart-container">
        <h2>Posts by Category</h2>
        <canvas id="categoryChart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Traffic by Category</h2>
        <canvas id="trafficChart"></canvas>
      </div>
    </div>

    <div class="table-container">
      <h2 style="padding: 20px 20px 0;">🏆 Top 10 Posts by Traffic</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Title</th>
            <th>Category</th>
            <th>Pageviews</th>
            <th>Engagement</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          ${topPosts.map((post, i) => `
            <tr>
              <td><strong>${i + 1}</strong></td>
              <td>${post.title}</td>
              <td><span class="badge badge-low">${post.category}</span></td>
              <td>${(post.analytics?.pageviews || 0).toLocaleString()}</td>
              <td>${(post.analytics?.engagementRate || 0).toFixed(1)}%</td>
              <td>${post.daysSince} days</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${insights ? `
    <div class="chart-container">
      <h2>💡 Key Insights</h2>
      <h3 style="margin-top: 20px; margin-bottom: 10px;">Critical Actions</h3>
      ${insights.criticalActions.slice(0, 3).map(a => `
        <div class="alert alert-critical">
          <strong>${a.issue}</strong><br>
          <small>Action: ${a.action}</small>
        </div>
      `).join('')}

      <h3 style="margin-top: 20px; margin-bottom: 10px;">Quick Wins</h3>
      ${insights.quickWins.slice(0, 3).map(w => `
        <div class="alert alert-success">
          <strong>${w.opportunity}</strong><br>
          <small>${w.action}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

  </div>

  <script>
    // Category distribution chart
    new Chart(document.getElementById('categoryChart'), {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(Object.keys(categoryData))},
        datasets: [{
          data: ${JSON.stringify(Object.values(categoryData).map(d => d.posts))},
          backgroundColor: [
            '#667eea', '#764ba2', '#f093fb', '#4facfe',
            '#43e97b', '#fa709a', '#fee140', '#30cfd0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });

    // Traffic by category chart
    new Chart(document.getElementById('trafficChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(Object.keys(categoryData))},
        datasets: [{
          label: 'Pageviews',
          data: ${JSON.stringify(Object.values(categoryData).map(d => d.views))},
          backgroundColor: '#667eea'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>`;

  // Save dashboard
  const dashboardPath = path.join(projectRoot, 'automation/dashboard.html');
  await fs.writeFile(dashboardPath, html);

  console.log('✅ Dashboard generated successfully!\n');
  console.log(`   Open: file://${dashboardPath}\n`);
  console.log('━'.repeat(60) + '\n');
}

generateDashboard().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
