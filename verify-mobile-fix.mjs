import { chromium } from 'playwright';

async function verifyMobileFix() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  await page.goto('https://26893b96.tpp.pages.dev/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025', {
    waitUntil: 'networkidle'
  });

  const check = await page.evaluate(() => {
    const h1s = Array.from(document.querySelectorAll('h1'));
    const visibleH1s = h1s.filter(h1 => {
      const style = window.getComputedStyle(h1);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    return {
      totalH1Count: h1s.length,
      visibleH1Count: visibleH1s.length,
      visibleTitles: visibleH1s.map(h1 => h1.textContent.substring(0, 50))
    };
  });

  console.log('=== MOBILE FIX VERIFICATION ===\n');
  console.log(`Total H1 tags: ${check.totalH1Count}`);
  console.log(`Visible H1 tags: ${check.visibleH1Count}`);
  console.log(`\n${check.visibleH1Count === 1 ? '✅ FIXED!' : '❌ STILL BROKEN'}`);
  console.log(check.visibleH1Count === 1 ? 'Only one H1 visible as expected.' : 'Multiple H1s still showing!');

  await page.screenshot({ path: 'mobile-fixed.png' });
  console.log('\n✓ Screenshot: mobile-fixed.png\n');

  await browser.close();
}

verifyMobileFix().catch(console.error);
