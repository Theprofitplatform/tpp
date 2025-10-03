import { test } from '@playwright/test';

test('Take screenshot of navigation', async ({ page }) => {
  await page.goto('http://localhost:4322/');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Take full page screenshot
  await page.screenshot({ path: 'navigation-full.png', fullPage: true });

  // Take screenshot of just the header
  const header = page.locator('header#header');
  await header.screenshot({ path: 'navigation-header.png' });

  // Get the HTML of the navigation
  const navHTML = await page.locator('nav#primary-navigation').innerHTML();
  console.log('Navigation HTML:', navHTML);

  // Get all nav items
  const navItems = await page.locator('nav[aria-label="Main navigation"] a.nav-item').all();
  console.log(`Found ${navItems.length} nav items`);

  for (let i = 0; i < navItems.length; i++) {
    const text = await navItems[i].textContent();
    const href = await navItems[i].getAttribute('href');
    const dataPage = await navItems[i].getAttribute('data-page');
    console.log(`Nav item ${i}: text="${text?.trim()}", href="${href}", data-page="${dataPage}"`);
  }
});
