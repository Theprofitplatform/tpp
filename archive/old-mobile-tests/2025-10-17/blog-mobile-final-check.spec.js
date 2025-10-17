import { test, expect } from '@playwright/test';

test('Verify mobile order matches desktop', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/', {
    waitUntil: 'networkidle'
  });

  // Force reload to clear cache
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to article start
  await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (article) article.scrollIntoView();
  });

  await page.screenshot({
    path: 'test-results/blog-mobile-fixed-order.png',
    fullPage: false
  });

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

  const items = [];
  if (elements.breadcrumbs) items.push({ name: 'Breadcrumbs', y: elements.breadcrumbs.top });
  if (elements.image) items.push({ name: 'Featured Image', y: elements.image.top });
  if (elements.header) items.push({ name: 'Post Header (Title)', y: elements.header.top });

  items.sort((a, b) => a.y - b.y);

  console.log('\n📱 MOBILE order after fix (top to bottom):');
  items.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.name} (Y: ${Math.round(item.y)}px)`);
  });

  console.log('\n✅ Expected order (matching desktop):');
  console.log('   1. Breadcrumbs');
  console.log('   2. Post Header (Title)');
  console.log('   3. Featured Image');

  // Verify the order matches desktop: Breadcrumbs -> Title -> Image
  const correctOrder =
    items[0].name === 'Breadcrumbs' &&
    items[1].name === 'Post Header (Title)' &&
    items[2].name === 'Featured Image';

  if (correctOrder) {
    console.log('\n✓ SUCCESS: Mobile order now matches desktop!');
  } else {
    console.log('\n✗ FAILED: Order does not match desktop yet');
  }

  expect(correctOrder).toBe(true);
});
