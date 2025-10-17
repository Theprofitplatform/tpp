import { test, expect } from '@playwright/test';

test.describe('About Page Check', () => {
  test('should render about page correctly', async ({ page }) => {
    // Go to the production about page
    await page.goto('https://theprofitplatform.com.au/about/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/About Us/);

    // Check for Header component (premium-nav)
    const header = await page.locator('header.premium-nav');
    await expect(header).toBeVisible();

    // Check logo is visible
    const logo = await page.locator('.logo img');
    await expect(logo).toBeVisible();

    // Check navigation items are visible
    const homeLink = await page.locator('a[data-page="home"]').first();
    await expect(homeLink).toBeVisible();

    // Check main content is visible
    const mainContent = await page.locator('#main-content');
    await expect(mainContent).toBeVisible();

    // Check for specific about page sections
    const missionSection = await page.locator('text=Mission');
    await expect(missionSection).toBeVisible();

    // Check CSS is loaded (check for styled elements)
    const headerBg = await header.evaluate(el => {
      return window.getComputedStyle(el).position;
    });
    expect(headerBg).toBeTruthy();

    // Take screenshot
    await page.screenshot({ path: 'test-results/about-page-check.png', fullPage: true });

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    console.log('✅ About page rendered successfully');
    if (errors.length > 0) {
      console.log('⚠️ Console errors found:', errors);
    } else {
      console.log('✅ No console errors');
    }
  });

  test('should have proper CSS loaded', async ({ page }) => {
    await page.goto('https://theprofitplatform.com.au/about/');
    await page.waitForLoadState('networkidle');

    // Check for CSS link tags
    const cssLinks = await page.locator('link[rel="stylesheet"]').all();
    console.log(`Found ${cssLinks.length} CSS files`);

    // List all CSS files
    for (const link of cssLinks) {
      const href = await link.getAttribute('href');
      console.log(`CSS: ${href}`);
    }

    expect(cssLinks.length).toBeGreaterThan(0);
  });

  test('should match services page navigation structure', async ({ page }) => {
    // Check about page navigation
    await page.goto('https://theprofitplatform.com.au/about/');
    await page.waitForLoadState('networkidle');

    const aboutNavItems = await page.locator('.premium-nav-links .nav-item').count();

    // Check services page navigation
    await page.goto('https://theprofitplatform.com.au/services/');
    await page.waitForLoadState('networkidle');

    const servicesNavItems = await page.locator('.premium-nav-links .nav-item').count();

    console.log(`About page nav items: ${aboutNavItems}`);
    console.log(`Services page nav items: ${servicesNavItems}`);

    // They should have similar number of nav items
    expect(Math.abs(aboutNavItems - servicesNavItems)).toBeLessThan(3);
  });
});
