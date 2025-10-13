#!/usr/bin/env node

/**
 * Build reusable components
 * Extract common HTML patterns into reusable components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧩 Building components...\n');

const components = {
  header: null,
  footer: null,
  navigation: null,
};

// Extract components from HTML files
const htmlFiles = glob.sync('*.html', { cwd: rootDir, ignore: ['node_modules/**', 'dist/**'] });

if (htmlFiles.length === 0) {
  console.log('⚠️  No HTML files found');
  process.exit(0);
}

console.log(`Found ${htmlFiles.length} HTML files\n`);

// Process first HTML file to extract common components
const firstFile = path.join(rootDir, htmlFiles[0]);
const html = fs.readFileSync(firstFile, 'utf-8');
const $ = cheerio.load(html);

// Extract header
const header = $('header').first();
if (header.length > 0) {
  components.header = $.html(header);
  console.log('✓ Extracted header component');
}

// Extract footer
const footer = $('footer').first();
if (footer.length > 0) {
  components.footer = $.html(footer);
  console.log('✓ Extracted footer component');
}

// Extract navigation
const nav = $('nav').first();
if (nav.length > 0) {
  components.navigation = $.html(nav);
  console.log('✓ Extracted navigation component');
}

// Save components
const componentsDir = path.join(rootDir, 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

let savedCount = 0;

for (const [name, content] of Object.entries(components)) {
  if (content) {
    const componentPath = path.join(componentsDir, `${name}.html`);
    fs.writeFileSync(componentPath, content);
    savedCount++;
  }
}

console.log(`\n✅ Saved ${savedCount} components to ${componentsDir}\n`);

// Generate component manifest
const manifest = {
  generated: new Date().toISOString(),
  components: Object.keys(components).filter((key) => components[key] !== null),
};

fs.writeFileSync(
  path.join(componentsDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('💡 Usage:');
console.log('   Components can be included in HTML using SSI or build-time injection');
console.log('   Example: <!--#include virtual="/components/header.html" -->\n');
