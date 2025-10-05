// Optimize dashboard image: PNG → WebP with quality settings
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = '/tmp/dashboard-original.png';
const outputDir = join(__dirname, '../public/images');
const outputWebP = join(outputDir, 'dashboard-optimized.webp');
const outputPngFallback = join(outputDir, 'dashboard-optimized.png');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function optimizeImage() {
  try {
    console.log('📸 Starting image optimization...');
    console.log(`Input: ${inputPath}`);

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Original: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Generate WebP (modern browsers) - high quality, small size
    await image
      .resize(1200, null, { // Max width 1200px, maintain aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({
        quality: 85,      // Good balance of quality/size
        effort: 6         // More compression effort
      })
      .toFile(outputWebP);

    const webpStats = await sharp(outputWebP).metadata();
    console.log(`✅ WebP created: ${webpStats.width}x${webpStats.height}`);

    // Generate optimized PNG fallback (older browsers)
    await sharp(inputPath)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .png({
        quality: 85,
        compressionLevel: 9,  // Maximum PNG compression
        adaptiveFiltering: true
      })
      .toFile(outputPngFallback);

    const pngStats = await sharp(outputPngFallback).metadata();
    console.log(`✅ PNG fallback created: ${pngStats.width}x${pngStats.height}`);

    // Get file sizes
    const { statSync } = await import('fs');
    const originalSize = statSync(inputPath).size;
    const webpSize = statSync(outputWebP).size;
    const pngSize = statSync(outputPngFallback).size;

    console.log('\n📊 Results:');
    console.log(`Original PNG:  ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Optimized WebP: ${(webpSize / 1024).toFixed(2)} KB (${((1 - webpSize/originalSize) * 100).toFixed(1)}% reduction)`);
    console.log(`Optimized PNG:  ${(pngSize / 1024).toFixed(2)} KB (${((1 - pngSize/originalSize) * 100).toFixed(1)}% reduction)`);

  } catch (error) {
    console.error('❌ Error optimizing image:', error);
    process.exit(1);
  }
}

optimizeImage();
