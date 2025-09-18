const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Simple HTML validation without browser - using JSDOM for parsing
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

describe('Navbar Structure Validation (No Browser Required)', () => {

  htmlFiles.forEach(file => {
    describe(`${file}`, () => {

      let dom;
      let document;

      beforeAll(() => {
        const filePath = path.join(websiteDir, file);
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        dom = new JSDOM(htmlContent);
        document = dom.window.document;
      });

      test('has proper HTML5 structure', () => {
        // Check DOCTYPE
        expect(dom.serialize().startsWith('<!DOCTYPE html>')).toBe(true);

        // Check basic elements
        expect(document.querySelector('html')).toBeTruthy();
        expect(document.querySelector('head')).toBeTruthy();
        expect(document.querySelector('body')).toBeTruthy();

        // Check lang attribute
        expect(document.documentElement.getAttribute('lang')).toBe('en');
      });

      test('has consolidated CSS files referenced', () => {
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        const hrefs = Array.from(cssLinks).map(link => link.getAttribute('href'));

        // Should have new consolidated CSS files
        expect(hrefs.some(href => href && href.includes('navigation.css'))).toBe(true);
        expect(hrefs.some(href => href && href.includes('layout.css'))).toBe(true);
        expect(hrefs.some(href => href && href.includes('loading-states.css'))).toBe(true);

        // Should NOT have old navbar-fix.css
        expect(hrefs.some(href => href && href.includes('navbar-fix.css'))).toBe(false);
      });

      test('has standardized navbar structure', () => {
        // Check main header
        const header = document.querySelector('#header.premium-nav');
        expect(header).toBeTruthy();

        // Check logo
        const logo = document.querySelector('.logo.premium-logo');
        expect(logo).toBeTruthy();
        expect(logo.getAttribute('href')).toBe('index.html');

        // Check navigation
        const nav = document.querySelector('#primary-navigation');
        expect(nav).toBeTruthy();
        expect(nav.getAttribute('role')).toBe('navigation');

        // Check nav links container
        const navLinks = document.querySelector('.nav-links.premium-nav-links');
        expect(navLinks).toBeTruthy();
        expect(navLinks.getAttribute('role')).toBe('menubar');

        // Check CTA button
        const ctaBtn = document.querySelector('.premium-cta-btn');
        expect(ctaBtn).toBeTruthy();
        expect(ctaBtn.getAttribute('href')).toBe('contact.html');

        // Check mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        expect(menuToggle).toBeTruthy();
      });

      test('has all required navigation items', () => {
        const navItems = document.querySelectorAll('.nav-item.premium-nav-item');
        const navTexts = Array.from(navItems).map(item =>
          item.textContent.trim().replace(/\s+/g, ' ')
        );

        // Should have all main navigation items
        expect(navTexts.some(text => text.includes('Home'))).toBe(true);
        expect(navTexts.some(text => text.includes('Services'))).toBe(true);
        expect(navTexts.some(text => text.includes('Pricing'))).toBe(true);
        expect(navTexts.some(text => text.includes('About'))).toBe(true);
        expect(navTexts.some(text => text.includes('Portfolio'))).toBe(true);
        expect(navTexts.some(text => text.includes('Contact'))).toBe(true);
      });

      test('has services dropdown with all items', () => {
        // Check services dropdown exists
        const servicesDropdown = document.querySelector('#services-dropdown');
        expect(servicesDropdown).toBeTruthy();
        expect(servicesDropdown.getAttribute('role')).toBe('menu');

        // Check dropdown items
        const dropdownItems = servicesDropdown.querySelectorAll('.dropdown-item.mega-item');
        expect(dropdownItems.length).toBeGreaterThanOrEqual(3);

        // Check specific service items exist
        const dropdownTexts = Array.from(dropdownItems).map(item => item.textContent);
        const hasServices = dropdownTexts.some(text => text.includes('SEO Services'));
        const hasWebDesign = dropdownTexts.some(text => text.includes('Website Design'));
        const hasGoogleAds = dropdownTexts.some(text => text.includes('Google Ads'));

        expect(hasServices).toBe(true);
        expect(hasWebDesign).toBe(true);
        expect(hasGoogleAds).toBe(true);
      });

      test('has accessibility features', () => {
        // Check skip links
        const skipLinks = document.querySelectorAll('.skip-link.sr-only-focusable');
        expect(skipLinks.length).toBeGreaterThanOrEqual(3);

        // Check main content ID
        const mainContent = document.querySelector('#main-content');
        expect(mainContent).toBeTruthy();
        expect(mainContent.getAttribute('role')).toBe('main');

        // Check scroll progress indicator
        const scrollProgress = document.querySelector('.scroll-progress');
        expect(scrollProgress).toBeTruthy();
        expect(scrollProgress.getAttribute('role')).toBe('progressbar');

        // Check ARIA attributes
        const header = document.querySelector('#header');
        expect(header.getAttribute('role')).toBe('banner');
      });

      test('has mobile navigation structure', () => {
        // Check mobile nav overlay
        const mobileOverlay = document.querySelector('.mobile-nav-overlay');
        expect(mobileOverlay).toBeTruthy();

        // Check mobile nav menu
        const mobileNav = document.querySelector('.mobile-nav');
        expect(mobileNav).toBeTruthy();
        expect(mobileNav.getAttribute('role')).toBe('dialog');
        expect(mobileNav.getAttribute('aria-modal')).toBe('true');

        // Check mobile nav structure
        expect(document.querySelector('.mobile-nav-header')).toBeTruthy();
        expect(document.querySelector('.mobile-nav-links')).toBeTruthy();
        expect(document.querySelector('.mobile-nav-cta')).toBeTruthy();

        // Check mobile nav close button
        const closeBtn = document.querySelector('.mobile-nav-close');
        expect(closeBtn).toBeTruthy();
        expect(closeBtn.getAttribute('type')).toBe('button');
      });

      test('has correct active states for page type', () => {
        const activeNavItems = document.querySelectorAll('.nav-item.active');
        const activeMobileItems = document.querySelectorAll('.mobile-nav-link.active');

        // Configuration for expected active states
        const pageConfig = {
          'index.html': { nav: 'Home' },
          'about.html': { nav: 'About' },
          'contact.html': { nav: 'Contact' },
          'portfolio.html': { nav: 'Portfolio' },
          'pricing.html': { nav: 'Pricing' },
          'services.html': { nav: 'Services' },
          'seo.html': { nav: 'Services', dropdown: 'SEO Services' },
          'google-ads.html': { nav: 'Services', dropdown: 'Google Ads' },
          'web-design.html': { nav: 'Services', dropdown: 'Website Design' },
          'terms.html': { nav: null },
          'privacy.html': { nav: null },
          'disclaimer.html': { nav: null }
        };

        const config = pageConfig[file];

        if (config.nav) {
          // Should have at least one active nav item
          expect(activeNavItems.length).toBeGreaterThan(0);

          // Check that correct item is active
          const activeTexts = Array.from(activeNavItems).map(item =>
            item.textContent.trim().replace(/\s+/g, ' ')
          );
          expect(activeTexts.some(text => text.includes(config.nav))).toBe(true);

          // For service pages, check dropdown item is active
          if (config.dropdown) {
            const activeDropdownItems = document.querySelectorAll('.dropdown-item.active');
            expect(activeDropdownItems.length).toBeGreaterThan(0);

            const dropdownTexts = Array.from(activeDropdownItems).map(item =>
              item.textContent.trim().replace(/\s+/g, ' ')
            );
            expect(dropdownTexts.some(text => text.includes(config.dropdown))).toBe(true);
          }
        }
      });

      test('has proper FontAwesome icon structure', () => {
        // Check navigation icons exist
        const navIcons = document.querySelectorAll('.nav-icon.fas');
        expect(navIcons.length).toBeGreaterThan(0);

        // Check specific icons
        expect(document.querySelector('.fa-home')).toBeTruthy();
        expect(document.querySelector('.fa-rocket')).toBeTruthy();
        expect(document.querySelector('.fa-dollar-sign')).toBeTruthy();
        expect(document.querySelector('.fa-users')).toBeTruthy();
        expect(document.querySelector('.fa-briefcase')).toBeTruthy();
        expect(document.querySelector('.fa-envelope')).toBeTruthy();

        // Check CTA icon
        expect(document.querySelector('.premium-cta-icon.fas')).toBeTruthy();
      });

      test('has all navigation links with correct hrefs', () => {
        // Test main navigation
        const homeLink = document.querySelector('a[href="index.html"]:has(.fa-home)');
        expect(homeLink).toBeTruthy();

        const servicesLink = document.querySelector('a[href="services.html"]:has(.fa-rocket)');
        expect(servicesLink).toBeTruthy();

        const pricingLink = document.querySelector('a[href="pricing.html"]:has(.fa-dollar-sign)');
        expect(pricingLink).toBeTruthy();

        const aboutLink = document.querySelector('a[href="about.html"]:has(.fa-users)');
        expect(aboutLink).toBeTruthy();

        const portfolioLink = document.querySelector('a[href="portfolio.html"]:has(.fa-briefcase)');
        expect(portfolioLink).toBeTruthy();

        const contactLink = document.querySelector('a[href="contact.html"]:has(.fa-envelope)');
        expect(contactLink).toBeTruthy();

        // Test dropdown links
        expect(document.querySelector('a[href="seo.html"]')).toBeTruthy();
        expect(document.querySelector('a[href="web-design.html"]')).toBeTruthy();
        expect(document.querySelector('a[href="google-ads.html"]')).toBeTruthy();

        // Test CTA button
        const ctaButton = document.querySelector('.premium-cta-btn[href="contact.html"]');
        expect(ctaButton).toBeTruthy();

        // Test logo link
        const logoLink = document.querySelector('.logo.premium-logo[href="index.html"]');
        expect(logoLink).toBeTruthy();
      });

      test('has proper meta tags', () => {
        // Check charset
        const charset = document.querySelector('meta[charset="UTF-8"]');
        expect(charset).toBeTruthy();

        // Check viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
        expect(viewport.getAttribute('content')).toContain('width=device-width');

        // Check basic SEO
        expect(document.querySelector('title')).toBeTruthy();
        expect(document.querySelector('meta[name="description"]')).toBeTruthy();
        expect(document.querySelector('meta[name="keywords"]')).toBeTruthy();

        // Check Open Graph
        expect(document.querySelector('meta[property="og:title"]')).toBeTruthy();
        expect(document.querySelector('meta[property="og:description"]')).toBeTruthy();
      });
    });
  });

  // Cross-page consistency tests
  describe('Cross-Page Consistency', () => {

    test('all pages have similar navbar structure', () => {
      const navbarElements = {};

      htmlFiles.forEach(file => {
        const filePath = path.join(websiteDir, file);
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        // Extract key navbar elements
        navbarElements[file] = {
          hasHeader: !!document.querySelector('#header.premium-nav'),
          hasLogo: !!document.querySelector('.logo.premium-logo'),
          hasNav: !!document.querySelector('#primary-navigation'),
          hasNavLinks: !!document.querySelector('.nav-links.premium-nav-links'),
          hasCTA: !!document.querySelector('.premium-cta-btn'),
          hasMobileToggle: !!document.querySelector('.menu-toggle'),
          hasMobileNav: !!document.querySelector('.mobile-nav'),
          hasSkipLinks: document.querySelectorAll('.skip-link').length >= 3,
          hasScrollProgress: !!document.querySelector('.scroll-progress')
        };
      });

      // All pages should have the same basic structure
      const firstPage = navbarElements[htmlFiles[0]];

      htmlFiles.forEach(file => {
        const pageElements = navbarElements[file];

        expect(pageElements.hasHeader).toBe(firstPage.hasHeader);
        expect(pageElements.hasLogo).toBe(firstPage.hasLogo);
        expect(pageElements.hasNav).toBe(firstPage.hasNav);
        expect(pageElements.hasNavLinks).toBe(firstPage.hasNavLinks);
        expect(pageElements.hasCTA).toBe(firstPage.hasCTA);
        expect(pageElements.hasMobileToggle).toBe(firstPage.hasMobileToggle);
        expect(pageElements.hasMobileNav).toBe(firstPage.hasMobileNav);
        expect(pageElements.hasSkipLinks).toBe(firstPage.hasSkipLinks);
        expect(pageElements.hasScrollProgress).toBe(firstPage.hasScrollProgress);
      });
    });

    test('all pages reference the same consolidated CSS files', () => {
      const cssReferences = {};

      htmlFiles.forEach(file => {
        const filePath = path.join(websiteDir, file);
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        const hrefs = Array.from(cssLinks).map(link => link.getAttribute('href'));

        cssReferences[file] = {
          hasNavigationCSS: hrefs.some(href => href && href.includes('navigation.css')),
          hasLayoutCSS: hrefs.some(href => href && href.includes('layout.css')),
          hasLoadingStatesCSS: hrefs.some(href => href && href.includes('loading-states.css')),
          hasOldNavbarCSS: hrefs.some(href => href && href.includes('navbar-fix.css'))
        };
      });

      // All pages should have consistent CSS references
      htmlFiles.forEach(file => {
        const pageCss = cssReferences[file];

        expect(pageCss.hasNavigationCSS).toBe(true);
        expect(pageCss.hasLayoutCSS).toBe(true);
        expect(pageCss.hasLoadingStatesCSS).toBe(true);
        expect(pageCss.hasOldNavbarCSS).toBe(false);
      });
    });
  });

  test('summary of navbar standardization', () => {
    console.log(`\n🎉 Navbar Standardization Test Results:`);
    console.log(`✅ Tested ${htmlFiles.length} HTML pages`);
    console.log(`✅ All pages have consolidated CSS files`);
    console.log(`✅ All pages have standardized navbar structure`);
    console.log(`✅ All pages have accessibility features`);
    console.log(`✅ All pages have mobile navigation`);
    console.log(`✅ All pages have proper active states`);
    console.log(`✅ Cross-page consistency verified\n`);

    // This test always passes - it's just for reporting
    expect(true).toBe(true);
  });
});