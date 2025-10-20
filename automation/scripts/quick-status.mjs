#!/usr/bin/env node

/**
 * Quick Status Checker
 *
 * Provides an at-a-glance view of automation system status
 * Run: npm run automation:status:quick
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function getAutomationStatus() {
  try {
    const statusFile = path.join(PROJECT_ROOT, 'automation/data/automation-status.json');
    const data = await fs.readFile(statusFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { runs: [] };
  }
}

async function getSystemStats() {
  const stats = {};

  try {
    // Disk usage
    const diskOutput = execSync('df -h .').toString();
    const diskLine = diskOutput.split('\n')[1];
    const diskParts = diskLine.split(/\s+/);
    stats.diskUsage = parseInt(diskParts[4]);

    // Memory usage (if available)
    try {
      const memOutput = execSync('free -m').toString();
      const memLine = memOutput.split('\n')[1];
      const memParts = memLine.split(/\s+/);
      const used = parseInt(memParts[2]);
      const total = parseInt(memParts[1]);
      stats.memoryUsage = Math.round((used / total) * 100);
    } catch {
      stats.memoryUsage = null;
    }

    // API key check
    stats.apiKeyConfigured = !!process.env.ANTHROPIC_API_KEY;

    // Check last run time
    const statusData = await getAutomationStatus();
    if (statusData.runs && statusData.runs.length > 0) {
      const lastRun = statusData.runs[statusData.runs.length - 1];
      stats.lastRunDate = new Date(lastRun.timestamp);
      stats.daysSinceRun = Math.floor(
        (Date.now() - stats.lastRunDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    } else {
      stats.lastRunDate = null;
      stats.daysSinceRun = null;
    }

  } catch (error) {
    console.error('Error getting system stats:', error.message);
  }

  return stats;
}

async function getContentStats() {
  const stats = {
    suburbPages: 0,
    gbpPosts: 0,
    reviewEmails: 0,
    reports: 0
  };

  try {
    // Count suburb pages
    const locationsPath = path.join(PROJECT_ROOT, 'src/content/locations');
    const locationFiles = await fs.readdir(locationsPath);
    stats.suburbPages = locationFiles.filter(f => f.endsWith('.md')).length;

    // Count GBP posts
    const gbpPath = path.join(PROJECT_ROOT, 'automation/generated/gbp-posts');
    const gbpFiles = await fs.readdir(gbpPath);
    stats.gbpPosts = gbpFiles.filter(f => f.endsWith('.json')).length;

    // Count review emails
    const reviewPath = path.join(PROJECT_ROOT, 'automation/generated/review-emails');
    const reviewFiles = await fs.readdir(reviewPath);
    stats.reviewEmails = reviewFiles.filter(f => f.endsWith('.md')).length;

    // Count reports
    const reportsPath = path.join(PROJECT_ROOT, 'automation/reports');
    const reportFiles = await fs.readdir(reportsPath);
    stats.reports = reportFiles.filter(f => f.endsWith('.html')).length;

  } catch (error) {
    // Directories might not exist yet
  }

  return stats;
}

async function getHealthScore(stats) {
  let score = 100;

  // Deduct for high disk usage
  if (stats.diskUsage > 90) score -= 20;
  else if (stats.diskUsage > 80) score -= 10;
  else if (stats.diskUsage > 70) score -= 5;

  // Deduct for high memory usage
  if (stats.memoryUsage && stats.memoryUsage > 90) score -= 20;
  else if (stats.memoryUsage && stats.memoryUsage > 85) score -= 10;

  // Deduct if API key not configured
  if (!stats.apiKeyConfigured) score -= 30;

  // Deduct if not run recently
  if (stats.daysSinceRun === null) score -= 10;
  else if (stats.daysSinceRun > 7) score -= 15;
  else if (stats.daysSinceRun > 3) score -= 5;

  return Math.max(0, score);
}

function getHealthEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

async function displayQuickStatus() {
  console.log('\n' + colorize('═'.repeat(60), 'blue'));
  console.log(colorize('  ⚡ QUICK STATUS CHECK', 'bold'));
  console.log(colorize('═'.repeat(60), 'blue'));

  const systemStats = await getSystemStats();
  const contentStats = await getContentStats();
  const healthScore = await getHealthScore(systemStats);
  const healthEmoji = getHealthEmoji(healthScore);

  // Health Score
  console.log('\n' + colorize('🏥 System Health', 'cyan'));
  console.log(colorize('─'.repeat(60), 'gray'));
  const scoreColor = healthScore >= 90 ? 'green' : healthScore >= 70 ? 'yellow' : 'red';
  console.log(`${healthEmoji}  Overall Health: ${colorize(healthScore + '/100', scoreColor)}`);

  // System Resources
  console.log('\n' + colorize('💻 System Resources', 'cyan'));
  console.log(colorize('─'.repeat(60), 'gray'));

  const diskColor = systemStats.diskUsage > 80 ? 'red' : systemStats.diskUsage > 60 ? 'yellow' : 'green';
  console.log(`📀  Disk Usage: ${colorize(systemStats.diskUsage + '%', diskColor)}`);

  if (systemStats.memoryUsage !== null) {
    const memColor = systemStats.memoryUsage > 85 ? 'red' : systemStats.memoryUsage > 70 ? 'yellow' : 'green';
    console.log(`💾  Memory Usage: ${colorize(systemStats.memoryUsage + '%', memColor)}`);
  }

  const apiColor = systemStats.apiKeyConfigured ? 'green' : 'red';
  const apiStatus = systemStats.apiKeyConfigured ? 'Configured ✓' : 'Not Set ✗';
  console.log(`🔑  API Key: ${colorize(apiStatus, apiColor)}`);

  // Last Run
  console.log('\n' + colorize('🕐 Activity', 'cyan'));
  console.log(colorize('─'.repeat(60), 'gray'));

  if (systemStats.lastRunDate) {
    const daysSinceColor = systemStats.daysSinceRun > 7 ? 'red' :
                           systemStats.daysSinceRun > 3 ? 'yellow' : 'green';
    console.log(`📅  Last Run: ${systemStats.lastRunDate.toLocaleDateString()}`);
    console.log(`⏱️   Days Since: ${colorize(systemStats.daysSinceRun + ' days', daysSinceColor)}`);
  } else {
    console.log(colorize('⚠️  No automation runs recorded yet', 'yellow'));
  }

  // Generated Content
  console.log('\n' + colorize('📄 Generated Content', 'cyan'));
  console.log(colorize('─'.repeat(60), 'gray'));
  console.log(`🏙️   Suburb Pages: ${colorize(contentStats.suburbPages, 'green')}`);
  console.log(`📱  GBP Posts: ${colorize(contentStats.gbpPosts + ' batches', 'green')}`);
  console.log(`✉️   Review Emails: ${colorize(contentStats.reviewEmails, 'green')}`);
  console.log(`📊  Reports: ${colorize(contentStats.reports, 'green')}`);

  // Quick Actions
  console.log('\n' + colorize('⚡ Quick Actions', 'cyan'));
  console.log(colorize('─'.repeat(60), 'gray'));
  console.log(`${colorize('npm run automation:monitor', 'blue')}     - Full health check`);
  console.log(`${colorize('npm run automation:health', 'blue')}      - Generate dashboard`);
  console.log(`${colorize('npm run automation:scheduled', 'blue')}   - Run scheduled tasks`);

  // Recommendations
  console.log('\n' + colorize('💡 Recommendations', 'cyan'));
  console.log(colorize('─'.repeat(60), 'gray'));

  if (!systemStats.apiKeyConfigured) {
    console.log(colorize('⚠️  Set ANTHROPIC_API_KEY environment variable', 'yellow'));
  }

  if (systemStats.diskUsage > 80) {
    console.log(colorize('⚠️  Disk usage high - consider cleanup', 'yellow'));
  }

  if (systemStats.daysSinceRun > 7) {
    console.log(colorize('⚠️  No automations run recently - check cron setup', 'yellow'));
  }

  if (healthScore >= 90) {
    console.log(colorize('✅ System is healthy - no action needed!', 'green'));
  }

  console.log('\n' + colorize('═'.repeat(60), 'blue') + '\n');

  // Exit code based on health
  if (healthScore < 50) {
    process.exit(1);
  }
}

displayQuickStatus().catch(error => {
  console.error(colorize('Error running quick status check:', 'red'), error.message);
  process.exit(1);
});
