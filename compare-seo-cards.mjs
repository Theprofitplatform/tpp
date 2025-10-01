import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Check the HTML file
  const htmlPath = 'file://' + path.join(__dirname, 'services.html');
  console.log('Opening:', htmlPath);
  await page.goto(htmlPath);
  await page.waitForLoadState('networkidle');

  const seoCardHTML = await page.locator('.service-card').filter({ hasText: 'SEO Services' }).first();
  if (await seoCardHTML.count() > 0) {
    await seoCardHTML.screenshot({ path: 'seo-card-html.png' });
    console.log('✅ HTML version screenshot saved to seo-card-html.png');

    const bgColorHTML = await seoCardHTML.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    console.log('HTML Card Styles:', bgColorHTML);
  }

  await browser.close();
})();
