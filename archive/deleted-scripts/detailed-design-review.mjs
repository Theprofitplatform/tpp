import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function detailedDesignReview() {
  console.log('🔍 DETAILED DESIGN REVIEW\n');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const url = 'http://localhost:4322/tools/';
  const screenshotsDir = join(__dirname, 'reports', 'tools-review', 'detailed');

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Page loaded\n');

    // Wait for all animations and counters
    await page.waitForTimeout(3000);

    // 1. HERO SECTION DETAILED ANALYSIS
    console.log('🎨 HERO SECTION - DETAILED ANALYSIS');
    console.log('─'.repeat(60));

    // Check hero background layers
    const heroBackground = await page.locator('.hero-background').evaluate(el => ({
      position: window.getComputedStyle(el).position,
      zIndex: window.getComputedStyle(el).zIndex,
      display: window.getComputedStyle(el).display
    }));
    console.log('✓ Hero background layer:', heroBackground);

    // Check floating orbs
    for (let i = 1; i <= 3; i++) {
      const orb = await page.locator(`.orb-${i}`).evaluate(el => ({
        width: window.getComputedStyle(el).width,
        height: window.getComputedStyle(el).height,
        filter: window.getComputedStyle(el).filter,
        background: window.getComputedStyle(el).background
      }));
      console.log(`✓ Orb ${i}:`, orb.width, orb.height, orb.filter.substring(0, 30) + '...');
    }

    // Check gradient text
    const gradientText = await page.locator('.hero-title-gradient').evaluate(el => ({
      background: window.getComputedStyle(el).background,
      webkitBackgroundClip: window.getComputedStyle(el).webkitBackgroundClip,
      webkitTextFillColor: window.getComputedStyle(el).webkitTextFillColor,
      fontSize: window.getComputedStyle(el).fontSize,
      fontWeight: window.getComputedStyle(el).fontWeight
    }));
    console.log('✓ Gradient text:', gradientText.fontSize, gradientText.fontWeight);
    console.log('  Background clip:', gradientText.webkitBackgroundClip);
    console.log('  Text fill color:', gradientText.webkitTextFillColor);

    // Check stat badges positioning
    const statBadges = await page.locator('.stat-badge').all();
    console.log(`✓ Found ${statBadges.length} stat badges`);

    for (let i = 0; i < statBadges.length; i++) {
      const badge = statBadges[i];
      const text = await badge.textContent();
      const styles = await badge.evaluate(el => ({
        background: window.getComputedStyle(el).background,
        backdropFilter: window.getComputedStyle(el).backdropFilter,
        boxShadow: window.getComputedStyle(el).boxShadow
      }));
      console.log(`  Badge ${i + 1}: "${text?.trim().substring(0, 30)}..."`);
      console.log(`    Backdrop filter: ${styles.backdropFilter}`);
    }

    // Screenshot: Hero with annotations
    await page.screenshot({
      path: join(screenshotsDir, 'hero-full-desktop.png'),
      fullPage: false
    });
    console.log('📸 Screenshot: hero-full-desktop.png\n');

    // 2. TOOL CARDS DETAILED ANALYSIS
    console.log('💎 TOOL CARDS - DETAILED ANALYSIS');
    console.log('─'.repeat(60));

    await page.locator('.tools-grid-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const cards = await page.locator('.tool-card-modern').all();
    console.log(`✓ Total cards: ${cards.length}\n`);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const isFeatured = await card.evaluate(el => el.classList.contains('featured'));
      const isComingSoon = await card.evaluate(el => el.classList.contains('coming-soon'));
      const title = await card.locator('h2').textContent();

      const styles = await card.evaluate(el => ({
        background: window.getComputedStyle(el).background,
        borderRadius: window.getComputedStyle(el).borderRadius,
        boxShadow: window.getComputedStyle(el).boxShadow,
        border: window.getComputedStyle(el).border,
        transform: window.getComputedStyle(el).transform
      }));

      console.log(`Card ${i + 1}: "${title?.trim()}"`);
      console.log(`  Featured: ${isFeatured ? 'YES ⭐' : 'No'}`);
      console.log(`  Coming Soon: ${isComingSoon ? 'YES' : 'No'}`);
      console.log(`  Border: ${styles.border}`);
      console.log(`  Border Radius: ${styles.borderRadius}`);
      console.log(`  Transform: ${styles.transform}`);

      // Check for gradient border on featured
      if (isFeatured) {
        const hasPseudoBorder = await card.evaluate(el => {
          const before = window.getComputedStyle(el, '::before');
          return {
            content: before.content,
            background: before.background.substring(0, 50),
            opacity: before.opacity
          };
        });
        console.log(`  ::before pseudo (gradient border):`, hasPseudoBorder);
      }

      // Check icon gradient
      const iconGradient = await card.locator('.icon-bg-gradient').first().evaluate(el => ({
        background: window.getComputedStyle(el).background.substring(0, 50),
        animation: window.getComputedStyle(el).animation.substring(0, 30)
      })).catch(() => null);

      if (iconGradient) {
        console.log(`  Icon gradient: ${iconGradient.background}...`);
        console.log(`  Icon animation: ${iconGradient.animation}...`);
      }

      // Check progress bar if coming soon
      if (isComingSoon) {
        const progressBar = await card.locator('.progress-bar').evaluate(el => {
          const after = window.getComputedStyle(el, '::after');
          return {
            width: after.width,
            background: after.background.substring(0, 40)
          };
        }).catch(() => null);

        if (progressBar) {
          console.log(`  Progress bar width: ${progressBar.width}`);
        }
      }

      console.log('');
    }

    // Screenshot: Cards grid
    await page.screenshot({
      path: join(screenshotsDir, 'cards-grid-detail.png'),
      fullPage: false
    });
    console.log('📸 Screenshot: cards-grid-detail.png\n');

    // 3. HOVER STATE ANALYSIS
    console.log('✨ HOVER STATE ANALYSIS');
    console.log('─'.repeat(60));

    const featuredCard = page.locator('.tool-card-modern.featured');

    // Before hover
    const beforeHover = await featuredCard.evaluate(el => ({
      transform: window.getComputedStyle(el).transform,
      boxShadow: window.getComputedStyle(el).boxShadow.substring(0, 50)
    }));
    console.log('Before hover:');
    console.log('  Transform:', beforeHover.transform);
    console.log('  Box shadow:', beforeHover.boxShadow + '...');

    // Hover
    await featuredCard.hover();
    await page.waitForTimeout(500);

    const afterHover = await featuredCard.evaluate(el => ({
      transform: window.getComputedStyle(el).transform,
      boxShadow: window.getComputedStyle(el).boxShadow.substring(0, 50)
    }));
    console.log('\nAfter hover:');
    console.log('  Transform:', afterHover.transform);
    console.log('  Box shadow:', afterHover.boxShadow + '...');

    const transformChanged = beforeHover.transform !== afterHover.transform;
    console.log(`\n✓ Hover effect active: ${transformChanged ? 'YES ✅' : 'NO ❌'}`);

    await page.screenshot({
      path: join(screenshotsDir, 'featured-card-hover.png'),
      fullPage: false
    });
    console.log('📸 Screenshot: featured-card-hover.png\n');

    // 4. CTA SECTION DETAILED ANALYSIS
    console.log('🚀 CTA SECTION - DETAILED ANALYSIS');
    console.log('─'.repeat(60));

    await page.locator('.tools-cta-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Check CTA background
    const ctaBackground = await page.locator('.tools-cta-modern').evaluate(el => ({
      background: window.getComputedStyle(el).background.substring(0, 60),
      position: window.getComputedStyle(el).position,
      overflow: window.getComputedStyle(el).overflow
    }));
    console.log('CTA Background:', ctaBackground);

    // Check floating shapes
    const shapes = await page.locator('.floating-shape').all();
    console.log(`\n✓ Floating shapes: ${shapes.length}`);
    for (let i = 0; i < shapes.length; i++) {
      const shapeStyles = await shapes[i].evaluate(el => ({
        width: window.getComputedStyle(el).width,
        height: window.getComputedStyle(el).height,
        filter: window.getComputedStyle(el).filter,
        animation: window.getComputedStyle(el).animation.substring(0, 30)
      }));
      console.log(`  Shape ${i + 1}:`, shapeStyles.width, shapeStyles.height, shapeStyles.filter);
    }

    // Check avatars
    const avatars = await page.locator('.avatar').all();
    console.log(`\n✓ Avatar stack: ${avatars.length} avatars`);
    for (let i = 0; i < avatars.length; i++) {
      const avatarStyles = await avatars[i].evaluate(el => ({
        background: window.getComputedStyle(el).background.substring(0, 50),
        borderRadius: window.getComputedStyle(el).borderRadius,
        border: window.getComputedStyle(el).border
      }));
      console.log(`  Avatar ${i + 1}: ${avatarStyles.background}...`);
    }

    // Check CTA buttons
    const primaryCTA = await page.locator('.cta-primary-modern').evaluate(el => ({
      background: window.getComputedStyle(el).background.substring(0, 50),
      borderRadius: window.getComputedStyle(el).borderRadius,
      boxShadow: window.getComputedStyle(el).boxShadow.substring(0, 50),
      padding: window.getComputedStyle(el).padding
    }));
    console.log('\nPrimary CTA:', primaryCTA);

    const secondaryCTA = await page.locator('.cta-secondary-modern').evaluate(el => ({
      background: window.getComputedStyle(el).background.substring(0, 50),
      backdropFilter: window.getComputedStyle(el).backdropFilter,
      border: window.getComputedStyle(el).border
    }));
    console.log('Secondary CTA:', secondaryCTA);

    // Check urgency indicator
    const urgency = await page.locator('.cta-urgency').evaluate(el => ({
      text: el.textContent,
      display: window.getComputedStyle(el).display,
      gap: window.getComputedStyle(el).gap
    }));
    console.log('\nUrgency indicator:', urgency.text?.trim());

    await page.screenshot({
      path: join(screenshotsDir, 'cta-section-detail.png'),
      fullPage: false
    });
    console.log('📸 Screenshot: cta-section-detail.png\n');

    // 5. SPACING & LAYOUT ANALYSIS
    console.log('📐 SPACING & LAYOUT ANALYSIS');
    console.log('─'.repeat(60));

    const heroSection = await page.locator('.tools-hero-modern').evaluate(el => ({
      padding: window.getComputedStyle(el).padding,
      minHeight: window.getComputedStyle(el).minHeight
    }));
    console.log('Hero section:', heroSection);

    const toolsSection = await page.locator('.tools-section-modern').evaluate(el => ({
      padding: window.getComputedStyle(el).padding,
      background: window.getComputedStyle(el).background.substring(0, 50)
    }));
    console.log('Tools section:', toolsSection);

    const toolsGrid = await page.locator('.tools-grid-modern').evaluate(el => ({
      display: window.getComputedStyle(el).display,
      gridTemplateColumns: window.getComputedStyle(el).gridTemplateColumns,
      gap: window.getComputedStyle(el).gap
    }));
    console.log('Tools grid:', toolsGrid);

    const ctaSection = await page.locator('.tools-cta-modern').evaluate(el => ({
      padding: window.getComputedStyle(el).padding
    }));
    console.log('CTA section:', ctaSection);

    // 6. MOBILE RESPONSIVENESS CHECK
    console.log('\n📱 MOBILE RESPONSIVENESS CHECK');
    console.log('─'.repeat(60));

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('Testing iPhone X viewport (375x812)...');

    // Check hero on mobile
    const mobileHero = await page.locator('.tools-hero-modern').evaluate(el => ({
      padding: window.getComputedStyle(el).padding,
      minHeight: window.getComputedStyle(el).minHeight
    }));
    console.log('Mobile hero:', mobileHero);

    // Check title size on mobile
    const mobileTitle = await page.locator('.hero-title-gradient').evaluate(el => ({
      fontSize: window.getComputedStyle(el).fontSize,
      lineHeight: window.getComputedStyle(el).lineHeight
    }));
    console.log('Mobile title:', mobileTitle);

    // Check stat badges layout
    const mobileStatBadges = await page.locator('.hero-stats-inline').evaluate(el => ({
      flexDirection: window.getComputedStyle(el).flexDirection,
      gap: window.getComputedStyle(el).gap
    }));
    console.log('Mobile stat badges:', mobileStatBadges);

    await page.screenshot({
      path: join(screenshotsDir, 'mobile-hero-detailed.png'),
      fullPage: false
    });
    console.log('📸 Screenshot: mobile-hero-detailed.png');

    // Scroll to cards
    await page.locator('.tools-section-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Check mobile grid
    const mobileGrid = await page.locator('.tools-grid-modern').evaluate(el => ({
      gridTemplateColumns: window.getComputedStyle(el).gridTemplateColumns,
      gap: window.getComputedStyle(el).gap
    }));
    console.log('Mobile grid:', mobileGrid);

    // Check card visibility
    const mobileCards = await page.locator('.tool-card-modern').all();
    console.log(`Mobile cards visible: ${mobileCards.length}/6`);

    const firstCardVisible = await mobileCards[0].isVisible().catch(() => false);
    console.log(`First card visible: ${firstCardVisible ? 'YES ✅' : 'NO ❌'}`);

    await page.screenshot({
      path: join(screenshotsDir, 'mobile-cards-detailed.png'),
      fullPage: false
    });
    console.log('📸 Screenshot: mobile-cards-detailed.png');

    // Full page mobile
    await page.screenshot({
      path: join(screenshotsDir, 'mobile-full-page.png'),
      fullPage: true
    });
    console.log('📸 Screenshot: mobile-full-page.png\n');

    // 7. ANIMATION PERFORMANCE
    console.log('⚡ ANIMATION PERFORMANCE CHECK');
    console.log('─'.repeat(60));

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if animations use GPU acceleration
    const animations = await page.evaluate(() => {
      const animatedElements = document.querySelectorAll('.floating-orb, .hero-gradient-mesh, .icon-bg-gradient');
      const results = [];

      animatedElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        results.push({
          element: el.className,
          transform: styles.transform !== 'none',
          animation: styles.animation !== 'none',
          willChange: styles.willChange
        });
      });

      return results;
    });

    console.log('Animated elements:');
    animations.forEach((anim, i) => {
      console.log(`  ${i + 1}. ${anim.element}`);
      console.log(`     Transform: ${anim.transform ? 'YES' : 'NO'}`);
      console.log(`     Animation: ${anim.animation ? 'YES' : 'NO'}`);
      console.log(`     will-change: ${anim.willChange}`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log('✅ DETAILED REVIEW COMPLETE');
    console.log('═'.repeat(60));
    console.log(`\n📁 Detailed screenshots: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

detailedDesignReview().catch(console.error);
