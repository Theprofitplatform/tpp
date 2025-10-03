import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

test.describe('Hamburger Menu - Debug User Issue', () => {
  test('Test with hard reload and cache clear', async ({ page, context }) => {
    // Clear all cookies and cache
    await context.clearCookies();

    // Force hard reload by adding cache buster
    const url = `${PRODUCTION_URL}?nocache=${Date.now()}`;

    await page.goto(url, {
      waitUntil: 'networkidle'
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== DEBUGGING USER ISSUE ===\n');

    const menuToggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');

    // Check if button exists
    const buttonExists = await menuToggle.count();
    console.log('1. Button exists:', buttonExists > 0);

    // Check if visible
    const isVisible = await menuToggle.isVisible();
    console.log('2. Button visible:', isVisible);

    if (!isVisible) {
      const computedDisplay = await menuToggle.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          width: style.width,
          height: style.height,
          zIndex: style.zIndex
        };
      });
      console.log('   Computed style:', computedDisplay);
    }

    // Check if script loaded
    const scriptLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      return scripts.some(s => s.textContent.includes('menuToggle.addEventListener'));
    });
    console.log('3. Script with event listener loaded:', scriptLoaded);

    // Check DOMContentLoaded fired
    const domReady = await page.evaluate(() => document.readyState);
    console.log('4. Document ready state:', domReady);

    // Check for overlaying elements
    const clickableInfo = await page.evaluate(() => {
      const button = document.getElementById('menuToggle');
      if (!button) return { error: 'Button not found' };

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      const isButtonClickable = elementAtPoint === button || button.contains(elementAtPoint);

      return {
        buttonRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        centerPoint: { x: centerX, y: centerY },
        elementAtCenter: elementAtPoint?.tagName + (elementAtPoint?.id ? '#' + elementAtPoint.id : '') + (elementAtPoint?.className ? '.' + elementAtPoint.className.split(' ').join('.') : ''),
        isClickable: isButtonClickable,
        buttonZIndex: window.getComputedStyle(button).zIndex
      };
    });
    console.log('5. Click interception check:', clickableInfo);

    if (isVisible) {
      // Try clicking with different methods
      console.log('\n6. Attempting click with force...');
      await menuToggle.click({ force: true });
      await page.waitForTimeout(1000);

      const hasActive = await mobileNav.evaluate(el => el.classList.contains('active'));
      console.log('   Menu opened (force click):', hasActive);

      if (!hasActive) {
        console.log('\n7. Force click failed, trying JS click...');
        await page.evaluate(() => {
          document.getElementById('menuToggle').click();
        });
        await page.waitForTimeout(1000);

        const hasActiveJS = await mobileNav.evaluate(el => el.classList.contains('active'));
        console.log('   Menu opened (JS click):', hasActiveJS);

        if (!hasActiveJS) {
          console.log('\n8. JS click failed, checking event listener...');
          const eventInfo = await page.evaluate(() => {
            const button = document.getElementById('menuToggle');
            // Manually trigger the event
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            button.dispatchEvent(event);

            // Wait a bit
            return new Promise(resolve => {
              setTimeout(() => {
                const nav = document.getElementById('mobileNav');
                resolve({
                  hasActive: nav.classList.contains('active'),
                  navClasses: nav.className,
                  ariaExpanded: button.getAttribute('aria-expanded')
                });
              }, 500);
            });
          });
          console.log('   Event dispatch result:', eventInfo);
        }
      }
    }

    // Take screenshot for debugging
    await page.screenshot({
      path: 'test-results/user-issue-debug.png',
      fullPage: true
    });

    console.log('\n=== END DEBUG ===\n');
  });

  test('Check what user sees on desktop vs mobile', async ({ page }) => {
    console.log('\n=== DESKTOP vs MOBILE CHECK ===\n');

    // First test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const menuToggle = page.locator('#menuToggle');
    const desktopVisible = await menuToggle.isVisible();
    console.log('Desktop (1920px): Hamburger visible =', desktopVisible);

    // Now test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileVisible = await menuToggle.isVisible();
    console.log('Mobile (375px): Hamburger visible =', mobileVisible);

    // Test intermediate sizes
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const tabletVisible = await menuToggle.isVisible();
    console.log('Tablet (768px): Hamburger visible =', tabletVisible);

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);
    const smallLaptopVisible = await menuToggle.isVisible();
    console.log('Small Laptop (1024px): Hamburger visible =', smallLaptopVisible);

    console.log('\n=== END CHECK ===\n');
  });
});
