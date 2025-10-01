/**
 * Dynamic Data Reader Module
 *
 * Reads actual run data from various sources:
 * - logs/summary.json
 * - screenshots directories
 * - visual-checks reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Get the latest run data from summary.json
 */
export function getLatestRun() {
  const summaryPath = path.join(rootDir, 'logs/summary.json');

  if (!fs.existsSync(summaryPath)) {
    throw new Error('summary.json not found');
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

  if (!Array.isArray(summary) || summary.length === 0) {
    throw new Error('No runs found in summary.json');
  }

  return summary[summary.length - 1];
}

/**
 * Get trend data (last N runs)
 */
export function getTrendData(count = 5) {
  const summaryPath = path.join(rootDir, 'logs/summary.json');

  if (!fs.existsSync(summaryPath)) {
    return [];
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

  // Return last N runs
  return summary.slice(-count);
}

/**
 * Find the screenshots directory for a given timestamp
 */
export function findScreenshotsDir(timestamp) {
  const screenshotsRoot = path.join(rootDir, 'screenshots');

  // Convert timestamp to directory format
  // 2025-10-01T15:00:00.717Z -> run-2025-10-01T15-00-00
  const date = new Date(timestamp);
  const dirName = `run-${date.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', 'T').slice(0, 10)}T${date.toISOString().slice(11, 19).replace(/:/g, '-')}`;

  // Find matching directory (may have different precision)
  const dirs = fs.readdirSync(screenshotsRoot);
  const matchingDir = dirs.find(dir => {
    const dirTimestamp = dir.replace('run-', '').replace(/-/g, ':').replace('T', 'T');
    const dirDate = new Date(dirTimestamp.replace(/:/g, '-').slice(0, 10) + 'T' + dirTimestamp.slice(11).replace(/-/g, ':'));

    // Match if within 1 minute
    return Math.abs(dirDate - date) < 60000;
  });

  if (matchingDir) {
    return path.join(screenshotsRoot, matchingDir);
  }

  // If no exact match, return the most recent directory
  const sortedDirs = dirs
    .filter(d => d.startsWith('run-'))
    .sort()
    .reverse();

  return sortedDirs.length > 0 ? path.join(screenshotsRoot, sortedDirs[0]) : null;
}

/**
 * Get list of pages scanned from screenshots directory
 */
export function getScannedPages(screenshotsDir) {
  if (!fs.existsSync(screenshotsDir)) {
    return [];
  }

  const pages = [];
  const entries = fs.readdirSync(screenshotsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('_')) {
      // Extract page name from directory name
      const pageName = entry.name === '_' ? '/' : entry.name.slice(1);

      // Get subdirectories (should contain site name)
      const pagePath = path.join(screenshotsDir, entry.name);
      const subDirs = fs.readdirSync(pagePath, { withFileTypes: true });

      for (const subDir of subDirs) {
        if (subDir.isDirectory()) {
          const sitePath = path.join(pagePath, subDir.name);

          // Check for mobile and desktop directories
          const viewports = fs.readdirSync(sitePath, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

          pages.push({
            name: pageName,
            path: sitePath,
            viewports: viewports,
            screenshotCount: viewports.length * 2 // full-page + viewport for each
          });
        }
      }
    }
  }

  return pages;
}

/**
 * Count total screenshots in directory
 */
export function countScreenshots(screenshotsDir) {
  if (!fs.existsSync(screenshotsDir)) {
    return 0;
  }

  let count = 0;

  function countRecursive(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        countRecursive(fullPath);
      } else if (entry.name.endsWith('.png')) {
        count++;
      }
    }
  }

  countRecursive(screenshotsDir);
  return count;
}

/**
 * Load production URLs configuration
 */
export function getProductionUrls() {
  const urlsPath = path.join(rootDir, 'production-urls.json');

  if (!fs.existsSync(urlsPath)) {
    return [];
  }

  const data = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
  return data.urls || [];
}

/**
 * Get complete run data with all context
 */
export function getCompleteRunData() {
  const latestRun = getLatestRun();
  const screenshotsDir = findScreenshotsDir(latestRun.timestamp);
  const pages = getScannedPages(screenshotsDir);
  const screenshotCount = countScreenshots(screenshotsDir);
  const trendData = getTrendData(5);
  const productionUrls = getProductionUrls();

  // Extract domain from first URL
  const domain = productionUrls.length > 0
    ? new URL(productionUrls[0].url).hostname
    : 'unknown';

  return {
    latestRun,
    screenshotsDir,
    pages,
    screenshotCount,
    trendData,
    productionUrls,
    domain
  };
}
