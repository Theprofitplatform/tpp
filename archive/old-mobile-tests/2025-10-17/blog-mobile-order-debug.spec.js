import { test, expect } from '@playwright/test';

test('Debug blog post mobile layout order', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Navigate to a blog post
  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');

  // Wait for content to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Scroll to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Take screenshot of viewport (what user sees first)
  await page.screenshot({
    path: 'test-results/blog-mobile-viewport.png',
    fullPage: false
  });

  // Get the actual visual order by checking what's in viewport
  const elements = await page.evaluate(() => {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    const image = document.querySelector('.featured-image-container');
    const header = document.querySelector('.post-header');

    return {
      breadcrumbs: breadcrumbs ? breadcrumbs.getBoundingClientRect() : null,
      image: image ? image.getBoundingClientRect() : null,
      header: header ? header.getBoundingClientRect() : null
    };
  });

  console.log('Element positions (relative to viewport):');
  console.log('Breadcrumbs:', elements.breadcrumbs);
  console.log('Featured Image:', elements.image);
  console.log('Post Header:', elements.header);

  // Determine visual order
  const items = [];
  if (elements.breadcrumbs) items.push({ name: 'Breadcrumbs', y: elements.breadcrumbs.top });
  if (elements.image) items.push({ name: 'Featured Image', y: elements.image.top });
  if (elements.header) items.push({ name: 'Post Header (Title)', y: elements.header.top });

  items.sort((a, b) => a.y - b.y);

  console.log('\nCurrent visual order (top to bottom):');
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name} (Y: ${Math.round(item.y)}px)`);
  });

  console.log('\nDesired order should be:');
  console.log('1. Breadcrumbs');
  console.log('2. Featured Image');
  console.log('3. Post Header (Title)');
});
