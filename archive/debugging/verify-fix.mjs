import { chromium } from 'playwright';

async function verifyFix() {
  console.log('🔍 Verifying layout fix with local build...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Test local build
  await page.goto('file:///mnt/c/Users/abhis/projects/atpp/tpp/dist/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/index.html', {
    waitUntil: 'networkidle'
  });

  // Check header positions
  const headerInfo = await page.evaluate(() => {
    const navHeader = document.querySelector('header#header');
    const postHeader = document.querySelector('.post-header');

    return {
      navHeader: navHeader ? {
        position: window.getComputedStyle(navHeader).position,
        top: window.getComputedStyle(navHeader).top,
        boundingTop: navHeader.getBoundingClientRect().top,
        zIndex: window.getComputedStyle(navHeader).zIndex
      } : null,
      postHeader: postHeader ? {
        position: window.getComputedStyle(postHeader).position,
        top: window.getComputedStyle(postHeader).top,
        boundingTop: postHeader.getBoundingClientRect().top,
        marginTop: window.getComputedStyle(postHeader).marginTop
      } : null
    };
  });

  console.log('=== HEADER POSITIONS AFTER FIX ===\n');
  console.log('Navigation Header:', headerInfo.navHeader);
  console.log('\nBlog Post Header:', headerInfo.postHeader);

  // What's at the top of viewport?
  const topElement = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, 50);
    return {
      tagName: el?.tagName,
      id: el?.id,
      className: el?.className?.substring(0, 50)
    };
  });

  console.log('\n=== ELEMENT AT TOP OF VIEWPORT ===');
  console.log(topElement);

  const isNavVisible = topElement.id === 'header' || topElement.tagName === 'HEADER';
  console.log(`\n${isNavVisible ? '✅ Navigation header is visible at top!' : '❌ Navigation header still not visible'}`);

  // Screenshots
  await page.screenshot({ path: 'verify-desktop.png', fullPage: false });
  console.log('\n✓ Desktop screenshot: verify-desktop.png');

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verify-mobile.png', fullPage: false });
  console.log('✓ Mobile screenshot: verify-mobile.png\n');

  await browser.close();
}

verifyFix().catch(console.error);
