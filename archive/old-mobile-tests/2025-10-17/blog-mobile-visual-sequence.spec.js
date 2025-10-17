import { test, expect } from '@playwright/test';

test('Visual sequence of mobile blog elements', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(1500);

  // Take multiple screenshots showing the sequence

  // 1. Scroll to breadcrumbs
  await page.evaluate(() => {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs) {
      window.scrollTo(0, breadcrumbs.offsetTop - 100);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'test-results/mobile-1-breadcrumbs.png',
    fullPage: false
  });

  // 2. Scroll to hero image
  await page.evaluate(() => {
    const hero = document.querySelector('.featured-image-container');
    if (hero) {
      window.scrollTo(0, hero.offsetTop - 100);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'test-results/mobile-2-hero-image.png',
    fullPage: false
  });

  // 3. Scroll to title
  await page.evaluate(() => {
    const header = document.querySelector('.post-header');
    if (header) {
      window.scrollTo(0, header.offsetTop - 100);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'test-results/mobile-3-title.png',
    fullPage: false
  });

  console.log('\nScreenshots saved:');
  console.log('  1. mobile-1-breadcrumbs.png');
  console.log('  2. mobile-2-hero-image.png');
  console.log('  3. mobile-3-title.png');
});
