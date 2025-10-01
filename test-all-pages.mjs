import { chromium } from 'playwright';

const baseUrl = 'https://06f6b696.tpp-new.pages.dev';
const pages = ['pricing', 'seo', 'google-ads', 'disclaimer'];

const browser = await chromium.launch();

console.log('=== TESTING ALL CONVERTED PAGES ===\n');

for (const pageName of pages) {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/${pageName}`);
  await page.waitForLoadState('networkidle');
  
  const sections = await page.$$eval('section', elements => 
    elements.map(el => el.className)
  );
  
  const homepageSections = sections.filter(c => 
    c.includes('hero-modern') || 
    c.includes('trust-signals') || 
    c.includes('services section animate-on-scroll')
  );
  
  const status = homepageSections.length === 0 ? '✅ CLEAN' : '❌ HAS HOMEPAGE';
  console.log(`${status} /${pageName}`);
  console.log(`   Total sections: ${sections.length}`);
  
  if (homepageSections.length > 0) {
    console.log(`   ⚠️  Homepage sections found: ${homepageSections.length}`);
    homepageSections.forEach((s, i) => {
      console.log(`      ${i+1}. ${s}`);
    });
  }
  console.log('');
  
  await page.close();
}

await browser.close();
