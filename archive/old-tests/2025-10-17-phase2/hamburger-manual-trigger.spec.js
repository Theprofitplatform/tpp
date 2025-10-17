import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test.describe('Hamburger Menu - Manual Trigger Test', () => {
  test.use({
    viewport: { width: 375, height: 667 }
  });

  test('manually trigger menu toggle via JavaScript', async ({ page }) => {
    // Listen for console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
      console.log(`${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Try to manually execute the toggle logic
    const result = await page.evaluate(() => {
      const mobileToggle = document.getElementById('menuToggle');
      const mobileNav = document.getElementById('mobileNav');
      const mobileOverlay = document.getElementById('mobileNavOverlay');

      if (!mobileToggle || !mobileNav || !mobileOverlay) {
        return { error: 'Elements not found' };
      }

      // Manually add the active class like the script should do
      mobileNav.classList.add('active');
      mobileOverlay.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
      mobileOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      return {
        success: true,
        navClasses: mobileNav.className,
        overlayClasses: mobileOverlay.className,
        toggleExpanded: mobileToggle.getAttribute('aria-expanded'),
        bodyOverflow: document.body.style.overflow
      };
    });

    console.log('Manual trigger result:', result);

    // Wait for changes to take effect
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ path: 'test-results/manual-trigger.png', fullPage: true });

    // Now check if the menu is visible
    const mobileNav = page.locator('#mobileNav');
    const hasActive = await mobileNav.evaluate(el => el.classList.contains('active'));

    console.log('Menu has active class:', hasActive);

    expect(hasActive).toBe(true);
    expect(result.success).toBe(true);
  });

  test('check for JavaScript errors and CSP violations', async ({ page }) => {
    const errors = [];
    const cspViolations = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('CONSOLE ERROR:', msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('PAGE ERROR:', error.message);
    });

    page.on('console', msg => {
      if (msg.text().includes('Content Security Policy') || msg.text().includes('CSP')) {
        cspViolations.push(msg.text());
        console.log('CSP VIOLATION:', msg.text());
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Try to click the menu
    const menuToggle = page.locator('#menuToggle');
    await menuToggle.click({ force: true });
    await page.waitForTimeout(1000);

    console.log('\n=== Summary ===');
    console.log('Errors found:', errors.length);
    console.log('CSP violations:', cspViolations.length);

    if (errors.length > 0) {
      console.log('\nErrors:', errors);
    }

    if (cspViolations.length > 0) {
      console.log('\nCSP Violations:', cspViolations);
    }

    // Check CSP headers
    const response = await page.goto(PRODUCTION_URL);
    const headers = response.headers();
    const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];

    console.log('\nCSP Header:', cspHeader || 'None');

    // This test always passes, it's just for diagnostics
    expect(true).toBe(true);
  });

  test('check if event listener is attached', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const eventInfo = await page.evaluate(() => {
      const mobileToggle = document.getElementById('menuToggle');

      // Try to trigger a click programmatically
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      const beforeClasses = document.getElementById('mobileNav').className;

      // Dispatch the event
      mobileToggle.dispatchEvent(clickEvent);

      // Wait a tiny bit
      return new Promise(resolve => {
        setTimeout(() => {
          const afterClasses = document.getElementById('mobileNav').className;
          resolve({
            beforeClasses,
            afterClasses,
            changed: beforeClasses !== afterClasses
          });
        }, 500);
      });
    });

    console.log('Programmatic click result:', eventInfo);

    if (eventInfo.changed) {
      console.log('✓ Event listener IS working!');
    } else {
      console.log('✗ Event listener NOT working - classes did not change');
    }
  });
});
