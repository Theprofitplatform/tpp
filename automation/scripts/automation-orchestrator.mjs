#!/usr/bin/env node

/**
 * SEO Automation Orchestrator
 * Master script that runs all automation systems on schedule
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const CONFIG = {
  // Automation schedule
  schedule: {
    daily: [
      { name: 'review-automation', time: '09:00', days: [1, 2, 3, 4, 5] }, // Weekdays
    ],
    weekly: [
      { name: 'rank-tracker', time: '08:00', day: 1 }, // Mondays
      { name: 'gbp-auto-poster', time: '07:00', day: 1 }, // Mondays (generate posts for week)
    ],
    monthly: [
      { name: 'generate-suburb-pages', time: '09:00', dayOfMonth: 1 }, // 1st of month
      { name: 'link-outreach', time: '10:00', dayOfMonth: 1 }, // 1st of month
    ],
  },

  // Script paths
  scripts: {
    'generate-suburb-pages': './automation/scripts/generate-suburb-pages.mjs',
    'gbp-auto-poster': './automation/scripts/gbp-auto-poster.mjs',
    'review-automation': './automation/scripts/review-automation.mjs',
    'rank-tracker': './automation/scripts/rank-tracker.mjs',
    'link-outreach': './automation/scripts/link-outreach.mjs',
  },

  // Logging
  logDir: './automation/logs',
  statusFile: './automation/data/automation-status.json',
};

/**
 * Run a single automation script
 */
async function runAutomation(scriptName) {
  const scriptPath = CONFIG.scripts[scriptName];

  if (!scriptPath) {
    throw new Error(`Unknown script: ${scriptName}`);
  }

  console.log(`🚀 Running: ${scriptName}...`);

  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`);

    const duration = Date.now() - startTime;

    // Log output
    const logPath = path.join(
      CONFIG.logDir,
      `${scriptName}-${new Date().toISOString().split('T')[0]}.log`
    );

    const logContent = `
=== ${scriptName} ===
Started: ${new Date(startTime).toISOString()}
Duration: ${duration}ms

STDOUT:
${stdout}

STDERR:
${stderr || '(none)'}

Status: ✅ SUCCESS
`;

    await fs.mkdir(CONFIG.logDir, { recursive: true });
    await fs.writeFile(logPath, logContent);

    console.log(`✅ ${scriptName} completed in ${duration}ms`);

    return {
      script: scriptName,
      status: 'success',
      duration,
      timestamp: new Date().toISOString(),
      log: logPath,
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ ${scriptName} failed:`, error.message);

    // Log error
    const logPath = path.join(
      CONFIG.logDir,
      `${scriptName}-${new Date().toISOString().split('T')[0]}.log`
    );

    const logContent = `
=== ${scriptName} ===
Started: ${new Date(startTime).toISOString()}
Duration: ${duration}ms

ERROR:
${error.message}

STACK:
${error.stack}

Status: ❌ FAILED
`;

    await fs.mkdir(CONFIG.logDir, { recursive: true });
    await fs.writeFile(logPath, logContent);

    return {
      script: scriptName,
      status: 'failed',
      duration,
      timestamp: new Date().toISOString(),
      error: error.message,
      log: logPath,
    };
  }
}

/**
 * Check what should run today
 */
function getScheduledTasks() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = now.getDate();
  const currentHour = now.getHours();

  const tasks = [];

  // Check daily tasks
  for (const task of CONFIG.schedule.daily) {
    if (task.days.includes(dayOfWeek)) {
      tasks.push(task.name);
    }
  }

  // Check weekly tasks
  for (const task of CONFIG.schedule.weekly) {
    if (task.day === dayOfWeek) {
      tasks.push(task.name);
    }
  }

  // Check monthly tasks
  for (const task of CONFIG.schedule.monthly) {
    if (task.dayOfMonth === dayOfMonth) {
      tasks.push(task.name);
    }
  }

  return [...new Set(tasks)]; // Remove duplicates
}

/**
 * Run all scheduled automations
 */
async function runScheduled() {
  console.log('🕐 Checking scheduled automations...\n');

  const tasks = getScheduledTasks();

  if (tasks.length === 0) {
    console.log('✅ No automations scheduled for today');
    return;
  }

  console.log(`📋 Scheduled tasks for today: ${tasks.join(', ')}\n`);

  const results = [];

  for (const task of tasks) {
    const result = await runAutomation(task);
    results.push(result);

    // Wait between tasks
    if (tasks.indexOf(task) < tasks.length - 1) {
      console.log('⏳ Waiting 10 seconds before next task...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Save status
  await saveStatus(results);

  // Print summary
  printSummary(results);
}

/**
 * Run specific automation manually
 */
async function runManual(scriptName) {
  console.log(`🔧 Running ${scriptName} manually...\n`);

  const result = await runAutomation(scriptName);

  await saveStatus([result]);

  printSummary([result]);
}

/**
 * Save automation status
 */
async function saveStatus(results) {
  await fs.mkdir(path.dirname(CONFIG.statusFile), { recursive: true });

  let status = {};
  try {
    const existing = await fs.readFile(CONFIG.statusFile, 'utf-8');
    status = JSON.parse(existing);
  } catch (error) {
    // File doesn't exist yet
  }

  const today = new Date().toISOString().split('T')[0];

  if (!status[today]) {
    status[today] = [];
  }

  status[today].push(...results);

  await fs.writeFile(CONFIG.statusFile, JSON.stringify(status, null, 2));
}

/**
 * Print summary
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 AUTOMATION SUMMARY');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log(`\n✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  console.log('\nDetails:');
  results.forEach(r => {
    const icon = r.status === 'success' ? '✅' : '❌';
    console.log(`   ${icon} ${r.script} (${r.duration}ms)`);
    if (r.error) {
      console.log(`      Error: ${r.error}`);
    }
  });

  console.log('\n' + '='.repeat(50));
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
🤖 SEO Automation Orchestrator

USAGE:
  node automation/scripts/automation-orchestrator.mjs [command] [script]

COMMANDS:
  scheduled       Run all automations scheduled for today (default)
  run <script>    Run specific automation manually
  list            List all available automations
  status          Show recent automation status
  help            Show this help message

AVAILABLE SCRIPTS:
  - generate-suburb-pages    Generate new suburb landing pages
  - gbp-auto-poster         Generate Google Business Profile posts
  - review-automation       Process review requests
  - rank-tracker           Track keyword rankings
  - link-outreach          Generate link building outreach emails

EXAMPLES:
  # Run scheduled automations
  node automation/scripts/automation-orchestrator.mjs scheduled

  # Run specific automation
  node automation/scripts/automation-orchestrator.mjs run rank-tracker

  # Check status
  node automation/scripts/automation-orchestrator.mjs status

AUTOMATION SCHEDULE:
  Daily (Weekdays):
    - review-automation (9:00 AM)

  Weekly (Mondays):
    - rank-tracker (8:00 AM)
    - gbp-auto-poster (7:00 AM)

  Monthly (1st of month):
    - generate-suburb-pages (9:00 AM)
    - link-outreach (10:00 AM)

SETUP AS CRON JOB:
  # Run daily at 6:00 AM
  0 6 * * * cd /path/to/project && node automation/scripts/automation-orchestrator.mjs scheduled >> /path/to/project/automation/logs/cron.log 2>&1
  `);
}

/**
 * List all automations
 */
function listAutomations() {
  console.log('\n📋 Available Automations:\n');

  Object.entries(CONFIG.scripts).forEach(([name, path]) => {
    console.log(`   ${name}`);
    console.log(`   Path: ${path}`);

    // Find schedule
    const dailySchedule = CONFIG.schedule.daily.find(s => s.name === name);
    const weeklySchedule = CONFIG.schedule.weekly.find(s => s.name === name);
    const monthlySchedule = CONFIG.schedule.monthly.find(s => s.name === name);

    if (dailySchedule) {
      const days = dailySchedule.days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
      console.log(`   Schedule: Daily at ${dailySchedule.time} (${days})`);
    } else if (weeklySchedule) {
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weeklySchedule.day];
      console.log(`   Schedule: Weekly on ${day} at ${weeklySchedule.time}`);
    } else if (monthlySchedule) {
      console.log(`   Schedule: Monthly on day ${monthlySchedule.dayOfMonth} at ${monthlySchedule.time}`);
    } else {
      console.log(`   Schedule: Manual only`);
    }

    console.log('');
  });
}

/**
 * Show automation status
 */
async function showStatus() {
  try {
    const statusData = await fs.readFile(CONFIG.statusFile, 'utf-8');
    const status = JSON.parse(statusData);

    console.log('\n📊 Recent Automation Status:\n');

    const dates = Object.keys(status).sort().reverse().slice(0, 7); // Last 7 days

    for (const date of dates) {
      console.log(`\n${date}:`);

      const runs = status[date];
      runs.forEach(run => {
        const icon = run.status === 'success' ? '✅' : '❌';
        console.log(`   ${icon} ${run.script} (${run.duration}ms)`);
      });
    }

  } catch (error) {
    console.log('⚠️  No status data available yet');
  }
}

/**
 * Main execution
 */
async function main() {
  const [,, command = 'scheduled', arg] = process.argv;

  switch (command) {
    case 'scheduled':
      await runScheduled();
      break;

    case 'run':
      if (!arg) {
        console.error('❌ Error: Specify script name');
        console.log('Usage: node automation-orchestrator.mjs run <script-name>');
        process.exit(1);
      }
      await runManual(arg);
      break;

    case 'list':
      listAutomations();
      break;

    case 'status':
      await showStatus();
      break;

    case 'help':
      printHelp();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
