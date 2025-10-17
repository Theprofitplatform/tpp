import { test, expect } from '@playwright/test';

test('Mobile blog has hero image before title', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/', {
    waitUntil: 'networkidle'
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll to article start
  await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (article) article.scrollIntoView();
  });

  await page.screenshot({
    path: 'test-results/blog-mobile-hero-on-top.png',
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
  if (elements.image) items.push({ name: 'Hero Image', y: elements.image.top });
  if (elements.header) items.push({ name: 'Title/Header', y: elements.header.top });

  items.sort((a, b) => a.y - b.y);

  console.log('\n📱 MOBILE Layout Order:');
  items.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.name} (Y: ${Math.round(item.y)}px)`);
  });

  console.log('\n✅ Desired mobile order:');
  console.log('   1. Breadcrumbs');
  console.log('   2. Hero Image (Featured Image)');
  console.log('   3. Title/Header');

  // Verify: Breadcrumbs -> Image -> Title
  const correctOrder =
    items[0].name === 'Breadcrumbs' &&
    items[1].name === 'Hero Image' &&
    items[2].name === 'Title/Header';

  if (correctOrder) {
    console.log('\n✓ SUCCESS: Hero image is on top (before title)!');
  } else {
    console.log('\n✗ FAILED: Order is incorrect');
  }

  expect(correctOrder).toBe(true);
});
