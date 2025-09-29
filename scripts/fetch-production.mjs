#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchProduction() {
  try {
    console.log('🔍 Fetching production site...');

    const response = await fetch('https://theprofitplatform.com.au/');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Save the production HTML
    const outputPath = path.join(__dirname, '..', 'production-source.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log('✅ Production HTML saved to production-source.html');
    console.log(`📄 Size: ${(html.length / 1024).toFixed(1)}KB`);

    // Extract local assets
    const localAssets = [];
    const assetRegex = /(href|src)=["'](?!https?:\/\/)([^"']+)["']/g;
    let match;

    while ((match = assetRegex.exec(html)) !== null) {
      const asset = match[2];
      if (asset.startsWith('/') && !asset.startsWith('//')) {
        localAssets.push(asset);
      }
    }

    const uniqueAssets = [...new Set(localAssets)];
    console.log('📦 Local assets found:');
    uniqueAssets.forEach(asset => console.log(`   ${asset}`));

    // Save asset list
    fs.writeFileSync(
      path.join(__dirname, '..', 'assets-list.json'),
      JSON.stringify(uniqueAssets, null, 2),
      'utf8'
    );

    return { html, assets: uniqueAssets };

  } catch (error) {
    console.error('❌ Failed to fetch production:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchProduction();
}

export { fetchProduction };