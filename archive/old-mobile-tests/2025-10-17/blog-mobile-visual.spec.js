import { test, expect } from '@playwright/test';

test('Blog post mobile layout visual check', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Navigate to a blog post
  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');

  // Wait for content to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Take full-page screenshot
  await page.screenshot({
    path: 'test-results/blog-mobile-current-order.png',
    fullPage: true
  });

  console.log('Screenshot saved to test-results/blog-mobile-current-order.png');
});
