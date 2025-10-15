import { chromium } from 'playwright';

const baseUrl = 'https://06f6b696.tpp-new.pages.dev';
const pages = [
  'index', 'about', 'services', 'pricing', 'contact', 
  'portfolio', 'privacy', 'terms', 'disclaimer',
  'seo', 'google-ads', 'web-design'
];

const browser = await chromium.launch();

console.log('=== COMPREHENSIVE PAGE AUDIT ===\n');

const results = [];

for (const pageName of pages) {
  const page = await browser.newPage();
  const url = pageName === 'index' ? baseUrl : baseUrl + '/' + pageName;
  
  try {
    await page.goto(url, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    const hasHeaderComponent = await page.locator('header#header.premium-nav').count() > 0;
    const hasOldHeader = await page.locator('header#site-header').count() > 0;
    
    const hasFooterComponent = await page.locator('footer[role="contentinfo"] .footer-content .footer-column').count() >= 4;
    const hasSimpleFooter = await page.locator('footer .footer-columns').count() > 0;
    
    const sections = await page.$$eval('section', elements => 
      elements.map(el => el.className)
    );
    
    const homepageSections = sections.filter(s => 
      s.includes('hero-modern') || 
      s.includes('trust-signals') || 
      s.includes('services section animate-on-scroll')
    );
    
    const scripts = await page.$$eval('script[src]', elements =>
      elements.map(el => el.src).filter(src => 
        src.includes('component-loader') || 
        src.includes('emergency-fixes') ||
        src.includes('consolidated')
      )
    );
    
    results.push({
      page: pageName,
      headerType: hasHeaderComponent ? 'MODERN' : (hasOldHeader ? 'OLD' : 'INLINE'),
      footerType: hasFooterComponent ? 'MODERN' : 'OLD',
      sections: sections.length,
      homepageLeaks: homepageSections.length,
      badScripts: scripts.length,
      status: hasHeaderComponent && hasFooterComponent && homepageSections.length === 0 ? 'GOOD' : 'UPDATE'
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

console.log('Page            | Header    | Footer    | Sections | Leaks | Scripts | Status');
console.log('================================================================================');

results.forEach(r => {
  if (r.status === 'ERROR') {
    console.log(r.page + ' - ERROR: ' + r.error);
  } else {
    const status = r.status === 'GOOD' ? 'OK' : 'NEEDS UPDATE';
    console.log(
      r.page.padEnd(15) + ' | ' +
      r.headerType.padEnd(9) + ' | ' +
      r.footerType.padEnd(9) + ' | ' +
      r.sections.toString().padEnd(8) + ' | ' +
      r.homepageLeaks.toString().padEnd(5) + ' | ' +
      r.badScripts.toString().padEnd(7) + ' | ' +
      status
    );
  }
});

console.log('\n=== SUMMARY ===');
const needsUpdate = results.filter(r => r.status === 'UPDATE');
const good = results.filter(r => r.status === 'GOOD');

console.log('Good pages: ' + good.length);
console.log('Pages needing update: ' + needsUpdate.length);

if (needsUpdate.length > 0) {
  console.log('\nPages to update:');
  needsUpdate.forEach(r => {
    const issues = [];
    if (r.headerType !== 'MODERN') issues.push('header');
    if (r.footerType !== 'MODERN') issues.push('footer');
    if (r.homepageLeaks > 0) issues.push(r.homepageLeaks + ' leaks');
    if (r.badScripts > 0) issues.push(r.badScripts + ' bad scripts');
    console.log('  - ' + r.page + ': ' + issues.join(', '));
  });
}
