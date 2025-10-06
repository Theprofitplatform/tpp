import { chromium } from 'playwright';

const PROD_URL = 'https://theprofitplatform.com.au/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025';

async function testBlogPostLayout() {
  console.log('🚀 Starting Playwright blog post layout verification...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log(`📍 Testing URL: ${PROD_URL}\n`);

    // Navigate to the blog post
    await page.goto(PROD_URL, { waitUntil: 'networkidle' });

    console.log('=== HEADER VERIFICATION ===\n');

    // Check for header
    const header = await page.locator('header#header').first();
    const headerExists = await header.count() > 0;
    console.log(`✓ Header exists: ${headerExists ? '✅ YES' : '❌ NO'}`);

    if (headerExists) {
      const headerVisible = await header.isVisible();
      console.log(`✓ Header visible: ${headerVisible ? '✅ YES' : '❌ NO'}`);

      // Check for logo
      const logo = await page.locator('.logo, .premium-logo').first();
      const logoExists = await logo.count() > 0;
      console.log(`✓ Logo exists: ${logoExists ? '✅ YES' : '❌ NO'}`);

      // Check navigation items
      const navItems = [
        { name: 'Home', selector: 'a[href="/"]' },
        { name: 'Services', selector: 'a[href="/services"]' },
        { name: 'Pricing', selector: 'a[href="/pricing"]' },
        { name: 'Tools', selector: 'a[href="/tools"]' },
        { name: 'Contact', selector: 'a[href="/contact"]' }
      ];

      console.log('\n📋 Navigation Menu Items:');
      for (const item of navItems) {
        const element = await page.locator(item.selector).first();
        const exists = await element.count() > 0;
        const visible = exists ? await element.isVisible() : false;
        console.log(`  ${item.name}: ${exists && visible ? '✅' : '❌'} ${exists ? (visible ? 'Visible' : 'Hidden') : 'Not found'}`);
      }

      // Check CTA button
      const ctaButton = await page.locator('.btn-primary, .premium-cta-btn').first();
      const ctaExists = await ctaButton.count() > 0;
      console.log(`✓ CTA Button: ${ctaExists ? '✅ YES' : '❌ NO'}`);
    }

    console.log('\n=== BLOG POST CONTENT ===\n');

    // Check blog post article
    const article = await page.locator('article.blog-post').first();
    const articleExists = await article.count() > 0;
    console.log(`✓ Article element: ${articleExists ? '✅ YES' : '❌ NO'}`);

    // Check post header
    const postHeader = await page.locator('.post-header').first();
    const postHeaderExists = await postHeader.count() > 0;
    console.log(`✓ Post header: ${postHeaderExists ? '✅ YES' : '❌ NO'}`);

    // Check title
    const h1 = await page.locator('h1').first();
    const h1Text = await h1.textContent();
    console.log(`✓ Title: ${h1Text ? '✅' : '❌'}`);
    if (h1Text) {
      console.log(`  "${h1Text.trim()}"`);
    }

    // Check content sections
    const contentDiv = await page.locator('.post-content').first();
    const contentExists = await contentDiv.count() > 0;
    console.log(`✓ Post content: ${contentExists ? '✅ YES' : '❌ NO'}`);

    if (contentExists) {
      const h2Count = await page.locator('.post-content h2').count();
      const pCount = await page.locator('.post-content p').count();
      console.log(`  - H2 headings: ${h2Count}`);
      console.log(`  - Paragraphs: ${pCount}`);
    }

    // Check footer CTA
    const postCTA = await page.locator('.post-cta').first();
    const postCTAExists = await postCTA.count() > 0;
    console.log(`✓ Post CTA: ${postCTAExists ? '✅ YES' : '❌ NO'}`);

    console.log('\n=== FOOTER VERIFICATION ===\n');

    // Check footer
    const footer = await page.locator('footer').first();
    const footerExists = await footer.count() > 0;
    console.log(`✓ Footer exists: ${footerExists ? '✅ YES' : '❌ NO'}`);

    if (footerExists) {
      const footerVisible = await footer.isVisible();
      console.log(`✓ Footer visible: ${footerVisible ? '✅ YES' : '❌ NO'}`);
    }

    console.log('\n=== LAYOUT & CSS CHECKS ===\n');

    // Check if header is positioned at top
    if (headerExists) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        console.log(`✓ Header position: Top=${headerBox.y}px (should be near 0)`);
        console.log(`✓ Header dimensions: ${headerBox.width}px × ${headerBox.height}px`);
      }
    }

    // Check for CSS load errors
    const cssErrors = [];
    page.on('response', response => {
      if (response.url().includes('.css') && !response.ok()) {
        cssErrors.push(response.url());
      }
    });

    // Check viewport and scroll
    const viewportHeight = page.viewportSize().height;
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`✓ Page height: ${bodyHeight}px (viewport: ${viewportHeight}px)`);

    // Take screenshots
    console.log('\n=== SCREENSHOTS ===\n');

    await page.screenshot({
      path: 'blog-post-full.png',
      fullPage: true
    });
    console.log('✓ Full page screenshot: blog-post-full.png');

    await page.screenshot({
      path: 'blog-post-viewport.png',
      fullPage: false
    });
    console.log('✓ Viewport screenshot: blog-post-viewport.png');

    // Mobile test
    console.log('\n=== MOBILE VIEW TEST ===\n');

    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.waitForTimeout(500);

    const mobileHeader = await page.locator('header#header').first();
    const mobileHeaderVisible = await mobileHeader.isVisible();
    console.log(`✓ Header visible on mobile: ${mobileHeaderVisible ? '✅ YES' : '❌ NO'}`);

    const menuToggle = await page.locator('.menu-toggle, #menuToggle').first();
    const menuToggleExists = await menuToggle.count() > 0;
    console.log(`✓ Mobile menu toggle: ${menuToggleExists ? '✅ YES' : '❌ NO'}`);

    await page.screenshot({
      path: 'blog-post-mobile.png',
      fullPage: false
    });
    console.log('✓ Mobile screenshot: blog-post-mobile.png');

    console.log('\n=== SUMMARY ===\n');

    const checks = {
      'Header Present': headerExists,
      'Navigation Working': navItems.every(async (item) => {
        const el = await page.locator(item.selector).first();
        return await el.count() > 0;
      }),
      'Blog Content Present': articleExists && contentExists,
      'Footer Present': footerExists,
      'Mobile Responsive': mobileHeaderVisible && menuToggleExists
    };

    const allPassed = Object.values(checks).every(v => v);

    console.log(allPassed ? '✅ ALL CHECKS PASSED!' : '⚠️  SOME CHECKS FAILED');
    console.log('\nScreenshots saved:');
    console.log('  - blog-post-full.png (desktop full page)');
    console.log('  - blog-post-viewport.png (desktop viewport)');
    console.log('  - blog-post-mobile.png (mobile view)');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testBlogPostLayout().catch(console.error);
