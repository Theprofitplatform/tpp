import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test('Hamburger menu basic functionality test', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto(PRODUCTION_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const menuToggle = page.locator('#menuToggle');
  const mobileNav = page.locator('#mobileNav');

  // Test 1: Button visible
  await expect(menuToggle).toBeVisible();
  console.log('✓ Hamburger button is visible');

  // Test 2: Click to open
  await menuToggle.click();
  await page.waitForTimeout(800);

  // Test 3: Menu opened
  const hasActive = await mobileNav.evaluate(el => el.classList.contains('active'));
  console.log('✓ Menu opened:', hasActive);

  expect(hasActive).toBe(true);

  // Test 4: Check ARIA
  const ariaExpanded = await menuToggle.getAttribute('aria-expanded');
  console.log('✓ aria-expanded:', ariaExpanded);
  expect(ariaExpanded).toBe('true');

  // Test 5: Navigation items visible
  const homeLink = mobileNav.locator('a[data-page="home"]');
  await expect(homeLink).toBeVisible();
  console.log('✓ Navigation items are visible');

  console.log('\n✅ HAMBURGER MENU IS WORKING!\n');
});
