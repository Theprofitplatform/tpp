import { test, expect } from '@playwright/test';

test.describe('Blog Post Mobile Layout Order', () => {
  test('should display elements in correct order on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to a blog post
    await page.goto('http://localhost:3001/blog/seo-case-study-first-page-rankings');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Take a full-page screenshot to see the current order
    await page.screenshot({
      path: 'test-results/blog-mobile-order-before.png',
      fullPage: true
    });

    // Get the blog-post article element
    const article = page.locator('article.blog-post');

    // Check that article uses flexbox
    const display = await article.evaluate(el => window.getComputedStyle(el).display);
    console.log('Article display:', display);

    // Get all direct children and their order values
    const children = await article.locator('> *').all();
    const childrenInfo = [];

    for (const child of children) {
      const className = await child.getAttribute('class');
      const order = await child.evaluate(el => window.getComputedStyle(el).order);
      const tagName = await child.evaluate(el => el.tagName);
      childrenInfo.push({ tagName, className, order });
    }

    console.log('Children order:', childrenInfo);

    // Expected order:
    // 1. breadcrumbs (order: 1)
    // 2. featured-image-container (order: 2)
    // 3. post-header (order: 3)

    expect(childrenInfo.find(c => c.className?.includes('breadcrumbs'))?.order).toBe('1');
    expect(childrenInfo.find(c => c.className?.includes('featured-image-container'))?.order).toBe('2');
    expect(childrenInfo.find(c => c.className?.includes('post-header'))?.order).toBe('3');
  });

  test('should verify visual order matches expected order', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to a blog post
    await page.goto('http://localhost:3001/blog/seo-case-study-first-page-rankings');
    await page.waitForLoadState('networkidle');

    // Get positions of elements
    const breadcrumbsBox = await page.locator('.breadcrumbs').boundingBox();
    const imageBox = await page.locator('.featured-image-container').boundingBox();
    const headerBox = await page.locator('.post-header').boundingBox();

    console.log('Breadcrumbs Y:', breadcrumbsBox?.y);
    console.log('Image Y:', imageBox?.y);
    console.log('Header Y:', headerBox?.y);

    // Verify visual order (Y position should be in order)
    expect(breadcrumbsBox.y).toBeLessThan(imageBox.y);
    expect(imageBox.y).toBeLessThan(headerBox.y);
  });
});
