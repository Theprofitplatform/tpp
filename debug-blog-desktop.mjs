import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to production blog page...');
  await page.goto('https://new.theprofitplatform.com.au/blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('\n=== HERO SECTION MEASUREMENTS ===');
  const heroStats = await page.$$('.hero-stats .stat-item');
  console.log('Number of stat items:', heroStats.length);

  for (let i = 0; i < heroStats.length; i++) {
    const bbox = await heroStats[i].boundingBox();
    const styles = await heroStats[i].evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        width: computed.width,
        height: computed.height,
        padding: computed.padding,
        display: computed.display,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent,
        gap: computed.gap
      };
    });
    console.log(`\nStat ${i + 1}:`, {
      position: bbox,
      styles
    });
  }

  console.log('\n=== HERO STATS CONTAINER ===');
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
        right: rect.right
      };
    });
    console.log('Hero stats container:', containerStyles);
  }

  console.log('\n=== FILTER SECTION ===');
  const filterContainer = await page.$('.filter-container');
  if (filterContainer) {
    const filterStyles = await filterContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap,
        alignItems: computed.alignItems,
        width: rect.width
      };
    });
    console.log('Filter container:', filterStyles);
  }

  console.log('\n=== ARTICLES GRID ===');
  const articlesGrid = await page.$('.articles-grid');
  if (articlesGrid) {
    const gridStyles = await articlesGrid.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap,
        alignItems: computed.alignItems
      };
    });
    console.log('Articles grid:', gridStyles);

    const cards = await page.$$('.article-card');
    console.log('Number of article cards:', cards.length);

    // Check first 3 cards alignment
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      const bbox = await cards[i].boundingBox();
      console.log(`Card ${i + 1} position:`, {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      });
    }
  }

  console.log('\n=== CONTAINER MEASUREMENTS ===');
  const containers = await page.$$('.container');
  for (let i = 0; i < containers.length; i++) {
    const bbox = await containers[i].boundingBox();
    const styles = await containers[i].evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        maxWidth: computed.maxWidth,
        padding: computed.padding,
        margin: computed.margin
      };
    });
    console.log(`Container ${i + 1}:`, {
      width: bbox.width,
      left: bbox.x,
      styles
    });
  }

  console.log('\n=== TAKING SCREENSHOTS ===');
  await page.screenshot({ path: 'blog-desktop-full.png', fullPage: true });
  console.log('✓ Full page: blog-desktop-full.png');

  await page.screenshot({
    path: 'blog-desktop-hero.png',
    clip: { x: 0, y: 0, width: 1920, height: 900 }
  });
  console.log('✓ Hero section: blog-desktop-hero.png');

  await page.screenshot({
    path: 'blog-desktop-stats.png',
    clip: { x: 0, y: 500, width: 1920, height: 400 }
  });
  console.log('✓ Stats section: blog-desktop-stats.png');

  await page.screenshot({
    path: 'blog-desktop-articles.png',
    clip: { x: 0, y: 1400, width: 1920, height: 800 }
  });
  console.log('✓ Articles grid: blog-desktop-articles.png');

  await browser.close();
  console.log('\n✓ Analysis complete!');
})();
