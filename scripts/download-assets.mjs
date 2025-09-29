#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Critical assets that must exist for the site to work
const criticalAssets = [
  '/css/critical.min.css',
  '/css/style.min.css',
  '/css/loading-states.css',
  '/css/modern-theme-variables.css',
  '/css/navigation.css',
  '/css/skip-links-fix.css',
  '/css/main-content-spacing.css',
  '/css/modern-theme-components.css',
  '/css/dropdown-fix.css',
  '/css/layout.css',
  '/css/navigation-glass-enhanced.css',
  '/css/hero-content-spacing.css',
  '/css/hero-modern.css',
  '/css/trust-signals-enhanced.css',
  '/css/trust-signals-homepage-theme.css',
  '/css/bundled.min.css',
  '/css/fix-animations.css',
  '/js/combined.min.js',
  '/js/main.js',
  '/js/homepage.js',
  '/js/predictive-resource-loader.js',
  '/test-phase2-performance.js',
  '/assets/manifest.json'
];

async function downloadAsset(assetPath) {
  try {
    const url = `https://theprofitplatform.com.au${assetPath}`;
    const localPath = path.join(__dirname, '..', 'public', assetPath.slice(1));

    // Create directory if it doesn't exist
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Skip if file already exists and has content
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
      console.log(`✓ ${assetPath} (already exists)`);
      return;
    }

    console.log(`📥 Downloading ${assetPath}...`);
    const response = await fetch(url);

    if (response.ok) {
      const content = await response.text();
      fs.writeFileSync(localPath, content, 'utf8');
      console.log(`✅ ${assetPath} (${(content.length/1024).toFixed(1)}KB)`);
    } else {
      console.log(`⚠️  ${assetPath} (HTTP ${response.status} - may not exist on production)`);
    }
  } catch (error) {
    console.log(`❌ ${assetPath} (${error.message})`);
  }
}

async function downloadAllAssets() {
  console.log('🔽 Downloading critical assets from production...\n');

  for (const asset of criticalAssets) {
    await downloadAsset(asset);
  }

  console.log('\n✅ Asset download complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllAssets();
}

export { downloadAllAssets };