#!/usr/bin/env node

/**
 * Production Parity Scanner
 *
 * Compares local build against production to verify:
 * - CSS load order matches
 * - JS load order matches
 * - SEO meta tags are consistent
 * - Critical resources are present
 *
 * Usage:
 *   npm run parity:scan
 *   PROD_URL=https://... LOCAL_URL=http://... npm run parity:scan
 *   node scripts/parity-scan.mjs <prod-url> <local-url>
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PROD_URL = process.env.PROD_URL || process.argv[2] || 'https://theprofitplatform.com.au';
const LOCAL_URL = process.env.LOCAL_URL || process.argv[3] || null;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractCSSLinks(html) {
  const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const matches = html.match(cssRegex) || [];

  return matches.map(link => {
    const hrefMatch = link.match(/href=["']([^"']+)["']/);
    return hrefMatch ? hrefMatch[1] : '';
  }).filter(Boolean);
}

function extractJSScripts(html) {
  const jsRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const matches = [];
  let match;

  while ((match = jsRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

function extractMetaTags(html) {
  const metaRegex = /<meta[^>]*>/gi;
  const matches = html.match(metaRegex) || [];

  return matches.map(tag => {
    const nameMatch = tag.match(/(?:name|property)=["']([^"']+)["']/);
    const contentMatch = tag.match(/content=["']([^"']+)["']/);

    if (nameMatch && contentMatch) {
      return {
        name: nameMatch[1],
        content: contentMatch[1]
      };
    }
    return null;
  }).filter(Boolean);
}

function compareArrays(arr1, arr2, label) {
  log(`\n${label}:`, 'bright');

  const maxLength = Math.max(arr1.length, arr2.length);
  let differences = 0;

  for (let i = 0; i < maxLength; i++) {
    const prod = arr1[i] || '(missing)';
    const local = arr2[i] || '(missing)';

    if (prod === local) {
      log(`  ✓ [${i + 1}] ${prod}`, 'green');
    } else {
      differences++;
      log(`  ✗ [${i + 1}] Mismatch:`, 'red');
      log(`      Production: ${prod}`, 'yellow');
      log(`      Local:      ${local}`, 'cyan');
    }
  }

  if (differences === 0) {
    log(`  ✓ All ${arr1.length} items match perfectly!`, 'green');
  } else {
    log(`  ✗ Found ${differences} difference(s)`, 'red');
  }

  return differences;
}

function compareMeta(prodMeta, localMeta) {
  log(`\n${'SEO Meta Tags Comparison:'}`, 'bright');

  const criticalTags = [
    'description',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'twitter:card',
    'twitter:title',
    'twitter:description'
  ];

  let differences = 0;

  criticalTags.forEach(tagName => {
    const prodTag = prodMeta.find(m => m.name === tagName);
    const localTag = localMeta.find(m => m.name === tagName);

    if (!prodTag && !localTag) {
      return; // Both missing, skip
    }

    if (!prodTag) {
      log(`  ✗ ${tagName}: Missing in production`, 'red');
      differences++;
    } else if (!localTag) {
      log(`  ✗ ${tagName}: Missing in local`, 'red');
      differences++;
    } else if (prodTag.content === localTag.content) {
      log(`  ✓ ${tagName}: Match`, 'green');
    } else {
      log(`  ✗ ${tagName}: Content differs`, 'red');
      log(`      Production: ${prodTag.content}`, 'yellow');
      log(`      Local:      ${localTag.content}`, 'cyan');
      differences++;
    }
  });

  if (differences === 0) {
    log(`  ✓ All critical SEO tags match!`, 'green');
  } else {
    log(`  ✗ Found ${differences} SEO tag difference(s)`, 'red');
  }

  return differences;
}

async function main() {
  log('\n🔍 Production Parity Scanner\n', 'bright');
  log(`Production URL: ${PROD_URL}`, 'cyan');

  try {
    // Fetch production HTML
    log('\n📥 Fetching production HTML...', 'blue');
    const prodHtml = await fetchUrl(PROD_URL);
    log('✓ Production HTML fetched', 'green');

    // Get local HTML (either from URL or dist file)
    let localHtml;
    if (LOCAL_URL) {
      log(`📥 Fetching local HTML from ${LOCAL_URL}...`, 'blue');
      localHtml = await fetchUrl(LOCAL_URL);
    } else {
      log('📂 Reading local build from dist/index.html...', 'blue');
      const distPath = join(__dirname, '..', 'dist', 'index.html');
      localHtml = readFileSync(distPath, 'utf-8');
    }
    log('✓ Local HTML loaded', 'green');

    // Extract resources
    const prodCSS = extractCSSLinks(prodHtml);
    const localCSS = extractCSSLinks(localHtml);

    const prodJS = extractJSScripts(prodHtml);
    const localJS = extractJSScripts(localHtml);

    const prodMeta = extractMetaTags(prodHtml);
    const localMeta = extractMetaTags(localHtml);

    // Compare
    log('\n═══════════════════════════════════════', 'bright');

    const cssDiff = compareArrays(prodCSS, localCSS, 'CSS Load Order');
    const jsDiff = compareArrays(prodJS, localJS, 'JavaScript Load Order');
    const metaDiff = compareMeta(prodMeta, localMeta);

    // Summary
    log('\n═══════════════════════════════════════', 'bright');
    log('\n📊 Summary:', 'bright');
    log(`  CSS files: ${prodCSS.length} (prod) vs ${localCSS.length} (local)`, 'cyan');
    log(`  JS files: ${prodJS.length} (prod) vs ${localJS.length} (local)`, 'cyan');
    log(`  Meta tags: ${prodMeta.length} (prod) vs ${localMeta.length} (local)`, 'cyan');

    const totalDiff = cssDiff + jsDiff + metaDiff;

    if (totalDiff === 0) {
      log('\n✓ ✓ ✓ PERFECT PARITY! Production matches local build. ✓ ✓ ✓\n', 'green');
      process.exit(0);
    } else {
      log(`\n✗ Found ${totalDiff} total difference(s). Review above for details.\n`, 'red');
      process.exit(1);
    }

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
