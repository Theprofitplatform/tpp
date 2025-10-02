import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto('http://localhost:4323/services');
  await page.waitForLoadState('networkidle');

  // First, let's see what service cards exist
  const allCards = await page.locator('.service-card').all();
  console.log(`Found ${allCards.length} service cards\n`);

  for (let i = 0; i < allCards.length; i++) {
    const cardTitle = await allCards[i].locator('h3').textContent().catch(() => 'No title');
    console.log(`  Card ${i + 1}: ${cardTitle?.trim()}`);
  }

  // Find the SEO Services card
  const seoCard = await page.locator('.service-card').filter({ hasText: 'SEO Services' }).first();

  if (await seoCard.count() > 0) {
    console.log('\n✅ SEO Services card found');

    // Take screenshot
    await seoCard.screenshot({ path: 'seo-card-screenshot.png' });
    console.log('📸 Screenshot saved to seo-card-screenshot.png');

    // Check computed styles for the card itself
    const cardStyles = await seoCard.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        position: styles.position,
        zIndex: styles.zIndex
      };
    });

    // Check if service-icon is covering the card
    const iconStyles = await seoCard.locator('.service-icon').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        background: styles.background,
        width: styles.width,
        height: styles.height,
        position: styles.position,
        zIndex: styles.zIndex
      };
    });

    console.log('\n🎨 Card Styles:');
    console.log('  Card Background:', cardStyles.backgroundColor);
    console.log('  Card Color:', cardStyles.color);
    console.log('  Card Position:', cardStyles.position);
    console.log('  Card z-index:', cardStyles.zIndex);

    console.log('\n🔷 Icon Styles:');
    console.log('  Icon Background:', iconStyles.background);
    console.log('  Icon Width:', iconStyles.width);
    console.log('  Icon Height:', iconStyles.height);
    console.log('  Icon Position:', iconStyles.position);
    console.log('  Icon z-index:', iconStyles.zIndex);

    // Check if CSS file is loaded
    const cssLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(l => l.href);
    });

    console.log('\n📄 CSS Files Loaded:');
    cssLoaded.forEach(css => console.log('  -', css));

    // Check what's inside the service-card to see if ::before or ::after is the issue
    const pseudoElements = await seoCard.evaluate(el => {
      const beforeStyles = window.getComputedStyle(el, '::before');
      const afterStyles = window.getComputedStyle(el, '::after');
      return {
        before: {
          content: beforeStyles.content,
          background: beforeStyles.background,
          position: beforeStyles.position,
          width: beforeStyles.width,
          height: beforeStyles.height,
          zIndex: beforeStyles.zIndex
        },
        after: {
          content: afterStyles.content,
          background: afterStyles.background,
          position: afterStyles.position,
          width: beforeStyles.width,
          height: afterStyles.height,
          zIndex: afterStyles.zIndex
        }
      };
    });

    console.log('\n✨ Pseudo Elements:');
    console.log('  ::before content:', pseudoElements.before.content);
    console.log('  ::before background:', pseudoElements.before.background);
    console.log('  ::before position:', pseudoElements.before.position);
    console.log('  ::before dimensions:', pseudoElements.before.width, 'x', pseudoElements.before.height);
    console.log('  ::before z-index:', pseudoElements.before.zIndex);

  } else {
    console.log('❌ SEO Services card NOT found');
  }

  await browser.close();
})();
