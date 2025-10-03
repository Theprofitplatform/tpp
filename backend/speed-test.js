import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/**
 * Run Lighthouse performance test on a URL
 * @param {string} url - The URL to test
 * @param {object} options - Lighthouse options
 * @returns {Promise<object>} - Lighthouse results
 */
export async function runSpeedTest(url, options = {}) {
  let chrome;

  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!urlObj.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol. Must be http or https.');
    }

    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromePath: '/usr/bin/chromium-browser',
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ]
    });

    // Run Lighthouse
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      ...options
    });

    // Extract key metrics
    const { lhr } = runnerResult;

    const result = {
      url: lhr.finalUrl,
      fetchTime: lhr.fetchTime,
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100)
      },
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
        speedIndex: lhr.audits['speed-index'].numericValue,
        largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
        timeToInteractive: lhr.audits['interactive'].numericValue
      },
      opportunities: extractOpportunities(lhr),
      diagnostics: extractDiagnostics(lhr),
      rawData: lhr // Include full data for advanced users
    };

    return result;

  } catch (error) {
    console.error('Speed test error:', error);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Extract top performance opportunities from Lighthouse results
 */
function extractOpportunities(lhr) {
  const opportunities = [];

  const opportunityAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'duplicated-javascript',
    'legacy-javascript',
    'total-byte-weight'
  ];

  opportunityAudits.forEach(auditId => {
    const audit = lhr.audits[auditId];
    if (audit && audit.details && audit.details.overallSavingsMs > 100) {
      opportunities.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        savingsMs: Math.round(audit.details.overallSavingsMs),
        savingsBytes: audit.details.overallSavingsBytes || 0,
        score: audit.score
      });
    }
  });

  // Sort by potential savings
  return opportunities
    .sort((a, b) => b.savingsMs - a.savingsMs)
    .slice(0, 10); // Top 10
}

/**
 * Extract key diagnostics from Lighthouse results
 */
function extractDiagnostics(lhr) {
  const diagnostics = [];

  const diagnosticAudits = [
    'mainthread-work-breakdown',
    'bootup-time',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'dom-size',
    'critical-request-chains',
    'user-timings',
    'uses-rel-preconnect',
    'font-display',
    'third-party-summary'
  ];

  diagnosticAudits.forEach(auditId => {
    const audit = lhr.audits[auditId];
    if (audit && audit.score !== null && audit.score < 0.9) {
      diagnostics.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        displayValue: audit.displayValue || '',
        score: audit.score
      });
    }
  });

  return diagnostics.slice(0, 10); // Top 10
}

/**
 * Get performance grade based on score
 */
export function getPerformanceGrade(score) {
  if (score >= 90) return { grade: 'A', label: 'Excellent', color: '#10b981' };
  if (score >= 75) return { grade: 'B', label: 'Good', color: '#3b82f6' };
  if (score >= 60) return { grade: 'C', label: 'Fair', color: '#f59e0b' };
  if (score >= 40) return { grade: 'D', label: 'Poor', color: '#ef4444' };
  return { grade: 'F', label: 'Critical', color: '#991b1b' };
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export default { runSpeedTest, getPerformanceGrade, formatTime, formatBytes };
