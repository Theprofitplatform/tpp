import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Checking blog page with white background...');
  await page.goto('https://dc2f81be.tpp-new.pages.dev/blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

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

  console.log('\nTaking screenshot...');
  await page.screenshot({ path: 'blog-white-bg.png', fullPage: false });
  console.log('✓ Screenshot saved: blog-white-bg.png');

  await browser.close();
  console.log('\n✅ Check complete!');
})();
