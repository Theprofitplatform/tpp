import { test } from '@playwright/test';

test('capture full portfolio page showing all cards', async ({ page }) => {
  await page.goto('https://theprofitplatform.com.au/portfolio/');
  await page.waitForLoadState('networkidle');

  // Wait for cards to be visible
  await page.waitForSelector('.portfolio-card', { timeout: 5000 });

  // Scroll through the page to ensure all content loads
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Scroll to middle
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(500);

  // Scroll to cards section
  await page.locator('.portfolio-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Take screenshot of just the cards section
  const cardsSection = page.locator('.portfolio-grid');
  await cardsSection.screenshot({
    path: 'tests/screenshots/portfolio-cards-grid.png'
  });

  console.log('✅ Screenshot of portfolio cards grid captured');

  // Also take a viewport screenshot showing the cards
  await page.screenshot({
    path: 'tests/screenshots/portfolio-cards-viewport.png',
    fullPage: false
  });

  console.log('✅ Viewport screenshot captured showing cards section');
});
