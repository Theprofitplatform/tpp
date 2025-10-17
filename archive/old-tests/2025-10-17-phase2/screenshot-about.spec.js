import { test } from '@playwright/test';

test('Screenshot current about page', async ({ page }) => {
  // Go to production with cache bypass
  await page.goto('https://theprofitplatform.com.au/about/', {
    waitUntil: 'networkidle'
  });

  // Take full page screenshot
  await page.screenshot({
    path: 'test-results/about-current-full.png',
    fullPage: true
  });

  // Take viewport screenshot
  await page.screenshot({
    path: 'test-results/about-current-viewport.png'
  });

  console.log('✅ Screenshots saved to test-results/');
  console.log('   - about-current-full.png (full page)');
  console.log('   - about-current-viewport.png (viewport)');
});
