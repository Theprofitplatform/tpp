#!/usr/bin/env node

/**
 * Optimize images using Sharp
 * Converts to WebP and optimizes file sizes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🖼️  Optimizing images...\n');

// Find all images
const imageFiles = glob.sync('**/*.{jpg,jpeg,png,gif}', {
  cwd: rootDir,
  ignore: ['node_modules/**', 'dist/**', '**/optimized/**'],
});

if (imageFiles.length === 0) {
  console.log('⚠️  No images found to optimize');
  process.exit(0);
}

console.log(`Found ${imageFiles.length} images to optimize\n`);

let totalSavings = 0;
let processedCount = 0;

for (const file of imageFiles) {
  try {
    const inputPath = path.join(rootDir, file);
    const outputDir = path.join(path.dirname(inputPath), 'optimized');
    const outputPath = path.join(outputDir, path.basename(file, path.extname(file)) + '.webp');

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const inputStats = fs.statSync(inputPath);
    const originalSize = inputStats.size;

    // Optimize image
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const optimizedSize = outputStats.size;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`  ✓ ${file}`);
    console.log(`    ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (${savings}% smaller)`);

    totalSavings += originalSize - optimizedSize;
    processedCount++;
  } catch (error) {
    console.error(`  ✗ ${file}: ${error.message}`);
  }
}

console.log('\n✅ Image optimization complete!');
console.log(`   Processed: ${processedCount}/${imageFiles.length} images`);
console.log(`   Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)} MB\n`);
