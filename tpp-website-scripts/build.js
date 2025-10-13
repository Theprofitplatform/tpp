#!/usr/bin/env node

/**
 * Build script for tpp-website
 * Handles HTML minification, CSS optimization, and JS bundling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { minify as htmlMinify } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify as jsMinify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

console.log('🏗️  Building tpp-website...\n');

// HTML minification options
const htmlOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
};

// Process HTML files
const htmlFiles = glob.sync('*.html', { cwd: rootDir });
console.log(`📄 Processing ${htmlFiles.length} HTML files...`);

for (const file of htmlFiles) {
  const inputPath = path.join(rootDir, file);
  const outputPath = path.join(distDir, file);
  const html = fs.readFileSync(inputPath, 'utf-8');

  const minified = await htmlMinify(html, htmlOptions);
  fs.writeFileSync(outputPath, minified);

  const savings = ((1 - minified.length / html.length) * 100).toFixed(1);
  console.log(`  ✓ ${file} (${savings}% smaller)`);
}

// Process CSS files
const cssFiles = glob.sync('**/*.css', { cwd: rootDir, ignore: ['node_modules/**', 'dist/**'] });
console.log(`\n🎨 Processing ${cssFiles.length} CSS files...`);

const cleanCSS = new CleanCSS({ level: 2 });
for (const file of cssFiles) {
  const inputPath = path.join(rootDir, file);
  const outputPath = path.join(distDir, file);
  const css = fs.readFileSync(inputPath, 'utf-8');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const result = cleanCSS.minify(css);

  if (result.errors.length > 0) {
    console.error(`  ✗ ${file}: ${result.errors.join(', ')}`);
    continue;
  }

  fs.writeFileSync(outputPath, result.styles);
  const savings = ((1 - result.styles.length / css.length) * 100).toFixed(1);
  console.log(`  ✓ ${file} (${savings}% smaller)`);
}

// Process JS files
const jsFiles = glob.sync('**/*.js', { cwd: rootDir, ignore: ['node_modules/**', 'dist/**', 'scripts/**'] });
console.log(`\n⚡ Processing ${jsFiles.length} JS files...`);

for (const file of jsFiles) {
  const inputPath = path.join(rootDir, file);
  const outputPath = path.join(distDir, file);
  const js = fs.readFileSync(inputPath, 'utf-8');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const result = await jsMinify(js, {
    compress: true,
    mangle: true,
  });

  if (result.error) {
    console.error(`  ✗ ${file}: ${result.error}`);
    continue;
  }

  fs.writeFileSync(outputPath, result.code);
  const savings = ((1 - result.code.length / js.length) * 100).toFixed(1);
  console.log(`  ✓ ${file} (${savings}% smaller)`);
}

// Copy static assets
const assetPatterns = ['**/*.{png,jpg,jpeg,gif,svg,ico,webp,woff,woff2,ttf,eot}'];
console.log('\n📦 Copying static assets...');

for (const pattern of assetPatterns) {
  const files = glob.sync(pattern, { cwd: rootDir, ignore: ['node_modules/**', 'dist/**'] });

  for (const file of files) {
    const inputPath = path.join(rootDir, file);
    const outputPath = path.join(distDir, file);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.copyFileSync(inputPath, outputPath);
  }
}

// Create _headers file for Cloudflare/Nginx
const headersContent = `/*
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/*.html
  Cache-Control: public, max-age=300

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.{png,jpg,jpeg,gif,svg,ico,webp}
  Cache-Control: public, max-age=31536000, immutable
`;

fs.writeFileSync(path.join(distDir, '_headers'), headersContent);

console.log('\n✅ Build complete!\n');
console.log(`📊 Output: ${distDir}`);

// Build stats
const distSize = getFolderSize(distDir);
console.log(`📦 Total size: ${(distSize / 1024 / 1024).toFixed(2)} MB\n`);

function getFolderSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getFolderSize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}
