import { test } from '@playwright/test';

test('capture portfolio cards with clip', async ({ page }) => {
  // Use larger viewport to capture more content
  await page.setViewportSize({ width: 1280, height: 3000 });

  await page.goto('https://theprofitplatform.com.au/portfolio/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.portfolio-card');

  // Get exact coordinates of the portfolio grid
  const gridBounds = await page.locator('.portfolio-grid').boundingBox();
  console.log('Grid bounds:', gridBounds);

  // Take screenshot with clip to specific area
  await page.screenshot({
    path: 'tests/screenshots/portfolio-cards-clipped.png',
    clip: {
      x: gridBounds.x,
      y: gridBounds.y,
      width: gridBounds.width,
      height: Math.min(gridBounds.height, 2000)
    }
  });

  console.log('✅ Clipped screenshot of portfolio cards captured');

  // Also check the background colors
  const colors = await page.evaluate(() => {
    const hero = document.querySelector('.portfolio-hero');
    const section = document.querySelector('.portfolio-section');
    const grid = document.querySelector('.portfolio-grid');
    const card = document.querySelector('.portfolio-card');

    return {
      hero: hero ? window.getComputedStyle(hero).backgroundColor : null,
      section: section ? window.getComputedStyle(section).backgroundColor : null,
      grid: grid ? window.getComputedStyle(grid).backgroundColor : null,
      card: card ? window.getComputedStyle(card).backgroundColor : null,
    };
  });

  console.log('Background colors:', colors);
});
