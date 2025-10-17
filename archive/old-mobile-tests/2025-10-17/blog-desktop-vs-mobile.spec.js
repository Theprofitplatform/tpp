import { test, expect } from '@playwright/test';

test('Check desktop blog post order', async ({ page }) => {
  // Set desktop viewport
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Scroll to article start (after header)
  await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (article) article.scrollIntoView();
  });

  await page.screenshot({
    path: 'test-results/blog-desktop-order.png',
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

  console.log('DESKTOP order (top to bottom):');
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name} (Y: ${Math.round(item.y)}px)`);
  });
});

test('Check mobile blog post order', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Scroll to article start (after header)
  await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (article) article.scrollIntoView();
  });

  await page.screenshot({
    path: 'test-results/blog-mobile-order-comparison.png',
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

  console.log('MOBILE order (top to bottom):');
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name} (Y: ${Math.round(item.y)}px)`);
  });
});
