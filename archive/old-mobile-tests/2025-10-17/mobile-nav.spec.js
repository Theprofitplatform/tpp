import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test('should open mobile navigation from top right on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Go to homepage
    await page.goto('http://localhost:3001');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find mobile menu toggle
    const menuToggle = page.locator('#menuToggle');
    await expect(menuToggle).toBeVisible();
    
    // Click mobile menu toggle
    await menuToggle.click();
    
    // Wait for mobile navigation to appear
    await page.waitForTimeout(500);
    
    // Check if mobile navigation is visible
    const mobileNav = page.locator('#mobileNav');
    await expect(mobileNav).toBeVisible();
    
    // CRITICAL: Check mobile nav position - it should NOT be at bottom
    const mobileNavBox = await mobileNav.boundingBox();
    expect(mobileNavBox.y).toBeLessThan(100); // Should be at top (y < 100px)
    
    // Check if mobile nav has correct z-index and positioning
    const computedStyle = await mobileNav.evaluate((el) => {
      return {
        position: getComputedStyle(el).position,
        top: getComputedStyle(el).top,
        zIndex: getComputedStyle(el).zIndex,
        transform: getComputedStyle(el).transform
      };
    });
    
    console.log('Mobile Nav Computed Style:', computedStyle);
    console.log('Mobile Nav Position:', mobileNavBox);
    
    // Verify it's fixed positioning at top
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.top).toBe('0px');
    
    // Take screenshot for debugging
    await page.screenshot({ 
      path: 'mobile-nav-debug.png',
      fullPage: true 
    });
    
    // Close mobile nav
    const mobileClose = page.locator('#mobileNavClose');
    await mobileClose.click();
    await page.waitForTimeout(300);
    
    // Verify nav is hidden
    await expect(mobileNav).not.toHaveClass(/active/);
  });
  
  test('should have correct overlay behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3001');
    
    const menuToggle = page.locator('#menuToggle');
    await menuToggle.click();
    await page.waitForTimeout(500);
    
    // Check overlay is present
    const overlay = page.locator('#mobileNavOverlay');
    await expect(overlay).toHaveClass(/active/);
    
    // Check overlay covers full screen
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox.width).toBeGreaterThan(370);
    expect(overlayBox.height).toBeGreaterThan(800);
    
    // Click overlay to close
    await overlay.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(300);
    
    // Verify both overlay and nav are closed
    await expect(overlay).not.toHaveClass(/active/);
    const mobileNav = page.locator('#mobileNav');
    await expect(mobileNav).not.toHaveClass(/active/);
  });
});
