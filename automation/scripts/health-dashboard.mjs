#!/usr/bin/env node

/**
 * Automation Health Dashboard
 * Generates a comprehensive HTML dashboard showing automation system health
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const CONFIG = {
  statusFile: './automation/data/automation-status.json',
  healthLog: './automation/logs/health-check.log',
  alertLog: './automation/logs/alerts.log',
  outputFile: './automation/reports/health-dashboard.html',
  outputJson: './automation/reports/health-dashboard.json',
};

/**
 * Get system stats
 */
async function getSystemStats() {
  const stats = {
    timestamp: new Date().toISOString(),
    disk: { usage: 0, available: '', total: '' },
    memory: { usage: 0, used: '', total: '' },
    uptime: '',
    nodeVersion: process.version,
  };

  try {
    // Disk usage
    const diskCmd = await execAsync('df -h . | tail -1');
    const diskParts = diskCmd.stdout.trim().split(/\s+/);
    stats.disk.total = diskParts[1];
    stats.disk.used = diskParts[2];
    stats.disk.available = diskParts[3];
    stats.disk.usage = parseInt(diskParts[4]) || 0;

    // Memory usage
    const memCmd = await execAsync('free -h | grep Mem');
    const memParts = memCmd.stdout.trim().split(/\s+/);
    stats.memory.total = memParts[1];
    stats.memory.used = memParts[2];
    stats.memory.available = memParts[6];

    const memUsedNum = parseFloat(memParts[2]);
    const memTotalNum = parseFloat(memParts[1]);
    stats.memory.usage = Math.round((memUsedNum / memTotalNum) * 100) || 0;

    // System uptime
    const uptimeCmd = await execAsync('uptime -p');
    stats.uptime = uptimeCmd.stdout.trim().replace('up ', '');

  } catch (error) {
    console.log('⚠️  Could not get all system stats:', error.message);
  }

  return stats;
}

/**
 * Get automation status
 */
async function getAutomationStatus() {
  try {
    const statusData = await fs.readFile(CONFIG.statusFile, 'utf-8');
    const status = JSON.parse(statusData);

    const dates = Object.keys(status).sort().reverse();
    const lastRunDate = dates[0];
    const lastRuns = status[lastRunDate] || [];

    // Calculate stats
    const totalRuns = Object.values(status).flat().length;
    const successful = Object.values(status).flat().filter(r => r.status === 'success').length;
    const failed = Object.values(status).flat().filter(r => r.status === 'failed').length;
    const successRate = totalRuns > 0 ? Math.round((successful / totalRuns) * 100) : 0;

    // Recent failures (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFailures = Object.entries(status)
      .filter(([date]) => new Date(date) >= sevenDaysAgo)
      .flatMap(([, runs]) => runs)
      .filter(r => r.status === 'failed');

    return {
      hasRuns: dates.length > 0,
      lastRunDate,
      lastRuns,
      totalRuns,
      successful,
      failed,
      successRate,
      recentFailures: recentFailures.length,
      recentFailureDetails: recentFailures.slice(0, 5), // Last 5 failures
    };

  } catch (error) {
    return {
      hasRuns: false,
      error: error.message,
    };
  }
}

/**
 * Get recent alerts
 */
async function getRecentAlerts() {
  try {
    const alertData = await fs.readFile(CONFIG.alertLog, 'utf-8');
    const lines = alertData.trim().split('\n').filter(l => l.length > 0);

    // Get last 10 alerts
    const alerts = lines.slice(-10).reverse().map(line => {
      const match = line.match(/\[(.*?)\] (.*)/);
      if (match) {
        return {
          timestamp: match[1],
          message: match[2],
        };
      }
      return { timestamp: 'Unknown', message: line };
    });

    return alerts;

  } catch (error) {
    return [];
  }
}

/**
 * Calculate overall health score
 */
function calculateHealthScore(systemStats, automationStatus) {
  let score = 100;
  const issues = [];

  // Disk space check (max -20 points)
  if (systemStats.disk.usage > 90) {
    score -= 20;
    issues.push('Critical: Disk usage > 90%');
  } else if (systemStats.disk.usage > 80) {
    score -= 10;
    issues.push('Warning: Disk usage > 80%');
  }

  // Memory check (max -20 points)
  if (systemStats.memory.usage > 90) {
    score -= 20;
    issues.push('Critical: Memory usage > 90%');
  } else if (systemStats.memory.usage > 85) {
    score -= 10;
    issues.push('Warning: Memory usage > 85%');
  }

  // Automation status (max -30 points)
  if (!automationStatus.hasRuns) {
    score -= 15;
    issues.push('Info: No automation runs yet');
  } else if (automationStatus.successRate < 80) {
    score -= 30;
    issues.push(`Critical: Success rate ${automationStatus.successRate}%`);
  } else if (automationStatus.successRate < 95) {
    score -= 15;
    issues.push(`Warning: Success rate ${automationStatus.successRate}%`);
  }

  // Recent failures (max -30 points)
  if (automationStatus.recentFailures > 5) {
    score -= 30;
    issues.push(`Critical: ${automationStatus.recentFailures} failures in 7 days`);
  } else if (automationStatus.recentFailures > 0) {
    score -= 10;
    issues.push(`Warning: ${automationStatus.recentFailures} failures in 7 days`);
  }

  // API key check
  if (!process.env.ANTHROPIC_API_KEY) {
    score -= 20;
    issues.push('Critical: API key not configured');
  }

  return {
    score: Math.max(0, score),
    status: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor',
    color: score >= 90 ? '#22c55e' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444',
    issues,
  };
}

/**
 * Generate HTML dashboard
 */
function generateHTML(systemStats, automationStatus, alerts, health) {
  const lastRunAgo = automationStatus.lastRunDate
    ? Math.floor((Date.now() - new Date(automationStatus.lastRunDate).getTime()) / (1000 * 60 * 60 * 24))
    : 'N/A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Automation Health Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      opacity: 0.9;
      font-size: 1.1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .stat:last-child { border-bottom: none; }
    .stat-label {
      color: #6b7280;
      font-size: 0.95rem;
    }
    .stat-value {
      font-weight: 600;
      color: #1f2937;
      font-size: 1.1rem;
    }
    .health-score {
      text-align: center;
      padding: 2rem;
    }
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: ${health.color};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: bold;
      margin: 0 auto 1rem;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    .health-status {
      font-size: 1.5rem;
      font-weight: 600;
      color: ${health.color};
      margin-bottom: 0.5rem;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .alert {
      padding: 0.75rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }
    .alert-time {
      color: #92400e;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    .alert-msg {
      color: #78350f;
    }
    .no-data {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
      font-style: italic;
    }
    .timestamp {
      text-align: center;
      color: white;
      opacity: 0.8;
      margin-top: 2rem;
      font-size: 0.9rem;
    }
    .issue-list {
      list-style: none;
      margin-top: 1rem;
    }
    .issue-list li {
      padding: 0.5rem;
      background: #fef3c7;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #78350f;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 SEO Automation Health Dashboard</h1>
      <p>Real-time monitoring for The Profit Platform automation system</p>
    </div>

    <!-- Health Score -->
    <div class="card">
      <div class="health-score">
        <div class="score-circle">${health.score}</div>
        <div class="health-status">${health.status}</div>
        <p style="color: #6b7280; margin-bottom: 1rem;">Overall System Health</p>
        ${health.issues.length > 0 ? `
          <ul class="issue-list">
            ${health.issues.map(issue => `<li>⚠️ ${issue}</li>`).join('')}
          </ul>
        ` : '<p style="color: #22c55e; font-weight: 600;">✓ All systems operational</p>'}
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid">
      <!-- System Resources -->
      <div class="card">
        <h2>💻 System Resources</h2>
        <div class="stat">
          <span class="stat-label">Disk Usage</span>
          <span class="stat-value">${systemStats.disk.usage}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${systemStats.disk.usage}%; background: ${systemStats.disk.usage > 80 ? '#ef4444' : '#22c55e'}"></div>
        </div>
        <div class="stat" style="margin-top: 1rem;">
          <span class="stat-label">Memory Usage</span>
          <span class="stat-value">${systemStats.memory.usage}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${systemStats.memory.usage}%; background: ${systemStats.memory.usage > 85 ? '#ef4444' : '#22c55e'}"></div>
        </div>
        <div class="stat" style="margin-top: 1rem;">
          <span class="stat-label">Uptime</span>
          <span class="stat-value">${systemStats.uptime || 'Unknown'}</span>
        </div>
      </div>

      <!-- Automation Stats -->
      <div class="card">
        <h2>🚀 Automation Stats</h2>
        ${automationStatus.hasRuns ? `
          <div class="stat">
            <span class="stat-label">Last Run</span>
            <span class="stat-value">${lastRunAgo} days ago</span>
          </div>
          <div class="stat">
            <span class="stat-label">Success Rate</span>
            <span class="stat-value">${automationStatus.successRate}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${automationStatus.successRate}%; background: ${automationStatus.successRate > 90 ? '#22c55e' : automationStatus.successRate > 70 ? '#f59e0b' : '#ef4444'}"></div>
          </div>
          <div class="stat" style="margin-top: 1rem;">
            <span class="stat-label">Total Runs</span>
            <span class="stat-value">${automationStatus.totalRuns}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Recent Failures (7d)</span>
            <span class="stat-value ${automationStatus.recentFailures > 0 ? 'badge badge-warning' : 'badge badge-success'}">${automationStatus.recentFailures}</span>
          </div>
        ` : '<div class="no-data">No automation runs yet</div>'}
      </div>

      <!-- Configuration -->
      <div class="card">
        <h2>⚙️ Configuration</h2>
        <div class="stat">
          <span class="stat-label">API Key</span>
          <span class="stat-value">
            <span class="badge ${process.env.ANTHROPIC_API_KEY ? 'badge-success' : 'badge-error'}">
              ${process.env.ANTHROPIC_API_KEY ? '✓ Configured' : '✗ Missing'}
            </span>
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">Node.js</span>
          <span class="stat-value">${systemStats.nodeVersion}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Environment</span>
          <span class="stat-value badge badge-info">${process.env.NODE_ENV || 'production'}</span>
        </div>
      </div>
    </div>

    <!-- Recent Alerts -->
    ${alerts.length > 0 ? `
      <div class="card">
        <h2>⚠️ Recent Alerts (Last 10)</h2>
        ${alerts.map(alert => `
          <div class="alert">
            <div class="alert-time">${new Date(alert.timestamp).toLocaleString()}</div>
            <div class="alert-msg">${alert.message}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Last Automation Runs -->
    ${automationStatus.hasRuns && automationStatus.lastRuns.length > 0 ? `
      <div class="card">
        <h2>📋 Last Automation Runs (${automationStatus.lastRunDate})</h2>
        ${automationStatus.lastRuns.map(run => `
          <div class="stat">
            <span class="stat-label">${run.script}</span>
            <span class="stat-value">
              <span class="badge ${run.status === 'success' ? 'badge-success' : 'badge-error'}">
                ${run.status === 'success' ? '✓' : '✗'} ${run.status}
              </span>
              <span style="font-size: 0.85rem; color: #6b7280; margin-left: 0.5rem;">
                ${run.duration}ms
              </span>
            </span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="timestamp">
      Last updated: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main execution
 */
async function main() {
  console.log('🏥 Generating health dashboard...\n');

  // Gather data
  console.log('📊 Collecting system stats...');
  const systemStats = await getSystemStats();

  console.log('🤖 Analyzing automation status...');
  const automationStatus = await getAutomationStatus();

  console.log('⚠️  Checking recent alerts...');
  const alerts = await getRecentAlerts();

  console.log('🧮 Calculating health score...');
  const health = calculateHealthScore(systemStats, automationStatus);

  // Generate reports
  console.log('📄 Generating HTML dashboard...');
  const html = generateHTML(systemStats, automationStatus, alerts, health);

  // Create reports directory
  await fs.mkdir(path.dirname(CONFIG.outputFile), { recursive: true });

  // Save HTML
  await fs.writeFile(CONFIG.outputFile, html);
  console.log(`✅ HTML dashboard saved: ${CONFIG.outputFile}`);

  // Save JSON
  const jsonData = {
    timestamp: new Date().toISOString(),
    health,
    system: systemStats,
    automation: automationStatus,
    alerts: alerts.slice(0, 5),
  };

  await fs.writeFile(CONFIG.outputJson, JSON.stringify(jsonData, null, 2));
  console.log(`✅ JSON data saved: ${CONFIG.outputJson}`);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`🏥 Health Score: ${health.score}/100 (${health.status})`);
  console.log(`💻 Disk: ${systemStats.disk.usage}% | Memory: ${systemStats.memory.usage}%`);
  console.log(`🤖 Automation Success Rate: ${automationStatus.successRate || 0}%`);
  console.log(`⚠️  Issues: ${health.issues.length}`);
  console.log('='.repeat(50));
  console.log(`\n👉 View dashboard: file://${path.resolve(CONFIG.outputFile)}\n`);
}

main().catch(error => {
  console.error('❌ Error generating dashboard:', error);
  process.exit(1);
});
