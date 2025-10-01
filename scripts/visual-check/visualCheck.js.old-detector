#!/usr/bin/env node

/**
 * Visual Frontend Checker Agent
 *
 * Automated visual inspection of web pages using Playwright.
 * Detects missing CSS, broken components, font issues, and layout problems.
 *
 * Usage:
 *   node visualCheck.js --url "https://example.com"
 *   node visualCheck.js --urls urls.json
 *   node visualCheck.js --url "https://example.com" --mobile --desktop
 */

import { chromium } from '@playwright/test';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectIssues } from './lib/detector.js';
import { generateReport } from './lib/reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, 'visual-checks'),
  viewports: {
    mobile: { width: 375, height: 812, name: 'mobile' },
    tablet: { width: 768, height: 1024, name: 'tablet' },
    desktop: { width: 1920, height: 1080, name: 'desktop' }
  },
  timeout: 30000,
  waitForNetworkIdle: true
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  return yargs(hideBin(process.argv))
    .option('url', {
      alias: 'u',
      type: 'string',
      description: 'Single URL to check'
    })
    .option('urls', {
      type: 'string',
      description: 'Path to JSON file with multiple URLs'
    })
    .option('mobile', {
      alias: 'm',
      type: 'boolean',
      default: true,
      description: 'Check mobile viewport'
    })
    .option('tablet', {
      alias: 't',
      type: 'boolean',
      default: false,
      description: 'Check tablet viewport'
    })
    .option('desktop', {
      alias: 'd',
      type: 'boolean',
      default: true,
      description: 'Check desktop viewport'
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Output directory for screenshots and reports',
      default: CONFIG.outputDir
    })
    .option('format', {
      alias: 'f',
      type: 'string',
      choices: ['json', 'markdown', 'both'],
      default: 'both',
      description: 'Report format'
    })
    .check((argv) => {
      if (!argv.url && !argv.urls) {
        throw new Error('Either --url or --urls must be provided');
      }
      return true;
    })
    .help()
    .alias('help', 'h')
    .argv;
}

/**
 * Load URLs from file or command line
 */
async function loadUrls(argv) {
  if (argv.urls) {
    const content = await fs.readFile(argv.urls, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.urls;
  }
  return [{ url: argv.url, name: new URL(argv.url).hostname }];
}

/**
 * Get enabled viewports based on CLI arguments
 */
function getEnabledViewports(argv) {
  const viewports = [];
  if (argv.mobile) viewports.push(CONFIG.viewports.mobile);
  if (argv.tablet) viewports.push(CONFIG.viewports.tablet);
  if (argv.desktop) viewports.push(CONFIG.viewports.desktop);
  return viewports;
}

/**
 * Create unique timestamp-based folder for this check run
 */
function createRunFolder(baseDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return path.join(baseDir, `run-${timestamp}`);
}

/**
 * Take screenshot and detect issues for a specific viewport
 */
async function checkViewport(page, url, urlInfo, viewport, runFolder) {
  console.log(chalk.cyan(`  📱 Checking ${viewport.name} (${viewport.width}x${viewport.height})...`));

  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  // Navigate and wait for page load
  const response = await page.goto(url, {
    waitUntil: CONFIG.waitForNetworkIdle ? 'networkidle' : 'load',
    timeout: CONFIG.timeout
  });

  // Wait a bit for fonts and styles to load
  await page.waitForTimeout(2000);

  const sanitizedName = urlInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const screenshotFolder = path.join(runFolder, sanitizedName, viewport.name);
  await fs.mkdir(screenshotFolder, { recursive: true });

  // Take screenshots
  const fullPagePath = path.join(screenshotFolder, 'full-page.png');
  const viewportPath = path.join(screenshotFolder, 'viewport.png');

  await page.screenshot({ path: fullPagePath, fullPage: true });
  await page.screenshot({ path: viewportPath, fullPage: false });

  // Detect issues
  const issues = await detectIssues(page, response);

  return {
    viewport: viewport.name,
    dimensions: `${viewport.width}x${viewport.height}`,
    screenshots: {
      fullPage: fullPagePath,
      viewport: viewportPath
    },
    issues,
    status: response.status(),
    loadTime: Date.now()
  };
}

/**
 * Check a single URL across all viewports
 */
async function checkUrl(browser, urlInfo, viewports, runFolder) {
  console.log(chalk.bold.blue(`\n🔍 Checking: ${urlInfo.url}`));

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();
  const startTime = Date.now();

  const results = {
    url: urlInfo.url,
    name: urlInfo.name,
    timestamp: new Date().toISOString(),
    viewportResults: []
  };

  try {
    // Check each viewport
    for (const viewport of viewports) {
      try {
        const viewportResult = await checkViewport(page, urlInfo.url, urlInfo, viewport, runFolder);
        results.viewportResults.push(viewportResult);
      } catch (error) {
        console.log(chalk.red(`    ❌ Error in ${viewport.name}: ${error.message}`));
        results.viewportResults.push({
          viewport: viewport.name,
          error: error.message,
          status: 'failed'
        });
      }
    }

    results.totalLoadTime = Date.now() - startTime;
    results.success = results.viewportResults.every(r => !r.error);

    // Count total issues
    const totalIssues = results.viewportResults.reduce((sum, r) => {
      return sum + (r.issues ? Object.values(r.issues).flat().length : 0);
    }, 0);

    if (results.success && totalIssues === 0) {
      console.log(chalk.green(`  ✅ All checks passed (${results.totalLoadTime}ms)`));
    } else if (results.success) {
      console.log(chalk.yellow(`  ⚠️  Completed with ${totalIssues} issue(s) (${results.totalLoadTime}ms)`));
    } else {
      console.log(chalk.red(`  ❌ Failed with errors`));
    }

  } catch (error) {
    console.log(chalk.red(`  ❌ Fatal error: ${error.message}`));
    results.error = error.message;
    results.success = false;
  } finally {
    await context.close();
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.cyan('\n🎨 Visual Frontend Checker Agent\n'));

  const argv = await parseArgs();
  const urls = await loadUrls(argv);
  const viewports = getEnabledViewports(argv);
  const runFolder = createRunFolder(argv.output);

  console.log(chalk.gray(`Output directory: ${runFolder}`));
  console.log(chalk.gray(`Checking ${urls.length} URL(s) across ${viewports.length} viewport(s)\n`));

  await fs.mkdir(runFolder, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({
    headless: true
  });

  const allResults = [];

  try {
    // Check all URLs
    for (const urlInfo of urls) {
      const result = await checkUrl(browser, urlInfo, viewports, runFolder);
      allResults.push(result);
    }

    // Generate reports
    console.log(chalk.bold.cyan('\n📝 Generating reports...\n'));
    await generateReport(allResults, runFolder, argv.format);

    // Summary
    const successCount = allResults.filter(r => r.success).length;
    const failCount = allResults.length - successCount;
    const totalIssues = allResults.reduce((sum, r) => {
      return sum + r.viewportResults.reduce((vSum, vr) => {
        return vSum + (vr.issues ? Object.values(vr.issues).flat().length : 0);
      }, 0);
    }, 0);

    console.log(chalk.bold('\n📊 Summary:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  Total URLs checked: ${allResults.length}`);
    console.log(`  ${chalk.green('✅ Successful:')} ${successCount}`);
    if (failCount > 0) {
      console.log(`  ${chalk.red('❌ Failed:')} ${failCount}`);
    }
    console.log(`  ${chalk.yellow('⚠️  Total issues:')} ${totalIssues}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.gray(`\n📁 Results saved to: ${runFolder}\n`));

    // Exit code based on results
    if (failCount > 0) {
      process.exit(1);
    } else if (totalIssues > 0) {
      process.exit(2); // Issues found but no failures
    } else {
      process.exit(0); // All good
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error.message);
    console.error(error.stack);
    process.exit(3);
  } finally {
    await browser.close();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, checkUrl, CONFIG };