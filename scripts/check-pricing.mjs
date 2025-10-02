import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://855886db.tpp-new.pages.dev/pricing');
await page.waitForLoadState('networkidle');

const sections = await page.$$eval('section', elements => 
  elements.map(el => ({
    class: el.className,
    role: el.getAttribute('role'),
    text: el.innerText.substring(0, 80)
  }))
);

console.log('=== SECTIONS ON PRICING PAGE ===\n');
sections.forEach((section, idx) => {
  console.log((idx + 1) + '. class="' + section.class + '" role="' + section.role + '"');
  console.log('   ' + section.text.replace(/\n/g, ' ').substring(0, 60) + '...\n');
});

await browser.close();
