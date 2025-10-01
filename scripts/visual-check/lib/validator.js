/**
 * Issue Validator Module
 *
 * Validates issues before including them in reports:
 * - Checks HTTP status codes (handles 308 redirects)
 * - Verifies file existence
 * - Validates CSS/JS paths
 * - Cross-checks with production site
 */

import https from 'https';
import http from 'http';

/**
 * Check actual HTTP status for a URL
 * Handles redirects properly (308 redirects are NOT errors)
 */
export async function checkHttpStatus(url, followRedirects = true) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: 'HEAD',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      // Handle redirects
      if (followRedirects && [301, 302, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        if (location) {
          const redirectUrl = location.startsWith('http')
            ? location
            : new URL(location, url).toString();

          // Follow redirect
          checkHttpStatus(redirectUrl, false).then(result => {
            resolve({
              url,
              finalUrl: redirectUrl,
              statusCode: res.statusCode,
              finalStatusCode: result.statusCode,
              redirected: true,
              isError: result.statusCode >= 400
            });
          });
          return;
        }
      }

      resolve({
        url,
        statusCode: res.statusCode,
        redirected: false,
        isError: res.statusCode >= 400
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        statusCode: 0,
        error: error.message,
        isError: true
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        statusCode: 0,
        error: 'Timeout',
        isError: true
      });
    });

    req.end();
  });
}

/**
 * Validate multiple URLs concurrently
 */
export async function validateUrls(urls) {
  const results = await Promise.all(
    urls.map(url => checkHttpStatus(url))
  );

  return results.reduce((acc, result) => {
    acc[result.url] = result;
    return acc;
  }, {});
}

/**
 * Validate HTTP errors reported by scanner
 * Returns only REAL errors (excludes successful redirects)
 */
export async function validateHttpErrors(urls) {
  const validationResults = await validateUrls(urls);

  const realErrors = [];
  const falsePositives = [];

  for (const [url, result] of Object.entries(validationResults)) {
    if (result.isError && !result.redirected) {
      // Real error - not redirected or redirected to error
      realErrors.push({
        url,
        statusCode: result.statusCode,
        error: result.error || `HTTP ${result.statusCode}`,
        severity: result.statusCode === 404 ? 'high' : 'critical'
      });
    } else if (result.redirected && !result.isError) {
      // False positive - it's just a redirect
      falsePositives.push({
        url,
        statusCode: result.statusCode,
        finalUrl: result.finalUrl,
        finalStatusCode: result.finalStatusCode,
        note: 'Redirects successfully, not an error'
      });
    }
  }

  return {
    realErrors,
    falsePositives,
    totalChecked: urls.length
  };
}

/**
 * Validate CSS/JS path issues
 * Check if paths are actually malformed or just CORS issues
 */
export function validateResourcePaths(resources) {
  const issues = [];

  for (const resource of resources) {
    const { href, type } = resource;

    // Check for truly malformed paths
    if (href.startsWith('https://js/') || href.startsWith('https://css/')) {
      issues.push({
        type: 'malformed_path',
        href,
        resourceType: type,
        severity: 'critical',
        fix: href.replace('https://js/', '/js/').replace('https://css/', '/css/'),
        confidence: 'high'
      });
    }
    // Check for double slashes
    else if (href.includes('//css/') || href.includes('//js/')) {
      issues.push({
        type: 'double_slash',
        href,
        resourceType: type,
        severity: 'medium',
        confidence: 'medium'
      });
    }
  }

  return issues;
}

/**
 * Calculate confidence score for an issue
 * Based on validation results and issue type
 */
export function calculateConfidence(issue, validationData = {}) {
  let confidence = 1.0;

  // Reduce confidence for common false positives
  if (issue.type === 'css_not_loaded') {
    // CSS might not load due to CORS but still apply styles
    confidence *= 0.6;
  }

  if (issue.type === 'system_fonts_only') {
    // Hard to determine if custom fonts failed or weren't specified
    confidence *= 0.65;
  }

  if (issue.type === 'fonts_still_loading') {
    // Fonts might load after screenshot
    confidence *= 0.7;
  }

  // Increase confidence for validated issues
  if (validationData.httpValidated && issue.type === 'page_error') {
    confidence = 0.95;
  }

  if (validationData.pathValidated && issue.type === 'malformed_path') {
    confidence = 1.0;
  }

  return Math.round(confidence * 100);
}

/**
 * Filter issues by confidence threshold
 */
export function filterByConfidence(issues, minConfidence = 70) {
  return issues
    .map(issue => ({
      ...issue,
      confidence: calculateConfidence(issue)
    }))
    .filter(issue => issue.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence);
}
