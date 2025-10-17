import { test, expect } from '@playwright/test';

test('Capture breadcrumbs and hero section on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1200 });

  await page.goto('http://localhost:3001/blog/google-ads-bidding-strategies-which-one-is-right-for-your-sydney-business/', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(2000);

  // Find where the breadcrumbs actually are
  const breadcrumbsPosition = await page.evaluate(() => {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    return breadcrumbs ? breadcrumbs.offsetTop : 0;
  });

  console.log('Breadcrumbs position:', breadcrumbsPosition);

  // Scroll to breadcrumbs
  await page.evaluate((pos) => {
    window.scrollTo(0, Math.max(0, pos - 10));
  }, breadcrumbsPosition);

  await page.waitForTimeout(500);

  // Take screenshot showing breadcrumbs + what comes after
  await page.screenshot({
    path: 'test-results/blog-breadcrumbs-section.png',
    fullPage: false
  });

  // Now get the exact order of elements
  const elementOrder = await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (!article) return { error: 'No article found' };

    const children = Array.from(article.children);
    const order = children.map((child, index) => {
      const classes = child.className || '';
      const tag = child.tagName;
      const y = child.getBoundingClientRect().top + window.scrollY;

      let name = 'Unknown';
      if (classes.includes('breadcrumbs')) name = 'Breadcrumbs';
      else if (classes.includes('featured-image-container')) name = 'Featured Image';
      else if (classes.includes('post-header')) name = 'Post Header (Title)';
      else if (classes.includes('blog-layout')) name = 'Blog Layout (Content)';

      return {
        index,
        name,
        tag,
        classes: classes.substring(0, 50),
        y: Math.round(y)
      };
    });

    return order;
  });

  console.log('\n=== Actual DOM Order in <article> ===');
  elementOrder.forEach((el) => {
    console.log(`${el.index + 1}. ${el.name} (${el.tag}) - Y: ${el.y}px`);
    if (el.classes) console.log(`   Classes: ${el.classes}`);
  });

  // Find the specific elements we care about
  const breadcrumbs = elementOrder.find(el => el.name === 'Breadcrumbs');
  const image = elementOrder.find(el => el.name === 'Featured Image');
  const header = elementOrder.find(el => el.name === 'Post Header (Title)');

  console.log('\n=== Visual Order ===');
  if (breadcrumbs && image && header) {
    const sorted = [breadcrumbs, image, header].sort((a, b) => a.y - b.y);
    sorted.forEach((el, i) => {
      console.log(`${i + 1}. ${el.name}`);
    });

    const correct =
      sorted[0].name === 'Breadcrumbs' &&
      sorted[1].name === 'Featured Image' &&
      sorted[2].name === 'Post Header (Title)';

    console.log(correct ? '\n✓ ORDER IS CORRECT' : '\n✗ ORDER IS WRONG');
  }
});
