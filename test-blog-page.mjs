import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to blog page...');
  await page.goto('http://localhost:4322/blog', { waitUntil: 'networkidle' });
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'blog-page-new.png', fullPage: true });
  
  // Check for new elements
  const heroTitle = await page.textContent('h1');
  console.log('Hero title:', heroTitle);
  
  const searchBox = await page.$('input[type="search"]');
  console.log('Search box exists:', !!searchBox);
  
  const categoryPills = await page.$$('button.group');
  console.log('Category pills count:', categoryPills.length);
  
  await browser.close();
  console.log('\nScreenshot saved: blog-page-new.png');
})();
