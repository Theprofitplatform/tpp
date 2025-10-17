import { test } from '@playwright/test';

test('capture portfolio page after scrolling to cards', async ({ page }) => {
  await page.goto('https://theprofitplatform.com.au/portfolio/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.portfolio-card');

  // Scroll past the hero section
  await page.evaluate(() => {
    window.scrollTo(0, 1200); // Scroll past hero (920px) to cards section
  });

  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({
    path: 'tests/screenshots/portfolio-after-scroll.png',
    fullPage: false
  });

  console.log('✅ Screenshot after scrolling captured');

  // Scroll to show all cards
  await page.evaluate(() => {
    window.scrollTo(0, 1500);
  });

  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'tests/screenshots/portfolio-mid-cards.png',
    fullPage: false
  });

  // Scroll to bottom cards
  await page.evaluate(() => {
    window.scrollTo(0, 2200);
  });

  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'tests/screenshots/portfolio-bottom-cards.png',
    fullPage: false
  });

  console.log('✅ All scroll position screenshots captured');
});
