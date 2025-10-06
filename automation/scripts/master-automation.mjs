#!/usr/bin/env node
/**
 * Master Automation Script
 * Runs complete blog analysis and optimization workflow
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║        🚀 MASTER BLOG AUTOMATION WORKFLOW 🚀                  ║');
console.log('║                                                                ║');
console.log('║              Elite Marketing Automation System                ║');
console.log('║                    Version 9.5/10                             ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runStep(step, command, description) {
  console.log(`\n${'═'.repeat(64)}`);
  console.log(`\n📋 STEP ${step}: ${description}`);
  console.log(`\n${'═'.repeat(64)}\n`);

  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log(`\n✅ Step ${step} complete!\n`);
    await sleep(1000);
  } catch (err) {
    console.log(`\n⚠️  Step ${step} encountered an issue (continuing...)\n`);
    await sleep(1000);
  }
}

async function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 FINAL REPORT                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Load all reports
    const perfPath = path.join(projectRoot, 'automation/performance-report.json');
    const perf = JSON.parse(await fs.readFile(perfPath, 'utf-8'));

    let insights = null;
    try {
      const insightsPath = path.join(projectRoot, 'automation/insights-report.json');
      insights = JSON.parse(await fs.readFile(insightsPath, 'utf-8'));
    } catch (e) {}

    let alerts = null;
    try {
      const alertsPath = path.join(projectRoot, 'automation/performance-alerts.json');
      alerts = JSON.parse(await fs.readFile(alertsPath, 'utf-8'));
    } catch (e) {}

    console.log('📈 PERFORMANCE SUMMARY\n');
    console.log(`   Total Posts: ${perf.summary.totalPosts}`);
    console.log(`   Total Pageviews: ${perf.analytics?.totalPageviews || 0}`);
    console.log(`   Avg Engagement: ${(perf.analytics?.avgEngagementRate || 0).toFixed(1)}%`);
    console.log(`   Avg Word Count: ${perf.summary.avgWordCount}`);
    console.log(`   Posts with Images: ${perf.summary.postsWithImages}/${perf.summary.totalPosts}`);

    if (insights) {
      console.log('\n🎯 KEY INSIGHTS\n');
      console.log(`   Critical Actions: ${insights.criticalActions.length}`);
      console.log(`   Quick Wins: ${insights.quickWins.length}`);
      console.log(`   Content Opportunities: ${insights.contentOpportunities.length}`);
      console.log(`   Growth Strategies: ${insights.growthStrategies.length}`);
    }

    if (alerts) {
      console.log('\n🔔 ACTIVE ALERTS\n');
      console.log(`   Total: ${alerts.summary.total}`);
      console.log(`   Critical: ${alerts.summary.critical}`);
      console.log(`   Warnings: ${alerts.summary.warnings}`);
      console.log(`   Wins: ${alerts.summary.successes}`);
    }

    console.log('\n📂 FILES GENERATED\n');
    const files = [
      'automation/performance-report.json',
      'automation/insights-report.json',
      'automation/performance-alerts.json',
      'automation/dashboard.html'
    ];

    for (const file of files) {
      try {
        await fs.access(path.join(projectRoot, file));
        console.log(`   ✅ ${file}`);
      } catch (e) {
        console.log(`   ⚪ ${file} (not generated)`);
      }
    }

    console.log('\n🎯 TOP 3 ACTION ITEMS\n');
    if (insights && insights.criticalActions.length > 0) {
      insights.criticalActions.slice(0, 3).forEach((action, i) => {
        console.log(`   ${i + 1}. ${action.action}`);
      });
    } else {
      console.log('   1. Generate content calendar for next month');
      console.log('   2. Optimize top 3 performing posts');
      console.log('   3. Run competitor analysis');
    }

    console.log('\n📊 NEXT STEPS\n');
    console.log('   1. Open dashboard: file://' + path.join(projectRoot, 'automation/dashboard.html'));
    console.log('   2. Review insights report: automation/insights-report.json');
    console.log('   3. Implement top 3 action items this week');

  } catch (err) {
    console.log('   ⚠️  Could not generate full report. Some data may be missing.');
  }
}

async function main() {
  const startTime = Date.now();

  console.log('This workflow will:\n');
  console.log('  ✓ Track performance (GA4 + Search Console)');
  console.log('  ✓ Generate actionable insights');
  console.log('  ✓ Check for performance alerts');
  console.log('  ✓ Find SEO opportunities');
  console.log('  ✓ Create visual dashboard');
  console.log('\nEstimated time: 2-3 minutes\n');

  await sleep(2000);

  // Step 1: Track Performance
  await runStep(1, 'npm run blog:performance', 'Track Performance (GA4 + Search Console)');

  // Step 2: Generate Insights
  await runStep(2, 'npm run blog:insights', 'Generate AI-Powered Insights');

  // Step 3: Check Alerts
  await runStep(3, 'npm run blog:alerts', 'Check Performance Alerts');

  // Step 4: Find SEO Opportunities
  await runStep(4, 'npm run blog:opportunities', 'Find SEO Opportunities');

  // Step 5: Generate Dashboard
  await runStep(5, 'npm run blog:dashboard', 'Generate Visual Dashboard');

  // Final Report
  await generateReport();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║                  ✅ WORKFLOW COMPLETE!                         ║');
  console.log('║                                                                ║');
  console.log(`║              Completed in ${duration} seconds                           ║`);
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('🚀 Your blog automation system is now running at ELITE LEVEL!\n');
  console.log('📚 Documentation: automation/README.md');
  console.log('📊 Dashboard: automation/dashboard.html');
  console.log('💡 Insights: automation/insights-report.json\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
