/**
 * Fix Generator Module
 *
 * Analyzes visual issues and generates actionable fixes
 * for CSS, HTML, and layout problems.
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

export class FixGenerator {
  constructor(config) {
    this.config = config;
    this.webRoot = config.paths.webRoot;
  }

  /**
   * Generate fixes for all detected issues
   */
  async generateFixes(result) {
    const fixes = [];

    for (const viewportResult of result.viewportResults) {
      if (!viewportResult.issues) continue;

      const issues = viewportResult.issues;
      const viewport = viewportResult.viewport;

      // CSS Issues
      if (issues.cssIssues && issues.cssIssues.length > 0) {
        fixes.push(...this.generateCssFixes(issues.cssIssues, viewport));
      }

      // Font Issues
      if (issues.fontIssues && issues.fontIssues.length > 0) {
        fixes.push(...this.generateFontFixes(issues.fontIssues, viewport));
      }

      // Layout Issues
      if (issues.layoutIssues && issues.layoutIssues.length > 0) {
        fixes.push(...this.generateLayoutFixes(issues.layoutIssues, viewport));
      }

      // Missing Assets
      if (issues.missingAssets && issues.missingAssets.length > 0) {
        fixes.push(...this.generateAssetFixes(issues.missingAssets, viewport));
      }
    }

    // Deduplicate and prioritize
    return this.prioritizeFixes(fixes);
  }

  /**
   * Generate CSS-related fixes
   */
  generateCssFixes(cssIssues, viewport) {
    const fixes = [];

    for (const issue of cssIssues) {
      switch (issue.type) {
        case 'css_not_loaded':
          fixes.push({
            type: 'css',
            issue: 'css_not_loaded',
            description: `Fix CSS loading failure: ${issue.href}`,
            priority: 'critical',
            confidence: 85,
            viewport,
            action: 'check_css_path',
            data: {
              href: issue.href,
              suggestion: 'Verify CSS file path and ensure file exists'
            },
            code: this.generateCssLoadFix(issue)
          });
          break;

        case 'unstyled_page':
          fixes.push({
            type: 'css',
            issue: 'unstyled_page',
            description: 'Page appears unstyled - add fallback styles',
            priority: 'high',
            confidence: 70,
            viewport,
            action: 'add_fallback_styles',
            code: this.generateFallbackStyles()
          });
          break;

        case 'excessive_inline_styles':
          fixes.push({
            type: 'css',
            issue: 'excessive_inline_styles',
            description: 'Extract inline styles to CSS file',
            priority: 'medium',
            confidence: 60,
            viewport,
            action: 'extract_inline_styles',
            data: { ratio: issue.ratio }
          });
          break;
      }
    }

    return fixes;
  }

  /**
   * Generate font-related fixes
   */
  generateFontFixes(fontIssues, viewport) {
    const fixes = [];

    for (const issue of fontIssues) {
      switch (issue.type) {
        case 'fonts_still_loading':
          fixes.push({
            type: 'font',
            issue: 'fonts_still_loading',
            description: `Add font-display: swap for ${issue.count} font(s)`,
            priority: 'medium',
            confidence: 80,
            viewport,
            action: 'add_font_display',
            data: { fonts: issue.fonts },
            code: this.generateFontDisplayFix(issue.fonts)
          });
          break;

        case 'system_fonts_only':
          fixes.push({
            type: 'font',
            issue: 'system_fonts_only',
            description: 'Custom fonts not loading - check font declarations',
            priority: 'medium',
            confidence: 65,
            viewport,
            action: 'check_font_loading',
            data: { systemFonts: issue.fonts }
          });
          break;
      }
    }

    return fixes;
  }

  /**
   * Generate layout-related fixes
   */
  generateLayoutFixes(layoutIssues, viewport) {
    const fixes = [];

    for (const issue of layoutIssues) {
      switch (issue.type) {
        case 'horizontal_overflow':
          fixes.push({
            type: 'layout',
            issue: 'horizontal_overflow',
            description: `Fix horizontal overflow on ${issue.count} element(s)`,
            priority: 'high',
            confidence: 75,
            viewport,
            action: 'fix_overflow',
            data: { elements: issue.elements },
            code: this.generateOverflowFix(issue.elements, viewport)
          });
          break;

        case 'broken_images':
          fixes.push({
            type: 'layout',
            issue: 'broken_images',
            description: `Fix ${issue.count} broken image(s)`,
            priority: 'high',
            confidence: 90,
            viewport,
            action: 'fix_images',
            data: { images: issue.images }
          });
          break;

        case 'zero_dimension_elements':
          fixes.push({
            type: 'layout',
            issue: 'zero_dimension_elements',
            description: `Fix ${issue.count} invisible element(s)`,
            priority: 'medium',
            confidence: 60,
            viewport,
            action: 'fix_dimensions',
            data: { elements: issue.elements }
          });
          break;

        case 'missing_element':
          fixes.push({
            type: 'html',
            issue: 'missing_element',
            description: `Add missing <${issue.element}> element`,
            priority: 'high',
            confidence: 85,
            viewport,
            action: 'add_element',
            data: { element: issue.element }
          });
          break;
      }
    }

    return fixes;
  }

  /**
   * Generate asset-related fixes
   */
  generateAssetFixes(missingAssets, viewport) {
    const fixes = [];

    const cssAssets = missingAssets.filter(a => a.type === 'link' || a.name.endsWith('.css'));
    const jsAssets = missingAssets.filter(a => a.type === 'script' || a.name.endsWith('.js'));
    const imageAssets = missingAssets.filter(a => a.type === 'img' || /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(a.name));

    if (cssAssets.length > 0) {
      fixes.push({
        type: 'asset',
        issue: 'missing_css',
        description: `Fix ${cssAssets.length} missing CSS file(s)`,
        priority: 'critical',
        confidence: 95,
        viewport,
        action: 'fix_css_paths',
        data: { assets: cssAssets }
      });
    }

    if (jsAssets.length > 0) {
      fixes.push({
        type: 'asset',
        issue: 'missing_js',
        description: `Fix ${jsAssets.length} missing JS file(s)`,
        priority: 'high',
        confidence: 95,
        viewport,
        action: 'fix_js_paths',
        data: { assets: jsAssets }
      });
    }

    if (imageAssets.length > 0) {
      fixes.push({
        type: 'asset',
        issue: 'missing_images',
        description: `Fix ${imageAssets.length} missing image(s)`,
        priority: 'medium',
        confidence: 90,
        viewport,
        action: 'fix_image_paths',
        data: { assets: imageAssets }
      });
    }

    return fixes;
  }

  /**
   * Prioritize fixes by impact and confidence
   */
  prioritizeFixes(fixes) {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return fixes.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Apply a fix to the actual files
   */
  async applyFix(fix) {
    console.log(chalk.gray(`    Applying fix: ${fix.action}`));

    switch (fix.action) {
      case 'add_fallback_styles':
        await this.applyFallbackStyles(fix);
        break;

      case 'add_font_display':
        await this.applyFontDisplay(fix);
        break;

      case 'fix_overflow':
        await this.applyOverflowFix(fix);
        break;

      default:
        console.log(chalk.yellow(`    ⚠️  Manual intervention required for: ${fix.action}`));
    }
  }

  /**
   * Generate CSS load fix code
   */
  generateCssLoadFix(issue) {
    return {
      description: 'Check if CSS file exists and path is correct',
      manual: true,
      steps: [
        `Verify file exists: ${issue.href}`,
        'Check for typos in href attribute',
        'Ensure file permissions are correct',
        'Verify web server is serving the file'
      ]
    };
  }

  /**
   * Generate fallback styles
   */
  generateFallbackStyles() {
    return {
      file: 'fallback-styles.css',
      content: `/* Fallback styles - Generated by Visual Agent */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 20px;
  background: #fff;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

p {
  margin-bottom: 1em;
}

img {
  max-width: 100%;
  height: auto;
}

* {
  box-sizing: border-box;
}
`
    };
  }

  /**
   * Generate font-display fix
   */
  generateFontDisplayFix(fonts) {
    return {
      description: 'Add font-display property to prevent invisible text',
      cssRule: fonts.map(font => `
@font-face {
  font-family: '${font}';
  font-display: swap;
  /* existing src declarations */
}`).join('\n')
    };
  }

  /**
   * Generate overflow fix
   */
  generateOverflowFix(elements, viewport) {
    const selectors = elements.map(el => {
      if (el.id) return `#${el.id}`;
      if (el.class) return `.${el.class.split(' ')[0]}`;
      return el.tag.toLowerCase();
    });

    return {
      file: `overflow-fix-${viewport}.css`,
      content: `/* Overflow fix for ${viewport} - Generated by Visual Agent */
${selectors.map(sel => `${sel} {
  max-width: 100%;
  overflow-x: hidden;
}`).join('\n\n')}

/* Responsive container */
@media (max-width: ${viewport === 'mobile' ? '768px' : '1920px'}) {
  * {
    max-width: 100%;
  }

  img {
    width: 100%;
    height: auto;
  }
}
`
    };
  }

  /**
   * Apply fallback styles to project
   */
  async applyFallbackStyles(fix) {
    const cssPath = path.join(this.webRoot, 'css', 'fallback-styles.css');
    await fs.mkdir(path.dirname(cssPath), { recursive: true });
    await fs.writeFile(cssPath, fix.code.content);
    console.log(chalk.gray(`    Created: ${cssPath}`));
  }

  /**
   * Apply font-display fix
   */
  async applyFontDisplay(fix) {
    // This would require parsing CSS files and adding font-display
    // For now, just create a patch file
    const patchPath = path.join(this.config.paths.fixes, `font-display-${Date.now()}.css`);
    await fs.writeFile(patchPath, fix.code.cssRule);
    console.log(chalk.gray(`    Patch created: ${patchPath}`));
    console.log(chalk.yellow(`    Manual: Add font-display to your @font-face rules`));
  }

  /**
   * Apply overflow fix
   */
  async applyOverflowFix(fix) {
    const cssPath = path.join(this.config.paths.fixes, fix.code.file);
    await fs.mkdir(path.dirname(cssPath), { recursive: true });
    await fs.writeFile(cssPath, fix.code.content);
    console.log(chalk.gray(`    Created: ${cssPath}`));
    console.log(chalk.yellow(`    Manual: Include this CSS file in your HTML`));
  }
}