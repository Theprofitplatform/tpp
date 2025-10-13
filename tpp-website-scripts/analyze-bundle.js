#!/usr/bin/env node

/**
 * Analyze bundle sizes and report on asset optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('📊 Analyzing bundle...\n');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

const stats = {
  html: { files: [], size: 0 },
  css: { files: [], size: 0 },
  js: { files: [], size: 0 },
  images: { files: [], size: 0 },
  fonts: { files: [], size: 0 },
  other: { files: [], size: 0 },
};

// Analyze files
const allFiles = glob.sync('**/*', { cwd: distDir, nodir: true });

for (const file of allFiles) {
  const filePath = path.join(distDir, file);
  const fileStats = fs.statSync(filePath);
  const size = fileStats.size;

  const ext = path.extname(file).toLowerCase();
  const fileInfo = { name: file, size };

  if (ext === '.html') {
    stats.html.files.push(fileInfo);
    stats.html.size += size;
  } else if (ext === '.css') {
    stats.css.files.push(fileInfo);
    stats.css.size += size;
  } else if (ext === '.js') {
    stats.js.files.push(fileInfo);
    stats.js.size += size;
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
    stats.images.files.push(fileInfo);
    stats.images.size += size;
  } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    stats.fonts.files.push(fileInfo);
    stats.fonts.size += size;
  } else {
    stats.other.files.push(fileInfo);
    stats.other.size += size;
  }
}

// Calculate total size
const totalSize = Object.values(stats).reduce((sum, stat) => sum + stat.size, 0);

// Print results
console.log('📦 Bundle Analysis\n');
console.log('═══════════════════════════════════════════════════════\n');

for (const [type, data] of Object.entries(stats)) {
  if (data.files.length === 0) continue;

  const percentage = ((data.size / totalSize) * 100).toFixed(1);
  const sizeKB = (data.size / 1024).toFixed(2);

  console.log(`${type.toUpperCase()}: ${sizeKB} KB (${percentage}%)`);
  console.log(`  Files: ${data.files.length}`);

  // Show largest files
  const sorted = data.files.sort((a, b) => b.size - a.size).slice(0, 3);
  sorted.forEach((file) => {
    console.log(`    - ${file.name}: ${(file.size / 1024).toFixed(2)} KB`);
  });

  console.log('');
}

console.log('═══════════════════════════════════════════════════════');
console.log(`\nTotal bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Total files: ${allFiles.length}\n`);

// Size warnings
const warnings = [];
if (stats.js.size > 500 * 1024) warnings.push('⚠️  JS bundle is large (>500KB)');
if (stats.css.size > 200 * 1024) warnings.push('⚠️  CSS bundle is large (>200KB)');
if (stats.images.size > 5 * 1024 * 1024) warnings.push('⚠️  Images are large (>5MB)');

if (warnings.length > 0) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log(`  ${w}`));
  console.log('');
}

// Recommendations
console.log('💡 Recommendations:');
if (stats.js.size > 500 * 1024) {
  console.log('  - Consider code splitting for JavaScript');
}
if (stats.css.size > 200 * 1024) {
  console.log('  - Review CSS consolidation and remove unused styles');
}
if (stats.images.size > 2 * 1024 * 1024) {
  console.log('  - Optimize images and use WebP format');
  console.log('  - Consider lazy loading for below-the-fold images');
}
console.log('');
