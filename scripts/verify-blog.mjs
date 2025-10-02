import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to blog page...');
  await page.goto('http://localhost:4322/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Take screenshots
  await page.screenshot({ path: 'blog-hero-section.png', clip: { x: 0, y: 0, width: 1920, height: 800 } });
  console.log('✓ Hero section screenshot saved');
  
  // Check page structure
  console.log('\n=== PAGE STRUCTURE ===');
  
  const h1Text = await page.textContent('h1');
  console.log('H1 text:', h1Text?.trim());
  
  const hasSearch = await page.$('input[type="search"]') !== null;
  console.log('Has search bar:', hasSearch);
  
  const categoryButtons = await page.$$('button.group');
  console.log('Category buttons:', categoryButtons.length);
  
  const articles = await page.$$('article');
  console.log('Article cards:', articles.length);
  
  // Check if it's the old design
  const hasOldHero = await page.$('.hero-modern') !== null;
  console.log('Has old hero class:', hasOldHero);
  
  // Check if it's the new design
  const hasGradientHero = await page.$('section.bg-gradient-to-br');
  console.log('Has new gradient hero:', hasGradientHero !== null);
  
  // Get the actual HTML of the hero section
  const heroHTML = await page.$eval('main section:first-child', el => el.outerHTML.substring(0, 500));
  console.log('\n=== HERO SECTION HTML (first 500 chars) ===');
  console.log(heroHTML);
  
  await browser.close();
})();
