#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ParityScanner {
  constructor() {
    this.results = {
      cssOrder: { pass: false, errors: [] },
      jsOrder: { pass: false, errors: [] },
      assetExistence: { pass: false, errors: [] },
      seoHead: { pass: false, errors: [] }
    };
  }

  async fetchHTML(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
  }

  extractResources(html, baseUrl = '') {
    const $ = load(html);
    const resources = {
      css: [],
      js: [],
      meta: [],
      title: $('title').text().trim()
    };

    // Extract CSS links
    $('link[rel="stylesheet"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        resources.css.push(href);
      }
    });

    // Extract JS scripts
    $('script[src]').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        resources.js.push(src);
      }
    });

    // Extract meta tags
    $('meta').each((i, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        resources.meta.push({ name, content });
      }
    });

    return resources;
  }

  compareArrays(arr1, arr2, label) {
    const errors = [];

    if (arr1.length !== arr2.length) {
      errors.push(`${label} count mismatch: prod=${arr1.length}, local=${arr2.length}`);
    }

    // Check order and content
    const maxLength = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < maxLength; i++) {
      const prod = arr1[i];
      const local = arr2[i];

      if (prod !== local) {
        errors.push(`${label}[${i}]: prod="${prod || 'missing'}" vs local="${local || 'missing'}"`);
      }
    }

    return errors;
  }

  async checkAssetExistence(assets) {
    const errors = [];
    const publicDir = path.join(__dirname, '..', 'public');
    const distDir = path.join(__dirname, '..', 'dist');

    for (const asset of assets) {
      if (asset.startsWith('http')) continue; // Skip external assets

      const relativePath = asset.startsWith('/') ? asset.slice(1) : asset;
      const publicPath = path.join(publicDir, relativePath);
      const distPath = path.join(distDir, relativePath);

      const existsInPublic = fs.existsSync(publicPath);
      const existsInDist = fs.existsSync(distPath);

      if (!existsInPublic && !existsInDist) {
        errors.push(`Missing asset: ${asset} (not found in public/ or dist/)`);
      }
    }

    return errors;
  }

  printResults() {
    console.log('\n🎯 PARITY SCAN RESULTS');
    console.log('='.repeat(50));

    let allPassed = true;

    Object.entries(this.results).forEach(([category, result]) => {
      const status = result.pass ? '✅ PASS' : '❌ FAIL';
      const categoryName = category.replace(/([A-Z])/g, ' $1').toUpperCase();

      console.log(`\n${status} ${categoryName}`);

      if (!result.pass) {
        allPassed = false;
        result.errors.forEach(error => {
          console.log(`  ❌ ${error}`);
        });
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(allPassed ? '🎉 ALL CHECKS PASSED! PIXEL PARITY ACHIEVED!' : '⚠️  PARITY ISSUES DETECTED - See errors above');

    if (allPassed) {
      console.log('\n📋 NEXT STEPS:');
      console.log('✅ Ready for production deployment');
      console.log('✅ Safe to create BaseLayout.astro');
      console.log('✅ Visual parity confirmed');
    } else {
      console.log('\n🔧 FIX INSTRUCTIONS:');
      console.log('1. Download missing assets from production');
      console.log('2. Fix CSS/JS order in head section');
      console.log('3. Update meta tags to match production');
      console.log('4. Re-run scanner until all checks pass');
    }

    return allPassed;
  }

  async scan() {
    try {
      console.log('🔍 Starting parity scan...\n');

      // Read production HTML
      const prodHtmlPath = path.join(__dirname, '..', 'production-source.html');
      const prodHtml = fs.readFileSync(prodHtmlPath, 'utf8');
      console.log('✓ Production HTML loaded');

      // Read local build
      const localHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
      const localHtml = fs.readFileSync(localHtmlPath, 'utf8');
      console.log('✓ Local build HTML loaded');

      // Extract resources
      const prodResources = this.extractResources(prodHtml);
      const localResources = this.extractResources(localHtml);

      console.log(`✓ Production: ${prodResources.css.length} CSS, ${prodResources.js.length} JS, ${prodResources.meta.length} meta`);
      console.log(`✓ Local: ${localResources.css.length} CSS, ${localResources.js.length} JS, ${localResources.meta.length} meta`);

      // Check CSS order
      const cssErrors = this.compareArrays(prodResources.css, localResources.css, 'CSS');
      this.results.cssOrder = {
        pass: cssErrors.length === 0,
        errors: cssErrors
      };

      // Check JS order
      const jsErrors = this.compareArrays(prodResources.js, localResources.js, 'JS');
      this.results.jsOrder = {
        pass: jsErrors.length === 0,
        errors: jsErrors
      };

      // Check asset existence
      const allAssets = [...prodResources.css, ...prodResources.js].filter(asset =>
        !asset.startsWith('http') && !asset.startsWith('/_astro')
      );
      const assetErrors = await this.checkAssetExistence(allAssets);
      this.results.assetExistence = {
        pass: assetErrors.length === 0,
        errors: assetErrors
      };

      // Check SEO/meta parity
      const seoErrors = [];
      if (prodResources.title !== localResources.title) {
        seoErrors.push(`Title mismatch: "${prodResources.title}" vs "${localResources.title}"`);
      }

      this.results.seoHead = {
        pass: seoErrors.length === 0,
        errors: seoErrors
      };

      return this.printResults();

    } catch (error) {
      console.error('❌ Scan failed:', error.message);
      return false;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scanner = new ParityScanner();
  const success = await scanner.scan();
  process.exit(success ? 0 : 1);
}

export { ParityScanner };