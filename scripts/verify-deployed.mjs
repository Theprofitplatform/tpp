import { chromium } from 'playwright';

const deploymentUrl = 'https://51bc1a0c.tpp-new.pages.dev';

const browser = await chromium.launch();
const page = await browser.newPage();

console.log('=== VERIFYING DEPLOYED WEB-DESIGN PAGE ===\n');

await page.goto(deploymentUrl + '/web-design', { timeout: 30000 });
await page.waitForLoadState('networkidle');

const sections = await page.$$eval('section', elements => 
  elements.map((el, idx) => ({
    index: idx + 1,
    class: el.className,
    firstText: el.innerText.substring(0, 50).replace(/\n/g, ' ')
  }))
);

const homepageLeaks = sections.filter(s => 
  s.class.includes('hero-modern') || 
  s.class.includes('trust-signals') || 
  s.class.includes('services section animate-on-scroll')
);

if (homepageLeaks.length === 0) {
  console.log('✅ DEPLOYED PAGE IS CLEAN!');
} else {
  console.log('❌ FOUND ' + homepageLeaks.length + ' HOMEPAGE LEAKS:');
  homepageLeaks.forEach(s => {
    console.log('   ⚠️  ' + s.index + '. ' + s.class);
  });
}

console.log('\nTotal sections on deployed page: ' + sections.length);
console.log('\nSection classes:');
sections.forEach(s => {
  console.log('   ' + s.index + '. ' + s.class);
});

await browser.close();
