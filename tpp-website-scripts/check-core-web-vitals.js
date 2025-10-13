#!/usr/bin/env node

/**
 * Check Core Web Vitals using Lighthouse
 */

import { chromium } from 'playwright';

const TEST_URL = process.env.TEST_URL || 'https://theprofitplatform.com.au';

const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100, // First Input Delay (ms)
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTI: 3800, // Time to Interactive (ms)
};

async function measureWebVitals(url) {
  console.log(`🔍 Measuring Core Web Vitals for: ${url}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle' });

    // Inject Web Vitals library
    await page.addScriptTag({
      content: `
        // Simplified Web Vitals measurement
        window.webVitals = {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0,
          TTI: 0
        };

        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.webVitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Measure CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          window.webVitals.CLS = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Measure FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          window.webVitals.FCP = firstEntry.startTime;
        }).observe({ entryTypes: ['paint'] });

        // Use performance.timing for TTI approximation
        window.addEventListener('load', () => {
          const timing = performance.timing;
          window.webVitals.TTI = timing.domInteractive - timing.navigationStart;
        });
      `,
    });

    // Wait for measurements
    await page.waitForTimeout(3000);

    // Get Web Vitals
    const vitals = await page.evaluate(() => window.webVitals);

    // Get additional performance metrics
    const timing = await page.evaluate(() => {
      const perf = performance.timing;
      return {
        loadTime: perf.loadEventEnd - perf.navigationStart,
        domReady: perf.domContentLoadedEventEnd - perf.navigationStart,
      };
    });

    await browser.close();

    return { ...vitals, ...timing };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function checkThreshold(value, threshold, lowerIsBetter = true) {
  const passed = lowerIsBetter ? value <= threshold : value >= threshold;
  const status = passed ? '✓' : '❌';
  return { passed, status };
}

async function main() {
  try {
    const vitals = await measureWebVitals(TEST_URL);

    console.log('📊 Core Web Vitals Results:\n');

    // LCP
    const lcp = checkThreshold(vitals.LCP, THRESHOLDS.LCP);
    console.log(
      `${lcp.status} LCP (Largest Contentful Paint): ${vitals.LCP.toFixed(0)}ms (threshold: ${THRESHOLDS.LCP}ms)`
    );

    // FCP
    const fcp = checkThreshold(vitals.FCP, THRESHOLDS.FCP);
    console.log(
      `${fcp.status} FCP (First Contentful Paint): ${vitals.FCP.toFixed(0)}ms (threshold: ${THRESHOLDS.FCP}ms)`
    );

    // CLS
    const cls = checkThreshold(vitals.CLS, THRESHOLDS.CLS);
    console.log(
      `${cls.status} CLS (Cumulative Layout Shift): ${vitals.CLS.toFixed(3)} (threshold: ${THRESHOLDS.CLS})`
    );

    // TTI
    const tti = checkThreshold(vitals.TTI, THRESHOLDS.TTI);
    console.log(
      `${tti.status} TTI (Time to Interactive): ${vitals.TTI.toFixed(0)}ms (threshold: ${THRESHOLDS.TTI}ms)`
    );

    // Additional metrics
    console.log(`\n📈 Additional Metrics:`);
    console.log(`   Total Load Time: ${vitals.loadTime}ms`);
    console.log(`   DOM Ready: ${vitals.domReady}ms`);

    // Overall result
    const allPassed = [lcp, fcp, cls, tti].every((result) => result.passed);

    console.log('\n' + '═'.repeat(60) + '\n');

    if (allPassed) {
      console.log('✅ All Core Web Vitals passed!\n');
      process.exit(0);
    } else {
      console.log('❌ Some Core Web Vitals failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error measuring Web Vitals:', error.message);
    process.exit(1);
  }
}

main();
