import { test, expect } from '@playwright/test';

test('full page mobile screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');
  await page.waitForLoadState('networkidle');

  // Scroll to very top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Take full page screenshot
  await page.screenshot({
    path: 'test-results/blog-mobile-full-page.png',
    fullPage: true
  });

  // Check if elements are visible
  const breadcrumbsVisible = await page.locator('.breadcrumbs').isVisible();
  const imageVisible = await page.locator('.featured-image-container').isVisible();
  const headerVisible = await page.locator('.post-header').isVisible();

  console.log('Breadcrumbs visible:', breadcrumbsVisible);
  console.log('Featured image visible:', imageVisible);
  console.log('Post header visible:', headerVisible);

  // Get computed styles
  const blogPostStyles = await page.locator('.blog-post').evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      display: styles.display,
      flexDirection: styles.flexDirection
    };
  });

  console.log('Blog post styles:', blogPostStyles);

  // Check if we're on mobile viewport
  const width = await page.evaluate(() => window.innerWidth);
  console.log('Viewport width:', width);
});
