import { chromium } from 'playwright';

const deploymentUrl = 'https://d8ac3021.tpp-new.pages.dev';

const browser = await chromium.launch();
const page = await browser.newPage();

console.log('=== CHECKING DEPLOYED CONTACT PAGE ===\n');

await page.goto(deploymentUrl + '/contact', { timeout: 30000 });
await page.waitForLoadState('networkidle');

// Check header
const headerLogo = await page.locator('header img[alt*="Logo"]').first();
const logoSrc = await headerLogo.getAttribute('src');

// Check navigation items
const navItems = await page.$$eval('header nav a', links => 
  links.slice(0, 5).map(a => a.textContent.trim())
);

// Check footer columns
const footerColumns = await page.$$eval('footer .footer-column h3', headings =>
  headings.map(h => h.textContent.trim())
);

// Check sections
const sections = await page.$$eval('section', elements => 
  elements.map((el, idx) => ({
    index: idx + 1,
    class: el.className
  }))
);

console.log('HEADER:');
console.log('  Logo source: ' + logoSrc);
console.log('  Nav items: ' + navItems.join(', '));

console.log('\nFOOTER:');
console.log('  Columns: ' + footerColumns.join(', '));

console.log('\nSECTIONS (' + sections.length + ' total):');
sections.forEach(s => {
  console.log('  ' + s.index + '. ' + s.class);
});

await browser.close();
