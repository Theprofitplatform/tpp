/**
 * Mobile Blog Layout Test
 * Validates that blog posts display correctly on mobile without overlay issues
 */

import { test, expect } from '@playwright/test';

// Mobile viewport configuration (iPhone 12/13/14 size)
const mobileViewport = {
  width: 390,
  height: 844,
};

const testPosts = [
  '/blog/how-to-scale-local-seo/',
  '/blog/parramatta-plumber-case-study/',
  '/blog/remarketing-campaigns-that-actually-convert-for-sydney-ecommerce/',
];

test.describe('Mobile Blog Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(mobileViewport);
  });

  for (const postUrl of testPosts) {
    test(`${postUrl} - should have proper mobile layout without overlay`, async ({ page }) => {
      // Navigate to the blog post
      await page.goto(`http://localhost:3006${postUrl}`);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Wait for the main elements to be visible
      await page.waitForSelector('.post-header', { state: 'visible' });
      await page.waitForSelector('.featured-image-container', { state: 'visible' });
      await page.waitForSelector('.post-meta-wrapper', { state: 'visible' });

      // Get bounding boxes of key elements
      const breadcrumbs = await page.locator('.breadcrumbs').boundingBox();
      const header = await page.locator('.post-header').boundingBox();
      const featuredImage = await page.locator('.featured-image-container').boundingBox();
      const metaWrapper = await page.locator('.post-meta-wrapper').boundingBox();
      const postContent = await page.locator('.post-content').boundingBox();

      // Verify elements exist
      expect(breadcrumbs).not.toBeNull();
      expect(header).not.toBeNull();
      expect(featuredImage).not.toBeNull();
      expect(metaWrapper).not.toBeNull();
      expect(postContent).not.toBeNull();

      // Verify vertical ordering (Y positions)
      console.log('\nElement positions:');
      console.log('Breadcrumbs Y:', breadcrumbs.y);
      console.log('Header Y:', header.y);
      console.log('Featured Image Y:', featuredImage.y);
      console.log('Meta Wrapper Y:', metaWrapper.y);
      console.log('Post Content Y:', postContent.y);

      // Assert proper vertical ordering
      expect(breadcrumbs.y).toBeLessThan(header.y, 'Breadcrumbs should be above header');
      expect(header.y).toBeLessThan(featuredImage.y, 'Header should be above featured image');
      expect(featuredImage.y).toBeLessThan(metaWrapper.y, 'Featured image should be above meta wrapper');
      expect(metaWrapper.y).toBeLessThan(postContent.y, 'Meta wrapper should be above content');

      // Verify no overlapping between header and featured image
      const headerBottom = header.y + header.height;
      expect(headerBottom).toBeLessThanOrEqual(featuredImage.y + 5, 'Header should not overlap featured image');

      // Check that title is visible and readable
      const title = page.locator('.post-title');
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText.length).toBeGreaterThan(0);

      // Check that description is visible
      const description = page.locator('.post-lead');
      await expect(description).toBeVisible();

      // Verify share buttons are visible and properly sized
      const shareButtons = page.locator('.share-btn');
      const shareButtonCount = await shareButtons.count();
      expect(shareButtonCount).toBeGreaterThanOrEqual(4, 'Should have at least 4 share buttons');

      // Check first share button size (should be at least 44x44px for touch targets)
      const firstShareBtn = shareButtons.first();
      const shareBtnBox = await firstShareBtn.boundingBox();
      expect(shareBtnBox.width).toBeGreaterThanOrEqual(44, 'Share button width should be at least 44px');
      expect(shareBtnBox.height).toBeGreaterThanOrEqual(44, 'Share button height should be at least 44px');

      // Verify category badge is visible
      const categoryBadge = page.locator('.category-badge');
      await expect(categoryBadge).toBeVisible();

      // Check that tags are visible if they exist
      const tags = page.locator('.post-tags');
      const tagsCount = await tags.count();
      if (tagsCount > 0) {
        await expect(tags.first()).toBeVisible();

        // Tags should be in meta wrapper, below featured image
        const tagsBox = await tags.first().boundingBox();
        expect(tagsBox.y).toBeGreaterThan(featuredImage.y, 'Tags should be below featured image');
      }

      // Take a full-page screenshot for visual verification
      await page.screenshot({
        path: `tests/screenshots/mobile-${postUrl.replace(/\//g, '-')}.png`,
        fullPage: true
      });

      console.log(`✓ Layout verified for ${postUrl}`);
    });
  }

  test('Mobile layout - Featured image should be full width', async ({ page }) => {
    await page.goto('http://localhost:3006/blog/how-to-scale-local-seo/');
    await page.waitForLoadState('networkidle');

    const featuredImage = await page.locator('.featured-image-container').boundingBox();
    const viewport = page.viewportSize();

    // Featured image should span full viewport width on mobile
    expect(featuredImage.x).toBeLessThanOrEqual(1, 'Featured image should start at left edge');
    expect(featuredImage.width).toBeGreaterThanOrEqual(viewport.width - 2, 'Featured image should be full width');
  });

  test('Mobile layout - Author info should be below featured image', async ({ page }) => {
    await page.goto('http://localhost:3006/blog/parramatta-plumber-case-study/');
    await page.waitForLoadState('networkidle');

    const featuredImage = await page.locator('.featured-image-container').boundingBox();
    const authorInfo = await page.locator('.author-info').boundingBox();

    expect(authorInfo.y).toBeGreaterThan(featuredImage.y + featuredImage.height,
      'Author info should be positioned below featured image');
  });

  test('Mobile layout - No text should overlay on featured image', async ({ page }) => {
    await page.goto('http://localhost:3006/blog/remarketing-campaigns-that-actually-convert-for-sydney-ecommerce/');
    await page.waitForLoadState('networkidle');

    const featuredImage = await page.locator('.featured-image-container').boundingBox();
    const title = await page.locator('.post-title').boundingBox();
    const description = await page.locator('.post-lead').boundingBox();

    // Title and description should be completely above the featured image
    expect(title.y + title.height).toBeLessThanOrEqual(featuredImage.y + 5,
      'Title should not overlap featured image');
    expect(description.y + description.height).toBeLessThanOrEqual(featuredImage.y + 5,
      'Description should not overlap featured image');
  });

  test('Mobile layout - Typography and spacing check', async ({ page }) => {
    await page.goto('http://localhost:3006/blog/how-to-scale-local-seo/');
    await page.waitForLoadState('networkidle');

    // Check title font size
    const title = page.locator('.post-title');
    const titleFontSize = await title.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    const titleFontSizeNum = parseFloat(titleFontSize);
    expect(titleFontSizeNum).toBeGreaterThan(24); // Should be ~30px (1.875rem)
    expect(titleFontSizeNum).toBeLessThan(36); // But not too large

    // Check description font size
    const description = page.locator('.post-lead');
    const descFontSize = await description.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    const descFontSizeNum = parseFloat(descFontSize);
    expect(descFontSizeNum).toBeGreaterThan(14); // Should be ~17px (1.0625rem)

    // Check proper spacing
    const header = await page.locator('.post-header').boundingBox();
    expect(header.height).toBeGreaterThan(150, 'Header should have adequate height with padding');
  });
});
