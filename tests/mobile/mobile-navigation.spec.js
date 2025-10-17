import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test.describe('Hamburger Menu - Mobile View', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE size
  });

  test('hamburger button is visible on mobile viewport', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    await expect(menuToggle).toBeVisible();

    // Check ARIA attributes
    await expect(menuToggle).toHaveAttribute('aria-label', 'Open mobile menu');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menuToggle).toHaveAttribute('aria-controls', 'mobileNav');

    // Check it has 3 spans (hamburger lines)
    const spans = menuToggle.locator('span');
    await expect(spans).toHaveCount(3);
  });

  test('clicking hamburger opens mobile menu', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const mobileOverlay = page.locator('#mobileNavOverlay');

    // Initially menu should be hidden
    await expect(mobileNav).toHaveAttribute('aria-hidden', 'true');
    await expect(mobileOverlay).toHaveAttribute('aria-hidden', 'true');

    // Click hamburger to open
    await menuToggle.click();

    // Wait for menu to open
    await page.waitForTimeout(500); // Wait for animation

    // Menu should now be visible
    await expect(mobileNav).toHaveAttribute('aria-hidden', 'false');
    await expect(mobileNav).toHaveClass(/active/);
    await expect(mobileOverlay).toHaveAttribute('aria-hidden', 'false');
    await expect(mobileOverlay).toHaveClass(/active/);
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    // Body scroll should be disabled
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');
  });

  test('mobile menu contains all navigation items', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Open menu
    await page.locator('#menuToggle').click();
    await page.waitForTimeout(500);

    // Check for main nav items
    const mobileNav = page.locator('#mobileNav');
    await expect(mobileNav.locator('a[data-page="home"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="services"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="pricing"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="tools"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="contact"]')).toBeVisible();

    // Check for submenu items
    await expect(mobileNav.locator('a[data-page="seo"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="web-design"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="google-ads"]')).toBeVisible();
    await expect(mobileNav.locator('a[data-page="blog"]')).toBeVisible();
  });

  test('clicking close button closes mobile menu', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const mobileClose = page.locator('#mobileNavClose');

    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(500);
    await expect(mobileNav).toHaveClass(/active/);

    // Close menu
    await mobileClose.click();
    await page.waitForTimeout(500);

    // Menu should be closed
    await expect(mobileNav).toHaveAttribute('aria-hidden', 'true');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // Body scroll should be restored
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('');
  });

  test('clicking overlay closes mobile menu', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const mobileOverlay = page.locator('#mobileNavOverlay');

    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(500);
    await expect(mobileNav).toHaveClass(/active/);

    // Click overlay
    await mobileOverlay.click();
    await page.waitForTimeout(500);

    // Menu should be closed
    await expect(mobileNav).toHaveAttribute('aria-hidden', 'true');
    await expect(mobileOverlay).not.toHaveClass(/active/);
  });

  test('pressing Escape key closes mobile menu', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');

    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(500);
    await expect(mobileNav).toHaveClass(/active/);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Menu should be closed
    await expect(mobileNav).toHaveAttribute('aria-hidden', 'true');
  });

  test('mobile menu has correct ARIA attributes', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const mobileNav = page.locator('#mobileNav');

    // Check ARIA attributes
    await expect(mobileNav).toHaveAttribute('role', 'dialog');
    await expect(mobileNav).toHaveAttribute('aria-modal', 'true');
    await expect(mobileNav).toHaveAttribute('aria-labelledby', 'mobile-nav-title');

    // Check for navigation title
    const navTitle = mobileNav.locator('#mobile-nav-title');
    await expect(navTitle).toBeInViewport();
  });

  test('mobile menu items are clickable', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Open menu
    await page.locator('#menuToggle').click();
    await page.waitForTimeout(500);

    // Click a menu item and verify navigation
    const servicesLink = page.locator('#mobileNav a[data-page="services"]');
    await expect(servicesLink).toBeVisible();

    await servicesLink.click();

    // Should navigate to services page
    await page.waitForURL('**/services');
    expect(page.url()).toContain('/services');
  });

  test('mobile CTA button is visible in menu', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Open menu
    await page.locator('#menuToggle').click();
    await page.waitForTimeout(500);

    const ctaButton = page.locator('.mobile-cta-btn');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toContainText('Get Free Consultation');
    await expect(ctaButton).toHaveAttribute('href', '/contact');
  });
});

test.describe('Hamburger Menu - Desktop View', () => {
  test.use({
    viewport: { width: 1920, height: 1080 }
  });

  test('hamburger button is hidden on desktop viewport', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');

    // Hamburger should not be visible on desktop
    await expect(menuToggle).not.toBeVisible();

    // Desktop nav should be visible
    const desktopNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(desktopNav).toBeVisible();
  });
});

test.describe('Hamburger Menu - Tablet View', () => {
  test.use({
    viewport: { width: 768, height: 1024 }
  });

  test('hamburger button is visible on tablet viewport', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    await expect(menuToggle).toBeVisible();
  });
});

test.describe('Hamburger Menu - Animations', () => {
  test.use({
    viewport: { width: 375, height: 667 }
  });

  test('menu slides in from right when opened', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');

    // Get initial transform value (should be translateX(100%))
    const initialTransform = await mobileNav.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(500);

    // Get transform after opening (should be translateX(0))
    const openTransform = await mobileNav.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    // Transforms should be different
    expect(initialTransform).not.toBe(openTransform);

    // Menu should have active class
    await expect(mobileNav).toHaveClass(/active/);
  });

  test('overlay fades in when menu opens', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const menuToggle = page.locator('#menuToggle');
    const overlay = page.locator('#mobileNavOverlay');

    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(500);

    // Overlay should have active class
    await expect(overlay).toHaveClass(/active/);

    // Overlay should be visible
    const opacity = await overlay.evaluate(el =>
      window.getComputedStyle(el).opacity
    );

    expect(parseFloat(opacity)).toBeGreaterThan(0);
  });
});
