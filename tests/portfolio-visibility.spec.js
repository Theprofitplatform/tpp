import { test, expect } from '@playwright/test';

test.describe('Portfolio Page Visibility', () => {
  test('all 6 portfolio cards should be visible', async ({ page }) => {
    // Navigate to portfolio page
    await page.goto('https://theprofitplatform.com.au/portfolio/');

    // Wait for the portfolio section to load
    await page.waitForSelector('.portfolio-section', { timeout: 10000 });

    // Get all portfolio cards
    const portfolioCards = page.locator('.portfolio-card');

    // Check total count
    const count = await portfolioCards.count();
    console.log(`Total portfolio cards found: ${count}`);
    expect(count).toBe(6);

    // Check each card is visible
    for (let i = 0; i < count; i++) {
      const card = portfolioCards.nth(i);
      await expect(card).toBeVisible();

      // Get the title
      const title = await card.locator('.project-title').textContent();
      console.log(`Card ${i + 1}: ${title.trim()}`);
    }

    // Check none have filtered-out class
    const filteredOutCards = page.locator('.portfolio-card.filtered-out');
    const filteredCount = await filteredOutCards.count();
    console.log(`Cards with filtered-out class: ${filteredCount}`);
    expect(filteredCount).toBe(0);

    // Take a screenshot for verification
    await page.screenshot({
      path: 'tests/screenshots/portfolio-cards-visible.png',
      fullPage: true
    });

    console.log('✅ All portfolio cards are visible!');
  });

  test('portfolio cards display correctly on local dev', async ({ page }) => {
    // Test against local dev server
    await page.goto('http://localhost:3002/portfolio/');

    // Wait for the portfolio section to load
    await page.waitForSelector('.portfolio-section', { timeout: 10000 });

    // Get all portfolio cards
    const portfolioCards = page.locator('.portfolio-card');

    // Check total count
    const count = await portfolioCards.count();
    console.log(`[LOCAL] Total portfolio cards found: ${count}`);
    expect(count).toBe(6);

    // Check each card is visible
    for (let i = 0; i < count; i++) {
      const card = portfolioCards.nth(i);
      await expect(card).toBeVisible();

      const title = await card.locator('.project-title').textContent();
      console.log(`[LOCAL] Card ${i + 1}: ${title.trim()}`);
    }

    // Take a screenshot
    await page.screenshot({
      path: 'tests/screenshots/portfolio-cards-local.png',
      fullPage: true
    });

    console.log('✅ All local portfolio cards are visible!');
  });

  test('check CSS for filtered-out class', async ({ page }) => {
    await page.goto('https://theprofitplatform.com.au/portfolio/');

    // Wait for page to load
    await page.waitForSelector('.portfolio-section', { timeout: 10000 });

    // Get computed style by actually adding filtered-out class to an existing card
    const styles = await page.evaluate(() => {
      // Get the first portfolio card (which has the data-astro-cid attribute)
      const firstCard = document.querySelector('.portfolio-card');
      if (!firstCard) return null;

      // Add filtered-out class temporarily
      firstCard.classList.add('filtered-out');

      const computedStyle = window.getComputedStyle(firstCard);
      const result = {
        display: computedStyle.display,
        opacity: computedStyle.opacity,
        position: computedStyle.position,
        visibility: computedStyle.visibility
      };

      // Remove the class
      firstCard.classList.remove('filtered-out');

      return result;
    });

    console.log('CSS for .portfolio-card.filtered-out:', styles);

    // Verify display: none is applied
    expect(styles.display).toBe('none');
  });
});
