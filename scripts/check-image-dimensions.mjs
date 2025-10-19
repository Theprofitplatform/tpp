#!/usr/bin/env node
/**
 * Image Dimension Checker
 * Validates images before they're used to prevent API errors
 * Max dimensions: 8000x8000 pixels
 * Max file size: 5MB
 */

import { readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { basename } from 'path';

const MAX_DIMENSION = 8000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SAFE_DIMENSION = 7000; // Stay under limit

/**
 * Read PNG dimensions from file header
 */
function getPNGDimensions(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a valid PNG file');
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

/**
 * Read JPEG dimensions from file header
 */
function getJPEGDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xFF) break;

    const marker = buffer[offset + 1];
    offset += 2;

    // SOF markers (Start of Frame)
    if (marker >= 0xC0 && marker <= 0xC3) {
      return {
        height: buffer.readUInt16BE(offset + 1),
        width: buffer.readUInt16BE(offset + 3)
      };
    }

    // Skip to next marker
    const segmentLength = buffer.readUInt16BE(offset);
    offset += segmentLength;
  }

  throw new Error('Could not find JPEG dimensions');
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(filePath, buffer) {
  const ext = filePath.toLowerCase();

  if (ext.endsWith('.png')) {
    return getPNGDimensions(buffer);
  } else if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) {
    return getJPEGDimensions(buffer);
  } else if (ext.endsWith('.webp')) {
    // WebP simple file format
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      // VP8 format
      if (buffer.toString('ascii', 12, 16) === 'VP8 ') {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff
        };
      }
      // VP8L format
      if (buffer.toString('ascii', 12, 16) === 'VP8L') {
        const bits = buffer.readUInt32LE(21);
        return {
          width: (bits & 0x3FFF) + 1,
          height: ((bits >> 14) & 0x3FFF) + 1
        };
      }
    }
    throw new Error('Unsupported WebP format');
  }

  throw new Error(`Unsupported image format: ${ext}`);
}

/**
 * Check if image is safe to use with Claude API
 */
async function checkImage(filePath) {
  const stats = await stat(filePath);
  const fileSize = stats.size;

  console.log(`\n📸 Checking: ${basename(filePath)}`);
  console.log(`   File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  if (fileSize > MAX_FILE_SIZE) {
    console.log(`   ❌ FAIL: File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    return false;
  }

  const buffer = readFileSync(filePath);

  try {
    const { width, height } = getImageDimensions(filePath, buffer);
    console.log(`   Dimensions: ${width}x${height}px`);

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      console.log(`   ❌ FAIL: Dimensions exceed ${MAX_DIMENSION}px limit`);
      console.log(`
      🔧 Fix: Install ImageMagick and run:`);
      console.log(`      convert "${filePath}" -resize ${SAFE_DIMENSION}x${SAFE_DIMENSION}\\> -quality 80 safe-${basename(filePath)}`);
      return false;
    }

    if (width > SAFE_DIMENSION || height > SAFE_DIMENSION) {
      console.log(`   ⚠️  WARNING: Dimensions exceed safe threshold (${SAFE_DIMENSION}px)`);
      console.log(`   Recommend resizing to stay under ${SAFE_DIMENSION}px`);
    } else {
      console.log(`   ✅ PASS: Image is safe to use`);
    }

    return true;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node check-image-dimensions.mjs <image-file> [image-file2...]');
  console.log('\nChecks if images meet Claude API requirements:');
  console.log(`  - Max dimensions: ${MAX_DIMENSION}x${MAX_DIMENSION}px`);
  console.log(`  - Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  console.log(`  - Safe threshold: ${SAFE_DIMENSION}x${SAFE_DIMENSION}px`);
  process.exit(1);
}

let allPassed = true;

for (const filePath of args) {
  const passed = await checkImage(filePath);
  if (!passed) allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All images passed validation');
  process.exit(0);
} else {
  console.log('❌ Some images failed validation');
  console.log('\n💡 Install ImageMagick to fix:');
  console.log('   sudo apt-get install imagemagick  # Ubuntu/Debian');
  console.log('   brew install imagemagick          # macOS');
  process.exit(1);
}
