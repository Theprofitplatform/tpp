#!/usr/bin/env node

/**
 * Consolidate CSS files into a single optimized file
 * Removes duplicates and optimizes selectors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import CleanCSS from 'clean-css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🎨 Consolidating CSS files...\n');

// Find all CSS files
const cssFiles = glob.sync('css/**/*.css', { cwd: rootDir, ignore: ['**/consolidated.css'] });

if (cssFiles.length === 0) {
  console.log('⚠️  No CSS files found to consolidate');
  process.exit(0);
}

console.log(`Found ${cssFiles.length} CSS files:`);
cssFiles.forEach((file) => console.log(`  - ${file}`));

// Read and combine all CSS
let combinedCSS = '';
for (const file of cssFiles) {
  const filePath = path.join(rootDir, file);
  const css = fs.readFileSync(filePath, 'utf-8');
  combinedCSS += `\n/* ${file} */\n${css}\n`;
}

console.log('\n📦 Optimizing combined CSS...');

// Optimize with CleanCSS
const cleanCSS = new CleanCSS({
  level: {
    1: {
      all: true,
    },
    2: {
      all: true,
      removeDuplicateRules: true,
      mergeMedia: true,
    },
  },
});

const result = cleanCSS.minify(combinedCSS);

if (result.errors.length > 0) {
  console.error('❌ Errors during minification:');
  result.errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
}

// Save consolidated CSS
const outputPath = path.join(rootDir, 'css', 'consolidated.css');
fs.writeFileSync(outputPath, result.styles);

const originalSize = Buffer.byteLength(combinedCSS, 'utf8');
const optimizedSize = Buffer.byteLength(result.styles, 'utf8');
const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

console.log('\n✅ CSS consolidation complete!');
console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`   Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`);
console.log(`   Savings: ${savings}%`);
console.log(`   Output: ${outputPath}\n`);

// Show optimization stats
if (result.stats) {
  console.log('📊 Optimization stats:');
  console.log(`   Time: ${result.stats.timeSpent}ms`);
  console.log(`   Efficiency: ${result.stats.efficiency.toFixed(1)}%\n`);
}
