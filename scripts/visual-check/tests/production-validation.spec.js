/**
 * Production Validation Test Suite
 *
 * Validates production site health with 37 critical tests:
 * - HTTP Status Codes (8 tests)
 * - Critical HTML Elements (16 tests)
 * - CSS File Loading (10 tests)
 * - JavaScript File Loading (3 tests)
 *
 * These tests replace the flawed visual checker with proven Playwright validation.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://theprofitplatform.com.au';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services' },
  { path: '/blog', name: 'Blog' },
  { path: '/contact', name: 'Contact' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/cookies', name: 'Cookies' }
];

const CRITICAL_CSS_FILES = [
  '/css/critical.min.css',
  '/css/style.min.css',
  '/css/visibility-fix.css',
  '/css/navigation.css',
  '/css/skip-links-fix.css',
  '/css/main-content-spacing.css',
  '/css/layout.css',
  '/css/dropdown-fix.css',
  '/css/navigation-glass-enhanced.css',
  '/css/bundled.min.css'
];

const CRITICAL_JS_FILES = [
  '/js/vendor.js',
  '/js/plugins.js',
  '/js/main.js'
];

// HTTP Status Code Tests
test.describe('HTTP Status Codes', () => {
  for (const page of PAGES) {
    test(`${page.name} page returns 200`, async ({ page: playwrightPage }) => {
      const response = await playwrightPage.goto(`${BASE_URL}${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      expect(response.status()).toBe(200);
    });
  }
});

// Critical HTML Element Tests
test.describe('Critical HTML Elements', () => {
  for (const page of PAGES) {
    test(`${page.name} page has <main> element`, async ({ page: playwrightPage }) => {
      await playwrightPage.goto(`${BASE_URL}${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const mainElement = playwrightPage.locator('main');
      await expect(mainElement).toBeVisible();
    });

    test(`${page.name} page has <h1> element`, async ({ page: playwrightPage }) => {
      await playwrightPage.goto(`${BASE_URL}${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const h1Element = playwrightPage.locator('h1');
      await expect(h1Element).toBeVisible();
    });
  }
});

// CSS File Loading Tests
test.describe('CSS File Loading', () => {
  for (const cssFile of CRITICAL_CSS_FILES) {
    test(`${cssFile} loads successfully`, async ({ page }) => {
      let cssLoaded = false;

      // Listen for the CSS file request
      page.on('response', response => {
        if (response.url().includes(cssFile)) {
          cssLoaded = response.status() === 200;
        }
      });

      await page.goto(BASE_URL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Verify CSS file was requested and loaded
      expect(cssLoaded).toBe(true);
    });
  }
});

// JavaScript File Loading Tests
test.describe('JavaScript File Loading', () => {
  for (const jsFile of CRITICAL_JS_FILES) {
    test(`${jsFile} loads successfully`, async ({ page }) => {
      let jsLoaded = false;

      // Listen for the JS file request
      page.on('response', response => {
        if (response.url().includes(jsFile)) {
          jsLoaded = response.status() === 200;
        }
      });

      await page.goto(BASE_URL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Verify JS file was requested and loaded
      expect(jsLoaded).toBe(true);
    });
  }
});
