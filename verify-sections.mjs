import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://855886db.tpp-new.pages.dev/pricing');
await page.waitForLoadState('networkidle');

// Get the page HTML
const bodyHTML = await page.evaluate(() => {
  return document.body.innerHTML.substring(0, 50000);
});

// Check if homepage sections exist in the actual DOM
const hasHomepageSections = bodyHTML.includes('hero-modern');

console.log('Has hero-modern in DOM:', hasHomepageSections);

// Count all sections
const sectionCount = await page.$$eval('section', els => els.length);
console.log('Total sections found:', sectionCount);

// Get main content
const mainContent = await page.$eval('main#main-content', el => el.innerHTML.substring(0, 200));
console.log('\nMain content preview:', mainContent.replace(/\n/g, ' ').substring(0, 150));

await browser.close();
