import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4321/blog/how-to-scale-local-seo/', { waitUntil: 'networkidle' });
  
  await page.screenshot({ path: 'blog-final-desktop.png', fullPage: true });
  
  // Test mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4321/blog/how-to-scale-local-seo/', { waitUntil: 'networkidle' });
  
  await page.screenshot({ path: 'blog-final-mobile.png', fullPage: true });
  
  console.log('✅ Screenshots captured successfully');
  console.log('📸 blog-final-desktop.png');
  console.log('📸 blog-final-mobile.png');
  
  await browser.close();
})();
