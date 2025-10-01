/**
 * VisualInspector - Core visual inspection engine
 * Captures visual state and metrics using Playwright
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export class VisualInspector {
  constructor(page, viewport, config) {
    this.page = page;
    this.viewport = viewport;
    this.config = config;
  }

  async inspect(url) {
    logger.info(`Loading ${url}...`);

    const data = {
      viewport: this.viewport,
      url: url,
      timestamp: new Date().toISOString(),
      screenshot: null,
      metrics: {},
      elements: [],
      css: [],
      performance: {},
      accessibility: {},
      console: [],
      network: []
    };

    // Capture console messages
    this.page.on('console', msg => {
      data.console.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Capture network errors
    this.page.on('requestfailed', request => {
      data.network.push({
        url: request.url(),
        failure: request.failure().errorText
      });
    });

    try {
      // Navigate to page
      const response = await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response.ok()) {
        logger.warn(`Page returned status ${response.status()}`);
      }

      // Wait for page to be fully rendered
      await this.page.waitForLoadState('load');
      await this.page.waitForTimeout(2000);

      // Capture screenshot
      const screenshotPath = await this.captureScreenshot();
      data.screenshot = screenshotPath;

      // Collect metrics
      data.metrics = await this.collectMetrics();
      data.performance = await this.collectPerformanceMetrics();
      data.elements = await this.collectElementData();
      data.css = await this.collectCssIssues();
      data.accessibility = await this.collectAccessibilityData();

      logger.success(`Inspection complete for ${this.viewport.name}`);
      return data;

    } catch (error) {
      logger.error(`Inspection failed for ${this.viewport.name}:`, error);
      throw error;
    }
  }

  async captureScreenshot() {
    const timestamp = Date.now();
    const filename = `${this.viewport.name}-${timestamp}.png`;
    const filepath = path.join(this.config.paths.screenshots, filename);

    await this.page.screenshot({
      path: filepath,
      fullPage: true
    });

    logger.debug(`Screenshot saved: ${filename}`);
    return filepath;
  }

  async collectMetrics() {
    const metrics = await this.page.evaluate(() => {
      const computeLayoutShift = () => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        return clsValue;
      };

      return {
        documentHeight: document.documentElement.scrollHeight,
        documentWidth: document.documentElement.scrollWidth,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        timestamp: Date.now()
      };
    });

    return metrics;
  }

  async collectPerformanceMetrics() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        transferSize: navigation?.transferSize,
        resourceCount: performance.getEntriesByType('resource').length
      };
    });

    return performanceMetrics;
  }

  async collectElementData() {
    const elements = await this.page.evaluate(() => {
      const issues = [];

      // Helper to get element details
      const getElementDetails = (el, idx) => ({
        id: el.id || null,
        class: el.className || null,
        tag: el.tagName.toLowerCase(),
        selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : `${el.tagName.toLowerCase()}:nth-of-type(${idx + 1})`,
        position: {
          x: el.getBoundingClientRect().left,
          y: el.getBoundingClientRect().top,
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height
        },
        computedStyle: {
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
          opacity: window.getComputedStyle(el).opacity
        }
      });

      // Check images
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach((img, idx) => {
        const details = getElementDetails(img, idx);

        if (!img.src || img.src === '') {
          issues.push({
            type: 'missing-src',
            element: 'img',
            ...details,
            message: 'Image missing src attribute',
            severity: 'high'
          });
        }
        if (!img.alt) {
          issues.push({
            type: 'missing-alt',
            element: 'img',
            ...details,
            message: 'Image missing alt attribute (accessibility issue)',
            severity: 'medium',
            wcagViolation: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
          });
        }
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          issues.push({
            type: 'broken-image',
            element: 'img',
            ...details,
            src: img.src,
            actualSize: { width: img.naturalWidth, height: img.naturalHeight },
            expectedSize: { width: img.width, height: img.height },
            message: 'Image failed to load - check URL and file existence',
            severity: 'high',
            debugInfo: {
              currentSrc: img.currentSrc,
              complete: img.complete,
              naturalDimensions: `${img.naturalWidth}x${img.naturalHeight}`
            }
          });
        }

        // Check for oversized images
        if (img.naturalWidth > img.width * 2 || img.naturalHeight > img.height * 2) {
          issues.push({
            type: 'oversized-image',
            element: 'img',
            ...details,
            message: 'Image file is larger than display size (performance issue)',
            severity: 'low',
            naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
            displaySize: { width: img.width, height: img.height },
            recommendation: `Resize image to ${Math.ceil(img.width * 2)}x${Math.ceil(img.height * 2)} for optimal performance`
          });
        }
      });

      // Check links
      const links = Array.from(document.querySelectorAll('a'));
      links.forEach((link, idx) => {
        const details = getElementDetails(link, idx);

        if (!link.href || link.href === '' || link.href === window.location.href + '#') {
          issues.push({
            type: 'empty-link',
            element: 'a',
            ...details,
            text: link.textContent.trim().substring(0, 50),
            message: 'Link has no href or empty href (broken navigation)',
            severity: 'medium'
          });
        }

        // Check for missing text in links
        if (link.textContent.trim() === '' && !link.querySelector('img')) {
          issues.push({
            type: 'empty-link-text',
            element: 'a',
            ...details,
            message: 'Link has no visible text or image (accessibility issue)',
            severity: 'medium',
            wcagViolation: 'WCAG 2.1 Level A - 2.4.4 Link Purpose'
          });
        }
      });

      // Check for elements with zero dimensions
      const allElements = Array.from(document.querySelectorAll('body *'));
      allElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const details = getElementDetails(el, idx);

        if (rect.width === 0 && rect.height === 0 && style.display !== 'none' && style.visibility !== 'hidden') {
          issues.push({
            type: 'zero-dimensions',
            element: el.tagName.toLowerCase(),
            ...details,
            message: 'Element has zero dimensions but is not hidden (potential layout issue)',
            severity: 'low',
            parentInfo: {
              tag: el.parentElement?.tagName.toLowerCase(),
              id: el.parentElement?.id,
              class: el.parentElement?.className
            }
          });
        }

        // Check for overflow issues
        if (rect.width > window.innerWidth) {
          const overflowAmount = rect.width - window.innerWidth;
          issues.push({
            type: 'horizontal-overflow',
            element: el.tagName.toLowerCase(),
            ...details,
            viewportWidth: window.innerWidth,
            elementWidth: rect.width,
            overflowAmount: overflowAmount,
            message: `Element ${overflowAmount}px wider than viewport (causes horizontal scroll)`,
            severity: 'high',
            recommendation: 'Add max-width: 100% and overflow-x: hidden'
          });
        }

        // Check for invisible text (color same as background)
        if (el.textContent.trim() !== '') {
          const bgColor = style.backgroundColor;
          const textColor = style.color;
          if (bgColor && textColor && bgColor === textColor) {
            issues.push({
              type: 'invisible-text',
              element: el.tagName.toLowerCase(),
              ...details,
              message: 'Text color matches background (text is invisible)',
              severity: 'high',
              colors: { background: bgColor, text: textColor }
            });
          }
        }
      });

      return issues;
    });

    return elements;
  }

  async collectCssIssues() {
    const cssIssues = await this.page.evaluate(() => {
      const issues = [];

      // Helper for calculating luminance (WCAG standard)
      const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      // Helper for contrast ratio (WCAG standard)
      const getContrastRatio = (color1, color2) => {
        const lum1 = getLuminance(...color1);
        const lum2 = getLuminance(...color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
      };

      // Check text elements for styling issues
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, li, td, th, label'));
      textElements.forEach((el, idx) => {
        if (el.textContent.trim() === '') return;

        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        const color = style.color;
        const backgroundColor = style.backgroundColor;

        const selector = el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : `${el.tagName.toLowerCase()}:nth-of-type(${idx + 1})`;

        // Check font loading
        if (fontFamily && (fontFamily.includes('serif') || fontFamily.includes('sans-serif')) &&
            !fontFamily.includes(',')) {
          issues.push({
            type: 'font-fallback',
            selector,
            element: el.tagName.toLowerCase(),
            fontFamily,
            text: el.textContent.trim().substring(0, 30),
            message: 'Element using fallback font - custom font may not have loaded',
            severity: 'medium',
            recommendation: 'Check @font-face declarations and font file loading'
          });
        }

        // Check font size
        if (fontSize < 12) {
          issues.push({
            type: 'small-font-size',
            selector,
            element: el.tagName.toLowerCase(),
            fontSize: `${fontSize}px`,
            message: 'Font size too small - may be hard to read',
            severity: 'medium',
            wcagViolation: 'WCAG 2.1 Level AAA - 1.4.8 Visual Presentation',
            recommendation: 'Use minimum 12px font size for body text'
          });
        }

        // Check contrast ratio (WCAG compliant)
        const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bgMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

        if (colorMatch && bgMatch) {
          const colorRGB = colorMatch.slice(1, 4).map(Number);
          const bgRGB = bgMatch.slice(1, 4).map(Number);
          const contrastRatio = getContrastRatio(colorRGB, bgRGB);

          const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
          const minRatio = isLargeText ? 3 : 4.5; // WCAG AA standards

          if (contrastRatio < minRatio) {
            issues.push({
              type: 'low-contrast',
              selector,
              element: el.tagName.toLowerCase(),
              color,
              backgroundColor,
              contrastRatio: contrastRatio.toFixed(2),
              requiredRatio: minRatio,
              isLargeText,
              text: el.textContent.trim().substring(0, 30),
              message: `Insufficient color contrast (${contrastRatio.toFixed(2)}:1, requires ${minRatio}:1)`,
              severity: 'high',
              wcagViolation: 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
              recommendation: `Increase contrast ratio to at least ${minRatio}:1`
            });
          }
        }

        // Check for important visual properties
        if (style.display === 'none' || style.visibility === 'hidden') {
          if (el.textContent.trim().length > 10) {
            issues.push({
              type: 'hidden-content',
              selector,
              element: el.tagName.toLowerCase(),
              text: el.textContent.trim().substring(0, 50),
              message: 'Element with content is hidden',
              severity: 'low',
              recommendation: 'Verify if content should be visible'
            });
          }
        }
      });

      return issues;
    });

    return cssIssues;
  }

  async collectAccessibilityData() {
    const a11yIssues = await this.page.evaluate(() => {
      const issues = [];

      // Check for missing ARIA labels
      const interactiveElements = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
      interactiveElements.forEach((el, idx) => {
        if (!el.getAttribute('aria-label') && !el.textContent.trim() && el.tagName !== 'INPUT') {
          issues.push({
            type: 'missing-label',
            element: el.tagName.toLowerCase(),
            selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}:nth-of-type(${idx + 1})`,
            message: 'Interactive element missing accessible label'
          });
        }
      });

      // Check form inputs
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      inputs.forEach((input, idx) => {
        if (!input.labels || input.labels.length === 0) {
          issues.push({
            type: 'missing-form-label',
            element: input.tagName.toLowerCase(),
            selector: input.id ? `#${input.id}` : `${input.tagName.toLowerCase()}:nth-of-type(${idx + 1})`,
            message: 'Form input missing associated label'
          });
        }
      });

      // Check heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let lastLevel = 0;
      headings.forEach((heading, idx) => {
        const level = parseInt(heading.tagName[1]);
        if (level - lastLevel > 1) {
          issues.push({
            type: 'heading-hierarchy',
            element: heading.tagName.toLowerCase(),
            selector: heading.id ? `#${heading.id}` : `${heading.tagName.toLowerCase()}:nth-of-type(${idx + 1})`,
            message: `Heading skips from h${lastLevel} to h${level}`
          });
        }
        lastLevel = level;
      });

      return issues;
    });

    return a11yIssues;
  }
}
