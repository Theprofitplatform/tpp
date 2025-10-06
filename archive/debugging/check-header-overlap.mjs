import { chromium } from 'playwright';

async function checkHeaderOverlap() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:4321/tools/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('🔍 CHECKING HEADER OVERLAP\n');

    // Get header/nav dimensions
    const header = page.locator('#header');
    const headerBox = await header.boundingBox();

    if (headerBox) {
      console.log('Header/Nav:');
      console.log(`  Height: ${Math.round(headerBox.height)}px`);
      console.log(`  Bottom edge at: ${Math.round(headerBox.y + headerBox.height)}px\n`);
    }

    // Get hero section
    const hero = page.locator('.tools-hero-modern');
    const heroBox = await hero.boundingBox();
    const heroPadding = await hero.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
      };
    });

    console.log('Hero Section:');
    console.log(`  Total height: ${Math.round(heroBox.height)}px`);
    console.log(`  Padding top: ${heroPadding.paddingTop}`);
    console.log(`  Padding bottom: ${heroPadding.paddingBottom}\n`);

    // Get hero title position
    const heroTitle = page.locator('.hero-title-gradient');
    const titleBox = await heroTitle.boundingBox();

    if (titleBox) {
      console.log('Hero Title:');
      console.log(`  Top position: ${Math.round(titleBox.y)}px`);
      console.log(`  Height: ${Math.round(titleBox.height)}px`);
      console.log(`  Bottom position: ${Math.round(titleBox.y + titleBox.height)}px\n`);

      if (headerBox) {
        const headerBottom = headerBox.y + headerBox.height;
        const overlap = headerBottom - titleBox.y;
        console.log('Overlap Check:');
        console.log(`  Header bottom: ${Math.round(headerBottom)}px`);
        console.log(`  Title top: ${Math.round(titleBox.y)}px`);
        console.log(`  ${overlap > 0 ? '❌ OVERLAPPING by ' + Math.round(overlap) + 'px' : '✅ NO OVERLAP (gap: ' + Math.round(Math.abs(overlap)) + 'px)'}\n`);
      }
    }

    // Take screenshot
    await page.screenshot({
      path: 'reports/tools-review/header-overlap-check.png',
      fullPage: false
    });
    console.log('📸 Screenshot saved: header-overlap-check.png\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkHeaderOverlap();
