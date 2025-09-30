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

      // Check images
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach((img, idx) => {
        if (!img.src || img.src === '') {
          issues.push({
            type: 'missing-src',
            element: 'img',
            selector: img.id ? `#${img.id}` : `img:nth-of-type(${idx + 1})`,
            message: 'Image missing src attribute'
          });
        }
        if (!img.alt) {
          issues.push({
            type: 'missing-alt',
            element: 'img',
            selector: img.id ? `#${img.id}` : `img:nth-of-type(${idx + 1})`,
            message: 'Image missing alt attribute'
          });
        }
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          issues.push({
            type: 'broken-image',
            element: 'img',
            selector: img.id ? `#${img.id}` : `img:nth-of-type(${idx + 1})`,
            src: img.src,
            message: 'Image failed to load'
          });
        }
      });

      // Check links
      const links = Array.from(document.querySelectorAll('a'));
      links.forEach((link, idx) => {
        if (!link.href || link.href === '' || link.href === window.location.href + '#') {
          issues.push({
            type: 'empty-link',
            element: 'a',
            selector: link.id ? `#${link.id}` : `a:nth-of-type(${idx + 1})`,
            message: 'Link has no href or empty href'
          });
        }
      });

      // Check for elements with zero dimensions
      const allElements = Array.from(document.querySelectorAll('*'));
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        if (rect.width === 0 && rect.height === 0 && style.display !== 'none') {
          issues.push({
            type: 'zero-dimensions',
            element: el.tagName.toLowerCase(),
            selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase(),
            message: 'Element has zero dimensions but is not hidden'
          });
        }

        // Check for overflow issues
        if (rect.width > window.innerWidth) {
          issues.push({
            type: 'horizontal-overflow',
            element: el.tagName.toLowerCase(),
            selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase(),
            width: rect.width,
            message: 'Element wider than viewport'
          });
        }
      });

      return issues;
    });

    return elements;
  }

  async collectCssIssues() {
    const cssIssues = await this.page.evaluate(() => {
      const issues = [];

      // Check for missing fonts
      const elements = Array.from(document.querySelectorAll('*'));
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;

        // Common system font fallback indicators
        if (fontFamily && (fontFamily.includes('serif') || fontFamily.includes('sans-serif')) &&
            !fontFamily.includes(',')) {
          issues.push({
            type: 'font-fallback',
            selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase(),
            fontFamily: fontFamily,
            message: 'Element may be using fallback font'
          });
        }

        // Check contrast
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // Simple contrast check (would need proper calculation in production)
          const colorValues = color.match(/\d+/g);
          const bgValues = backgroundColor.match(/\d+/g);
          if (colorValues && bgValues) {
            const colorBrightness = (parseInt(colorValues[0]) + parseInt(colorValues[1]) + parseInt(colorValues[2])) / 3;
            const bgBrightness = (parseInt(bgValues[0]) + parseInt(bgValues[1]) + parseInt(bgValues[2])) / 3;
            const diff = Math.abs(colorBrightness - bgBrightness);

            if (diff < 125) {
              issues.push({
                type: 'low-contrast',
                selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase(),
                color: color,
                backgroundColor: backgroundColor,
                message: 'Insufficient color contrast'
              });
            }
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
