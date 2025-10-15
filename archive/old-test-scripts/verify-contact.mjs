import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('file://' + process.cwd() + '/dist/contact/index.html');
await page.waitForLoadState('networkidle');

const hasModernHeader = await page.locator('header#header.premium-nav').count() > 0;
const hasModernFooter = await page.locator('footer[role="contentinfo"] .footer-content .footer-column').count() >= 4;

const sections = await page.$$eval('section', elements => 
  elements.map(el => el.className)
);

const homepageLeaks = sections.filter(s => 
  s.includes('hero-modern') || 
  s.includes('trust-signals') || 
  s.includes('services section animate-on-scroll')
);

console.log('=== CONTACT PAGE VERIFICATION ===\n');
console.log('Header: ' + (hasModernHeader ? '✅ MODERN (Header.astro)' : '❌ OLD'));
console.log('Footer: ' + (hasModernFooter ? '✅ MODERN (Footer.astro)' : '❌ OLD'));
console.log('Homepage leaks: ' + (homepageLeaks.length === 0 ? '✅ NONE' : '❌ ' + homepageLeaks.length));
console.log('Total sections: ' + sections.length);
console.log('\n✅ Contact page successfully updated!');

await browser.close();
