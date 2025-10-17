import { test, expect } from '@playwright/test';

test('Blog post mobile top section order', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Navigate to a blog post
  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');

  // Wait for content to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Scroll to top
  await page.evaluate(() => window.scrollTo(0, 0));

  // Take screenshot of top section (first 2000px)
  await page.screenshot({
    path: 'test-results/blog-mobile-top-section.png',
    fullPage: false,
    clip: { x: 0, y: 0, width: 375, height: 1500 }
  });

  console.log('Screenshot saved to test-results/blog-mobile-top-section.png');

  // Check the visual positions
  const breadcrumbsBox = await page.locator('.breadcrumbs').boundingBox();
  const imageBox = await page.locator('.featured-image-container').boundingBox();
  const headerBox = await page.locator('.post-header').boundingBox();

  console.log('Breadcrumbs Y:', breadcrumbsBox?.y);
  console.log('Featured Image Y:', imageBox?.y);
  console.log('Post Header Y:', headerBox?.y);

  // The desired order is: breadcrumbs -> image -> header
  // So breadcrumbs.y < image.y < header.y
  const correctOrder =
    breadcrumbsBox.y < imageBox.y &&
    imageBox.y < headerBox.y;

  if (correctOrder) {
    console.log('✓ Order is CORRECT: Breadcrumbs -> Image -> Header');
  } else {
    console.log('✗ Order is WRONG!');
    console.log('Current order from top to bottom:');
    const elements = [
      { name: 'Breadcrumbs', y: breadcrumbsBox.y },
      { name: 'Featured Image', y: imageBox.y },
      { name: 'Post Header', y: headerBox.y }
    ].sort((a, b) => a.y - b.y);
    elements.forEach((el, i) => console.log(`${i + 1}. ${el.name} (Y: ${el.y})`));
  }

  expect(correctOrder).toBe(true);
});
