import { test, expect } from '@playwright/test';

test.describe('Blog Post Mobile Layout', () => {
  test('hero image should appear before title on mobile', async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to a blog post
    await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get the positions of elements
    const breadcrumbsBox = await page.locator('.breadcrumbs').boundingBox();
    const featuredImageBox = await page.locator('.featured-image-container').boundingBox();
    const postHeaderBox = await page.locator('.post-header').boundingBox();

    console.log('Breadcrumbs Y position:', breadcrumbsBox?.y);
    console.log('Featured Image Y position:', featuredImageBox?.y);
    console.log('Post Header Y position:', postHeaderBox?.y);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/blog-mobile-layout.png',
      fullPage: false
    });

    // Verify order: breadcrumbs -> image -> header
    expect(breadcrumbsBox?.y).toBeLessThan(featuredImageBox?.y || Infinity);
    expect(featuredImageBox?.y).toBeLessThan(postHeaderBox?.y || Infinity);

    // Check if blog-post has flex display
    const blogPost = page.locator('.blog-post');
    const display = await blogPost.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });

    const flexDirection = await blogPost.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });

    console.log('Blog post display:', display);
    console.log('Blog post flex-direction:', flexDirection);

    // Check order property
    const breadcrumbsOrder = await page.locator('.breadcrumbs').evaluate((el) => {
      return window.getComputedStyle(el).order;
    });

    const featuredImageOrder = await page.locator('.featured-image-container').evaluate((el) => {
      return window.getComputedStyle(el).order;
    });

    const postHeaderOrder = await page.locator('.post-header').evaluate((el) => {
      return window.getComputedStyle(el).order;
    });

    console.log('Breadcrumbs order:', breadcrumbsOrder);
    console.log('Featured image order:', featuredImageOrder);
    console.log('Post header order:', postHeaderOrder);

    // Verify CSS order properties
    expect(breadcrumbsOrder).toBe('1');
    expect(featuredImageOrder).toBe('2');
    expect(postHeaderOrder).toBe('3');
  });

  test('visual verification - top of page on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to blog post
    await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // Take screenshot of top portion
    await page.screenshot({
      path: 'test-results/blog-mobile-top-portion.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 390, height: 844 }
    });

    console.log('Screenshot saved to test-results/blog-mobile-top-portion.png');
  });
});
