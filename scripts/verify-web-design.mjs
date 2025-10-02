import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Test local build
await page.goto('file://' + process.cwd() + '/dist/web-design/index.html');
await page.waitForLoadState('networkidle');

const sections = await page.$$eval('section', elements => 
  elements.map((el, idx) => ({
    index: idx + 1,
    class: el.className,
    id: el.id,
    firstText: el.innerText.substring(0, 60).replace(/\n/g, ' ')
  }))
);

console.log('=== WEB-DESIGN PAGE VERIFICATION ===\n');

const homepageLeaks = sections.filter(s => 
  s.class.includes('hero-modern') || 
  s.class.includes('trust-signals') || 
  s.class.includes('services section animate-on-scroll')
);

if (homepageLeaks.length === 0) {
  console.log('✅ CLEAN - No homepage sections found!');
} else {
  console.log('❌ FOUND ' + homepageLeaks.length + ' HOMEPAGE LEAKS:');
  homepageLeaks.forEach(s => {
    console.log('   ⚠️  ' + s.index + '. ' + s.class);
    console.log('       Text: ' + s.firstText);
  });
}

console.log('\nTotal sections: ' + sections.length);
console.log('\nAll sections:');
sections.forEach(s => {
  console.log('   ' + s.index + '. ' + s.class);
});

await browser.close();
