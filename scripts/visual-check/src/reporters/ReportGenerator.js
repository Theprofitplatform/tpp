/**
 * ReportGenerator - Creates comprehensive reports
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export class ReportGenerator {
  constructor(config) {
    this.config = config;
  }

  async generateReports(results) {
    logger.info('Generating reports...');

    const reportDir = path.join(this.config.paths.reports, results.runId);
    await fs.mkdir(reportDir, { recursive: true });

    // Generate JSON report
    await this.generateJsonReport(results, reportDir);

    // Generate Markdown report
    await this.generateMarkdownReport(results, reportDir);

    // Generate summary
    await this.generateSummary(results);

    logger.success(`Reports generated in ${reportDir}`);
  }

  async generateJsonReport(results, reportDir) {
    const jsonPath = path.join(reportDir, 'results.json');
    await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));
    logger.debug('JSON report created');
  }

  async generateMarkdownReport(results, reportDir) {
    const mdPath = path.join(reportDir, 'report.md');

    let md = `# Visual Quality Report\n\n`;
    md += `**Run ID:** ${results.runId}\n`;
    md += `**Timestamp:** ${new Date(results.timestamp).toLocaleString()}\n`;
    md += `**URL:** ${results.url}\n`;
    md += `**Status:** ${results.summary.status}\n\n`;

    md += `## Summary\n\n`;
    md += `- **Total Issues:** ${results.summary.totalIssues}\n`;
    md += `- **Total Fixes:** ${results.summary.totalFixes}\n`;
    md += `- **Viewports Tested:** ${results.summary.viewportsTested}\n\n`;

    if (results.summary.totalIssues > 0) {
      md += `### Issues by Severity\n\n`;
      for (const [severity, count] of Object.entries(results.summary.issuesBySeverity)) {
        md += `- **${severity}:** ${count}\n`;
      }
      md += `\n`;

      md += `### Issues by Category\n\n`;
      for (const [category, count] of Object.entries(results.summary.issuesByCategory)) {
        md += `- **${category}:** ${count}\n`;
      }
      md += `\n`;
    }

    md += `## Detailed Results\n\n`;

    for (const viewport of results.viewports) {
      md += `### ${viewport.name} (${viewport.data.viewport.width}x${viewport.data.viewport.height})\n\n`;

      if (viewport.issues.length > 0) {
        md += `#### Issues Found: ${viewport.issues.length}\n\n`;

        const issuesByCategory = viewport.issues.reduce((acc, issue) => {
          if (!acc[issue.category]) acc[issue.category] = [];
          acc[issue.category].push(issue);
          return acc;
        }, {});

        for (const [category, issues] of Object.entries(issuesByCategory)) {
          md += `**${category.toUpperCase()}**\n\n`;
          issues.forEach((issue, idx) => {
            md += `${idx + 1}. **[${issue.severity.toUpperCase()}]** ${issue.message}\n`;
            md += `   - Type: ${issue.type}\n`;
            if (issue.selector) md += `   - Selector: \`${issue.selector}\`\n`;
            md += `\n`;
          });
        }
      } else {
        md += `✅ No issues found\n\n`;
      }

      if (viewport.fixes.length > 0) {
        md += `#### Suggested Fixes: ${viewport.fixes.length}\n\n`;

        viewport.fixes.forEach((fix, idx) => {
          md += `${idx + 1}. **${fix.description}**\n`;
          md += `   - Confidence: ${(fix.confidence * 100).toFixed(0)}%\n`;
          md += `   - File: \`${fix.filePath}\`\n`;
          md += `   - Type: ${fix.type}\n`;

          if (fix.instructions && fix.instructions.length > 0) {
            md += `   - Instructions:\n`;
            fix.instructions.forEach(instruction => {
              md += `     ${instruction}\n`;
            });
          }
          md += `\n`;
        });
      }

      md += `---\n\n`;
    }

    md += `## Screenshots\n\n`;
    for (const viewport of results.viewports) {
      if (viewport.data.screenshot) {
        md += `### ${viewport.name}\n`;
        md += `![${viewport.name}](${viewport.data.screenshot})\n\n`;
      }
    }

    await fs.writeFile(mdPath, md);
    logger.debug('Markdown report created');
  }

  async generateSummary(results) {
    const summaryPath = path.join(this.config.paths.reports, 'summary.md');

    // Load previous runs
    let previousRuns = [];
    try {
      const content = await fs.readFile(summaryPath, 'utf-8');
      const match = content.match(/## Recent Runs\n\n([\s\S]*)/);
      if (match) {
        previousRuns = match[1].split('\n').filter(line => line.trim()).slice(0, 9);
      }
    } catch (error) {
      // File doesn't exist yet
    }

    let summary = `# Visual Quality Monitoring - Summary\n\n`;
    summary += `**Last Updated:** ${new Date().toLocaleString()}\n`;
    summary += `**URL:** ${results.url}\n\n`;

    summary += `## Latest Run\n\n`;
    summary += `- **Run ID:** ${results.runId}\n`;
    summary += `- **Timestamp:** ${new Date(results.timestamp).toLocaleString()}\n`;
    summary += `- **Status:** ${results.summary.status === 'PASS' ? '✅ PASS' : '⚠️ ISSUES FOUND'}\n`;
    summary += `- **Total Issues:** ${results.summary.totalIssues}\n`;
    summary += `- **Total Fixes:** ${results.summary.totalFixes}\n`;
    summary += `- **Report:** [View Full Report](${results.runId}/report.md)\n\n`;

    if (results.summary.totalIssues > 0) {
      summary += `### Quick Overview\n\n`;
      summary += `**By Severity:**\n`;
      for (const [severity, count] of Object.entries(results.summary.issuesBySeverity)) {
        const emoji = severity === 'error' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
        summary += `- ${emoji} ${severity}: ${count}\n`;
      }
      summary += `\n`;

      summary += `**By Category:**\n`;
      for (const [category, count] of Object.entries(results.summary.issuesByCategory)) {
        summary += `- ${category}: ${count}\n`;
      }
      summary += `\n`;
    }

    summary += `## Recent Runs\n\n`;
    const currentRun = `- **${new Date(results.timestamp).toLocaleString()}** - ${results.summary.status} (${results.summary.totalIssues} issues) - [Report](${results.runId}/report.md)`;
    summary += currentRun + '\n';
    summary += previousRuns.join('\n');

    await fs.writeFile(summaryPath, summary);
    logger.debug('Summary updated');
  }
}
