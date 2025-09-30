/**
 * FixGenerator - Generates fixes for detected issues
 */

import path from 'path';
import { logger } from '../utils/logger.js';

export class FixGenerator {
  constructor(config) {
    this.config = config;
  }

  async generateFixes(issues, viewportData) {
    const fixes = [];

    for (const issue of issues) {
      const fix = await this.generateFix(issue, viewportData);
      if (fix) {
        fixes.push(fix);
      }
    }

    logger.debug(`Generated ${fixes.length} fixes`);
    return fixes;
  }

  async generateFix(issue, viewportData) {
    const fixGenerators = {
      'layout': this.generateLayoutFix.bind(this),
      'styling': this.generateStylingFix.bind(this),
      'performance': this.generatePerformanceFix.bind(this),
      'accessibility': this.generateAccessibilityFix.bind(this),
      'javascript': this.generateJavaScriptFix.bind(this),
      'network': this.generateNetworkFix.bind(this)
    };

    const generator = fixGenerators[issue.category];
    if (generator) {
      return await generator(issue, viewportData);
    }

    return null;
  }

  async generateLayoutFix(issue, viewportData) {
    const fixTemplates = {
      'broken-image': {
        description: `Fix broken image: ${issue.selector}`,
        type: 'html',
        confidence: 0.7,
        filePath: this.findRelevantFile(issue, 'astro'),
        patch: {
          search: issue.details.src,
          replace: '/images/placeholder.jpg',
          comment: 'Replace broken image with placeholder'
        },
        instructions: [
          '1. Check if image file exists in public/images/',
          '2. Verify correct path in src attribute',
          '3. Add alt text if missing',
          '4. Consider adding loading="lazy"'
        ]
      },
      'missing-alt': {
        description: `Add alt text to image: ${issue.selector}`,
        type: 'html',
        confidence: 0.9,
        filePath: this.findRelevantFile(issue, 'astro'),
        patch: {
          search: `<img`,
          replace: `<img alt="Descriptive alt text"`,
          comment: 'Add alt attribute for accessibility'
        },
        instructions: [
          '1. Add descriptive alt text based on image context',
          '2. If decorative, use alt=""',
          '3. Keep alt text concise and meaningful'
        ]
      },
      'horizontal-overflow': {
        description: `Fix horizontal overflow: ${issue.selector}`,
        type: 'css',
        confidence: 0.8,
        filePath: 'src/styles/fixes.css',
        patch: {
          newContent: `
/* Fix horizontal overflow for ${issue.selector} */
${issue.selector} {
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

@media (max-width: ${viewportData.viewport.width}px) {
  ${issue.selector} {
    width: 100% !important;
  }
}
`
        },
        instructions: [
          '1. Apply max-width: 100% to prevent overflow',
          '2. Ensure box-sizing: border-box is set',
          '3. Test on multiple viewport sizes',
          '4. Check for nested elements causing overflow'
        ]
      },
      'zero-dimensions': {
        description: `Fix element with zero dimensions: ${issue.selector}`,
        type: 'css',
        confidence: 0.6,
        filePath: 'src/styles/fixes.css',
        patch: {
          newContent: `
/* Fix zero dimensions for ${issue.selector} */
${issue.selector} {
  min-height: 1px;
  min-width: 1px;
}
`
        },
        instructions: [
          '1. Check if element should have content',
          '2. Verify display property is not none',
          '3. Check for missing content or children',
          '4. Review parent container constraints'
        ]
      }
    };

    const template = fixTemplates[issue.type];
    if (template) {
      return {
        id: `fix-${issue.id}`,
        issueId: issue.id,
        ...template
      };
    }

    return null;
  }

  async generateStylingFix(issue, viewportData) {
    const fixTemplates = {
      'low-contrast': {
        description: `Improve contrast for: ${issue.selector}`,
        type: 'css',
        confidence: 0.85,
        filePath: 'src/styles/fixes.css',
        patch: {
          newContent: `
/* Improve contrast for ${issue.selector} */
${issue.selector} {
  /* Current: ${issue.details.color} on ${issue.details.backgroundColor} */
  color: #000000; /* Adjust to meet WCAG AA standards */
  /* Or adjust background-color if needed */
}
`
        },
        instructions: [
          '1. Aim for contrast ratio of at least 4.5:1 (WCAG AA)',
          '2. Use color contrast checker tool',
          '3. Test readability on different displays',
          '4. Maintain brand color consistency where possible'
        ]
      },
      'font-fallback': {
        description: `Fix font loading for: ${issue.selector}`,
        type: 'css',
        confidence: 0.7,
        filePath: 'src/styles/fonts.css',
        patch: {
          newContent: `
/* Ensure proper font loading for ${issue.selector} */
${issue.selector} {
  font-family: 'PreferredFont', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-display: swap; /* Prevent invisible text during font loading */
}
`
        },
        instructions: [
          '1. Verify font files are loaded correctly',
          '2. Add @font-face declaration if missing',
          '3. Include proper fallback fonts',
          '4. Use font-display: swap for better UX'
        ]
      }
    };

    const template = fixTemplates[issue.type];
    if (template) {
      return {
        id: `fix-${issue.id}`,
        issueId: issue.id,
        ...template
      };
    }

    return null;
  }

  async generatePerformanceFix(issue, viewportData) {
    const fixTemplates = {
      'slow-load': {
        description: 'Optimize page load performance',
        type: 'component',
        confidence: 0.6,
        filePath: 'src/layouts/BaseLayout.astro',
        patch: {
          newContent: `
<!-- Add preload hints for critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- Add async/defer to non-critical scripts -->
<script src="/js/analytics.js" defer></script>
`
        },
        instructions: [
          '1. Identify and preload critical resources',
          '2. Defer non-critical JavaScript',
          '3. Optimize image loading with lazy loading',
          '4. Consider code splitting for large bundles',
          '5. Enable compression (gzip/brotli)',
          '6. Optimize CSS delivery'
        ]
      },
      'high-resource-count': {
        description: 'Reduce number of HTTP requests',
        type: 'component',
        confidence: 0.5,
        filePath: 'astro.config.mjs',
        patch: {
          newContent: `
// Consider bundling and minification
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',
    assets: {
      // Bundle smaller assets
    }
  }
});
`
        },
        instructions: [
          '1. Combine CSS files where possible',
          '2. Use sprite sheets for small images',
          '3. Inline critical CSS',
          '4. Enable HTTP/2 server push if available',
          '5. Review and remove unused dependencies'
        ]
      }
    };

    const template = fixTemplates[issue.type];
    if (template) {
      return {
        id: `fix-${issue.id}`,
        issueId: issue.id,
        ...template
      };
    }

    return null;
  }

  async generateAccessibilityFix(issue, viewportData) {
    const fixTemplates = {
      'missing-label': {
        description: `Add accessible label to: ${issue.selector}`,
        type: 'html',
        confidence: 0.9,
        filePath: this.findRelevantFile(issue, 'astro'),
        patch: {
          search: `<${issue.element}`,
          replace: `<${issue.element} aria-label="Descriptive label"`,
          comment: 'Add ARIA label for screen readers'
        },
        instructions: [
          '1. Add aria-label with clear description',
          '2. Or use aria-labelledby if label exists elsewhere',
          '3. Ensure label describes the purpose',
          '4. Test with screen reader'
        ]
      },
      'missing-form-label': {
        description: `Add label to form input: ${issue.selector}`,
        type: 'html',
        confidence: 0.95,
        filePath: this.findRelevantFile(issue, 'astro'),
        patch: {
          newContent: `
<label for="input-id">Label Text</label>
<input id="input-id" type="text" name="input-name">
`
        },
        instructions: [
          '1. Add <label> element with for attribute',
          '2. Ensure input has matching id attribute',
          '3. Label text should be clear and descriptive',
          '4. Position label appropriately for layout'
        ]
      },
      'heading-hierarchy': {
        description: `Fix heading hierarchy: ${issue.selector}`,
        type: 'html',
        confidence: 0.8,
        filePath: this.findRelevantFile(issue, 'astro'),
        patch: {
          comment: 'Adjust heading level to maintain hierarchy'
        },
        instructions: [
          '1. Ensure headings follow sequential order (h1, h2, h3...)',
          '2. Do not skip heading levels',
          '3. Use CSS for styling, not higher heading levels',
          '4. One h1 per page typically',
          '5. Headings should outline page structure'
        ]
      }
    };

    const template = fixTemplates[issue.type];
    if (template) {
      return {
        id: `fix-${issue.id}`,
        issueId: issue.id,
        ...template
      };
    }

    return null;
  }

  async generateJavaScriptFix(issue, viewportData) {
    return {
      id: `fix-${issue.id}`,
      issueId: issue.id,
      description: `Fix JavaScript error: ${issue.message.substring(0, 50)}...`,
      type: 'javascript',
      confidence: 0.5,
      filePath: 'Manual review required',
      instructions: [
        '1. Check browser console for full error details',
        '2. Review relevant JavaScript files',
        '3. Verify all dependencies are loaded',
        '4. Check for syntax errors or undefined variables',
        '5. Test in multiple browsers',
        `6. Error message: ${issue.message}`
      ]
    };
  }

  async generateNetworkFix(issue, viewportData) {
    return {
      id: `fix-${issue.id}`,
      issueId: issue.id,
      description: `Fix failed resource: ${issue.details.url}`,
      type: 'network',
      confidence: 0.6,
      filePath: 'Manual review required',
      instructions: [
        '1. Verify resource URL is correct',
        '2. Check if resource exists at specified path',
        '3. Review CORS settings if cross-origin',
        '4. Check server logs for errors',
        '5. Verify SSL/TLS certificates if HTTPS',
        `6. Failed URL: ${issue.details.url}`,
        `7. Error: ${issue.details.failure}`
      ]
    };
  }

  findRelevantFile(issue, extension = 'astro') {
    // Try to determine which file the issue is in based on selector
    // This is a simplified version - production would need more sophisticated logic

    if (issue.selector) {
      // Common component patterns
      if (issue.selector.includes('nav') || issue.selector.includes('header')) {
        return `src/components/navigation/Header.${extension}`;
      }
      if (issue.selector.includes('footer')) {
        return `src/components/Footer.${extension}`;
      }
      if (issue.selector.includes('hero')) {
        return `src/components/sections/Hero.${extension}`;
      }
      if (issue.selector.includes('testimonial')) {
        return `src/components/sections/TestimonialsGrid.${extension}`;
      }
      if (issue.selector.includes('team')) {
        return `src/components/sections/TeamGrid.${extension}`;
      }
    }

    return `src/pages/index.${extension}`;
  }
}
