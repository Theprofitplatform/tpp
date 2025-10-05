#!/usr/bin/env node

/**
 * Page Discovery Script
 *
 * Discovers all pages on the site by:
 * 1. Fetching sitemap.xml
 * 2. Crawling internal links from homepage
 * 3. Comparing with currently tested pages
 * 4. Outputting new pages to add to tests
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://theprofitplatform.com.au';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const CONFIG_PATH = path.join(__dirname, 'config/production.json');
const OUTPUT_PATH = path.join(__dirname, 'discovered-pages.json');

// Fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract URLs from sitemap.xml
function extractSitemapUrls(xml) {
  const urlPattern = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;

  while ((match = urlPattern.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

// Legacy/test paths to exclude from monitoring
const EXCLUDED_PATHS = [
  '/index-optimized',
  '/landingpage',
  '/test',
  '/demo',
  '/backup',
  '/old',
  '/archive',
  '/_test',
  '/staging'
];

// Convert full URL to path and filter out legacy pages
function urlToPath(url) {
  const withoutBase = url.replace(BASE_URL, '');
  return withoutBase || '/';
}

// Check if path should be excluded
function shouldExcludePath(path) {
  return EXCLUDED_PATHS.some(excluded =>
    path.toLowerCase().includes(excluded.toLowerCase())
  );
}

async function discoverPages() {
  console.log('🔍 Discovering pages...\n');

  // Load current configuration
  let currentPages = [];
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    currentPages = config.pages || [];
    console.log(`📋 Currently testing ${currentPages.length} pages`);
  } catch (err) {
    console.log('⚠️  Could not load current config, starting fresh');
  }

  // Fetch sitemap
  let discoveredPages = [];
  try {
    console.log('🌐 Fetching sitemap.xml...');
    const sitemapXml = await fetchUrl(SITEMAP_URL);
    const sitemapUrls = extractSitemapUrls(sitemapXml);
    const allPages = sitemapUrls.map(urlToPath);

    // Filter out legacy/test pages
    discoveredPages = allPages.filter(page => !shouldExcludePath(page));

    console.log(`✅ Found ${allPages.length} pages in sitemap`);
    console.log(`🔧 Filtered to ${discoveredPages.length} pages (excluded ${allPages.length - discoveredPages.length} legacy/test pages)`);
  } catch (err) {
    console.log(`⚠️  Could not fetch sitemap: ${err.message}`);
  }

  // Find new pages
  const newPages = discoveredPages.filter(page => !currentPages.includes(page));
  const removedPages = currentPages.filter(page => !discoveredPages.includes(page));

  const result = {
    timestamp: new Date().toISOString(),
    totalDiscovered: discoveredPages.length,
    currentlyTested: currentPages.length,
    newPages: newPages,
    removedPages: removedPages,
    allPages: discoveredPages
  };

  // Save results
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

  // Output summary
  console.log('\n📊 Discovery Summary:');
  console.log(`   Total pages found: ${discoveredPages.length}`);
  console.log(`   Currently tested: ${currentPages.length}`);
  console.log(`   New pages: ${newPages.length}`);
  console.log(`   Removed pages: ${removedPages.length}`);

  if (newPages.length > 0) {
    console.log('\n🆕 New pages to add:');
    newPages.forEach(page => console.log(`   - ${page}`));
  }

  if (removedPages.length > 0) {
    console.log('\n🗑️  Pages no longer in sitemap:');
    removedPages.forEach(page => console.log(`   - ${page}`));
  }

  console.log(`\n💾 Results saved to: ${OUTPUT_PATH}`);

  return result;
}

// Run if called directly
if (require.main === module) {
  discoverPages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { discoverPages };
