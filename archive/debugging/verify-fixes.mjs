import { chromium } from 'playwright';

async function verifyFixes() {
  console.log('🔍 VERIFYING FIXES...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  try {
    await page.goto('http://localhost:4322/tools/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✅ PAGE LOADED\n');

    // Test 1: Check if rank tracker is visible
    console.log('TEST 1: Rank Tracker Card Visibility');
    console.log('─'.repeat(50));

    const rankTrackerCard = page.locator('.tool-card-modern.featured');
    const isVisible = await rankTrackerCard.isVisible();
    console.log(`Rank tracker card visible: ${isVisible ? '✅ YES' : '❌ NO'}`);

    if (isVisible) {
      const title = await rankTrackerCard.locator('h2').textContent();
      console.log(`Card title: "${title?.trim()}"`);

      const description = await rankTrackerCard.locator('p').first().textContent();
      console.log(`Description visible: ${description && description.length > 10 ? '✅ YES' : '❌ NO'}`);

      const icon = await rankTrackerCard.locator('.tool-icon-modern i').isVisible();
      console.log(`Icon visible: ${icon ? '✅ YES' : '❌ NO'}`);

      const features = await rankTrackerCard.locator('.feature-tag-modern').count();
      console.log(`Feature tags: ${features} ${features === 3 ? '✅' : '❌'}`);

      const cta = await rankTrackerCard.locator('.tool-cta-modern').isVisible();
      console.log(`CTA visible: ${cta ? '✅ YES' : '❌ NO'}`);

      // Check background/border
      const styles = await rankTrackerCard.evaluate(el => ({
        background: window.getComputedStyle(el).background.substring(0, 100),
        border: window.getComputedStyle(el).border
      }));
      console.log(`Border: ${styles.border}`);
      console.log(`Has gradient border: ${styles.background.includes('gradient') ? '✅ YES' : '❌ NO'}`);
    }

    console.log('\n');

    // Test 2: Check footer
    console.log('TEST 2: Footer Component');
    console.log('─'.repeat(50));

    const footer = page.locator('footer');
    const footerExists = await footer.count();
    console.log(`Footer exists: ${footerExists > 0 ? '✅ YES' : '❌ NO'}`);

    if (footerExists > 0) {
      const footerVisible = await footer.isVisible();
      console.log(`Footer visible: ${footerVisible ? '✅ YES' : '❌ NO'}`);

      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const footerText = await footer.textContent();
      console.log(`Footer has content: ${footerText && footerText.length > 50 ? '✅ YES' : '❌ NO'}`);
    }

    console.log('\n');

    // Test 3: Check spacing and alignment
    console.log('TEST 3: Spacing & Alignment');
    console.log('─'.repeat(50));

    const container = await page.locator('.container').first().evaluate(el => ({
      maxWidth: window.getComputedStyle(el).maxWidth,
      padding: window.getComputedStyle(el).padding
    }));
    console.log(`Container max-width: ${container.maxWidth}`);
    console.log(`Container padding: ${container.padding}`);

    const heroSection = await page.locator('.tools-hero-modern').evaluate(el => ({
      padding: window.getComputedStyle(el).padding
    }));
    console.log(`Hero padding: ${heroSection.padding}`);

    const toolsSection = await page.locator('.tools-section-modern').evaluate(el => ({
      padding: window.getComputedStyle(el).padding
    }));
    console.log(`Tools section padding: ${toolsSection.padding}`);

    console.log('\n');

    // Test 4: Check all cards render
    console.log('TEST 4: All Tool Cards');
    console.log('─'.repeat(50));

    const allCards = await page.locator('.tool-card-modern').all();
    console.log(`Total cards: ${allCards.length} ${allCards.length === 6 ? '✅' : '❌ (expected 6)'}`);

    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const title = await card.locator('h2').textContent();
      const visible = await card.isVisible();
      const isFeatured = await card.evaluate(el => el.classList.contains('featured'));
      console.log(`  ${i + 1}. ${title?.trim().substring(0, 25)}: ${visible ? '✅' : '❌'} ${isFeatured ? '⭐' : ''}`);
    }

    console.log('\n');

    // Test 5: Screenshot for visual inspection
    console.log('TEST 5: Visual Screenshots');
    console.log('─'.repeat(50));

    await page.screenshot({
      path: 'reports/tools-review/detailed/rank-tracker-fixed.png',
      fullPage: false
    });
    console.log('📸 Screenshot: rank-tracker-fixed.png');

    await page.locator('.tools-section-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'reports/tools-review/detailed/tools-grid-fixed.png',
      fullPage: false
    });
    console.log('📸 Screenshot: tools-grid-fixed.png');

    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'reports/tools-review/detailed/footer-fixed.png',
      fullPage: false
    });
    console.log('📸 Screenshot: footer-fixed.png');

    await page.screenshot({
      path: 'reports/tools-review/detailed/full-page-fixed.png',
      fullPage: true
    });
    console.log('📸 Screenshot: full-page-fixed.png');

    console.log('\n' + '═'.repeat(50));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(50));

    // Summary
    const summary = {
      rankTrackerVisible: isVisible,
      footerExists: footerExists > 0,
      allCardsRendered: allCards.length === 6
    };

    const allPassed = Object.values(summary).every(v => v === true);

    console.log('\n📊 SUMMARY:');
    console.log(`  Rank Tracker Visible: ${summary.rankTrackerVisible ? '✅' : '❌'}`);
    console.log(`  Footer Present: ${summary.footerExists ? '✅' : '❌'}`);
    console.log(`  All Cards Rendered: ${summary.allCardsRendered ? '✅' : '❌'}`);
    console.log(`\n  Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

verifyFixes().catch(console.error);
