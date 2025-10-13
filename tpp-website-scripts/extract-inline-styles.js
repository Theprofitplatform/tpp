#!/usr/bin/env node

/**
 * Extract inline styles from HTML files
 * Converts style attributes to external CSS classes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🎨 Extracting inline styles...\n');

const extractedStyles = new Map();
let styleCounter = 0;

// Process HTML files
const htmlFiles = glob.sync('*.html', { cwd: rootDir, ignore: ['node_modules/**', 'dist/**'] });

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);

  let extracted = 0;

  $('[style]').each((i, elem) => {
    const $elem = $(elem);
    const inlineStyle = $elem.attr('style');

    if (!inlineStyle) return;

    // Generate unique class name
    const className = `extracted-style-${++styleCounter}`;

    // Store the style
    extractedStyles.set(className, inlineStyle);

    // Add class to element
    const existingClasses = $elem.attr('class') || '';
    $elem.attr('class', `${existingClasses} ${className}`.trim());

    // Remove inline style
    $elem.removeAttr('style');

    extracted++;
  });

  if (extracted > 0) {
    // Save modified HTML
    fs.writeFileSync(filePath, $.html());
    console.log(`  ✓ ${file}: Extracted ${extracted} inline styles`);
  }
}

// Create CSS file with extracted styles
if (extractedStyles.size > 0) {
  const cssPath = path.join(rootDir, 'css', 'extracted-styles.css');
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });

  let cssContent = '/* Extracted inline styles */\n\n';
  for (const [className, style] of extractedStyles) {
    cssContent += `.${className} { ${style} }\n`;
  }

  fs.writeFileSync(cssPath, cssContent);
  console.log(`\n✅ Created ${cssPath} with ${extractedStyles.size} styles`);
} else {
  console.log('\n✅ No inline styles found');
}
