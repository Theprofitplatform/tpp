import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://5ce9aac0.tpp-new.pages.dev/pricing');
await page.waitForLoadState('networkidle');
const sections = await page.$$eval('section', elements => elements.map(el => el.className));
console.log('Sections found:', sections.length);
sections.forEach((c, i) => console.log((i+1) + '. ' + c));
await browser.close();
