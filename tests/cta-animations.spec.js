import { test, expect } from '@playwright/test';

test.describe('CTA Section Animations', () => {

  test('should animate CTA section on desktop when scrolling into view', async ({ page, context }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to homepage
    await page.goto('http://localhost:4321/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check console logs for animation initialization
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    // Reload to capture console logs
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify animation system initialized
    const animationLogs = logs.filter(log => log.includes('[Animations]'));
    console.log('Animation logs:', animationLogs);

    // Should not skip on desktop
    expect(animationLogs.some(log => log.includes('Skipping - mobile'))).toBe(false);

    // Should find elements
    expect(animationLogs.some(log => log.includes('Found') && log.includes('elements'))).toBe(true);

    // Get CTA section
    const ctaSection = page.locator('section.cta.section.animate-on-scroll');
    await expect(ctaSection).toBeVisible();

    // Check initial state - should be hidden (opacity 0)
    const initialOpacity = await ctaSection.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.opacity);
    });

    console.log('CTA initial opacity:', initialOpacity);

    // CTA should be initially hidden on desktop
    expect(initialOpacity).toBeLessThan(0.5);

    // Scroll CTA into view
    await ctaSection.scrollIntoViewIfNeeded();

    // Wait for animation to trigger
    await page.waitForTimeout(1000);

    // Check if animate-in class was added
    const hasAnimateIn = await ctaSection.evaluate(el =>
      el.classList.contains('animate-in')
    );

    console.log('Has animate-in class:', hasAnimateIn);
    expect(hasAnimateIn).toBe(true);

    // Check final opacity - should be visible (opacity 1)
    const finalOpacity = await ctaSection.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.opacity);
    });

    console.log('CTA final opacity:', finalOpacity);
    expect(finalOpacity).toBeGreaterThan(0.9);
  });

  test('should NOT animate on mobile - elements visible immediately', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to homepage
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Capture console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify animation system skipped on mobile
    const animationLogs = logs.filter(log => log.includes('[Animations]'));
    console.log('Mobile animation logs:', animationLogs);

    expect(animationLogs.some(log => log.includes('Skipping - mobile'))).toBe(true);

    // Get CTA section
    const ctaSection = page.locator('section.cta.section.animate-on-scroll');
    await expect(ctaSection).toBeVisible();

    // Check opacity - should be visible immediately on mobile
    const opacity = await ctaSection.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.opacity);
    });

    console.log('CTA opacity on mobile:', opacity);

    // Should be fully visible on mobile (no animation)
    expect(opacity).toBe(1);

    // Should NOT have animate-in class
    const hasAnimateIn = await ctaSection.evaluate(el =>
      el.classList.contains('animate-in')
    );

    expect(hasAnimateIn).toBe(false);
  });

  test('should animate other sections with animate-on-scroll class', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Get all animated sections
    const animatedSections = page.locator('.animate-on-scroll');
    const count = await animatedSections.count();

    console.log('Total animated sections:', count);
    expect(count).toBeGreaterThan(0);

    // Test services section animation
    const servicesSection = page.locator('section.services.section.animate-on-scroll');

    // Scroll to services section
    await servicesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Should have animate-in class
    const hasAnimateIn = await servicesSection.evaluate(el =>
      el.classList.contains('animate-in')
    );

    console.log('Services section has animate-in:', hasAnimateIn);
    expect(hasAnimateIn).toBe(true);
  });

  test('should log animation setup in console', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Check for expected debug logs
    const animationLogs = logs.filter(log => log.includes('[Animations]'));

    console.log('All animation logs:');
    animationLogs.forEach(log => console.log('  -', log));

    expect(animationLogs.length).toBeGreaterThan(0);
    expect(animationLogs.some(log => log.includes('Window width:'))).toBe(true);
    expect(animationLogs.some(log => log.includes('Setup complete'))).toBe(true);
  });
});
