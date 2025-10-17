import { test, expect } from '@playwright/test';

test('check if portfolio section and cards are visible', async ({ page }) => {
  await page.goto('https://theprofitplatform.com.au/portfolio/');
  await page.waitForLoadState('networkidle');

  // Check portfolio section
  const portfolioSection = page.locator('.portfolio-section');
  const isSectionVisible = await portfolioSection.isVisible();
  console.log('Portfolio section visible:', isSectionVisible);

  if (isSectionVisible) {
    const box = await portfolioSection.boundingBox();
    console.log('Portfolio section dimensions:', box);
  }

  // Check grid
  const grid = page.locator('.portfolio-grid');
  const isGridVisible = await grid.isVisible();
  console.log('Portfolio grid visible:', isGridVisible);

  if (isGridVisible) {
    const gridBox = await grid.boundingBox();
    console.log('Portfolio grid dimensions:', gridBox);
  }

  // Check all cards
  const cards = page.locator('.portfolio-card');
  const count = await cards.count();
  console.log(`Total cards in DOM: ${count}`);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const isVisible = await card.isVisible();
    const box = await card.boundingBox();
    const title = await card.locator('.project-title').textContent();
    console.log(`Card ${i + 1} (${title.trim()}):`, {
      visible: isVisible,
      dimensions: box
    });
  }

  // Take screenshot of just the portfolio section
  await page.screenshot({
    path: 'tests/screenshots/portfolio-full-check.png',
    fullPage: false
  });

  // Scroll to portfolio section
  await portfolioSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'tests/screenshots/portfolio-section-scrolled.png',
    fullPage: false
  });
});
