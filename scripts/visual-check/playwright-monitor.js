#!/usr/bin/env node

/**
 * Playwright-Based Visual Monitoring System
 *
 * Runs proven Playwright tests instead of flawed custom detector
 * - Executes production-validation.spec.js
 * - Captures screenshots for each page
 * - Logs results to summary.json
 * - Triggers email notifications
 *
 * Usage:
 *   node playwright-monitor.js
 *   node playwright-monitor.js --send-email
 */

import { execSync } from 'child_process';
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const sendEmail = args.includes('--send-email');

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/services', name: 'services' },
  { path: '/blog', name: 'blog' },
  { path: '/contact', name: 'contact' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/cookies', name: 'cookies' }
];

const BASE_URL = 'https://theprofitplatform.com.au';

/**
 * Run Playwright tests
 */
function runPlaywrightTests() {
  console.log('🎭 Running Playwright validation tests...\n');

  try {
    const output = execSync('npx playwright test --config=playwright.config.js', {
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error('❌ Tests failed:', error.stdout || error.message);
    return { success: false, output: error.stdout || error.message, error };
  }
}

/**
 * Parse test results from JSON
 */
function parseTestResults() {
  const resultsPath = path.join(__dirname, 'test-results/results.json');

  if (!fs.existsSync(resultsPath)) {
    console.warn('⚠️  No test results JSON found');
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    // Use stats directly from Playwright JSON
    if (data.stats) {
      const stats = {
        total: data.stats.expected + data.stats.unexpected,
        passed: data.stats.expected,
        failed: data.stats.unexpected,
        failures: []
      };

      // Recursively collect failures from suites
      function collectFailures(suite) {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            if (!spec.ok && spec.tests && spec.tests[0]) {
              stats.failures.push({
                title: spec.title,
                file: spec.file,
                error: spec.tests[0].results[0]?.error?.message || 'Unknown error'
              });
            }
          });
        }
        if (suite.suites) {
          suite.suites.forEach(collectFailures);
        }
      }

      data.suites.forEach(collectFailures);

      return stats;
    }

    return null;
  } catch (error) {
    console.error('❌ Error parsing test results:', error.message);
    return null;
  }
}

/**
 * Capture screenshots for all pages
 */
async function captureScreenshots() {
  console.log('\n📸 Capturing screenshots...\n');

  const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
  const screenshotsDir = path.join(__dirname, 'screenshots', `run-${timestamp}`);

  const browser = await chromium.launch({ headless: true });

  for (const pageInfo of PAGES) {
    const pageName = pageInfo.name;
    const pageUrl = `${BASE_URL}${pageInfo.path}`;

    console.log(`  📷 ${pageName}...`);

    try {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true
      });

      // Desktop screenshot
      const desktopPage = await context.newPage();
      await desktopPage.setViewportSize({ width: 1920, height: 1080 });
      await desktopPage.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });

      const desktopDir = path.join(screenshotsDir, `_${pageName}`, `theprofitplatform-com-au-${pageName}`, 'desktop');
      fs.mkdirSync(desktopDir, { recursive: true });

      await desktopPage.screenshot({
        path: path.join(desktopDir, 'viewport.png'),
        fullPage: false
      });
      await desktopPage.screenshot({
        path: path.join(desktopDir, 'full-page.png'),
        fullPage: true
      });

      await desktopPage.close();

      // Mobile screenshot
      const mobilePage = await context.newPage();
      await mobilePage.setViewportSize({ width: 375, height: 812 });
      await mobilePage.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });

      const mobileDir = path.join(screenshotsDir, `_${pageName}`, `theprofitplatform-com-au-${pageName}`, 'mobile');
      fs.mkdirSync(mobileDir, { recursive: true });

      await mobilePage.screenshot({
        path: path.join(mobileDir, 'viewport.png'),
        fullPage: false
      });
      await mobilePage.screenshot({
        path: path.join(mobileDir, 'full-page.png'),
        fullPage: true
      });

      await mobilePage.close();
      await context.close();

      console.log(`    ✅ ${pageName} screenshots captured`);
    } catch (error) {
      console.error(`    ❌ Failed to capture ${pageName}:`, error.message);
    }
  }

  await browser.close();

  console.log(`\n✅ Screenshots saved to: ${screenshotsDir}\n`);
  return screenshotsDir;
}

/**
 * Update summary.json
 */
function updateSummary(testStats) {
  const summaryPath = path.join(__dirname, 'logs/summary.json');

  let summary = [];
  if (fs.existsSync(summaryPath)) {
    summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  }

  const previousRun = summary.length > 0 ? summary[summary.length - 1] : null;
  const issuesDelta = previousRun
    ? testStats.failed - previousRun.totalIssues
    : 0;

  const status = previousRun
    ? (issuesDelta < 0 ? 'improved' : issuesDelta > 0 ? 'degraded' : 'unchanged')
    : 'initial';

  const newEntry = {
    runId: Date.now(),
    timestamp: new Date().toISOString(),
    totalIssues: testStats.failed,
    fixesGenerated: 0, // Playwright tests don't auto-fix
    status,
    issuesDelta,
    testsPassed: testStats.passed,
    testsTotal: testStats.total,
    note: 'Playwright-based validation (accurate)'
  };

  summary.push(newEntry);

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('📝 Summary updated:');
  console.log(`  Total Issues: ${testStats.failed}`);
  console.log(`  Tests Passed: ${testStats.passed}/${testStats.total}`);
  console.log(`  Status: ${status.toUpperCase()}`);
  console.log(`  Delta: ${issuesDelta >= 0 ? '+' : ''}${issuesDelta}\n`);
}

/**
 * Send email notification
 */
function sendEmailNotification() {
  console.log('📧 Sending email notification...\n');

  try {
    const emailScript = path.join(__dirname, 'send-dynamic-report.js');
    execSync(`node ${emailScript}`, {
      cwd: __dirname,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Playwright Visual Monitoring System\n');
  console.log('='.repeat(50));
  console.log('\n');

  const startTime = Date.now();

  // Run Playwright tests
  const testResult = runPlaywrightTests();

  // Parse results
  const testStats = parseTestResults();

  if (!testStats) {
    console.error('❌ Could not parse test results. Exiting.');
    process.exit(1);
  }

  // Capture screenshots
  await captureScreenshots();

  // Update summary
  updateSummary(testStats);

  // Send email if requested
  if (sendEmail) {
    sendEmailNotification();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('='.repeat(50));
  console.log(`\n✅ Monitoring complete in ${duration}s\n`);

  // Exit with appropriate code
  if (testStats.failed > 0) {
    console.log(`⚠️  ${testStats.failed} issue(s) detected\n`);
    process.exit(2);
  } else {
    console.log('✅ Site is healthy - 0 issues\n');
    process.exit(0);
  }
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(3);
});
