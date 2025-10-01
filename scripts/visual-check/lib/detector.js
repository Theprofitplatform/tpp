/**
 * Issue Detection Module
 *
 * Detects various visual and structural issues on web pages:
 * - Missing CSS files
 * - 404 errors on assets
 * - Unstyled elements
 * - Font loading issues
 * - Layout problems
 * - Console errors
 *
 * IMPROVEMENTS (2025-10-01):
 * - Fixed CSS path detection to use pathname instead of full URLs
 * - Reduced false positives by checking for actual styling before reporting CSS issues
 * - Improved asset detection to exclude cached resources
 * - Added CORS-aware CSS sheet checking to avoid false positives
 */

/**
 * Detect all issues on the page
 */
export async function detectIssues(page, response) {
  const issues = {
    missingAssets: [],
    cssIssues: [],
    fontIssues: [],
    layoutIssues: [],
    consoleErrors: [],
    httpErrors: []
  };

  // HTTP Status
  if (response.status() >= 400) {
    issues.httpErrors.push({
      type: 'page_error',
      status: response.status(),
      url: response.url()
    });
  }

  // Detect missing assets (404s) - improved to reduce false positives
  const failedRequests = await page.evaluate(() => {
    return window.performance
      .getEntriesByType('resource')
      .filter(r => {
        // Filter out resources that truly failed (both transfer and decoded size are 0)
        // But exclude cached resources (which also show 0 transfer size)
        const isFailed = r.transferSize === 0 && r.decodedBodySize === 0;
        const isCached = r.transferSize === 0 && r.decodedBodySize > 0;

        return isFailed && !isCached;
      })
      .map(r => {
        // Extract just the pathname for cleaner reporting
        try {
          const url = new URL(r.name);
          return {
            name: url.pathname, // Use pathname instead of full URL
            fullName: r.name,
            type: r.initiatorType,
            duration: r.duration
          };
        } catch (e) {
          // If URL parsing fails, return the original name
          return {
            name: r.name,
            type: r.initiatorType,
            duration: r.duration
          };
        }
      });
  });

  issues.missingAssets = failedRequests;

  // Check for CSS loading issues
  const cssIssues = await detectCssIssues(page);
  issues.cssIssues = cssIssues;

  // Check for font loading issues
  const fontIssues = await detectFontIssues(page);
  issues.fontIssues = fontIssues;

  // Check for layout issues
  const layoutIssues = await detectLayoutIssues(page);
  issues.layoutIssues = layoutIssues;

  // Collect console errors
  const consoleErrors = await page.evaluate(() => {
    return window.__consoleErrors || [];
  });
  issues.consoleErrors = consoleErrors;

  return issues;
}

/**
 * Detect CSS-related issues
 */
async function detectCssIssues(page) {
  return await page.evaluate(() => {
    const issues = [];

    // Check all stylesheets - improved to avoid false positives
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    const cssNotLoaded = [];

    stylesheets.forEach((link) => {
      // Try to access the sheet - may fail due to CORS but doesn't mean CSS didn't load
      try {
        // Check if the stylesheet is actually applied
        if (!link.sheet) {
          // Additional check: verify if the link element is properly connected
          const isConnected = link.isConnected;
          const hasHref = link.href && link.href.trim() !== '';

          // Only report as not loaded if it's clearly broken
          if (isConnected && hasHref && !link.disabled) {
            // Extract just the pathname from the full URL for cleaner reporting
            const url = new URL(link.href);
            cssNotLoaded.push({
              type: 'css_not_loaded',
              href: url.pathname, // Use pathname instead of full URL
              fullHref: link.href,
              element: link.outerHTML.slice(0, 200)
            });
          }
        }
      } catch (e) {
        // CORS or other access errors don't necessarily mean the CSS didn't load
        // The browser may block access to the sheet object but still apply the styles
        console.debug('CSS sheet access blocked (may be CORS):', link.href);
      }
    });

    // Only report CSS not loaded if we have actual evidence
    if (cssNotLoaded.length > 0) {
      // Additional validation: check if the page has any styling at all
      const bodyStyle = window.getComputedStyle(document.body);
      const hasCustomStyles =
        bodyStyle.fontFamily !== 'Times New Roman' && // Default browser font
        bodyStyle.fontSize !== '16px'; // Default browser size

      // Only report if there's clear evidence of missing styles
      if (!hasCustomStyles) {
        issues.push(...cssNotLoaded);
      }
    }

    // Check for unstyled elements (elements with default browser styles)
    const bodyComputedStyle = window.getComputedStyle(document.body);
    if (bodyComputedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ||
        bodyComputedStyle.backgroundColor === 'transparent') {
      // Check if there are any styled elements
      const styledElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
               style.backgroundColor !== 'transparent';
      });

      if (styledElements.length < 5) {
        issues.push({
          type: 'unstyled_page',
          message: 'Page appears to have minimal styling applied',
          styledElements: styledElements.length
        });
      }
    }

    // Check for inline styles fallback (might indicate CSS loading failure)
    const inlineStyleCount = document.querySelectorAll('[style]').length;
    const totalElements = document.querySelectorAll('*').length;
    if (inlineStyleCount / totalElements > 0.3 && totalElements > 20) {
      issues.push({
        type: 'excessive_inline_styles',
        message: 'High ratio of inline styles detected (possible CSS loading issue)',
        ratio: (inlineStyleCount / totalElements).toFixed(2)
      });
    }

    return issues;
  });
}

/**
 * Detect font loading issues
 */
async function detectFontIssues(page) {
  return await page.evaluate(() => {
    const issues = [];

    // Check if fonts are loaded
    if (document.fonts) {
      const fontsLoading = Array.from(document.fonts.values())
        .filter(font => font.status === 'loading' || font.status === 'unloaded');

      if (fontsLoading.length > 0) {
        issues.push({
          type: 'fonts_still_loading',
          count: fontsLoading.length,
          fonts: fontsLoading.map(f => f.family)
        });
      }
    }

    // Check for fallback fonts being used
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button');
    const fontFamilies = new Set();

    elements.forEach(el => {
      const computed = window.getComputedStyle(el);
      fontFamilies.add(computed.fontFamily);
    });

    // Check if system fonts are being used (possible custom font loading failure)
    const systemFonts = ['serif', 'sans-serif', 'monospace', 'Times New Roman', 'Arial', 'Courier'];
    const usingSystemFonts = Array.from(fontFamilies).filter(family => {
      return systemFonts.some(sysFont => family.toLowerCase().includes(sysFont.toLowerCase()));
    });

    if (usingSystemFonts.length === fontFamilies.size && fontFamilies.size > 0) {
      issues.push({
        type: 'system_fonts_only',
        message: 'Only system fonts detected (custom fonts may not have loaded)',
        fonts: Array.from(fontFamilies)
      });
    }

    return issues;
  });
}

/**
 * Detect layout and structural issues
 */
async function detectLayoutIssues(page) {
  return await page.evaluate(() => {
    const issues = [];

    // Check for elements overflowing viewport
    const viewportWidth = window.innerWidth;
    const overflowingElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > viewportWidth + 10; // 10px tolerance
    }).slice(0, 10); // Limit to first 10

    if (overflowingElements.length > 0) {
      issues.push({
        type: 'horizontal_overflow',
        count: overflowingElements.length,
        elements: overflowingElements.map(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          width: el.getBoundingClientRect().width
        }))
      });
    }

    // Check for broken images
    const images = Array.from(document.querySelectorAll('img'));
    const brokenImages = images.filter(img => !img.complete || img.naturalHeight === 0);

    if (brokenImages.length > 0) {
      issues.push({
        type: 'broken_images',
        count: brokenImages.length,
        images: brokenImages.map(img => ({
          src: img.src,
          alt: img.alt
        })).slice(0, 10)
      });
    }

    // Check for invisible elements (zero dimensions)
    const invisibleElements = Array.from(document.querySelectorAll('img, div, section, article, main')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width === 0 || rect.height === 0;
    }).filter(el => {
      const computed = window.getComputedStyle(el);
      return computed.display !== 'none' && computed.visibility !== 'hidden';
    }).slice(0, 10);

    if (invisibleElements.length > 0) {
      issues.push({
        type: 'zero_dimension_elements',
        count: invisibleElements.length,
        elements: invisibleElements.map(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id
        }))
      });
    }

    // Check for missing critical elements
    const criticalElements = {
      title: document.querySelector('title'),
      h1: document.querySelector('h1'),
      main: document.querySelector('main, [role="main"]')
    };

    Object.entries(criticalElements).forEach(([name, element]) => {
      if (!element) {
        issues.push({
          type: 'missing_element',
          element: name,
          message: `Missing critical element: <${name}>`
        });
      }
    });

    return issues;
  });
}

/**
 * Setup console error capture
 * Call this before navigation
 */
export async function setupConsoleCapture(page) {
  await page.evaluateOnNewDocument(() => {
    window.__consoleErrors = [];
    const originalError = console.error;
    console.error = (...args) => {
      window.__consoleErrors.push({
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date().toISOString()
      });
      originalError.apply(console, args);
    };
  });

  // Also listen to page errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
}