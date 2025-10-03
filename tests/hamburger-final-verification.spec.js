import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test.describe('Hamburger Menu - Final Verification', () => {
  test.use({
    viewport: { width: 375, height: 667 } // Mobile viewport
  });

  test('Complete hamburger menu workflow', async ({ page }) => {
    console.log('\n🧪 FINAL HAMBURGER MENU VERIFICATION TEST\n');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for scripts

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const mobileOverlay = page.locator('#mobileNavOverlay');
    const mobileClose = page.locator('#mobileNavClose');

    // Step 1: Verify button is visible
    console.log('✓ Step 1: Checking hamburger button visibility...');
    await expect(menuToggle).toBeVisible();
    console.log('  ✓ Hamburger button is visible');

    // Step 2: Check initial state
    console.log('\n✓ Step 2: Checking initial state...');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    console.log('  ✓ aria-expanded is false');

    // Step 3: Click to open
    console.log('\n✓ Step 3: Opening menu...');
    await menuToggle.click();
    await page.waitForTimeout(600); // Wait for animation

    // Step 4: Verify menu is open
    console.log('\n✓ Step 4: Verifying menu opened...');
    const navHasActive = await mobileNav.evaluate(el => el.classList.contains('active'));
    expect(navHasActive).toBe(true);
    console.log('  ✓ Menu has "active" class');

    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    console.log('  ✓ aria-expanded is true');

    await expect(mobileNav).toHaveAttribute('aria-hidden', 'false');
    console.log('  ✓ aria-hidden is false');

    // Step 5: Verify navigation items are visible
    console.log('\n✓ Step 5: Checking navigation items...');
    const homeLink = mobileNav.locator('a[data-page="home"]');
    await expect(homeLink).toBeVisible();
    console.log('  ✓ Home link is visible');

    const servicesLink = mobileNav.locator('a[data-page="services"]');
    await expect(servicesLink).toBeVisible();
    console.log('  ✓ Services link is visible');

    // Step 6: Verify CTA button
    const ctaButton = mobileNav.locator('.mobile-cta-btn');
    await expect(ctaButton).toBeVisible();
    console.log('  ✓ CTA button is visible');

    // Step 7: Close with close button
    console.log('\n✓ Step 7: Closing menu with close button...');
    await mobileClose.click();
    await page.waitForTimeout(600);

    const navClosedByButton = await mobileNav.evaluate(el => !el.classList.contains('active'));
    expect(navClosedByButton).toBe(true);
    console.log('  ✓ Menu closed successfully');

    // Step 8: Reopen and close with overlay
    console.log('\n✓ Step 8: Testing overlay close...');
    await menuToggle.click();
    await page.waitForTimeout(600);

    const navReopenedHasActive = await mobileNav.evaluate(el => el.classList.contains('active'));
    expect(navReopenedHasActive).toBe(true);
    console.log('  ✓ Menu reopened');

    await mobileOverlay.click();
    await page.waitForTimeout(600);

    const navClosedByOverlay = await mobileNav.evaluate(el => !el.classList.contains('active'));
    expect(navClosedByOverlay).toBe(true);
    console.log('  ✓ Menu closed by overlay');

    // Step 9: Verify body scroll lock
    console.log('\n✓ Step 9: Testing body scroll lock...');
    await menuToggle.click();
    await page.waitForTimeout(600);

    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');
    console.log('  ✓ Body scroll is locked when menu is open');

    await mobileClose.click();
    await page.waitForTimeout(600);

    const bodyOverflowRestored = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowRestored).toBe('');
    console.log('  ✓ Body scroll is restored when menu closes');

    // Final verification
    console.log('\n✅ ALL TESTS PASSED! Hamburger menu is fully functional!\n');
  });

  test('Verify no JavaScript errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Click menu
    const menuToggle = page.locator('#menuToggle');
    await menuToggle.click();
    await page.waitForTimeout(1000);

    console.log('\n🔍 JavaScript Error Check:');
    if (consoleErrors.length === 0) {
      console.log('  ✓ No JavaScript errors detected!');
    } else {
      console.log('  ✗ Errors found:', consoleErrors);
    }

    expect(consoleErrors.length).toBe(0);
  });
});
