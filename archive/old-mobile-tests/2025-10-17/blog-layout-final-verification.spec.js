import { test, expect } from '@playwright/test';

test('Desktop and mobile blog layouts match', async ({ page, browserName }) => {
  const isMobile = browserName === 'webkit' || page.viewportSize()?.width < 768;

  if (isMobile) {
    await page.setViewportSize({ width: 375, height: 667 });
  } else {
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  await page.goto('http://localhost:3001/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(1000);

  // Scroll to article
  await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (article) article.scrollIntoView();
  });

  const screenshotName = isMobile ? 'blog-mobile-final' : 'blog-desktop-final';
  await page.screenshot({
    path: `test-results/${screenshotName}.png`,
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

  const viewportType = isMobile ? '📱 MOBILE' : '🖥️  DESKTOP';
  console.log(`\n${viewportType} Layout Order:`);
  items.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.name}`);
  });

  // Both desktop and mobile should have: Breadcrumbs -> Title -> Image
  const correctOrder =
    items[0].name === 'Breadcrumbs' &&
    items[1].name === 'Post Header (Title)' &&
    items[2].name === 'Featured Image';

  expect(correctOrder).toBe(true);
});
