/**
 * Hero Image Debug Test
 * Deep dive into why hero images aren't showing
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://theprofitplatform.com.au';

test.describe('Hero Image Debug', () => {

  test('Debug hero image on scale-local-seo post', async ({ page }) => {
    console.log('\n🔍 Starting hero image debug...\n');

    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    console.log('✓ Page loaded\n');

    // 1. Check if featured-image-container exists in DOM
    const containerExists = await page.locator('.featured-image-container').count();
    console.log(`1. Featured image container count: ${containerExists}`);

    if (containerExists === 0) {
      console.log('   ❌ ISSUE: .featured-image-container not found in DOM');

      // Check if coverImage is in the page source
      const pageContent = await page.content();
      const hasCoverImage = pageContent.includes('coverImage');
      console.log(`   - Page source contains "coverImage": ${hasCoverImage}`);

      if (hasCoverImage) {
        console.log('   - coverImage exists in source but not rendered');
      }

      return;
    }

    console.log('   ✓ Container found\n');

    // 2. Check if image element exists
    const imageExists = await page.locator('.featured-image img').count();
    console.log(`2. Image element count: ${imageExists}`);

    if (imageExists === 0) {
      console.log('   ❌ ISSUE: <img> element not found inside container');

      // Get container HTML
      const containerHTML = await page.locator('.featured-image-container').innerHTML();
      console.log(`   - Container HTML:\n${containerHTML.substring(0, 500)}`);

      return;
    }

    console.log('   ✓ Image element found\n');

    // 3. Get image attributes
    const img = page.locator('.featured-image img');
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    const loading = await img.getAttribute('loading');

    console.log('3. Image attributes:');
    console.log(`   - src: ${src}`);
    console.log(`   - alt: ${alt}`);
    console.log(`   - loading: ${loading}\n`);

    if (!src) {
      console.log('   ❌ ISSUE: Image src is empty or null');
      return;
    }

    // 4. Check if image is visible
    const isVisible = await img.isVisible();
    console.log(`4. Image visible: ${isVisible}`);

    if (!isVisible) {
      console.log('   ⚠️  Image exists but not visible - checking CSS...\n');

      // Get computed styles
      const display = await img.evaluate(el => window.getComputedStyle(el).display);
      const opacity = await img.evaluate(el => window.getComputedStyle(el).opacity);
      const visibility = await img.evaluate(el => window.getComputedStyle(el).visibility);
      const width = await img.evaluate(el => window.getComputedStyle(el).width);
      const height = await img.evaluate(el => window.getComputedStyle(el).height);

      console.log('   CSS properties:');
      console.log(`   - display: ${display}`);
      console.log(`   - opacity: ${opacity}`);
      console.log(`   - visibility: ${visibility}`);
      console.log(`   - width: ${width}`);
      console.log(`   - height: ${height}\n`);
    }

    // 5. Check if image loaded successfully
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    const naturalHeight = await img.evaluate(el => el.naturalHeight);
    const complete = await img.evaluate(el => el.complete);

    console.log('5. Image load status:');
    console.log(`   - naturalWidth: ${naturalWidth}`);
    console.log(`   - naturalHeight: ${naturalHeight}`);
    console.log(`   - complete: ${complete}\n`);

    if (naturalWidth === 0 || naturalHeight === 0) {
      console.log('   ❌ ISSUE: Image failed to load (network error or invalid URL)');

      // Try to load the image URL directly
      console.log(`   - Attempting to fetch image directly...\n`);
      const response = await page.goto(src);
      console.log(`   - Response status: ${response.status()}`);
      console.log(`   - Response headers: ${JSON.stringify(await response.allHeaders())}\n`);

      return;
    }

    console.log('   ✓ Image loaded successfully\n');

    // 6. Get container styles that might be hiding it
    const container = page.locator('.featured-image-container');
    const containerDisplay = await container.evaluate(el => window.getComputedStyle(el).display);
    const containerOpacity = await container.evaluate(el => window.getComputedStyle(el).opacity);
    const containerHeight = await container.evaluate(el => window.getComputedStyle(el).height);

    console.log('6. Container CSS:');
    console.log(`   - display: ${containerDisplay}`);
    console.log(`   - opacity: ${containerOpacity}`);
    console.log(`   - height: ${containerHeight}\n`);

    // 7. Take a screenshot
    await page.screenshot({
      path: 'debug-hero-image.png',
      fullPage: false
    });
    console.log('7. Screenshot saved: debug-hero-image.png\n');

    // 8. Check if any parent elements are hidden
    const parents = await page.locator('.featured-image-container').evaluate(el => {
      const results = [];
      let current = el.parentElement;
      while (current && current.tagName !== 'BODY') {
        const styles = window.getComputedStyle(current);
        results.push({
          tag: current.tagName,
          class: current.className,
          display: styles.display,
          opacity: styles.opacity,
          visibility: styles.visibility
        });
        current = current.parentElement;
      }
      return results;
    });

    console.log('8. Parent element styles:');
    parents.forEach((parent, i) => {
      console.log(`   ${i + 1}. <${parent.tag}${parent.class ? ' class="' + parent.class + '"' : ''}>`);
      console.log(`      display: ${parent.display}, opacity: ${parent.opacity}, visibility: ${parent.visibility}`);
    });

    console.log('\n✅ Debug complete!\n');
  });

  test('Check what frontmatter data is being passed', async ({ page }) => {
    console.log('\n🔍 Checking frontmatter data...\n');

    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);
    await page.waitForLoadState('networkidle');

    // Check page source for coverImage
    const content = await page.content();

    // Look for coverImage in various forms
    const checks = [
      { name: 'coverImage string', pattern: /coverImage.*?unsplash/i },
      { name: 'data-astro attributes', pattern: /data-astro-cid/i },
      { name: 'featured-image-container', pattern: /featured-image-container/i },
      { name: 'Unsplash URL', pattern: /images\.unsplash\.com/i },
    ];

    checks.forEach(check => {
      const found = check.pattern.test(content);
      console.log(`${found ? '✓' : '✗'} ${check.name}: ${found}`);
    });

    // Extract the actual coverImage URL if present
    const coverImageMatch = content.match(/src="(https:\/\/images\.unsplash\.com[^"]+)"/);
    if (coverImageMatch) {
      console.log(`\n✓ Found Unsplash URL in HTML: ${coverImageMatch[1]}\n`);
    } else {
      console.log('\n✗ No Unsplash URL found in HTML source\n');
    }

    // Check if the post data is available in a script tag
    const scriptContent = await page.locator('script[type="application/ld+json"]').first().textContent();
    if (scriptContent) {
      console.log('Schema.org data present:');
      const schema = JSON.parse(scriptContent);
      console.log(`  - Type: ${schema['@type']}`);
      console.log(`  - Title: ${schema.headline}\n`);
    }
  });

  test('Compare with working post that has image', async ({ page }) => {
    console.log('\n🔍 Comparing with working post...\n');

    // Check the Google Ads post that already had an image
    await page.goto(`${PROD_URL}/blog/2025-10-04-7-google-ads-mistakes-costing-sydney-businesses-thousands-every-month-test/`);
    await page.waitForLoadState('networkidle');

    const img = page.locator('.featured-image img');
    const exists = await img.count();

    console.log(`Working post image count: ${exists}`);

    if (exists > 0) {
      const src = await img.getAttribute('src');
      const isVisible = await img.isVisible();
      const naturalWidth = await img.evaluate(el => el.naturalWidth);

      console.log(`  ✓ Image src: ${src}`);
      console.log(`  ✓ Visible: ${isVisible}`);
      console.log(`  ✓ Loaded: ${naturalWidth > 0}\n`);

      // Get the HTML structure
      const containerHTML = await page.locator('.featured-image-container').innerHTML();
      console.log('Working post HTML structure:');
      console.log(containerHTML.substring(0, 400) + '...\n');
    }
  });

});
