import { test, expect } from '@playwright/test';

test('Mobile blog - capture from absolute top', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 2000 });

  await page.goto('http://localhost:3001/blog/google-ads-bidding-strategies-which-one-is-right-for-your-sydney-business/', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(2000);

  // Scroll to the very top where breadcrumbs start
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(500);

  // Then scroll down just past the main header
  await page.evaluate(() => {
    const header = document.querySelector('#header');
    if (header) {
      window.scrollTo(0, header.offsetHeight);
    }
  });

  await page.waitForTimeout(500);

  // Take a tall screenshot to capture breadcrumbs -> image -> title sequence
  await page.screenshot({
    path: 'test-results/blog-mobile-from-top.png',
    fullPage: false
  });

  console.log('Screenshot saved: test-results/blog-mobile-from-top.png');
  console.log('This should show: Breadcrumbs → Hero Image → Title in sequence');
});
