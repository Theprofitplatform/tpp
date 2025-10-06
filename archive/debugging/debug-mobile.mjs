import { chromium } from 'playwright';

async function debugMobile() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });

  await page.goto('https://0c1c3810.tpp.pages.dev/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025', {
    waitUntil: 'networkidle'
  });

  // Check for duplicate elements
  const analysis = await page.evaluate(() => {
    const h1s = Array.from(document.querySelectorAll('h1'));
    const postTitles = Array.from(document.querySelectorAll('.post-title'));
    const postHeaders = Array.from(document.querySelectorAll('.post-header'));

    return {
      h1Count: h1s.length,
      h1Texts: h1s.map(h1 => ({
        text: h1.textContent.substring(0, 50),
        className: h1.className,
        computedStyle: {
          position: window.getComputedStyle(h1).position,
          display: window.getComputedStyle(h1).display,
          zIndex: window.getComputedStyle(h1).zIndex
        }
      })),
      postTitleCount: postTitles.length,
      postHeaderCount: postHeaders.length,
      postHeaderStyles: postHeaders.map(header => ({
        position: window.getComputedStyle(header).position,
        zIndex: window.getComputedStyle(header).zIndex,
        overflow: window.getComputedStyle(header).overflow
      }))
    };
  });

  console.log('=== MOBILE DEBUG ANALYSIS ===\n');
  console.log(JSON.stringify(analysis, null, 2));

  await page.screenshot({ path: 'mobile-debug.png' });
  console.log('\n✓ Screenshot: mobile-debug.png');

  await browser.close();
}

debugMobile().catch(console.error);
