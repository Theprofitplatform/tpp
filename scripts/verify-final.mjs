import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://0f530ec9.tpp-new.pages.dev/pricing');
await page.waitForLoadState('networkidle');

const sections = await page.$$eval('section', elements => 
  elements.map(el => el.className)
);

console.log('=== FINAL DEPLOYMENT - PRICING PAGE SECTIONS ===\n');
console.log('Total sections:', sections.length, '\n');

sections.forEach((className, idx) => {
  const isHomepage = className.includes('hero-modern') || className.includes('trust-signals') || className.includes('services section');
  const marker = isHomepage ? '❌ HOMEPAGE' : '✅ PRICING';
  console.log(marker, (idx + 1) + '. ' + className);
});

const homepageSections = sections.filter(c => 
  c.includes('hero-modern') || c.includes('trust-signals') || c.includes('services section')
);

console.log('\n=== RESULT ===');
if (homepageSections.length === 0) {
  console.log('✅ SUCCESS! No homepage sections found on pricing page.');
} else {
  console.log('❌ FAIL! Still has', homepageSections.length, 'homepage sections.');
}

await browser.close();
