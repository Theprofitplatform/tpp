import { test, expect } from '@playwright/test';

test('Navigation CTA button is properly contained and visible', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  // Wait for page to load completely
  await page.waitForLoadState('networkidle');

  // Check for CTA button in navigation
  const ctaButton = page.locator('.nav-cta .premium-cta-btn');
  await expect(ctaButton).toBeVisible();
  
  // Verify the CTA button text is "Get Free Proposal"
  await expect(ctaButton).toContainText('Get Free Proposal');

  // Check accessibility label
  await expect(ctaButton).toHaveAttribute('aria-label', 'Get Free Proposal - Contact us');

  // Verify CTA button link points to contact page
  await expect(ctaButton).toHaveAttribute('href', '/contact');

  // Check that CTA button has proper styling
  await expect(ctaButton).toHaveClass(/btn-primary premium-cta-btn/);

  // Verify the icon is present
  const ctaIcon = ctaButton.locator('i.fa-comments');
  await expect(ctaIcon).toBeVisible();
});

test('Navigation container has adequate width to prevent overflow', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Get the navigation container
  const navContainer = page.locator('.premium-nav');
  await expect(navContainer).toBeVisible();

  // Check the max-width style
  const navStyles = await navContainer.evaluate(el => {
    return {
      maxWidth: getComputedStyle(el).maxWidth,
      width: getComputedStyle(el).width,
      marginLeft: getComputedStyle(el).marginLeft,
      marginRight: getComputedStyle(el).marginRight
    };
  });

  console.log('Navigation container styles:', navStyles);
  
  // Verify navigation is wide enough (should be at least 1200px for desktop)
  expect(navStyles.maxWidth).toBe('1400px');

  // Check that nav has proper margin for centering
  expect(navStyles.marginLeft).toBe('auto');
  expect(navStyles.marginRight).toBe('auto');
});

test('All navigation elements are within container bounds', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  await page.waitForLoadState('networkidle');

  // Get navigation container bounds
  const navContainer = page.locator('.premium-nav');
  const navBounds = await navContainer.boundingBox();
  
  // Get CTA button bounds  
  const ctaButton = page.locator('.nav-cta .premium-cta-btn');
  const ctaBounds = await ctaButton.boundingBox();

  console.log('Nav container bounds:', navBounds);
  console.log('CTA button bounds:', ctaBounds);

  // Verify CTA button is within navigation container
  expect(navBounds).toBeTruthy();
  expect(ctaBounds).toBeTruthy();
  
  if (navBounds && ctaBounds) {
    expect(ctaBounds.x).toBeGreaterThanOrEqual(navBounds.x);
    expect(ctaBounds.y).toBeGreaterThanOrEqual(navBounds.y);
    expect(ctaBounds.x + ctaBounds.width).toBeLessThanOrEqual(navBounds.x + navBounds.width);
    expect(ctaBounds.y + ctaBounds.height).toBeLessThanOrEqual(navBounds.y + navBounds.height);
  }
});

test('Navigation layout is responsive and doesn\'t break on different viewports', async ({ page }) => {
  // Test desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3001/');
  
  const ctaButton = page.locator('.nav-cta .premium-cta-btn');
  await expect(ctaButton).toBeVisible();

  // Test tablet view
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.reload();
  await expect(ctaButton).toBeVisible();

  // Test mobile menu toggle appears on smaller screens
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload();
  
  const mobileMenu = page.locator('#menuToggle');
  await expect(mobileMenu).toBeVisible();
  
  // CTA should still be visible but mobile menu should appear
  await expect(ctaButton).toBeVisible();
});
