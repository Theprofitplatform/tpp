import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing fixed blog page...');
  await page.goto('https://7b914ee6.tpp-new.pages.dev/blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== VIEWPORT INFO ===');
  console.log('Viewport width: 1920px');
  console.log('Viewport center: 960px');

  console.log('\n=== HERO CONTENT ===');
  const heroContent = await page.$('.blog-hero .hero-content');
  if (heroContent) {
    const contentStyles = await heroContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        display: computed.display,
        flexDirection: computed.flexDirection,
        alignItems: computed.alignItems,
        maxWidth: computed.maxWidth,
        padding: computed.padding,
        width: rect.width,
        left: rect.left,
        centerPosition: rect.left + (rect.width / 2)
      };
    });
    console.log('Hero content:', contentStyles);
    const offset = Math.round(Math.abs(contentStyles.centerPosition - 960));
    console.log(`Center offset: ${offset}px (${offset === 0 ? '✅ PERFECT' : '⚠️  OFF'})`);
  }

  console.log('\n=== HERO STATS - FIXED? ===');
  const heroStatsContainer = await page.$('.hero-stats');
  if (heroStatsContainer) {
    const containerStyles = await heroStatsContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap,
        maxWidth: computed.maxWidth,
        margin: computed.margin,
        width: rect.width,
        left: rect.left,
        centerPosition: rect.left + (rect.width / 2)
      };
    });
    console.log('Stats container:', containerStyles);
    const offset = Math.round(Math.abs(containerStyles.centerPosition - 960));
    console.log(`Stats center offset: ${offset}px (${offset === 0 ? '✅ PERFECT' : offset < 10 ? '✅ GOOD' : '⚠️  OFF'})`);
  }

  const heroStats = await page.$$('.hero-stats .stat-item');
  console.log('Number of stat items:', heroStats.length);

  for (let i = 0; i < heroStats.length; i++) {
    const bbox = await heroStats[i].boundingBox();
    const styles = await heroStats[i].evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent
      };
    });
    console.log(`Stat ${i + 1}:`, {
      x: Math.round(bbox.x),
      y: Math.round(bbox.y),
      width: Math.round(bbox.width),
      height: Math.round(bbox.height),
      styles
    });
  }

  console.log('\n=== FILTER CONTAINER - FIXED? ===');
  const filterContainer = await page.$('.filter-container');
  if (filterContainer) {
    const filterStyles = await filterContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap
      };
    });
    console.log('Filter container:', filterStyles);
  }

  console.log('\n=== CONTAINER ALIGNMENT ===');
  const heroContainer = await page.$('.blog-hero .container');
  if (heroContainer) {
    const bbox = await heroContainer.boundingBox();
    const styles = await heroContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        maxWidth: computed.maxWidth,
        margin: computed.margin
      };
    });
    console.log('Hero container:', {
      left: Math.round(bbox.x),
      width: Math.round(bbox.width),
      center: Math.round(bbox.x + bbox.width / 2),
      styles
    });
  }

  console.log('\n=== SCREENSHOTS ===');
  await page.screenshot({ path: 'blog-fixed-hero.png', clip: { x: 0, y: 0, width: 1920, height: 900 } });
  console.log('✓ Screenshot saved: blog-fixed-hero.png');

  await browser.close();
  console.log('\n✅ Verification complete!');
})();
