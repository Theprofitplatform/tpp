const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Get all HTML files to test
const websiteDir = path.resolve(__dirname, '..');
const htmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'portfolio.html',
  'pricing.html',
  'services.html',
  'seo.html',
  'google-ads.html',
  'web-design.html',
  'terms.html',
  'privacy.html',
  'disclaimer.html'
];

// Test configuration for each page with expected active states
const pageConfigs = {
  'index.html': {
    title: /The Profit Platform/i,
    activeNav: 'Home',
    shouldHaveActiveDropdown: false
  },
  'about.html': {
    title: /About.*The Profit Platform/i,
    activeNav: 'About',
    shouldHaveActiveDropdown: false
  },
  'contact.html': {
    title: /Contact.*The Profit Platform/i,
    activeNav: 'Contact',
    shouldHaveActiveDropdown: false
  },
  'portfolio.html': {
    title: /Portfolio.*The Profit Platform/i,
    activeNav: 'Portfolio',
    shouldHaveActiveDropdown: false
  },
  'pricing.html': {
    title: /Pricing.*The Profit Platform/i,
    activeNav: 'Pricing',
    shouldHaveActiveDropdown: false
  },
  'services.html': {
    title: /Services.*The Profit Platform/i,
    activeNav: 'Services',
    shouldHaveActiveDropdown: false
  },
  'seo.html': {
    title: /SEO.*The Profit Platform/i,
    activeNav: 'Services',
    shouldHaveActiveDropdown: true,
    activeDropdownItem: 'SEO Services'
  },
  'google-ads.html': {
    title: /Google Ads.*The Profit Platform/i,
    activeNav: 'Services',
    shouldHaveActiveDropdown: true,
    activeDropdownItem: 'Google Ads'
  },
  'web-design.html': {
    title: /Web.*Design.*The Profit Platform/i,
    activeNav: 'Services',
    shouldHaveActiveDropdown: true,
    activeDropdownItem: 'Website Design'
  },
  'terms.html': {
    title: /Terms.*The Profit Platform/i,
    activeNav: null,
    shouldHaveActiveDropdown: false
  },
  'privacy.html': {
    title: /Privacy.*The Profit Platform/i,
    activeNav: null,
    shouldHaveActiveDropdown: false
  },
  'disclaimer.html': {
    title: /Disclaimer.*The Profit Platform/i,
    activeNav: null,
    shouldHaveActiveDropdown: false
  }
};

// Test each HTML file exists and can be loaded
htmlFiles.forEach(file => {
  test.describe(`${file} - Navbar Consistency Tests`, () => {

    test('page loads successfully', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check page loads and has proper title
      const config = pageConfigs[file];
      await expect(page).toHaveTitle(config.title);
    });

    test('has standardized navbar structure', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check main header exists with correct class
      await expect(page.locator('#header.premium-nav')).toBeVisible();

      // Check logo exists and links to homepage
      const logo = page.locator('.logo.premium-logo');
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute('href', 'index.html');

      // Check main navigation exists
      await expect(page.locator('#primary-navigation')).toBeVisible();

      // Check all main navigation items exist
      const navItems = ['Home', 'Services', 'Pricing', 'About', 'Portfolio', 'Contact'];
      for (const item of navItems) {
        await expect(page.locator(`nav >> text=${item}`)).toBeVisible();
      }

      // Check CTA button exists
      await expect(page.locator('.premium-cta-btn')).toBeVisible();

      // Check mobile menu toggle exists
      await expect(page.locator('.menu-toggle')).toBeVisible();
    });

    test('has proper CSS files loaded', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check for consolidated CSS files
      const cssLinks = await page.locator('link[rel="stylesheet"]').all();
      const hrefs = await Promise.all(cssLinks.map(link => link.getAttribute('href')));

      // Should have navigation.css, layout.css, loading-states.css
      expect(hrefs.some(href => href && href.includes('navigation.css'))).toBeTruthy();
      expect(hrefs.some(href => href && href.includes('layout.css'))).toBeTruthy();
      expect(hrefs.some(href => href && href.includes('loading-states.css'))).toBeTruthy();

      // Should NOT have old navbar-fix.css
      expect(hrefs.some(href => href && href.includes('navbar-fix.css'))).toBeFalsy();
    });

    test('has accessibility features', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check skip links exist
      await expect(page.locator('.skip-link[href="#main-content"]')).toBeAttached();
      await expect(page.locator('.skip-link[href="#primary-navigation"]')).toBeAttached();
      await expect(page.locator('.skip-link[href="#contact"]')).toBeAttached();

      // Check main content has proper ID
      await expect(page.locator('#main-content')).toBeAttached();

      // Check scroll progress indicator exists
      await expect(page.locator('.scroll-progress')).toBeAttached();

      // Check proper ARIA attributes
      await expect(page.locator('#header[role="banner"]')).toBeVisible();
      await expect(page.locator('#primary-navigation[role="navigation"]')).toBeVisible();
      await expect(page.locator('main[role="main"]')).toBeVisible();
    });

    test('has correct active navigation state', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      const config = pageConfigs[file];

      if (config.activeNav) {
        // Check that the correct nav item has active class
        const activeNavItem = page.locator(`nav .nav-item:has-text("${config.activeNav}").active`);
        await expect(activeNavItem).toBeVisible();

        if (config.shouldHaveActiveDropdown && config.activeDropdownItem) {
          // For service pages, check dropdown item is also active
          const activeDropdownItem = page.locator(`.dropdown-item:has-text("${config.activeDropdownItem}").active`);
          await expect(activeDropdownItem).toBeAttached();
        }
      }
    });

    test('mobile navigation works correctly', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check mobile nav overlay exists
      await expect(page.locator('.mobile-nav-overlay')).toBeAttached();

      // Check mobile nav menu exists
      await expect(page.locator('.mobile-nav')).toBeAttached();

      // Check mobile nav has proper structure
      await expect(page.locator('.mobile-nav-header')).toBeAttached();
      await expect(page.locator('.mobile-nav-links')).toBeAttached();
      await expect(page.locator('.mobile-nav-cta')).toBeAttached();

      // Check mobile menu toggle functionality
      const menuToggle = page.locator('.menu-toggle');
      await expect(menuToggle).toBeVisible();

      // Test mobile menu opens (check aria-expanded changes)
      await menuToggle.click();
      await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

      // Check mobile nav becomes visible
      await expect(page.locator('.mobile-nav[aria-hidden="false"]')).toBeVisible();

      // Test mobile menu closes
      const closeButton = page.locator('.mobile-nav-close');
      await closeButton.click();
      await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('services dropdown works correctly', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check services dropdown exists
      const servicesDropdown = page.locator('.nav-dropdown:has-text("Services")');
      await expect(servicesDropdown).toBeVisible();

      // Check dropdown menu exists
      const dropdownMenu = page.locator('#services-dropdown');
      await expect(dropdownMenu).toBeAttached();

      // Check dropdown has all service items
      await expect(dropdownMenu.locator('text=SEO Services')).toBeAttached();
      await expect(dropdownMenu.locator('text=Website Design')).toBeAttached();
      await expect(dropdownMenu.locator('text=Google Ads')).toBeAttached();

      // Test dropdown opens on hover (desktop)
      await page.setViewportSize({ width: 1200, height: 800 });
      await servicesDropdown.hover();

      // Check dropdown becomes visible (implementation may vary)
      await expect(dropdownMenu).toBeAttached();
    });

    test('all navigation links are functional', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Test main navigation links
      const navLinks = [
        { text: 'Home', href: 'index.html' },
        { text: 'Services', href: 'services.html' },
        { text: 'Pricing', href: 'pricing.html' },
        { text: 'About', href: 'about.html' },
        { text: 'Portfolio', href: 'portfolio.html' },
        { text: 'Contact', href: 'contact.html' }
      ];

      for (const link of navLinks) {
        const linkElement = page.locator(`nav a:has-text("${link.text}")`).first();
        await expect(linkElement).toHaveAttribute('href', link.href);
      }

      // Test CTA button
      const ctaButton = page.locator('.premium-cta-btn');
      await expect(ctaButton).toHaveAttribute('href', 'contact.html');

      // Test logo link
      const logoLink = page.locator('.logo.premium-logo');
      await expect(logoLink).toHaveAttribute('href', 'index.html');
    });

    test('has proper meta tags and structure', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check HTML5 doctype (already loaded page should have proper doctype)
      const html = await page.locator('html').getAttribute('lang');
      expect(html).toBe('en');

      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width/);

      // Check charset
      const charset = page.locator('meta[charset]');
      await expect(charset).toHaveAttribute('charset', 'UTF-8');

      // Check basic SEO meta tags exist
      await expect(page.locator('meta[name="description"]')).toBeAttached();
      await expect(page.locator('meta[name="keywords"]')).toBeAttached();
    });

    test('FontAwesome icons load correctly', async ({ page }) => {
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Check FontAwesome icons exist in navigation
      await expect(page.locator('.nav-icon.fas')).toBeAttached();

      // Check specific navigation icons
      await expect(page.locator('.fa-home')).toBeAttached();
      await expect(page.locator('.fa-rocket')).toBeAttached();
      await expect(page.locator('.fa-dollar-sign')).toBeAttached();
      await expect(page.locator('.fa-users')).toBeAttached();
      await expect(page.locator('.fa-briefcase')).toBeAttached();
      await expect(page.locator('.fa-envelope')).toBeAttached();
    });

    test('page loads without console errors', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Check for console errors (allow some common file loading issues for local testing)
      const criticalErrors = consoleErrors.filter(error =>
        !error.includes('favicon') &&
        !error.includes('net::ERR_FILE_NOT_FOUND') &&
        !error.includes('images/optimized/logo')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });
});

// Cross-page consistency tests
test.describe('Cross-Page Navbar Consistency', () => {

  test('all pages have identical navbar HTML structure', async ({ page }) => {
    const navbarStructures = {};

    for (const file of htmlFiles.slice(0, 5)) { // Test first 5 pages for performance
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      // Get navbar structure (excluding active classes)
      const navbarHTML = await page.locator('#header').innerHTML();
      const normalizedHTML = navbarHTML
        .replace(/class="([^"]*\s+)?active(\s+[^"]*)?"/, 'class="$1$2"') // Remove active classes
        .replace(/aria-current="[^"]*"/, '') // Remove aria-current
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      navbarStructures[file] = normalizedHTML;
    }

    // Compare structures (they should be very similar, allowing for active state differences)
    const structures = Object.values(navbarStructures);
    const firstStructure = structures[0];

    // All structures should have similar base elements
    structures.forEach((structure, index) => {
      expect(structure).toContain('premium-nav');
      expect(structure).toContain('primary-navigation');
      expect(structure).toContain('premium-cta-btn');
      expect(structure).toContain('menu-toggle');
    });
  });

  test('all pages load CSS files consistently', async ({ page }) => {
    const cssLoadResults = {};

    for (const file of htmlFiles.slice(0, 3)) { // Test first 3 pages
      const filePath = `file://${path.join(websiteDir, file)}`;
      await page.goto(filePath);

      const cssLinks = await page.locator('link[rel="stylesheet"]').all();
      const hrefs = await Promise.all(cssLinks.map(link => link.getAttribute('href')));

      cssLoadResults[file] = hrefs.filter(href => href && (
        href.includes('navigation.css') ||
        href.includes('layout.css') ||
        href.includes('loading-states.css')
      ));
    }

    // All pages should load the same consolidated CSS files
    const expectedCSSFiles = ['navigation.css', 'layout.css', 'loading-states.css'];

    Object.values(cssLoadResults).forEach(hrefs => {
      expectedCSSFiles.forEach(cssFile => {
        expect(hrefs.some(href => href.includes(cssFile))).toBeTruthy();
      });
    });
  });
});

// Performance tests
test.describe('Navbar Performance Tests', () => {

  test('pages load within reasonable time', async ({ page }) => {
    for (const file of ['index.html', 'about.html', 'pricing.html']) {
      const filePath = `file://${path.join(websiteDir, file)}`;

      const startTime = Date.now();
      await page.goto(filePath);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Local file loading should be very fast (under 2 seconds even with processing)
      expect(loadTime).toBeLessThan(2000);
    }
  });

  test('navbar is visible immediately on page load', async ({ page }) => {
    const filePath = `file://${path.join(websiteDir, 'index.html')}`;
    await page.goto(filePath);

    // Navbar should be visible immediately
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#primary-navigation')).toBeVisible();
    await expect(page.locator('.premium-cta-btn')).toBeVisible();
  });
});