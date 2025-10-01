import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://cb1351d1.tpp-new.pages.dev/pricing');
await page.waitForLoadState('networkidle');

const sectionCount = await page.$$eval('section', els => els.length);
console.log('Total sections found:', sectionCount);

const sections = await page.$$eval('section', elements => 
  elements.map(el => el.className)
);

console.log('\n=== SECTIONS ON PRICING PAGE ===');
sections.forEach((className, idx) => {
  console.log((idx + 1) + '. ' + className);
});

await browser.close();
