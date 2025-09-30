/**
 * Report Generation Module
 *
 * Generates comprehensive reports in JSON and Markdown formats
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/**
 * Generate report in specified format(s)
 */
export async function generateReport(results, outputDir, format) {
  const reports = [];

  if (format === 'json' || format === 'both') {
    const jsonPath = await generateJsonReport(results, outputDir);
    reports.push({ type: 'JSON', path: jsonPath });
  }

  if (format === 'markdown' || format === 'both') {
    const mdPath = await generateMarkdownReport(results, outputDir);
    reports.push({ type: 'Markdown', path: mdPath });
  }

  reports.forEach(report => {
    console.log(chalk.green(`  ✅ ${report.type} report: ${report.path}`));
  });

  return reports;
}

/**
 * Generate JSON report
 */
async function generateJsonReport(results, outputDir) {
  const reportPath = path.join(outputDir, 'report.json');

  const report = {
    meta: {
      timestamp: new Date().toISOString(),
      totalUrls: results.length,
      successCount: results.filter(r => r.success).length,
      failCount: results.filter(r => !r.success).length
    },
    results: results
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

/**
 * Generate Markdown report
 */
async function generateMarkdownReport(results, outputDir) {
  const reportPath = path.join(outputDir, 'report.md');

  let markdown = '# Visual Frontend Check Report\n\n';
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;

  // Summary
  const totalUrls = results.length;
  const successCount = results.filter(r => r.success).length;
  const failCount = totalUrls - successCount;
  const totalIssues = results.reduce((sum, r) => {
    return sum + r.viewportResults.reduce((vSum, vr) => {
      return vSum + (vr.issues ? Object.values(vr.issues).flat().length : 0);
    }, 0);
  }, 0);

  markdown += '## 📊 Summary\n\n';
  markdown += `- **Total URLs Checked:** ${totalUrls}\n`;
  markdown += `- **Successful:** ${successCount} ✅\n`;
  if (failCount > 0) {
    markdown += `- **Failed:** ${failCount} ❌\n`;
  }
  markdown += `- **Total Issues Found:** ${totalIssues}\n\n`;

  // Detailed results
  markdown += '## 📝 Detailed Results\n\n';

  results.forEach((result, index) => {
    markdown += `### ${index + 1}. ${result.name}\n\n`;
    markdown += `**URL:** ${result.url}\n\n`;
    markdown += `**Status:** ${result.success ? '✅ Success' : '❌ Failed'}\n\n`;

    if (result.totalLoadTime) {
      markdown += `**Total Load Time:** ${result.totalLoadTime}ms\n\n`;
    }

    if (result.error) {
      markdown += `**Error:** ${result.error}\n\n`;
    }

    // Viewport results
    if (result.viewportResults && result.viewportResults.length > 0) {
      markdown += '#### Viewports\n\n';

      result.viewportResults.forEach(vr => {
        markdown += `##### ${vr.viewport} (${vr.dimensions})\n\n`;

        if (vr.error) {
          markdown += `⚠️ **Error:** ${vr.error}\n\n`;
        } else {
          markdown += `- **HTTP Status:** ${vr.status}\n`;

          if (vr.screenshots) {
            markdown += `- **Screenshots:**\n`;
            markdown += `  - Full page: \`${path.relative(outputDir, vr.screenshots.fullPage)}\`\n`;
            markdown += `  - Viewport: \`${path.relative(outputDir, vr.screenshots.viewport)}\`\n`;
          }

          // Issues
          if (vr.issues) {
            const issueCount = Object.values(vr.issues).flat().length;
            markdown += `- **Issues Found:** ${issueCount}\n\n`;

            if (issueCount > 0) {
              markdown += formatIssues(vr.issues);
            }
          }
        }

        markdown += '\n';
      });
    }

    markdown += '---\n\n';
  });

  // Exit codes explanation
  markdown += '## 📌 Exit Codes\n\n';
  markdown += '- `0` - All checks passed, no issues found\n';
  markdown += '- `1` - One or more checks failed\n';
  markdown += '- `2` - All checks passed but issues were detected\n';
  markdown += '- `3` - Fatal error occurred\n\n';

  await fs.writeFile(reportPath, markdown);
  return reportPath;
}

/**
 * Format issues for markdown
 */
function formatIssues(issues) {
  let output = '';

  if (issues.missingAssets && issues.missingAssets.length > 0) {
    output += '**Missing Assets (404s):**\n\n';
    issues.missingAssets.slice(0, 5).forEach(asset => {
      output += `- ${asset.type}: \`${asset.name}\`\n`;
    });
    if (issues.missingAssets.length > 5) {
      output += `- *...and ${issues.missingAssets.length - 5} more*\n`;
    }
    output += '\n';
  }

  if (issues.cssIssues && issues.cssIssues.length > 0) {
    output += '**CSS Issues:**\n\n';
    issues.cssIssues.forEach(issue => {
      output += `- **${issue.type}**: ${issue.message || issue.href || 'See details'}\n`;
      if (issue.ratio) output += `  - Ratio: ${issue.ratio}\n`;
      if (issue.styledElements !== undefined) output += `  - Styled elements: ${issue.styledElements}\n`;
    });
    output += '\n';
  }

  if (issues.fontIssues && issues.fontIssues.length > 0) {
    output += '**Font Issues:**\n\n';
    issues.fontIssues.forEach(issue => {
      output += `- **${issue.type}**: ${issue.message || ''}\n`;
      if (issue.fonts) output += `  - Fonts: ${issue.fonts.join(', ')}\n`;
      if (issue.count) output += `  - Count: ${issue.count}\n`;
    });
    output += '\n';
  }

  if (issues.layoutIssues && issues.layoutIssues.length > 0) {
    output += '**Layout Issues:**\n\n';
    issues.layoutIssues.forEach(issue => {
      output += `- **${issue.type}**: ${issue.message || ''}\n`;
      if (issue.count) output += `  - Count: ${issue.count}\n`;
      if (issue.element) output += `  - Element: ${issue.element}\n`;
      if (issue.elements && issue.elements.length > 0) {
        output += `  - Examples: ${issue.elements.slice(0, 3).map(e => e.tag || e.src || 'unknown').join(', ')}\n`;
      }
    });
    output += '\n';
  }

  if (issues.consoleErrors && issues.consoleErrors.length > 0) {
    output += '**Console Errors:**\n\n';
    issues.consoleErrors.slice(0, 5).forEach(error => {
      output += `- ${error.message}\n`;
    });
    if (issues.consoleErrors.length > 5) {
      output += `- *...and ${issues.consoleErrors.length - 5} more*\n`;
    }
    output += '\n';
  }

  if (issues.httpErrors && issues.httpErrors.length > 0) {
    output += '**HTTP Errors:**\n\n';
    issues.httpErrors.forEach(error => {
      output += `- **${error.status}** ${error.type}: \`${error.url}\`\n`;
    });
    output += '\n';
  }

  return output;
}

/**
 * Generate summary statistics
 */
export function generateSummaryStats(results) {
  const stats = {
    total: results.length,
    success: 0,
    failed: 0,
    totalIssues: 0,
    issuesByType: {},
    avgLoadTime: 0
  };

  let totalLoadTime = 0;

  results.forEach(result => {
    if (result.success) {
      stats.success++;
    } else {
      stats.failed++;
    }

    if (result.totalLoadTime) {
      totalLoadTime += result.totalLoadTime;
    }

    result.viewportResults.forEach(vr => {
      if (vr.issues) {
        Object.entries(vr.issues).forEach(([type, issueList]) => {
          stats.totalIssues += issueList.length;
          stats.issuesByType[type] = (stats.issuesByType[type] || 0) + issueList.length;
        });
      }
    });
  });

  stats.avgLoadTime = results.length > 0 ? Math.round(totalLoadTime / results.length) : 0;

  return stats;
}