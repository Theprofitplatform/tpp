import { test } from '@playwright/test';

test('Final about page check - full page', async ({ page }) => {
  // Go to production with cache bypass
  await page.goto('https://theprofitplatform.com.au/about/?nocache=' + Date.now(), {
    waitUntil: 'networkidle'
  });

  // Wait a bit for any animations
  await page.waitForTimeout(2000);

  // Take full page screenshot
  await page.screenshot({
    path: 'test-results/about-final-full.png',
    fullPage: true
  });

  // Scroll to middle of page
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'test-results/about-final-middle.png'
  });

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'test-results/about-final-bottom.png'
  });

  console.log('✅ Full page screenshots saved:');
  console.log('   - about-final-full.png (entire page)');
  console.log('   - about-final-middle.png (mid-section)');
  console.log('   - about-final-bottom.png (footer area)');
});
