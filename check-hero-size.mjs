import { chromium } from 'playwright';

async function checkHeroSize() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:4321/tools/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('🔍 CHECKING HERO SECTION SIZE\n');

    // Get viewport info
    const viewport = await page.viewportSize();
    console.log(`Viewport: ${viewport.width}x${viewport.height}\n`);

    // Get hero section dimensions
    const hero = page.locator('.tools-hero-modern');
    const heroBox = await hero.boundingBox();

    if (heroBox) {
      console.log('Hero Section:');
      console.log(`  Position: y=${Math.round(heroBox.y)}`);
      console.log(`  Height: ${Math.round(heroBox.height)}px`);
      console.log(`  Bottom edge at: ${Math.round(heroBox.y + heroBox.height)}px`);
      console.log(`  Viewport height: ${viewport.height}px`);
      console.log(`  Hero takes up: ${Math.round((heroBox.height / viewport.height) * 100)}% of viewport\n`);
    }

    // Take screenshot from top of page
    await page.screenshot({
      path: 'reports/tools-review/hero-size-check.png',
      fullPage: false
    });
    console.log('📸 Screenshot saved: hero-size-check.png\n');

    // Also take full page screenshot
    await page.screenshot({
      path: 'reports/tools-review/full-page.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot saved: full-page.png\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkHeroSize();
