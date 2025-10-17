import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test.describe('Hamburger Menu - Basic Functionality', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE size
  });

  test('check if JavaScript is loaded and menu toggle works', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const mobileOverlay = page.locator('#mobileNavOverlay');

    // Check initial visibility
    console.log('Initial state:');
    const initialNavHidden = await mobileNav.getAttribute('aria-hidden');
    console.log('mobileNav aria-hidden:', initialNavHidden);

    const initialToggleExpanded = await menuToggle.getAttribute('aria-expanded');
    console.log('menuToggle aria-expanded:', initialToggleExpanded);

    // Check if elements exist
    await expect(menuToggle).toBeVisible();
    console.log('menuToggle is visible');

    // Click the toggle
    console.log('\nClicking menu toggle...');
    await menuToggle.click();

    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(1000);

    // Check state after click
    console.log('\nState after click:');
    const afterNavHidden = await mobileNav.getAttribute('aria-hidden');
    console.log('mobileNav aria-hidden:', afterNavHidden);

    const afterToggleExpanded = await menuToggle.getAttribute('aria-expanded');
    console.log('menuToggle aria-expanded:', afterToggleExpanded);

    const navClasses = await mobileNav.getAttribute('class');
    console.log('mobileNav classes:', navClasses);

    const overlayClasses = await mobileOverlay.getAttribute('class');
    console.log('mobileOverlay classes:', overlayClasses);

    // Check if event listeners are attached
    const hasClickListener = await page.evaluate(() => {
      const toggle = document.getElementById('menuToggle');
      const listeners = getEventListeners?.(toggle);
      return listeners ? Object.keys(listeners).length > 0 : 'getEventListeners not available';
    });
    console.log('menuToggle has event listeners:', hasClickListener);

    // Manual test: try to trigger the function directly
    console.log('\nTrying to trigger toggleMobileNav directly...');
    const directResult = await page.evaluate(() => {
      const toggle = document.getElementById('menuToggle');
      const nav = document.getElementById('mobileNav');
      const overlay = document.getElementById('mobileNavOverlay');

      return {
        toggleExists: !!toggle,
        navExists: !!nav,
        overlayExists: !!overlay,
        toggleExpanded: toggle?.getAttribute('aria-expanded'),
        navHidden: nav?.getAttribute('aria-hidden'),
      };
    });
    console.log('Direct evaluation result:', directResult);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/hamburger-debug.png', fullPage: true });
  });

  test('check if script tag exists in page source', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    const scriptContent = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      const navScript = scripts.find(s => s.textContent.includes('menuToggle'));
      return navScript ? {
        found: true,
        excerpt: navScript.textContent.substring(0, 500)
      } : {
        found: false,
        totalScripts: scripts.length
      };
    });

    console.log('Navigation script check:', scriptContent);
    expect(scriptContent.found).toBe(true);
  });
});
