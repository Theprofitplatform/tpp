import { test, expect } from '@playwright/test';

test('Tools menu item appears in navigation', async ({ page }) => {
  await page.goto('http://localhost:4322/');

  // Check for Tools link in desktop navigation
  const toolsLink = page.locator('nav[aria-label="Main navigation"] a[data-page="tools"]');
  await expect(toolsLink).toBeVisible();
  await expect(toolsLink).toContainText('Tools');

  // Verify it has the correct href
  await expect(toolsLink).toHaveAttribute('href', '/tools');

  // Verify it has the tools icon
  const toolsIcon = toolsLink.locator('i.fa-tools');
  await expect(toolsIcon).toBeVisible();
});

test('Tools menu item appears in mobile navigation', async ({ page }) => {
  await page.goto('http://localhost:4322/');

  // Open mobile menu
  const menuToggle = page.locator('#menuToggle');
  await menuToggle.click();

  // Check for Tools link in mobile navigation
  const mobileToolsLink = page.locator('.mobile-nav a[data-page="tools"]');
  await expect(mobileToolsLink).toBeVisible();
  await expect(mobileToolsLink).toContainText('Tools');

  // Verify it has the correct href
  await expect(mobileToolsLink).toHaveAttribute('href', '/tools');
});

test('Navigation menu order is correct', async ({ page }) => {
  await page.goto('http://localhost:4322/');

  // Get all nav items
  const navItems = page.locator('nav[aria-label="Main navigation"] a.nav-item');

  // Verify the order
  await expect(navItems.nth(0)).toContainText('Home');
  await expect(navItems.nth(1)).toContainText('Services');
  await expect(navItems.nth(2)).toContainText('Pricing');
  await expect(navItems.nth(3)).toContainText('Tools');
  await expect(navItems.nth(4)).toContainText('Contact');
});
