#!/usr/bin/env node

/**
 * Fetch Production HTML
 *
 * Fetches the production site HTML for parity comparison
 * Saves to .cache/prod.html
 */

import https from 'https';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const PROD_URL = process.env.PROD_URL || 'https://theprofitplatform.com.au';
const OUTPUT_FILE = './.cache/prod.html';

console.log(`📥 Fetching production HTML from ${PROD_URL}...`);

https.get(PROD_URL, (res) => {
  if (res.statusCode !== 200) {
    console.error(`❌ HTTP ${res.statusCode}: ${res.statusMessage}`);
    process.exit(1);
  }

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
      writeFileSync(OUTPUT_FILE, data, 'utf-8');
      console.log(`✅ Production HTML saved to ${OUTPUT_FILE}`);
      console.log(`   Size: ${(data.length / 1024).toFixed(1)} KB`);
    } catch (error) {
      console.error(`❌ Failed to save file: ${error.message}`);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error(`❌ Request failed: ${error.message}`);
  process.exit(1);
});
