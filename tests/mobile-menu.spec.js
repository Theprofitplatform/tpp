import { test, expect } from '@playwright/test';

test.describe('Mobile Menu', () => {
  test('should show mobile menu with reduced gap and visible Tools submenu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to the page
    await page.goto('http://localhost:4321/');

    // Click hamburger menu
    await page.click('#menuToggle');

    // Wait for menu to be visible
    await page.waitForSelector('#mobileNav.active');

    // Take screenshot of mobile menu (just the visible menu, not full page)
    const mobileNav = await page.locator('#mobileNav');
    await mobileNav.screenshot({ path: 'mobile-menu-test.png' });

    // Check that Tools link exists
    const toolsLink = await page.locator('.mobile-nav-link:has-text("Tools")');
    await expect(toolsLink).toBeVisible();

    // Check that Blog submenu item exists and is visible
    const blogLink = await page.locator('.mobile-nav-submenu .mobile-sub-item:has-text("Blog")');
    await expect(blogLink).toBeVisible();

    // Check mobile nav header height
    const headerBox = await page.locator('.mobile-nav-header').boundingBox();
    console.log('Mobile nav header height:', headerBox.height);

    // Header should be compact (less than 80px)
    expect(headerBox.height).toBeLessThan(80);
  });
});
