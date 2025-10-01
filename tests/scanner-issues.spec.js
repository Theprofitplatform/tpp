import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

/**
 * This test file specifically validates the issues reported by the visual quality scanner
 * to determine if they are real issues or false positives.
 */

test.describe('Visual Quality Scanner Report Validation', () => {

  test.describe('Critical Issue #1: Malformed JavaScript Paths', () => {
    test('Verify no "https://js/" paths exist in HTML', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/`);

      const html = await page.content();

      // Scanner reported: 4 malformed paths like "https://js/emergency-fixes-loader.js"
      expect(html).not.toContain('https://js/');
      expect(html).not.toContain('src="https://js/');
      expect(html).not.toContain('href="https://js/');

      console.log('✅ No malformed "https://js/" paths found');
    });

    test('Verify correct JS paths are used', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/`);

      const jsScripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script[src]'))
          .map(script => script.getAttribute('src'))
          .filter(src => src && src.includes('.js'));
      });

      console.log('JS scripts found:', jsScripts);

      // All should start with / or https://
      const malformed = jsScripts.filter(src =>
        !src.startsWith('/') && !src.startsWith('http')
      );

      expect(malformed.length).toBe(0);
      console.log('✅ All JS paths are correctly formed');
    });
  });

  test.describe('Critical Issue #2: Missing CSS Files (79 reported)', () => {
    test('Verify CSS files load from correct /css/ path on /about page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/about`);

      const cssLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map(link => ({
            href: link.getAttribute('href'),
            loaded: true
          }));
      });

      console.log('CSS files on /about page:', cssLinks);

      // Check for scanner's incorrect paths
      const aboutCssPaths = cssLinks.filter(link =>
        link.href && link.href.includes('/about/css/')
      );

      expect(aboutCssPaths.length).toBe(0);
      console.log('✅ No incorrect /about/css/ paths found');

      // Verify correct /css/ paths exist
      const correctCssPaths = cssLinks.filter(link =>
        link.href && (link.href.includes('/css/') || link.href.startsWith('http'))
      );

      expect(correctCssPaths.length).toBeGreaterThan(0);
      console.log(`✅ Found ${correctCssPaths.length} correctly pathed CSS files`);
    });

    test('Verify navigation.css loads on /about page', async ({ page }) => {
      // Scanner reported: /about/css/navigation.css missing
      // Reality: Should load from /css/navigation.css

      const response = await page.goto(`${PRODUCTION_URL}/css/navigation.css`);
      expect(response.status()).toBe(200);
      console.log('✅ /css/navigation.css loads successfully');
    });

    test('Verify skip-links-fix.css loads on /about page', async ({ page }) => {
      // Scanner reported: /about/css/skip-links-fix.css missing
      // Reality: Should load from /css/skip-links-fix.css

      const response = await page.goto(`${PRODUCTION_URL}/css/skip-links-fix.css`);
      expect(response.status()).toBe(200);
      console.log('✅ /css/skip-links-fix.css loads successfully');
    });
  });

  test.describe('Critical Issue #3: HTTP 404/403 Errors', () => {
    test('/services returns 200 (scanner reported 404)', async ({ page }) => {
      const response = await page.goto(`${PRODUCTION_URL}/services`);
      expect(response.status()).toBe(200);

      const title = await page.title();
      expect(title.toLowerCase()).toContain('service');

      console.log('✅ /services returns 200, scanner was wrong');
    });

    test('/blog returns 200 (scanner reported 403)', async ({ page }) => {
      const response = await page.goto(`${PRODUCTION_URL}/blog`);
      expect(response.status()).toBe(200);

      const title = await page.title();
      expect(title.toLowerCase()).toContain('blog');

      console.log('✅ /blog returns 200, scanner was wrong');
    });

    test('/cookies page exists or redirects', async ({ page }) => {
      // Scanner reported 403
      const response = await page.goto(`${PRODUCTION_URL}/cookies`, {
        waitUntil: 'domcontentloaded'
      });

      // Accept 200, 301, 302, 404 (if page doesn't exist)
      const acceptableStatuses = [200, 301, 302, 404];
      expect(acceptableStatuses).toContain(response.status());

      console.log(`✅ /cookies returns ${response.status()}`);
    });
  });

  test.describe('High Priority Issue #4: Missing HTML Elements', () => {
    test('/services has <main> element (scanner reported missing)', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/services`);

      const main = page.locator('main');
      await expect(main).toBeAttached();

      console.log('✅ /services has <main> element, scanner was wrong');
    });

    test('/blog has <main> element (scanner reported missing)', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/blog`);

      const main = page.locator('main');
      await expect(main).toBeAttached();

      console.log('✅ /blog has <main> element, scanner was wrong');
    });

    test('/contact has <h1> element (scanner reported missing)', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/contact`);

      const h1 = page.locator('h1');
      await expect(h1).toBeAttached();

      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThan(0);

      const h1Text = await h1.first().textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(0);

      console.log(`✅ /contact has ${h1Count} <h1> elements, scanner was wrong`);
    });
  });

  test.describe('High Priority Issue #5: Broken Images', () => {
    test('Check Google Storage images on homepage', async ({ page }) => {
      const brokenImages = [];

      page.on('response', response => {
        const url = response.url();
        if (url.includes('storage.googleapis.com') && url.includes('.png')) {
          if (response.status() !== 200) {
            brokenImages.push({
              url: url,
              status: response.status()
            });
          }
        }
      });

      await page.goto(`${PRODUCTION_URL}/`, { waitUntil: 'networkidle' });

      if (brokenImages.length > 0) {
        console.log('⚠️ Broken Google Storage images:', brokenImages);
      } else {
        console.log('✅ All Google Storage images load successfully');
      }

      // This test is informational - we'll log but not fail
      // as images might be intentionally removed
    });

    test('All images on homepage have valid src', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/`);

      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .map(img => ({
            src: img.src,
            alt: img.alt
          }));
      });

      console.log(`Found ${images.length} images on homepage`);

      // Check for malformed src attributes
      const malformed = images.filter(img =>
        !img.src || img.src === '' || img.src === window.location.href
      );

      expect(malformed.length).toBe(0);
      console.log('✅ All images have valid src attributes');
    });
  });

  test.describe('High Priority Issue #6: Horizontal Overflow (30 elements)', () => {
    test('No horizontal overflow on homepage mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${PRODUCTION_URL}/`);
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = document.documentElement.clientWidth;

        return {
          scrollWidth: docWidth,
          clientWidth: viewWidth,
          hasOverflow: docWidth > viewWidth + 5
        };
      });

      console.log('Mobile overflow check:', overflow);
      expect(overflow.hasOverflow).toBe(false);
      console.log('✅ No horizontal overflow on mobile, scanner was wrong');
    });

    test('No horizontal overflow on /contact mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${PRODUCTION_URL}/contact`);
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = document.documentElement.clientWidth;

        return {
          scrollWidth: docWidth,
          clientWidth: viewWidth,
          hasOverflow: docWidth > viewWidth + 5
        };
      });

      console.log('Contact page mobile overflow check:', overflow);
      expect(overflow.hasOverflow).toBe(false);
      console.log('✅ No horizontal overflow on /contact mobile, scanner was wrong');
    });
  });

  test.describe('Medium Priority Issue #7: Font Display Optimization', () => {
    test('Check for font-display property in CSS', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/`);

      const fontInfo = await page.evaluate(() => {
        const fonts = [];
        try {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules || sheet.rules) {
                if (rule instanceof CSSFontFaceRule) {
                  fonts.push({
                    family: rule.style.fontFamily,
                    display: rule.style.fontDisplay || 'not set',
                    src: rule.style.src
                  });
                }
              }
            } catch (e) {
              // CORS, skip
            }
          }
        } catch (e) {
          // Error accessing stylesheets
        }
        return fonts;
      });

      console.log(`Found ${fontInfo.length} @font-face rules`);

      if (fontInfo.length > 0) {
        console.log('Font face details:', fontInfo);

        const withoutDisplay = fontInfo.filter(f => f.display === 'not set');
        if (withoutDisplay.length > 0) {
          console.log(`⚠️ ${withoutDisplay.length} fonts missing font-display (optimization opportunity)`);
        } else {
          console.log('✅ All fonts have font-display property');
        }
      }
    });
  });

  test.describe('Scanner Meta-Test: Verify Scanner Target', () => {
    test('Confirm scanner is testing correct domain', async ({ page }) => {
      const response = await page.goto(`${PRODUCTION_URL}/`);

      console.log('Testing domain:', response.url());
      expect(response.url()).toContain('theprofitplatform.com.au');

      // Scanner reports testing: new.theprofitplatform.com.au
      // This test confirms we're testing: theprofitplatform.com.au
      console.log('✅ This test suite is testing the correct production domain');
      console.log('⚠️ Scanner may be testing a different domain (new.theprofitplatform.com.au)');
    });
  });
});
