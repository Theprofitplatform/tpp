#!/usr/bin/env node

/**
 * Check if bundle size exceeds limits
 * Used in CI to enforce size budgets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Size limits (in bytes)
const LIMITS = {
  js: 500 * 1024, // 500KB
  css: 200 * 1024, // 200KB
  total: 5 * 1024 * 1024, // 5MB
};

console.log('🔍 Checking bundle size limits...\n');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

let jsSize = 0;
let cssSize = 0;
let totalSize = 0;
let failed = false;

// Calculate sizes
const jsFiles = glob.sync('**/*.js', { cwd: distDir });
const cssFiles = glob.sync('**/*.css', { cwd: distDir });
const allFiles = glob.sync('**/*', { cwd: distDir, nodir: true });

jsFiles.forEach((file) => {
  const size = fs.statSync(path.join(distDir, file)).size;
  jsSize += size;
});

cssFiles.forEach((file) => {
  const size = fs.statSync(path.join(distDir, file)).size;
  cssSize += size;
});

allFiles.forEach((file) => {
  const size = fs.statSync(path.join(distDir, file)).size;
  totalSize += size;
});

// Check JavaScript
console.log(`JavaScript: ${(jsSize / 1024).toFixed(2)} KB / ${(LIMITS.js / 1024).toFixed(0)} KB`);
if (jsSize > LIMITS.js) {
  console.log('  ❌ FAILED: JavaScript bundle exceeds limit');
  failed = true;
} else {
  const remaining = ((1 - jsSize / LIMITS.js) * 100).toFixed(1);
  console.log(`  ✓ OK (${remaining}% remaining)`);
}

// Check CSS
console.log(`CSS: ${(cssSize / 1024).toFixed(2)} KB / ${(LIMITS.css / 1024).toFixed(0)} KB`);
if (cssSize > LIMITS.css) {
  console.log('  ❌ FAILED: CSS bundle exceeds limit');
  failed = true;
} else {
  const remaining = ((1 - cssSize / LIMITS.css) * 100).toFixed(1);
  console.log(`  ✓ OK (${remaining}% remaining)`);
}

// Check total
console.log(
  `Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB / ${(LIMITS.total / 1024 / 1024).toFixed(0)} MB`
);
if (totalSize > LIMITS.total) {
  console.log('  ❌ FAILED: Total bundle size exceeds limit');
  failed = true;
} else {
  const remaining = ((1 - totalSize / LIMITS.total) * 100).toFixed(1);
  console.log(`  ✓ OK (${remaining}% remaining)`);
}

console.log('');

if (failed) {
  console.error('❌ Bundle size check FAILED\n');
  process.exit(1);
} else {
  console.log('✅ Bundle size check PASSED\n');
  process.exit(0);
}
