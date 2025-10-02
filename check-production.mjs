import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Checking production site: https://theprofitplatform.com.au/blog/');
  await page.goto('https://theprofitplatform.com.au/blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== HERO SECTION BACKGROUND ===');
  const heroSection = await page.$('.blog-hero');
  if (heroSection) {
    const bgColor = await heroSection.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        background: computed.background
      };
    });
    console.log('Hero background:', bgColor);
  }

  console.log('\n=== BODY BACKGROUND ===');
  const bodyBg = await page.evaluate(() => {
    const computed = window.getComputedStyle(document.body);
    return {
      backgroundColor: computed.backgroundColor,
      background: computed.background
    };
  });
  console.log('Body background:', bodyBg);

  console.log('\n=== CHECKING FOR INLINE STYLES ===');
  const hasInlineStyles = await page.evaluate(() => {
    const style = document.querySelector('style');
    return style ? style.textContent.includes('background: #ffffff') : false;
  });
  console.log('Has white background inline styles:', hasInlineStyles);

  console.log('\n=== TAKING SCREENSHOT ===');
  await page.screenshot({ path: 'production-blog-check.png', fullPage: false });
  console.log('✓ Screenshot saved: production-blog-check.png');

  console.log('\n=== STATS POSITIONING ===');
  const stats = await page.$('.hero-stats');
  if (stats) {
    const statsInfo = await stats.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      return {
        width: rect.width,
        left: rect.left,
        center: rect.left + rect.width / 2,
        display: computed.display,
        gridColumns: computed.gridTemplateColumns
      };
    });
    console.log('Stats container:', statsInfo);
    const offset = Math.round(Math.abs(statsInfo.center - 960));
    console.log(`Stats center offset: ${offset}px`);
  }

  await browser.close();
  console.log('\n✅ Check complete!');
})();
