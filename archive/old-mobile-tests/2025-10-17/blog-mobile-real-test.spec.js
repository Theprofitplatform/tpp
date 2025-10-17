import { test, expect } from '@playwright/test';

test('Mobile blog - real browser test for Google Ads post', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Navigate with cache disabled
  await page.goto('http://localhost:3001/blog/google-ads-bidding-strategies-which-one-is-right-for-your-sydney-business/', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(2000);

  // Scroll to top of article
  await page.evaluate(() => {
    const article = document.querySelector('article.blog-post');
    if (article) {
      window.scrollTo(0, article.offsetTop - 100);
    }
  });

  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({
    path: 'test-results/blog-google-ads-mobile.png',
    fullPage: false
  });

  // Get actual visual positions
  const positions = await page.evaluate(() => {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    const image = document.querySelector('.featured-image-container');
    const header = document.querySelector('.post-header');
    const title = header?.querySelector('.post-title');

    return {
      breadcrumbs: {
        exists: !!breadcrumbs,
        y: breadcrumbs?.getBoundingClientRect().top || -1,
        text: breadcrumbs?.textContent?.trim().substring(0, 50) || ''
      },
      image: {
        exists: !!image,
        y: image?.getBoundingClientRect().top || -1,
        height: image?.getBoundingClientRect().height || 0
      },
      header: {
        exists: !!header,
        y: header?.getBoundingClientRect().top || -1,
        titleText: title?.textContent?.trim() || ''
      }
    };
  });

  console.log('\n=== Mobile Blog Layout Test ===');
  console.log('\n1. Breadcrumbs:', positions.breadcrumbs.exists ? '✓' : '✗');
  console.log('   Y position:', Math.round(positions.breadcrumbs.y));
  console.log('   Text:', positions.breadcrumbs.text);

  console.log('\n2. Featured Image:', positions.image.exists ? '✓' : '✗');
  console.log('   Y position:', Math.round(positions.image.y));
  console.log('   Height:', Math.round(positions.image.height), 'px');

  console.log('\n3. Post Header (Title):', positions.header.exists ? '✓' : '✗');
  console.log('   Y position:', Math.round(positions.header.y));
  console.log('   Title:', positions.header.titleText.substring(0, 50));

  console.log('\n=== Order Check ===');

  const imageBeforeTitle = positions.image.y < positions.header.y;
  const breadcrumbsFirst = positions.breadcrumbs.y < positions.image.y;

  if (breadcrumbsFirst && imageBeforeTitle) {
    console.log('✓ CORRECT: Breadcrumbs → Hero Image → Title');
  } else {
    console.log('✗ WRONG ORDER!');
    console.log('  Expected: Breadcrumbs → Hero Image → Title');
    console.log('  Got:',
      breadcrumbsFirst ? 'Breadcrumbs first ✓' : 'Breadcrumbs NOT first ✗',
      imageBeforeTitle ? 'Image before title ✓' : 'Image NOT before title ✗'
    );
  }

  // Verify correct order
  expect(breadcrumbsFirst, 'Breadcrumbs should be first').toBe(true);
  expect(imageBeforeTitle, 'Hero image should be before title').toBe(true);
  expect(positions.image.height > 100, 'Hero image should be visible').toBe(true);
});
