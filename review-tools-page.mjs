import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function reviewToolsPage() {
  console.log('🚀 Starting Tools Page Review with Playwright...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = 'http://localhost:4322/tools/';

  console.log(`📍 Navigating to ${url}...`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Page loaded successfully\n');

    // Wait for animations to settle
    await page.waitForTimeout(2000);

    // Create screenshots directory
    const screenshotsDir = join(__dirname, 'reports', 'tools-review');

    // Review Section 1: Hero Section
    console.log('🎨 REVIEWING HERO SECTION');
    console.log('─'.repeat(50));

    const heroExists = await page.locator('.tools-hero-modern').count();
    console.log(`✓ Hero section found: ${heroExists > 0 ? 'YES ✅' : 'NO ❌'}`);

    const orbsCount = await page.locator('.floating-orb').count();
    console.log(`✓ Floating orbs: ${orbsCount} (Expected: 3) ${orbsCount === 3 ? '✅' : '⚠️'}`);

    const gradientMesh = await page.locator('.hero-gradient-mesh').count();
    console.log(`✓ Gradient mesh: ${gradientMesh > 0 ? 'YES ✅' : 'NO ❌'}`);

    const gridOverlay = await page.locator('.hero-grid-overlay').count();
    console.log(`✓ Grid overlay: ${gridOverlay > 0 ? 'YES ✅' : 'NO ❌'}`);

    const heroTitle = await page.locator('.hero-title-gradient').textContent();
    console.log(`✓ Hero title: "${heroTitle?.trim()}"`);

    const statBadges = await page.locator('.stat-badge').count();
    console.log(`✓ Trust stat badges: ${statBadges} (Expected: 3) ${statBadges === 3 ? '✅' : '⚠️'}`);

    // Check for counters
    const counters = await page.locator('.counter').count();
    console.log(`✓ Animated counters: ${counters} ${counters > 0 ? '✅' : '❌'}`);

    // Screenshot: Hero section
    await page.screenshot({
      path: join(screenshotsDir, '1-hero-section.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 1-hero-section.png\n');

    // Review Section 2: Tool Cards
    console.log('💎 REVIEWING TOOL CARDS');
    console.log('─'.repeat(50));

    const toolCards = await page.locator('.tool-card-modern').count();
    console.log(`✓ Total tool cards: ${toolCards} (Expected: 6) ${toolCards === 6 ? '✅' : '⚠️'}`);

    const featuredCard = await page.locator('.tool-card-modern.featured').count();
    console.log(`✓ Featured card (Rank Tracker): ${featuredCard > 0 ? 'YES ✅' : 'NO ❌'}`);

    const comingSoonCards = await page.locator('.tool-card-modern.coming-soon').count();
    console.log(`✓ Coming soon cards: ${comingSoonCards} (Expected: 5) ${comingSoonCards === 5 ? '✅' : '⚠️'}`);

    // Check for gradient icons
    const iconGradients = await page.locator('.icon-bg-gradient').count();
    console.log(`✓ Gradient icon backgrounds: ${iconGradients} ${iconGradients > 0 ? '✅' : '❌'}`);

    // Check for progress bars
    const progressBars = await page.locator('.progress-bar').count();
    console.log(`✓ Progress bars (coming soon tools): ${progressBars} ${progressBars > 0 ? '✅' : '❌'}`);

    // Check for shine effect
    const shineEffects = await page.locator('.card-shine').count();
    console.log(`✓ Card shine effects: ${shineEffects} ${shineEffects > 0 ? '✅' : '❌'}`);

    // Scroll to tools section
    await page.locator('.tools-section-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Screenshot: Tool cards
    await page.screenshot({
      path: join(screenshotsDir, '2-tool-cards.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 2-tool-cards.png\n');

    // Review Section 3: Hover Effects
    console.log('✨ TESTING HOVER EFFECTS');
    console.log('─'.repeat(50));

    const featuredCardSelector = '.tool-card-modern.featured';
    await page.hover(featuredCardSelector);
    await page.waitForTimeout(500);

    // Check transform on hover
    const transformStyle = await page.locator(featuredCardSelector).evaluate(el =>
      window.getComputedStyle(el).transform
    );
    console.log(`✓ Card hover transform applied: ${transformStyle !== 'none' ? 'YES ✅' : 'NO ❌'}`);

    // Screenshot: Hover state
    await page.screenshot({
      path: join(screenshotsDir, '3-card-hover.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 3-card-hover.png\n');

    // Review Section 4: CTA Section
    console.log('🚀 REVIEWING CTA SECTION');
    console.log('─'.repeat(50));

    await page.locator('.tools-cta-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const ctaSection = await page.locator('.tools-cta-modern').count();
    console.log(`✓ CTA section found: ${ctaSection > 0 ? 'YES ✅' : 'NO ❌'}`);

    const ctaFloatingShapes = await page.locator('.floating-shape').count();
    console.log(`✓ Floating shapes: ${ctaFloatingShapes} (Expected: 2) ${ctaFloatingShapes === 2 ? '✅' : '⚠️'}`);

    const avatarStack = await page.locator('.avatar-stack .avatar').count();
    console.log(`✓ Avatar stack: ${avatarStack} avatars ${avatarStack === 4 ? '✅' : '⚠️'}`);

    const ctaPrimaryBtn = await page.locator('.cta-primary-modern').count();
    console.log(`✓ Primary CTA button: ${ctaPrimaryBtn > 0 ? 'YES ✅' : 'NO ❌'}`);

    const ctaSecondaryBtn = await page.locator('.cta-secondary-modern').count();
    console.log(`✓ Secondary CTA button: ${ctaSecondaryBtn > 0 ? 'YES ✅' : 'NO ❌'}`);

    const urgencyIndicator = await page.locator('.cta-urgency').count();
    console.log(`✓ Urgency indicator: ${urgencyIndicator > 0 ? 'YES ✅' : 'NO ❌'}`);

    // Screenshot: CTA section
    await page.screenshot({
      path: join(screenshotsDir, '4-cta-section.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 4-cta-section.png\n');

    // Review Section 5: Responsive Design
    console.log('📱 TESTING RESPONSIVE DESIGN');
    console.log('─'.repeat(50));

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✓ Testing mobile viewport (375x812)...');

    await page.screenshot({
      path: join(screenshotsDir, '5-mobile-hero.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 5-mobile-hero.png');

    await page.locator('.tools-section-modern').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: join(screenshotsDir, '6-mobile-cards.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 6-mobile-cards.png\n');

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✓ Testing tablet viewport (768x1024)...');

    await page.screenshot({
      path: join(screenshotsDir, '7-tablet-view.png'),
      fullPage: false
    });
    console.log('📸 Screenshot saved: 7-tablet-view.png\n');

    // Full page screenshot (desktop)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✓ Testing desktop viewport (1920x1080)...');

    await page.screenshot({
      path: join(screenshotsDir, '8-full-page-desktop.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: 8-full-page-desktop.png\n');

    // Performance Check
    console.log('⚡ PERFORMANCE METRICS');
    console.log('─'.repeat(50));

    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
        loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
        totalTime: Math.round(perf.loadEventEnd - perf.fetchStart)
      };
    });

    console.log(`✓ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`✓ Load Complete: ${metrics.loadComplete}ms`);
    console.log(`✓ Total Load Time: ${metrics.totalTime}ms`);

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log(`\n✓ Console errors: ${consoleErrors.length === 0 ? 'NONE ✅' : `${consoleErrors.length} ❌`}`);
    if (consoleErrors.length > 0) {
      console.log('  Errors:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ REVIEW COMPLETE!');
    console.log('═'.repeat(50));
    console.log(`\n📁 Screenshots saved to: ${screenshotsDir}`);
    console.log('🌐 View the page at: http://localhost:4322/tools/\n');

  } catch (error) {
    console.error('❌ Error during review:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the review
reviewToolsPage().catch(console.error);
