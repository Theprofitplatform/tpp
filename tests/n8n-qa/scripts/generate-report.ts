#!/usr/bin/env tsx
/**
 * Test Report Generator
 * Generates comprehensive Markdown test report from test results
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from '../src/lib/config.js';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface TestSuiteResult {
  name: string;
  tests: TestResult[];
  duration: number;
}

interface TestReport {
  testSuites: TestSuiteResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

async function generateReport() {
  console.log('📊 Generating test report...');

  // Read test results JSON
  const resultsPath = path.join(process.cwd(), 'test-results.json');

  let testData: any;
  try {
    const resultsContent = await fs.readFile(resultsPath, 'utf-8');
    testData = JSON.parse(resultsContent);
  } catch (error) {
    console.error('❌ Failed to read test-results.json:', error);
    console.log('⚠️  Generating empty report...');
    testData = { testResults: [] };
  }

  // Parse test results
  const report = parseTestResults(testData);

  // Generate Markdown report
  const markdown = generateMarkdown(report);

  // Write report to file
  const outputPath = path.join(process.cwd(), config.reporting.output);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, markdown, 'utf-8');

  console.log(`✅ Test report generated: ${outputPath}`);
  console.log('\n' + generateSummaryText(report.summary));
}

function parseTestResults(data: any): TestReport {
  const testSuites: TestSuiteResult[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let totalDuration = 0;

  if (data.testResults) {
    for (const suite of data.testResults) {
      const tests: TestResult[] = suite.assertionResults.map((test: any) => ({
        name: test.title,
        status: test.status,
        duration: test.duration || 0,
        error: test.failureMessages?.[0],
      }));

      testSuites.push({
        name: suite.name,
        tests,
        duration: suite.endTime - suite.startTime,
      });

      totalTests += tests.length;
      passedTests += tests.filter((t) => t.status === 'passed').length;
      failedTests += tests.filter((t) => t.status === 'failed').length;
      skippedTests += tests.filter((t) => t.status === 'skipped').length;
      totalDuration += suite.endTime - suite.startTime;
    }
  }

  return {
    testSuites,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      duration: totalDuration,
    },
  };
}

function generateMarkdown(report: TestReport): string {
  const { summary, testSuites } = report;
  const timestamp = new Date().toISOString();
  const passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;

  let md = `# n8n Test Report\n\n`;
  md += `**Generated:** ${timestamp}\n\n`;
  md += `---\n\n`;

  // Summary section
  md += `## 📊 Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${summary.total} |\n`;
  md += `| ✅ Passed | ${summary.passed} |\n`;
  md += `| ❌ Failed | ${summary.failed} |\n`;
  md += `| ⏭️  Skipped | ${summary.skipped} |\n`;
  md += `| Pass Rate | ${passRate.toFixed(1)}% |\n`;
  md += `| Duration | ${(summary.duration / 1000).toFixed(2)}s |\n`;
  md += `\n`;

  // Status badge
  const statusEmoji = summary.failed === 0 ? '✅' : '❌';
  const statusText = summary.failed === 0 ? 'PASSED' : 'FAILED';
  md += `### Status: ${statusEmoji} ${statusText}\n\n`;
  md += `---\n\n`;

  // Test suites section
  md += `## 🧪 Test Suites\n\n`;

  if (testSuites.length === 0) {
    md += `_No test suites found._\n\n`;
  } else {
    for (const suite of testSuites) {
      const suitePassed = suite.tests.filter((t) => t.status === 'passed').length;
      const suiteFailed = suite.tests.filter((t) => t.status === 'failed').length;
      const suiteStatus = suiteFailed === 0 ? '✅' : '❌';

      md += `### ${suiteStatus} ${path.basename(suite.name)}\n\n`;
      md += `**Duration:** ${(suite.duration / 1000).toFixed(2)}s | `;
      md += `**Passed:** ${suitePassed}/${suite.tests.length}\n\n`;

      // List tests
      for (const test of suite.tests) {
        const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️ ';
        md += `- ${icon} ${test.name} _(${test.duration}ms)_\n`;

        if (test.error) {
          md += `  \`\`\`\n`;
          md += `  ${test.error.split('\n').slice(0, 5).join('\n')}\n`;
          md += `  \`\`\`\n`;
        }
      }
      md += `\n`;
    }
  }

  md += `---\n\n`;

  // Recommendations section
  md += `## 💡 Recommendations\n\n`;

  if (summary.failed > 0) {
    md += `- ❌ **${summary.failed} test(s) failed** - Review failed tests above and fix issues\n`;
  }

  if (summary.skipped > 0) {
    md += `- ⚠️  **${summary.skipped} test(s) skipped** - Consider enabling or removing skipped tests\n`;
  }

  if (passRate < 100 && passRate >= 80) {
    md += `- ⚠️  **Pass rate is ${passRate.toFixed(1)}%** - Aim for 100% pass rate\n`;
  }

  if (passRate < 80) {
    md += `- 🚨 **Pass rate is critically low (${passRate.toFixed(1)}%)** - Urgent attention required\n`;
  }

  if (summary.duration > 60000) {
    md += `- ⏱️  **Tests took ${(summary.duration / 1000).toFixed(0)}s** - Consider optimizing slow tests\n`;
  }

  if (summary.failed === 0 && summary.skipped === 0) {
    md += `- ✅ **All tests passed!** - Great job! Consider adding more test coverage.\n`;
  }

  md += `\n`;

  // Footer
  md += `---\n\n`;
  md += `**n8n Instance:** ${config.n8n.apiBase}\n`;
  md += `**Report Generated by:** n8n QA Test Harness v1.0.0\n`;

  return md;
}

function generateSummaryText(summary: any): string {
  const passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;

  let text = '='.repeat(60) + '\n';
  text += '📊 TEST SUMMARY\n';
  text += '='.repeat(60) + '\n';
  text += `Total:   ${summary.total}\n`;
  text += `Passed:  ${summary.passed} ✅\n`;
  text += `Failed:  ${summary.failed} ${summary.failed > 0 ? '❌' : ''}\n`;
  text += `Skipped: ${summary.skipped}\n`;
  text += `Pass Rate: ${passRate.toFixed(1)}%\n`;
  text += `Duration: ${(summary.duration / 1000).toFixed(2)}s\n`;
  text += '='.repeat(60) + '\n';

  return text;
}

// Run report generation
generateReport().catch((error) => {
  console.error('❌ Report generation failed:', error);
  process.exit(1);
});
