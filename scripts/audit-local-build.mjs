import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const baseDir = process.cwd() + '/dist';
const pages = [
  'index', 'about', 'services', 'pricing', 'contact', 
  'portfolio', 'privacy', 'terms', 'disclaimer',
  'seo', 'google-ads', 'web-design'
];

const browser = await chromium.launch();

console.log('=== LOCAL BUILD AUDIT ===\n');

const results = [];

for (const pageName of pages) {
  const page = await browser.newPage();
  const url = pageName === 'index' 
    ? 'file://' + baseDir + '/index.html' 
    : 'file://' + baseDir + '/' + pageName + '/index.html';
  
  try {
    await page.goto(url, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    const sections = await page.$$eval('section', elements => 
      elements.map(el => el.className)
    );
    
    const homepageSections = sections.filter(s => 
      s.includes('hero-modern') || 
      s.includes('trust-signals') || 
      s.includes('services section animate-on-scroll')
    );
    
    // For index page, homepage sections are expected
    const isExpectedHomepage = pageName === 'index' && homepageSections.length > 0;
    
    results.push({
      page: pageName,
      sections: sections.length,
      homepageLeaks: homepageSections.length,
      status: isExpectedHomepage ? 'HOMEPAGE' : (homepageSections.length === 0 ? 'CLEAN' : 'HAS LEAKS')
    });
    
  } catch (error) {
    results.push({
      page: pageName,
      status: 'ERROR',
      error: error.message
    });
  }
  
  await page.close();
}

await browser.close();

console.log('Page            | Sections | Homepage Sections | Status');
console.log('===============================================================');

results.forEach(r => {
  if (r.status === 'ERROR') {
    console.log(r.page.padEnd(15) + ' | ERROR: ' + r.error);
  } else {
    const marker = r.status === 'CLEAN' ? '✅' : (r.status === 'HOMEPAGE' ? '🏠' : '❌');
    console.log(
      marker + ' ' +
      r.page.padEnd(14) + ' | ' +
      r.sections.toString().padEnd(8) + ' | ' +
      r.homepageLeaks.toString().padEnd(17) + ' | ' +
      r.status
    );
  }
});

console.log('\n=== SUMMARY ===');
const clean = results.filter(r => r.status === 'CLEAN');
const homepage = results.filter(r => r.status === 'HOMEPAGE');
const leaks = results.filter(r => r.status === 'HAS LEAKS');

console.log('✅ Clean pages: ' + clean.length);
console.log('🏠 Homepage (expected sections): ' + homepage.length);
console.log('❌ Pages with leaks: ' + leaks.length);

if (leaks.length > 0) {
  console.log('\n⚠️  Pages needing fixes:');
  leaks.forEach(r => {
    console.log('  - ' + r.page + ': ' + r.homepageLeaks + ' homepage sections found');
  });
}
