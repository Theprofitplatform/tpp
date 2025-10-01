import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://855886db.tpp-new.pages.dev/pricing');
await page.waitForLoadState('networkidle');

const html = await page.content();

// Check if homepage sections exist in HTML
const hasHeroModern = html.includes('hero-modern');
const hasTrustSignals = html.includes('trust-signals-section');
const hasServicesSection = html.includes('services section animate-on-scroll');

console.log('Homepage elements in pricing page HTML:');
console.log('- hero-modern section:', hasHeroModern);
console.log('- trust-signals-section:', hasTrustSignals);
console.log('- services section:', hasServicesSection);

await browser.close();
