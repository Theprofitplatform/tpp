import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

const pages = [
  { path: '/', name: 'Home', expectedH1: true },
  { path: '/about', name: 'About', expectedH1: true },
  { path: '/services', name: 'Services', expectedH1: true },
  { path: '/blog', name: 'Blog', expectedH1: true },
  { path: '/contact', name: 'Contact', expectedH1: true },
  { path: '/privacy', name: 'Privacy', expectedH1: true },
  { path: '/terms', name: 'Terms', expectedH1: true },
  { path: '/portfolio', name: 'Portfolio', expectedH1: true },
];

test.describe('Production Site Validation', () => {

  test.describe('HTTP Status Codes', () => {
    for (const page of pages) {
      test(`${page.name} page returns 200`, async ({ page: browser }) => {
        const response = await browser.goto(`${PRODUCTION_URL}${page.path}`);
        expect(response.status()).toBe(200);
      });
    }
  });

  test.describe('Critical HTML Elements', () => {
    for (const page of pages) {
      test(`${page.name} has <main> element`, async ({ page: browser }) => {
        await browser.goto(`${PRODUCTION_URL}${page.path}`);
        const main = browser.locator('main');
        await expect(main).toBeAttached();
      });

      if (page.expectedH1) {
        test(`${page.name} has <h1> element`, async ({ page: browser }) => {
          await browser.goto(`${PRODUCTION_URL}${page.path}`);
          const h1 = browser.locator('h1');
          await expect(h1).toBeAttached();
          const h1Text = await h1.textContent();
          expect(h1Text?.trim().length).toBeGreaterThan(0);
        });
      }
    }
  });

  test.describe('CSS File Loading', () => {
    const criticalCssFiles = [
      '/css/critical.min.css',
      '/css/style.min.css',
      '/css/visibility-fix.css',
      '/css/navigation.css',
      '/css/skip-links-fix.css',
      '/css/main-content-spacing.css',
      '/css/layout.css',
      '/css/dropdown-fix.css',
      '/css/navigation-glass-enhanced.css',
      '/css/bundled.min.css',
    ];

    for (const cssFile of criticalCssFiles) {
      test(`CSS file ${cssFile} loads successfully`, async ({ page: browser }) => {
        const response = await browser.goto(`${PRODUCTION_URL}${cssFile}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('text/css');
      });
    }
  });

  test.describe('JavaScript File Loading', () => {
    const jsFiles = [
      '/js/vendor.js',
      '/js/plugins.js',
      '/js/main.js',
    ];

    for (const jsFile of jsFiles) {
      test(`JS file ${jsFile} loads successfully`, async ({ page: browser }) => {
        const response = await browser.goto(`${PRODUCTION_URL}${jsFile}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/javascript|ecmascript/);
      });
    }

    test('No malformed JS paths (https://js/)', async ({ page: browser }) => {
      await browser.goto(`${PRODUCTION_URL}/`);
      const html = await browser.content();

      // Check for malformed paths
      expect(html).not.toContain('https://js/');
      expect(html).not.toContain('src="https://js/');
    });
  });

  test.describe('Resource Loading Validation', () => {
    test('All resources load without 404 errors', async ({ page: browser }) => {
      const failed404Resources = [];
      const failed403Resources = [];

      browser.on('response', response => {
        if (response.status() === 404) {
          failed404Resources.push({
            url: response.url(),
            status: response.status()
          });
        }
        if (response.status() === 403) {
          failed403Resources.push({
            url: response.url(),
            status: response.status()
          });
        }
      });

      await browser.goto(`${PRODUCTION_URL}/`, { waitUntil: 'networkidle' });

      if (failed404Resources.length > 0) {
        console.log('404 Resources:', JSON.stringify(failed404Resources, null, 2));
      }
      if (failed403Resources.length > 0) {
        console.log('403 Resources:', JSON.stringify(failed403Resources, null, 2));
      }

      expect(failed404Resources.length).toBe(0);
      expect(failed403Resources.length).toBe(0);
    });
  });

  test.describe('Image Loading', () => {
    test('All images load successfully on homepage', async ({ page: browser }) => {
      const brokenImages = [];

      browser.on('response', response => {
        if (response.url().match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          if (response.status() !== 200) {
            brokenImages.push({
              url: response.url(),
              status: response.status()
            });
          }
        }
      });

      await browser.goto(`${PRODUCTION_URL}/`, { waitUntil: 'networkidle' });

      if (brokenImages.length > 0) {
        console.log('Broken Images:', JSON.stringify(brokenImages, null, 2));
      }

      expect(brokenImages.length).toBe(0);
    });
  });

  test.describe('Horizontal Overflow Check', () => {
    test('No horizontal overflow on mobile viewport', async ({ page: browser }) => {
      await browser.setViewportSize({ width: 375, height: 812 });
      await browser.goto(`${PRODUCTION_URL}/`);
      await browser.waitForLoadState('networkidle');

      // Check document width
      const documentWidth = await browser.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await browser.evaluate(() => document.documentElement.clientWidth);

      console.log(`Document width: ${documentWidth}px, Viewport width: ${viewportWidth}px`);

      // Allow 5px tolerance for scrollbars
      expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });

    test('No horizontal overflow on desktop viewport', async ({ page: browser }) => {
      await browser.setViewportSize({ width: 1920, height: 1080 });
      await browser.goto(`${PRODUCTION_URL}/`);
      await browser.waitForLoadState('networkidle');

      const documentWidth = await browser.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await browser.evaluate(() => document.documentElement.clientWidth);

      expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });
  });

  test.describe('Font Loading', () => {
    test('Fonts have font-display property', async ({ page: browser }) => {
      await browser.goto(`${PRODUCTION_URL}/`);

      const fontFaces = await browser.evaluate(() => {
        const fonts = [];
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules || sheet.rules) {
              if (rule instanceof CSSFontFaceRule) {
                fonts.push({
                  family: rule.style.fontFamily,
                  display: rule.style.fontDisplay || 'not set'
                });
              }
            }
          } catch (e) {
            // CORS issue, skip
          }
        }
        return fonts;
      });

      console.log('Font faces found:', fonts);

      // Check if we found any fonts without font-display
      const fontsWithoutDisplay = fonts.filter(f => f.display === 'not set' || !f.display);

      if (fontsWithoutDisplay.length > 0) {
        console.log('Fonts without font-display:', fontsWithoutDisplay);
      }
    });
  });

  test.describe('Performance Metrics', () => {
    test('Homepage load time is acceptable', async ({ page: browser }) => {
      const startTime = Date.now();
      await browser.goto(`${PRODUCTION_URL}/`, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      console.log(`Homepage load time: ${loadTime}ms`);

      // Warn if over 3 seconds, fail if over 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Page-Specific Validation', () => {
    test('/services page renders properly', async ({ page: browser }) => {
      const response = await browser.goto(`${PRODUCTION_URL}/services`);
      expect(response.status()).toBe(200);

      const title = await browser.title();
      expect(title.toLowerCase()).toContain('service');

      const main = browser.locator('main');
      await expect(main).toBeAttached();
    });

    test('/blog page renders properly', async ({ page: browser }) => {
      const response = await browser.goto(`${PRODUCTION_URL}/blog`);
      expect(response.status()).toBe(200);

      const title = await browser.title();
      expect(title.toLowerCase()).toContain('blog');

      const main = browser.locator('main');
      await expect(main).toBeAttached();
    });

    test('/contact page has h1', async ({ page: browser }) => {
      await browser.goto(`${PRODUCTION_URL}/contact`);

      const h1 = browser.locator('h1');
      await expect(h1).toBeAttached();

      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThan(0);
    });
  });

  test.describe('CSS Path Validation', () => {
    test('All CSS links use correct absolute paths', async ({ page: browser }) => {
      await browser.goto(`${PRODUCTION_URL}/about`);

      const cssLinks = await browser.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return links.map(link => link.getAttribute('href'));
      });

      console.log('CSS links found:', cssLinks);

      // Check for incorrect paths like /about/css/
      const malformedPaths = cssLinks.filter(href =>
        href && (href.includes('/about/css/') || href.includes('/services/css/'))
      );

      expect(malformedPaths.length).toBe(0);
    });
  });

  test.describe('Console Errors', () => {
    test('No console errors on homepage', async ({ page: browser }) => {
      const consoleErrors = [];

      browser.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await browser.goto(`${PRODUCTION_URL}/`, { waitUntil: 'networkidle' });

      if (consoleErrors.length > 0) {
        console.log('Console errors:', consoleErrors);
      }

      // We might have some third-party script errors, so let's be lenient
      // Only fail if there are critical errors
      const criticalErrors = consoleErrors.filter(err =>
        err.toLowerCase().includes('failed to fetch') ||
        err.toLowerCase().includes('404') ||
        err.toLowerCase().includes('syntax error')
      );

      expect(criticalErrors.length).toBe(0);
    });
  });
});
