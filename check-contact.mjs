import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Check local build
await page.goto('file://' + process.cwd() + '/dist/contact/index.html');
await page.waitForLoadState('networkidle');

const hasModernHeader = await page.locator('header#header.premium-nav').count() > 0;
const hasOldHeader = await page.locator('header#site-header').count() > 0;

const hasModernFooter = await page.locator('footer[role="contentinfo"] .footer-content .footer-column').count() >= 4;

const sections = await page.$$eval('section', elements => 
  elements.map(el => el.className)
);

const homepageLeaks = sections.filter(s => 
  s.includes('hero-modern') || 
  s.includes('trust-signals') || 
  s.includes('services section animate-on-scroll')
);

const scripts = await page.$$eval('script[src]', elements =>
  elements.map(el => el.src).filter(src => 
    src.includes('component-loader') || 
    src.includes('emergency-fixes')
  )
);

console.log('=== CONTACT PAGE ANALYSIS ===\n');
console.log('Header: ' + (hasModernHeader ? '✅ MODERN' : (hasOldHeader ? '⚠️  OLD' : '❌ INLINE')));
console.log('Footer: ' + (hasModernFooter ? '✅ MODERN' : '⚠️  OLD'));
console.log('Total sections: ' + sections.length);
console.log('Homepage leaks: ' + (homepageLeaks.length === 0 ? '✅ NONE' : '❌ ' + homepageLeaks.length));
console.log('Bad scripts: ' + (scripts.length === 0 ? '✅ NONE' : '❌ ' + scripts.length));

if (homepageLeaks.length > 0) {
  console.log('\n⚠️  Homepage sections found:');
  homepageLeaks.forEach(s => console.log('   - ' + s));
}

if (scripts.length > 0) {
  console.log('\n⚠️  Problematic scripts:');
  scripts.forEach(s => console.log('   - ' + s));
}

console.log('\nAll sections:');
sections.forEach((s, i) => console.log('   ' + (i+1) + '. ' + s));

await browser.close();
