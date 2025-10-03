import { chromium } from 'playwright';

async function checkRankTracker() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:4321/tools/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('🔍 CHECKING RANK TRACKER CARD\n');

    // Scroll to tools section first
    await page.locator('.tools-section-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find rank tracker
    const rankTracker = page.locator('.tool-card-modern.featured');
    const exists = await rankTracker.count();
    console.log(`Rank Tracker exists in DOM: ${exists > 0 ? 'YES' : 'NO'}`);

    if (exists > 0) {
      const visible = await rankTracker.isVisible();
      console.log(`Rank Tracker isVisible(): ${visible ? 'YES' : 'NO'}`);

      // Get position and size
      const box = await rankTracker.boundingBox();
      if (box) {
        console.log(`\nPosition: x=${box.x}, y=${box.y}`);
        console.log(`Size: width=${box.width}, height=${box.height}`);
      } else {
        console.log('\nNo bounding box (card might be hidden)');
      }

      // Get computed styles
      const styles = await rankTracker.evaluate(el => ({
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
        opacity: window.getComputedStyle(el).opacity,
        position: window.getComputedStyle(el).position,
        zIndex: window.getComputedStyle(el).zIndex,
        overflow: window.getComputedStyle(el).overflow,
        width: window.getComputedStyle(el).width,
        height: window.getComputedStyle(el).height,
      }));
      console.log('\nComputed Styles:', styles);

      // Try to scroll the card into view
      await rankTracker.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Screenshot just the card area
      await page.screenshot({
        path: 'reports/tools-review/rank-tracker-closeup.png',
        fullPage: false
      });
      console.log('\n📸 Screenshot saved: rank-tracker-closeup.png');

      // Get all cards and check their order
      const allCards = await page.locator('.tool-card-modern').all();
      console.log(`\n📋 Total cards in grid: ${allCards.length}`);

      for (let i = 0; i < allCards.length; i++) {
        const title = await allCards[i].locator('h2').textContent();
        const isFeatured = await allCards[i].evaluate(el => el.classList.contains('featured'));
        const vis = await allCards[i].isVisible();
        console.log(`  ${i + 1}. "${title?.trim()}" ${isFeatured ? '⭐' : ''}${vis ? ' ✅' : ' ❌ HIDDEN'}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkRankTracker();
