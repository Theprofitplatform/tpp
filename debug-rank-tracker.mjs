import { chromium } from 'playwright';

async function debugRankTracker() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:4321/tools/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('🔍 DEBUGGING RANK TRACKER POSITION\n');

    // Get viewport info
    const viewport = await page.viewportSize();
    console.log(`Viewport: ${viewport.width}x${viewport.height}\n`);

    // Scroll to tools section
    await page.locator('.tools-section-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Get scroll position
    const scrollY = await page.evaluate(() => window.scrollY);
    console.log(`Current scroll position: ${scrollY}px\n`);

    // Get all cards and their positions
    const cards = await page.locator('.tool-card-modern').all();
    console.log(`Found ${cards.length} cards\n`);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const title = await card.locator('h2').textContent();
      const isFeatured = await card.evaluate(el => el.classList.contains('featured'));

      const box = await card.boundingBox();
      const styles = await card.evaluate(el => ({
        opacity: window.getComputedStyle(el).opacity,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
      }));

      console.log(`Card ${i + 1}: "${title?.trim()}" ${isFeatured ? '⭐' : ''}`);
      if (box) {
        console.log(`  Position: x=${Math.round(box.x)}, y=${Math.round(box.y)}`);
        console.log(`  Size: ${Math.round(box.width)}x${Math.round(box.height)}`);
        console.log(`  In viewport: ${box.y >= 0 && box.y < viewport.height ? 'YES' : 'NO'}`);
      } else {
        console.log(`  NO BOUNDING BOX`);
      }
      console.log(`  Opacity: ${styles.opacity}, Display: ${styles.display}, Visibility: ${styles.visibility}`);
      console.log('');
    }

    // Try scrolling to the first card (rank tracker)
    console.log('\n📍 Scrolling to rank tracker...\n');
    await page.locator('.tool-card-modern.featured').scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(1000);

    const newScrollY = await page.evaluate(() => window.scrollY);
    console.log(`New scroll position: ${newScrollY}px\n`);

    // Screenshot after scrolling to rank tracker
    await page.screenshot({
      path: 'reports/tools-review/rank-tracker-scrolled.png',
      fullPage: false
    });
    console.log('📸 Screenshot saved: rank-tracker-scrolled.png\n');

    // Check if it's visible now
    const rankTrackerBox = await page.locator('.tool-card-modern.featured').boundingBox();
    if (rankTrackerBox) {
      console.log(`Rank tracker after scroll: x=${Math.round(rankTrackerBox.x)}, y=${Math.round(rankTrackerBox.y)}`);
      console.log(`In viewport: ${rankTrackerBox.y >= 0 && rankTrackerBox.y < viewport.height ? 'YES ✅' : 'NO ❌'}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugRankTracker();
