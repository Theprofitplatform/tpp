#!/usr/bin/env node

/**
 * Playwright E2E Tests for Growth Journey Section
 * Tests all interactive functionality and user flows
 */

import { chromium } from 'playwright';

console.log('🎭 Starting Playwright tests for Growth Journey Section...\n');

const TEST_URL = 'http://localhost:4322';

async function runTests() {
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('📍 Navigating to:', TEST_URL);
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });

    // Wait for the page to fully load
    await page.waitForTimeout(2000);

    console.log('🔍 Testing Growth Journey Section presence...');

    // Test 1: Check if Growth Journey section exists
    const growthSection = await page.locator('#growth-journey').first();
    const sectionExists = await growthSection.isVisible();
    console.log(sectionExists ? '✅ Growth Journey section found' : '❌ Growth Journey section not found');

    if (!sectionExists) {
      console.log('🚨 Growth Journey section not found! Checking page content...');
      const pageTitle = await page.title();
      console.log('Page title:', pageTitle);

      // Check if we're on the right page
      const heroSection = await page.locator('.hero-section, #hero, .hero').first();
      const heroExists = await heroSection.isVisible();
      console.log(heroExists ? '✅ Hero section found' : '❌ Hero section not found');

      // Look for any form
      const anyForm = await page.locator('form').first();
      const formExists = await anyForm.isVisible();
      console.log(formExists ? '✅ Some form found' : '❌ No forms found');

      if (formExists) {
        const formId = await anyForm.getAttribute('id');
        console.log('Form found with ID:', formId);
      }

      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-page.png', fullPage: true });
      console.log('📸 Screenshot saved as debug-page.png');

      return;
    }

    // Scroll to Growth Journey section
    await growthSection.scrollIntoView();
    await page.waitForTimeout(1000);

    console.log('\n🧪 Testing Form Components...');

    // Test 2: Check form existence
    const form = await page.locator('#growth-form').first();
    const formExists = await form.isVisible();
    console.log(formExists ? '✅ Growth form found' : '❌ Growth form not found');

    // Test 3: Check stepper
    const stepper = await page.locator('.stepper').first();
    const stepperExists = await stepper.isVisible();
    console.log(stepperExists ? '✅ Stepper component found' : '❌ Stepper component not found');

    // Test 4: Check service pills
    const servicePills = await page.locator('.service-pills').first();
    const servicePillsExist = await servicePills.isVisible();
    console.log(servicePillsExist ? '✅ Service pills found' : '❌ Service pills not found');

    if (servicePillsExist) {
      // Test service pill interaction
      const firstServicePill = await page.locator('.service-pill').first();
      await firstServicePill.click();
      await page.waitForTimeout(500);

      const isSelected = await firstServicePill.getAttribute('aria-checked');
      console.log(isSelected === 'true' ? '✅ Service pill selection works' : '❌ Service pill selection not working');
    }

    // Test 5: Form field interactions
    console.log('\n📝 Testing Form Fields...');

    const nameField = await page.locator('#name').first();
    const emailField = await page.locator('#email').first();

    if (await nameField.isVisible()) {
      await nameField.fill('John Doe');
      const nameValue = await nameField.inputValue();
      console.log(nameValue === 'John Doe' ? '✅ Name field works' : '❌ Name field not working');
    }

    if (await emailField.isVisible()) {
      await emailField.fill('john@example.com');
      const emailValue = await emailField.inputValue();
      console.log(emailValue === 'john@example.com' ? '✅ Email field works' : '❌ Email field not working');
    }

    // Test 6: Step navigation
    console.log('\n🚶 Testing Step Navigation...');

    const nextButton = await page.locator('button:has-text("Next"), button[data-action="next"]').first();
    const nextButtonExists = await nextButton.isVisible();

    if (nextButtonExists) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Check if step 2 is now visible
      const step2 = await page.locator('#step2').first();
      const step2Visible = await step2.isVisible();
      console.log(step2Visible ? '✅ Step 2 navigation works' : '❌ Step 2 navigation not working');

      if (step2Visible) {
        // Test phone field
        const phoneField = await page.locator('#phone').first();
        if (await phoneField.isVisible()) {
          await phoneField.fill('0412345678');
          const phoneValue = await phoneField.inputValue();
          console.log(phoneValue.includes('04') ? '✅ Phone field works' : '❌ Phone field not working');
        }
      }
    }

    // Test 7: Mobile sticky bar (resize to mobile)
    console.log('\n📱 Testing Mobile Features...');

    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.waitForTimeout(1000);

    const stickyBar = await page.locator('.mobile-sticky-bar').first();
    const stickyBarVisible = await stickyBar.isVisible();
    console.log(stickyBarVisible ? '✅ Mobile sticky bar appears' : '❌ Mobile sticky bar not working');

    // Test 8: Contact card
    console.log('\n📞 Testing Contact Card...');

    await page.setViewportSize({ width: 1280, height: 720 }); // Back to desktop
    await page.waitForTimeout(1000);

    const contactCard = await page.locator('.contact-card').first();
    const contactCardExists = await contactCard.isVisible();
    console.log(contactCardExists ? '✅ Contact card found' : '❌ Contact card not found');

    if (contactCardExists) {
      const phoneLink = await page.locator('a[href^="tel:"]').first();
      const emailLink = await page.locator('a[href^="mailto:"]').first();

      const phoneLinkExists = await phoneLink.isVisible();
      const emailLinkExists = await emailLink.isVisible();

      console.log(phoneLinkExists ? '✅ Phone link works' : '❌ Phone link not found');
      console.log(emailLinkExists ? '✅ Email link works' : '❌ Email link not found');
    }

    // Test 9: Timeline component
    const timeline = await page.locator('.timeline, .next-timeline').first();
    const timelineExists = await timeline.isVisible();
    console.log(timelineExists ? '✅ Timeline component found' : '❌ Timeline component not found');

    // Test 10: Check JavaScript functionality
    console.log('\n🔧 Testing JavaScript Features...');

    // Check if GrowthForm class is loaded
    const growthFormLoaded = await page.evaluate(() => {
      return typeof window.GrowthForm !== 'undefined' ||
             document.querySelector('#growth-form')?.dataset?.initialized === 'true';
    });

    console.log(growthFormLoaded ? '✅ JavaScript functionality loaded' : '❌ JavaScript not loaded');

    // Final screenshot
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('\n📸 Final screenshot saved as final-test-result.png');

    console.log('\n🎯 Test Summary Complete!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved');
  } finally {
    await browser.close();
  }
}

// Check if we have the required dependencies
try {
  await runTests();
} catch (error) {
  if (error.message.includes('playwright')) {
    console.log('📦 Playwright not found. Installing...');
    console.log('Run: npm install -D playwright');
    console.log('Then: npx playwright install');
  } else {
    console.error('Error running tests:', error);
  }
}