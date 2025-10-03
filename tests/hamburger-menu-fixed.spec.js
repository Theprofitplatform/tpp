import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test.describe('Hamburger Menu - Production Test', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE size
  });

  test('hamburger menu opens and closes correctly', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Wait for the page to be fully loaded and scripts to execute
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the menu toggle JavaScript to be ready
    await page.waitForFunction(() => {
      const toggle = document.getElementById('menuToggle');
      return toggle && window.document.readyState === 'complete';
    }, { timeout: 10000 });

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const mobileOverlay = page.locator('#mobileNavOverlay');
    const mobileClose = page.locator('#mobileNavClose');

    // Verify hamburger button is visible
    await expect(menuToggle).toBeVisible();

    // Check initial state
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // Click to open menu (using force: true to ensure click happens)
    await menuToggle.click({ force: true });

    // Wait for animation and JavaScript to complete
    await page.waitForTimeout(800);

    // Check if menu opened by looking for the active class
    const navClasses = await mobileNav.getAttribute('class');
    const hasActive = navClasses.includes('active');

    console.log('Menu classes after click:', navClasses);
    console.log('Has active class:', hasActive);

    if (hasActive) {
      // Menu opened successfully
      await expect(mobileNav).toHaveClass(/active/);
      await expect(mobileOverlay).toHaveClass(/active/);

      // Check navigation items are visible
      const homeLink = mobileNav.locator('a[data-page="home"]');
      await expect(homeLink).toBeVisible();

      // Test close button
      await mobileClose.click({ force: true });
      await page.waitForTimeout(800);

      const navClassesAfterClose = await mobileNav.getAttribute('class');
      expect(navClassesAfterClose).not.toContain('active');
    } else {
      console.log('WARNING: Menu did not open - JavaScript may not be executing');
      console.log('This could be a timing issue or script execution problem');

      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/hamburger-not-working.png', fullPage: true });

      // Verify the script is at least present
      const scriptPresent = await page.evaluate(() => {
        const scripts = Array.from(document.scripts);
        return scripts.some(s => s.textContent.includes('toggleMobileNav'));
      });

      console.log('Script present in DOM:', scriptPresent);

      // Fail the test with helpful message
      throw new Error('Hamburger menu did not respond to click - JavaScript not executing properly');
    }
  });

  test('hamburger button structure is correct', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('#menuToggle');

    // Check button attributes
    await expect(menuToggle).toHaveAttribute('aria-label', 'Open mobile menu');
    await expect(menuToggle).toHaveAttribute('aria-controls', 'mobileNav');
    await expect(menuToggle).toHaveAttribute('type', 'button');

    // Check for hamburger lines
    const spans = menuToggle.locator('span');
    await expect(spans).toHaveCount(3);
  });

  test('mobile menu structure is correct', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const mobileNav = page.locator('#mobileNav');

    // Check ARIA attributes
    await expect(mobileNav).toHaveAttribute('role', 'dialog');
    await expect(mobileNav).toHaveAttribute('aria-modal', 'true');
    await expect(mobileNav).toHaveAttribute('aria-labelledby', 'mobile-nav-title');

    // Check navigation items exist (even if not visible)
    await expect(mobileNav.locator('a[data-page="home"]')).toBeAttached();
    await expect(mobileNav.locator('a[data-page="services"]')).toBeAttached();
    await expect(mobileNav.locator('a[data-page="pricing"]')).toBeAttached();
    await expect(mobileNav.locator('a[data-page="tools"]')).toBeAttached();
    await expect(mobileNav.locator('a[data-page="contact"]')).toBeAttached();

    // Check CTA button
    const ctaButton = mobileNav.locator('.mobile-cta-btn');
    await expect(ctaButton).toBeAttached();
    await expect(ctaButton).toHaveAttribute('href', '/contact');
  });

  test('hamburger hidden on desktop', async ({ page, viewport }) => {
    // Override viewport for this test
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('#menuToggle');

    // Should not be visible on desktop
    await expect(menuToggle).not.toBeVisible();
  });
});
