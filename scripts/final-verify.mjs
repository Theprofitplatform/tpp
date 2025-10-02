import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🔍 Final verification of desktop alignment...\n');
  await page.goto('https://ccc30fe1.tpp-new.pages.dev/blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const heroStatsContainer = await page.$('.hero-stats');
  if (heroStatsContainer) {
    const stats = await heroStatsContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerWidth / 2;
      const containerCenter = rect.left + (rect.width / 2);
      const offsetFromCenter = Math.abs(containerCenter - viewportCenter);

      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        width: rect.width,
        left: rect.left,
        containerCenter: containerCenter,
        viewportCenter: viewportCenter,
        offsetFromCenter: offsetFromCenter,
        isCentered: offsetFromCenter < 50
      };
    });

    console.log('📊 HERO STATS CONTAINER:');
    console.log(`  Display: ${stats.display}`);
    console.log(`  Grid Columns: ${stats.gridTemplateColumns}`);
    console.log(`  Width: ${Math.round(stats.width)}px`);
    console.log(`  Container Center: ${Math.round(stats.containerCenter)}px`);
    console.log(`  Viewport Center: ${Math.round(stats.viewportCenter)}px`);
    console.log(`  Offset: ${Math.round(stats.offsetFromCenter)}px`);
    console.log(`  ✓ Centered: ${stats.isCentered ? 'YES ✅' : 'NO ❌'}\n`);
  }

  const heroStats = await page.$$('.hero-stats .stat-item');
  console.log(`📦 STAT ITEMS (${heroStats.length} total):\n`);

  for (let i = 0; i < heroStats.length; i++) {
    const bbox = await heroStats[i].boundingBox();
    const content = await heroStats[i].evaluate(el => {
      const number = el.querySelector('.stat-number')?.textContent || '';
      const label = el.querySelector('.stat-label')?.textContent || '';
      return { number, label };
    });

    console.log(`  Stat ${i + 1}: "${content.number}" - "${content.label}"`);
    console.log(`    Position: x=${Math.round(bbox.x)}px, y=${Math.round(bbox.y)}px`);
    console.log(`    Size: ${Math.round(bbox.width)}px × ${Math.round(bbox.height)}px\n`);
  }

  console.log('📸 Taking final screenshot...');
  await page.screenshot({ path: 'blog-final-desktop.png', clip: { x: 0, y: 0, width: 1920, height: 900 } });
  console.log('   Saved: blog-final-desktop.png\n');

  await browser.close();
  console.log('✅ Verification complete!');
})();
