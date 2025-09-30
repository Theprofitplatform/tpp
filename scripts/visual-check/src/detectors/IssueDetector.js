/**
 * IssueDetector - Analyzes inspection data to identify issues
 */

import { logger } from '../utils/logger.js';

export class IssueDetector {
  constructor(config) {
    this.config = config;
  }

  async analyze(viewportData) {
    const issues = [];

    // Analyze elements
    issues.push(...this.analyzeElements(viewportData.elements, viewportData.viewport));

    // Analyze CSS
    issues.push(...this.analyzeCss(viewportData.css, viewportData.viewport));

    // Analyze performance
    issues.push(...this.analyzePerformance(viewportData.performance, viewportData.viewport));

    // Analyze accessibility
    issues.push(...this.analyzeAccessibility(viewportData.accessibility, viewportData.viewport));

    // Analyze console errors
    issues.push(...this.analyzeConsole(viewportData.console, viewportData.viewport));

    // Analyze network errors
    issues.push(...this.analyzeNetwork(viewportData.network, viewportData.viewport));

    // Add metadata
    issues.forEach(issue => {
      issue.id = this.generateIssueId(issue);
      issue.timestamp = viewportData.timestamp;
      issue.viewport = viewportData.viewport.name;
    });

    logger.debug(`Detected ${issues.length} issues in ${viewportData.viewport.name}`);
    return issues;
  }

  analyzeElements(elementIssues, viewport) {
    return elementIssues.map(issue => ({
      category: 'layout',
      severity: this.determineSeverity(issue.type),
      type: issue.type,
      element: issue.element,
      selector: issue.selector,
      message: issue.message,
      details: issue
    }));
  }

  analyzeCss(cssIssues, viewport) {
    return cssIssues.map(issue => ({
      category: 'styling',
      severity: this.determineSeverity(issue.type),
      type: issue.type,
      selector: issue.selector,
      message: issue.message,
      details: issue
    }));
  }

  analyzePerformance(performanceData, viewport) {
    const issues = [];
    const thresholds = this.config.detectionThresholds;

    if (performanceData.firstContentfulPaint > 3000) {
      issues.push({
        category: 'performance',
        severity: 'warning',
        type: 'slow-fcp',
        message: `First Contentful Paint is slow: ${performanceData.firstContentfulPaint}ms`,
        details: performanceData
      });
    }

    if (performanceData.loadComplete > 5000) {
      issues.push({
        category: 'performance',
        severity: 'warning',
        type: 'slow-load',
        message: `Page load is slow: ${performanceData.loadComplete}ms`,
        details: performanceData
      });
    }

    if (performanceData.resourceCount > 100) {
      issues.push({
        category: 'performance',
        severity: 'info',
        type: 'high-resource-count',
        message: `High number of resources: ${performanceData.resourceCount}`,
        details: performanceData
      });
    }

    return issues;
  }

  analyzeAccessibility(a11yIssues, viewport) {
    return a11yIssues.map(issue => ({
      category: 'accessibility',
      severity: this.determineSeverity(issue.type),
      type: issue.type,
      element: issue.element,
      selector: issue.selector,
      message: issue.message,
      details: issue
    }));
  }

  analyzeConsole(consoleMessages, viewport) {
    const issues = [];

    consoleMessages.forEach(msg => {
      if (msg.type === 'error') {
        issues.push({
          category: 'javascript',
          severity: 'error',
          type: 'console-error',
          message: msg.text,
          details: msg
        });
      } else if (msg.type === 'warning') {
        issues.push({
          category: 'javascript',
          severity: 'warning',
          type: 'console-warning',
          message: msg.text,
          details: msg
        });
      }
    });

    return issues;
  }

  analyzeNetwork(networkErrors, viewport) {
    return networkErrors.map(error => ({
      category: 'network',
      severity: 'error',
      type: 'request-failed',
      message: `Failed to load: ${error.url}`,
      details: error
    }));
  }

  determineSeverity(issueType) {
    const severityMap = {
      'broken-image': 'error',
      'missing-src': 'error',
      'empty-link': 'warning',
      'missing-alt': 'warning',
      'zero-dimensions': 'warning',
      'horizontal-overflow': 'error',
      'font-fallback': 'info',
      'low-contrast': 'warning',
      'missing-label': 'error',
      'missing-form-label': 'error',
      'heading-hierarchy': 'warning'
    };

    return severityMap[issueType] || 'info';
  }

  generateIssueId(issue) {
    const str = `${issue.category}-${issue.type}-${issue.selector || 'general'}`;
    return str.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }
}
