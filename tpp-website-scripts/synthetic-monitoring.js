#!/usr/bin/env node

/**
 * Synthetic monitoring - test key user flows
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://theprofitplatform.com.au';

const TESTS = [
  {
    name: 'Homepage loads',
    url: PRODUCTION_URL,
    checks: [
      { selector: 'header', name: 'Header present' },
      { selector: 'nav', name: 'Navigation present' },
      { selector: 'footer', name: 'Footer present' },
    ],
  },
  {
    name: 'Services page loads',
    url: `${PRODUCTION_URL}/services.html`,
    checks: [{ selector: 'h1', name: 'Heading present' }],
  },
  {
    name: 'Contact page loads',
    url: `${PRODUCTION_URL}/contact.html`,
    checks: [
      { selector: 'form', name: 'Contact form present' },
      { selector: 'input[type="email"]', name: 'Email input present' },
    ],
  },
];

async function runTest(test) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`\n🧪 ${test.name}`);
  console.log(`   URL: ${test.url}`);

  try {
    // Navigate to page with timeout
    const response = await page.goto(test.url, {
      waitUntil: 'networkidle',
      timeout: 10000,
    });

    // Check HTTP status
    if (response.status() !== 200) {
      throw new Error(`HTTP ${response.status()}`);
    }
    console.log(`   ✓ HTTP 200 OK`);

    // Run checks
    for (const check of test.checks) {
      const element = await page.$(check.selector);
      if (!element) {
        throw new Error(`${check.name} - selector not found: ${check.selector}`);
      }
      console.log(`   ✓ ${check.name}`);
    }

    // Measure performance
    const timing = await page.evaluate(() => {
      const perf = performance.timing;
      return {
        loadTime: perf.loadEventEnd - perf.navigationStart,
        domReady: perf.domContentLoadedEventEnd - perf.navigationStart,
      };
    });

    console.log(`   ⏱️  Load time: ${timing.loadTime}ms`);
    console.log(`   ⏱️  DOM ready: ${timing.domReady}ms`);

    await browser.close();
    return { success: true, test: test.name };
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    await browser.close();
    return { success: false, test: test.name, error: error.message };
  }
}

async function main() {
  console.log('🔍 Running synthetic monitoring tests...');
  console.log(`📍 Target: ${PRODUCTION_URL}\n`);

  const results = [];

  for (const test of TESTS) {
    const result = await runTest(test);
    results.push(result);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Summary:');
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`   Passed: ${passed}/${results.length}`);
  console.log(`   Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.test}: ${r.error}`);
      });
  }

  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
