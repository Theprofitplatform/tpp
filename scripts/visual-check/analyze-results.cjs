#!/usr/bin/env node

/**
 * Test Results Analysis Script
 *
 * Provides comprehensive analysis of Playwright test results:
 * 1. Categorizes failures by type
 * 2. Identifies patterns and trends
 * 3. Suggests specific improvements
 * 4. Generates actionable recommendations
 */

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, 'test-results/results.json');
const OUTPUT_PATH = path.join(__dirname, 'analysis-report.json');

function analyzeResults() {
  console.log('📊 Analyzing test results...\n');

  // Load test results
  let results;
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  } catch (err) {
    console.error('❌ Could not load test results:', err.message);
    return null;
  }

  const { suites, stats } = results;

  // Initialize analysis
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      total: stats.expected + stats.unexpected + stats.flaky,
      passed: stats.expected,
      failed: stats.unexpected,
      flaky: stats.flaky,
      duration: stats.duration,
      successRate: ((stats.expected / (stats.expected + stats.unexpected + stats.flaky)) * 100).toFixed(2) + '%'
    },
    failures: {
      byCategory: {},
      byPage: {},
      details: []
    },
    improvements: [],
    recommendations: []
  };

  // Categorize failures
  const categories = {
    'HTTP Status': [],
    'HTML Elements': [],
    'CSS Loading': [],
    'JavaScript Loading': [],
    'Other': []
  };

  const pageFailures = {};

  // Traverse test results
  function processSpecs(specs, suiteName) {
    specs.forEach(spec => {
      spec.tests.forEach(test => {
        test.results.forEach(result => {
          if (result.status === 'failed' || result.status === 'timedOut') {
            const failure = {
              title: spec.title,
              suite: suiteName,
              status: result.status,
              duration: result.duration,
              error: result.errors[0]?.message || 'Unknown error'
            };

            // Categorize
            if (suiteName.includes('HTTP Status')) {
              categories['HTTP Status'].push(failure);
            } else if (suiteName.includes('HTML Elements')) {
              categories['HTML Elements'].push(failure);
            } else if (suiteName.includes('CSS')) {
              categories['CSS Loading'].push(failure);
            } else if (suiteName.includes('JavaScript')) {
              categories['JavaScript Loading'].push(failure);
            } else {
              categories['Other'].push(failure);
            }

            // Track by page
            const pageMatch = spec.title.match(/(\w+)\s+page/);
            if (pageMatch) {
              const pageName = pageMatch[1];
              if (!pageFailures[pageName]) {
                pageFailures[pageName] = [];
              }
              pageFailures[pageName].push(failure);
            }

            analysis.failures.details.push(failure);
          }
        });
      });
    });
  }

  suites.forEach(suite => {
    if (suite.specs) {
      processSpecs(suite.specs, suite.title);
    }
    if (suite.suites) {
      suite.suites.forEach(subsuite => {
        if (subsuite.specs) {
          processSpecs(subsuite.specs, subsuite.title);
        }
      });
    }
  });

  analysis.failures.byCategory = categories;
  analysis.failures.byPage = pageFailures;

  // Generate improvements and recommendations

  // CSS failures
  if (categories['CSS Loading'].length > 0) {
    analysis.improvements.push({
      category: 'CSS Loading',
      priority: 'HIGH',
      issue: `${categories['CSS Loading'].length} CSS files are not loading correctly`,
      affectedFiles: categories['CSS Loading'].map(f => f.title),
      suggestions: [
        'Check if CSS files exist at the specified paths',
        'Verify CSS files are properly deployed',
        'Check for 404 errors in browser network tab',
        'Ensure CSS file paths are correct in HTML',
        'Consider using CSS bundling to reduce requests'
      ]
    });

    analysis.recommendations.push('Fix CSS file loading issues - this affects page styling and user experience');
  }

  // JS failures
  if (categories['JavaScript Loading'].length > 0) {
    analysis.improvements.push({
      category: 'JavaScript Loading',
      priority: 'HIGH',
      issue: `${categories['JavaScript Loading'].length} JavaScript files are not loading correctly`,
      affectedFiles: categories['JavaScript Loading'].map(f => f.title),
      suggestions: [
        'Check if JS files exist at the specified paths',
        'Verify JavaScript files are properly deployed',
        'Check for 404 errors in browser network tab',
        'Ensure JS file paths are correct in HTML',
        'Consider using JS bundling and minification'
      ]
    });

    analysis.recommendations.push('Fix JavaScript file loading - this may break site functionality');
  }

  // HTML element failures
  if (categories['HTML Elements'].length > 0) {
    const h1Failures = categories['HTML Elements'].filter(f => f.title.includes('<h1>'));
    const mainFailures = categories['HTML Elements'].filter(f => f.title.includes('<main>'));

    if (h1Failures.length > 0) {
      analysis.improvements.push({
        category: 'SEO & Accessibility',
        priority: 'MEDIUM',
        issue: `${h1Failures.length} pages are missing <h1> elements`,
        affectedPages: h1Failures.map(f => f.title),
        suggestions: [
          'Add an <h1> element to each page for SEO',
          'Ensure <h1> contains the main page title',
          'Only use one <h1> per page',
          'Make <h1> visible and meaningful'
        ]
      });

      analysis.recommendations.push('Add <h1> elements to improve SEO and accessibility');
    }

    if (mainFailures.length > 0) {
      analysis.improvements.push({
        category: 'Accessibility',
        priority: 'MEDIUM',
        issue: `${mainFailures.length} pages are missing <main> elements`,
        affectedPages: mainFailures.map(f => f.title),
        suggestions: [
          'Add a <main> element to wrap primary content',
          'Helps screen readers navigate page structure',
          'Improves semantic HTML structure',
          'Required for WCAG compliance'
        ]
      });

      analysis.recommendations.push('Add <main> elements for better accessibility');
    }
  }

  // HTTP status failures
  if (categories['HTTP Status'].length > 0) {
    analysis.improvements.push({
      category: 'HTTP Errors',
      priority: 'CRITICAL',
      issue: `${categories['HTTP Status'].length} pages are returning non-200 status codes`,
      affectedPages: categories['HTTP Status'].map(f => f.title),
      suggestions: [
        'Check server logs for errors',
        'Verify pages are deployed correctly',
        'Check for routing issues',
        'Ensure database connectivity',
        'Review recent deployments'
      ]
    });

    analysis.recommendations.push('Fix HTTP errors immediately - pages are not accessible');
  }

  // Page-specific recommendations
  Object.keys(pageFailures).forEach(page => {
    const failures = pageFailures[page];
    if (failures.length >= 3) {
      analysis.recommendations.push(`Page "${page}" has ${failures.length} failures - needs immediate attention`);
    }
  });

  // Overall health
  const successRate = parseFloat(analysis.summary.successRate);
  if (successRate < 70) {
    analysis.recommendations.unshift('⚠️ CRITICAL: Success rate below 70% - immediate action required');
  } else if (successRate < 85) {
    analysis.recommendations.unshift('⚠️ WARNING: Success rate below 85% - attention needed');
  } else if (successRate >= 95) {
    analysis.recommendations.unshift('✅ Site health is excellent - minor fixes only');
  }

  // Save analysis
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(analysis, null, 2));

  // Console output
  console.log('📈 Analysis Summary:');
  console.log(`   Success Rate: ${analysis.summary.successRate}`);
  console.log(`   Passed: ${analysis.summary.passed}`);
  console.log(`   Failed: ${analysis.summary.failed}`);
  console.log(`   Flaky: ${analysis.summary.flaky}`);
  console.log(`   Duration: ${(analysis.summary.duration / 1000).toFixed(2)}s`);

  console.log('\n🔍 Failures by Category:');
  Object.keys(categories).forEach(cat => {
    if (categories[cat].length > 0) {
      console.log(`   ${cat}: ${categories[cat].length} failures`);
    }
  });

  console.log('\n💡 Top Recommendations:');
  analysis.recommendations.slice(0, 5).forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  console.log(`\n💾 Analysis saved to: ${OUTPUT_PATH}`);

  return analysis;
}

// Run if called directly
if (require.main === module) {
  try {
    analyzeResults();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

module.exports = { analyzeResults };
