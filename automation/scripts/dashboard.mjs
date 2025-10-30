#!/usr/bin/env node

/**
 * Automation Dashboard
 *
 * Interactive CLI dashboard for monitoring automation system:
 * - API usage and costs
 * - Recent automation runs
 * - Budget status
 * - Content generation stats
 * - Error logs
 * - System health
 *
 * Usage:
 *   npm run automation:dashboard
 *   node automation/scripts/dashboard.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { UsageTracker } from '../lib/usage-tracker.mjs';
import { Logger } from '../lib/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = new Logger('dashboard');
const usageTracker = new UsageTracker();

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Clear terminal and show header
 */
function showHeader() {
  console.clear();
  console.log(colors.cyan + colors.bright);
  console.log('═'.repeat(70));
  console.log('🤖  THE PROFIT PLATFORM - AUTOMATION DASHBOARD');
  console.log('═'.repeat(70));
  console.log(colors.reset);
  console.log(`Generated: ${new Date().toLocaleString()}\n`);
}

/**
 * Get API usage statistics
 */
async function getApiStats() {
  try {
    const stats30 = await usageTracker.getStats(30);
    const stats7 = await usageTracker.getStats(7);
    const stats1 = await usageTracker.getStats(1);
    const monthlySpend = await usageTracker.getMonthlySpend();

    return {
      today: stats1,
      week: stats7,
      month: stats30,
      monthlySpend,
      budget: usageTracker.budget,
      percentUsed: (monthlySpend / usageTracker.budget) * 100,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get suburb generation stats
 */
async function getSuburbStats() {
  try {
    const suburbsPath = path.resolve(__dirname, '../data/suburbs.json');
    const data = await fs.readFile(suburbsPath, 'utf-8');
    const suburbs = JSON.parse(data);

    const total = suburbs.metadata?.totalSuburbs || suburbs.suburbs?.length || 0;
    const generated = suburbs.metadata?.generated || 0;
    const pending = suburbs.metadata?.pendingGeneration || 0;

    return { total, generated, pending };
  } catch (error) {
    return null;
  }
}

/**
 * Get recent log entries
 */
async function getRecentLogs(limit = 10) {
  try {
    const logsDir = path.resolve(__dirname, '../logs');
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(logsDir, `${today}.log`);

    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.length > 0);
    const logs = lines
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(log => log !== null);

    return logs;
  } catch (error) {
    return [];
  }
}

/**
 * Get error logs from recent runs
 */
async function getErrorLogs() {
  try {
    const logsDir = path.resolve(__dirname, '../logs');
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(logsDir, `${today}.log`);

    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.length > 0);
    const errors = lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(log => log !== null && (log.level === 'error' || log.level === 'warn'))
      .slice(-5); // Last 5 errors/warnings

    return errors;
  } catch (error) {
    return [];
  }
}

/**
 * Display API usage section
 */
function displayApiUsage(stats) {
  console.log(colors.bright + '💰 API USAGE & COSTS' + colors.reset);
  console.log('─'.repeat(70));

  if (!stats) {
    console.log(colors.dim + '  No usage data available\n' + colors.reset);
    return;
  }

  // Budget status
  const percentUsed = stats.percentUsed;
  const barLength = 40;
  const filled = Math.floor((percentUsed / 100) * barLength);
  const empty = barLength - filled;

  let barColor = colors.green;
  if (percentUsed >= 90) barColor = colors.red;
  else if (percentUsed >= 80) barColor = colors.yellow;

  console.log(`\n  Monthly Budget:`);
  console.log(`  [${barColor}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}] ${percentUsed.toFixed(1)}%`);
  console.log(`  Spent: $${stats.monthlySpend.toFixed(2)} / $${stats.budget.toFixed(2)}`);
  console.log(`  Remaining: $${(stats.budget - stats.monthlySpend).toFixed(2)}`);

  // Usage breakdown
  console.log(`\n  Usage Summary:`);
  console.log(`  ├─ Today:      $${stats.today.totalCost.toFixed(4)} (${stats.today.requestCount} requests)`);
  console.log(`  ├─ This Week:  $${stats.week.totalCost.toFixed(4)} (${stats.week.requestCount} requests)`);
  console.log(`  └─ This Month: $${stats.month.totalCost.toFixed(4)} (${stats.month.requestCount} requests)`);

  // By script
  if (Object.keys(stats.month.byScript).length > 0) {
    console.log(`\n  Top Scripts (This Month):`);
    Object.entries(stats.month.byScript)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 5)
      .forEach(([script, data]) => {
        const percentage = (data.cost / stats.month.totalCost) * 100;
        console.log(`  ├─ ${script.padEnd(25)} $${data.cost.toFixed(4)} (${percentage.toFixed(1)}%)`);
      });
  }

  console.log();
}

/**
 * Display content generation stats
 */
function displayContentStats(suburbStats) {
  console.log(colors.bright + '📝 CONTENT GENERATION' + colors.reset);
  console.log('─'.repeat(70));

  if (!suburbStats) {
    console.log(colors.dim + '  No suburb data available\n' + colors.reset);
    return;
  }

  const progress = (suburbStats.generated / suburbStats.total) * 100;
  const barLength = 40;
  const filled = Math.floor((progress / 100) * barLength);
  const empty = barLength - filled;

  console.log(`\n  Suburb Pages:`);
  console.log(`  [${colors.green}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}] ${progress.toFixed(1)}%`);
  console.log(`  Generated: ${suburbStats.generated} / ${suburbStats.total}`);
  console.log(`  Pending: ${suburbStats.pending}`);
  console.log();
}

/**
 * Display recent activity
 */
function displayRecentActivity(logs) {
  console.log(colors.bright + '📊 RECENT ACTIVITY' + colors.reset);
  console.log('─'.repeat(70));

  if (logs.length === 0) {
    console.log(colors.dim + '  No recent activity\n' + colors.reset);
    return;
  }

  console.log();
  logs.forEach(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    let icon = '•';
    let color = colors.reset;

    if (log.level === 'error') {
      icon = '✗';
      color = colors.red;
    } else if (log.level === 'warn') {
      icon = '⚠';
      color = colors.yellow;
    } else if (log.level === 'success') {
      icon = '✓';
      color = colors.green;
    }

    console.log(`  ${color}${icon}${colors.reset} ${colors.dim}${time}${colors.reset} [${log.script}] ${log.message}`);
  });

  console.log();
}

/**
 * Display errors and warnings
 */
function displayErrors(errors) {
  console.log(colors.bright + '🚨 ERRORS & WARNINGS' + colors.reset);
  console.log('─'.repeat(70));

  if (errors.length === 0) {
    console.log(colors.green + '  ✓ No errors or warnings today\n' + colors.reset);
    return;
  }

  console.log();
  errors.forEach(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const color = log.level === 'error' ? colors.red : colors.yellow;
    const icon = log.level === 'error' ? '✗' : '⚠';

    console.log(`  ${color}${icon} ${log.level.toUpperCase()}${colors.reset} ${colors.dim}${time}${colors.reset} [${log.script}]`);
    console.log(`    ${log.message}`);
    if (log.data) {
      console.log(`    ${colors.dim}${JSON.stringify(log.data)}${colors.reset}`);
    }
    console.log();
  });
}

/**
 * Display system health
 */
function displaySystemHealth(stats, errors) {
  console.log(colors.bright + '💊 SYSTEM HEALTH' + colors.reset);
  console.log('─'.repeat(70));
  console.log();

  // Budget health
  const budgetHealth = stats?.percentUsed < 80 ? 'GOOD' : stats?.percentUsed < 90 ? 'WARNING' : 'CRITICAL';
  const budgetColor = budgetHealth === 'GOOD' ? colors.green : budgetHealth === 'WARNING' ? colors.yellow : colors.red;
  console.log(`  Budget Status:     ${budgetColor}${budgetHealth}${colors.reset}`);

  // Error rate
  const errorRate = errors.length === 0 ? 'HEALTHY' : errors.length < 3 ? 'MINOR ISSUES' : 'NEEDS ATTENTION';
  const errorColor = errorRate === 'HEALTHY' ? colors.green : errorRate === 'MINOR ISSUES' ? colors.yellow : colors.red;
  console.log(`  Error Rate:        ${errorColor}${errorRate}${colors.reset}`);

  // API connectivity
  const apiHealth = stats ? 'CONNECTED' : 'NO DATA';
  const apiColor = apiHealth === 'CONNECTED' ? colors.green : colors.yellow;
  console.log(`  API Connectivity:  ${apiColor}${apiHealth}${colors.reset}`);

  console.log();
}

/**
 * Display quick actions
 */
function displayQuickActions() {
  console.log(colors.bright + '⚡ QUICK ACTIONS' + colors.reset);
  console.log('─'.repeat(70));
  console.log();
  console.log('  npm run automation:suburb-pages     Generate suburb pages');
  console.log('  npm run automation:gbp-posts        Generate GBP posts');
  console.log('  npm run automation:generate-topics  Generate blog topics');
  console.log('  npm run automation:link-outreach    Generate outreach emails');
  console.log();
  console.log('  View detailed usage:  node -e "import(\'./automation/lib/usage-tracker.mjs\').then(m => new m.UsageTracker().generateReport())"');
  console.log('  View logs:            tail -f automation/logs/$(date +%Y-%m-%d).log');
  console.log();
}

/**
 * Main dashboard
 */
async function main() {
  try {
    showHeader();

    // Gather data
    const [apiStats, suburbStats, recentLogs, errorLogs] = await Promise.all([
      getApiStats(),
      getSuburbStats(),
      getRecentLogs(10),
      getErrorLogs(),
    ]);

    // Display sections
    displayApiUsage(apiStats);
    displayContentStats(suburbStats);
    displaySystemHealth(apiStats, errorLogs);
    displayRecentActivity(recentLogs);
    displayErrors(errorLogs);
    displayQuickActions();

    // Footer
    console.log('─'.repeat(70));
    console.log(colors.dim + 'Dashboard auto-refreshes every 30 seconds. Press Ctrl+C to exit.' + colors.reset);
    console.log();

  } catch (error) {
    console.error(colors.red + '✗ Dashboard error:' + colors.reset, error.message);
    process.exit(1);
  }
}

// Run dashboard
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check for --watch flag
  const watch = process.argv.includes('--watch');

  if (watch) {
    // Auto-refresh every 30 seconds
    main();
    setInterval(main, 30000);
  } else {
    // Run once
    main();
  }
}

export { main as showDashboard };
