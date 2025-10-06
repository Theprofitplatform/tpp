/**
 * Chart Auto-Generation System
 * Extracts statistics from blog content and generates Chart.js visualizations
 *
 * Week 2, Day 1-2: Visual Automation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Main chart generation function
 * @param {string} content - Blog post content
 * @param {Object} metadata - Post metadata
 * @returns {Object} Charts and updated content
 */
export async function generateCharts(content, metadata) {
  console.log('\n📊 Generating charts from statistics...');

  try {
    // Extract statistics from content
    const statistics = extractStatistics(content);

    if (statistics.length === 0) {
      console.log('   No statistics found for chart generation');
      return {
        charts: [],
        content: content,
        success: true
      };
    }

    console.log(`   Found ${statistics.length} statistics`);

    // Group statistics by type
    const chartGroups = groupStatisticsForCharts(statistics);

    // Generate charts
    const charts = [];
    let updatedContent = content;

    for (const group of chartGroups) {
      const chart = createChart(group, metadata);
      charts.push(chart);

      // Insert chart into content
      const beforeLength = updatedContent.length;
      updatedContent = insertChartIntoContent(updatedContent, chart, group);
      const afterLength = updatedContent.length;
      console.log(`   Chart ${chart.id} inserted: +${afterLength - beforeLength} chars`);
    }

    console.log(`   Generated ${charts.length} charts`);

    return {
      charts,
      content: updatedContent,
      success: true,
      statisticsFound: statistics.length
    };

  } catch (error) {
    console.error('❌ Chart generation failed:', error.message);
    return {
      charts: [],
      content: content,
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract statistics from content
 * Looks for: percentages, dollar amounts, multipliers, numbers with context
 */
function extractStatistics(content) {
  const statistics = [];
  const lines = content.split('\n');

  // Patterns for different statistic types
  const patterns = {
    percentage: /(\d+(?:\.\d+)?%)/g,
    currency: /\$[\d,]+(?:\.\d+)?/g,
    multiplier: /(\d+(?:\.\d+)?x)/g,
    largeNumber: /\b(\d{1,3}(?:,\d{3})+|\d{4,})\+?\b/g,
    improvement: /(\d+(?:\.\d+)?%)\s+(?:increase|improvement|gain|growth|boost)/gi,
    reduction: /(\d+(?:\.\d+)?%)\s+(?:decrease|reduction|drop|decline|lower)/gi
  };

  lines.forEach((line, index) => {
    // Skip headings, code blocks, and links
    if (line.match(/^#{1,6}\s/) || line.match(/^```/) || line.match(/^\[/)) {
      return;
    }

    // Extract each type of statistic
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = [...line.matchAll(pattern)];

      matches.forEach(match => {
        const value = match[0] || match[1];
        const context = line.trim();

        // Get surrounding context (up to 200 chars)
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(line.length, match.index + 100);
        const surroundingContext = line.substring(contextStart, contextEnd).trim();

        statistics.push({
          value: value.replace(/,/g, ''), // Remove commas for parsing
          displayValue: value,
          type,
          lineNumber: index + 1,
          context: surroundingContext,
          fullLine: context
        });
      });
    });
  });

  // Deduplicate and filter
  return deduplicateStatistics(statistics);
}

/**
 * Remove duplicate statistics
 */
function deduplicateStatistics(stats) {
  const seen = new Set();
  return stats.filter(stat => {
    const key = `${stat.value}-${stat.lineNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Group statistics into meaningful charts
 */
function groupStatisticsForCharts(statistics) {
  const groups = [];

  // Group 1: Before/After comparisons
  const beforeAfter = findBeforeAfterPairs(statistics);
  if (beforeAfter.length > 0) {
    groups.push({
      type: 'before-after',
      title: 'Performance Improvement',
      data: beforeAfter,
      chartType: 'bar'
    });
  }

  // Group 2: Key metrics (top 3-5 percentages or numbers)
  const keyMetrics = statistics
    .filter(s => s.type === 'percentage' || s.type === 'improvement')
    .slice(0, 5);

  if (keyMetrics.length >= 3) {
    groups.push({
      type: 'key-metrics',
      title: 'Key Statistics',
      data: keyMetrics,
      chartType: 'horizontalBar'
    });
  }

  // Group 3: Cost comparisons
  const costStats = statistics.filter(s => s.type === 'currency');
  if (costStats.length >= 2) {
    groups.push({
      type: 'cost-comparison',
      title: 'Cost Analysis',
      data: costStats.slice(0, 4),
      chartType: 'bar'
    });
  }

  return groups.slice(0, 2); // Limit to 2 charts per post
}

/**
 * Find before/after pairs in statistics
 */
function findBeforeAfterPairs(statistics) {
  const pairs = [];

  for (let i = 0; i < statistics.length - 1; i++) {
    const current = statistics[i];
    const next = statistics[i + 1];

    // Look for pairs close together (within 3 lines)
    if (Math.abs(current.lineNumber - next.lineNumber) <= 3) {
      // Check if context suggests before/after
      const combinedContext = (current.context + ' ' + next.context).toLowerCase();

      if (combinedContext.includes('before') ||
          combinedContext.includes('after') ||
          combinedContext.includes('from') ||
          combinedContext.includes('to') ||
          combinedContext.includes('increased') ||
          combinedContext.includes('improved')) {

        pairs.push({
          before: current,
          after: next,
          context: combinedContext
        });
      }
    }
  }

  return pairs;
}

/**
 * Create chart configuration
 */
function createChart(group, metadata) {
  const chartId = `chart-${group.type}-${Date.now()}`;

  let chartConfig = {
    id: chartId,
    type: group.type,
    title: group.title,
    chartType: group.chartType
  };

  if (group.type === 'before-after') {
    chartConfig.data = {
      labels: group.data.map((pair, i) => [`Metric ${i + 1}`, 'Before → After']),
      datasets: [{
        label: 'Before',
        data: group.data.map(pair => parseValue(pair.before.value)),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }, {
        label: 'After',
        data: group.data.map(pair => parseValue(pair.after.value)),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      }]
    };
  } else if (group.type === 'key-metrics') {
    chartConfig.data = {
      labels: group.data.map((stat, i) => shortenContext(stat.context, 40)),
      datasets: [{
        label: 'Value',
        data: group.data.map(stat => parseValue(stat.value)),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(251, 146, 60, 1)'
        ],
        borderWidth: 2
      }]
    };
  }

  return chartConfig;
}

/**
 * Parse statistic value to number
 */
function parseValue(value) {
  // Remove %, $, x, and commas
  const cleaned = value.replace(/[%$x,]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Shorten context string
 */
function shortenContext(context, maxLength) {
  if (context.length <= maxLength) return context;
  return context.substring(0, maxLength) + '...';
}

/**
 * Insert chart into content
 */
function insertChartIntoContent(content, chart, group) {
  // Find a good insertion point (after first occurrence of any statistic in the group)
  const firstStat = group.data[0];
  const statContext = firstStat.before ? firstStat.before.context : firstStat.context;

  // Find the line with this statistic
  const lines = content.split('\n');
  let insertionIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(statContext.substring(0, 50))) {
      insertionIndex = i + 1; // Insert after the paragraph
      break;
    }
  }

  if (insertionIndex === -1) {
    // Fallback: insert after first ## heading
    insertionIndex = lines.findIndex(line => line.match(/^##\s/)) + 3;
  }

  // Create chart markdown
  const chartMarkdown = generateChartMarkdown(chart);

  // Insert chart
  lines.splice(insertionIndex, 0, '', chartMarkdown, '');

  return lines.join('\n');
}

/**
 * Generate Chart.js HTML/markdown
 */
function generateChartMarkdown(chart) {
  return `<div class="chart-container" style="position: relative; height: 400px; margin: 2rem 0;">
  <canvas id="${chart.id}"></canvas>
</div>

<script>
(function() {
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    script.onload = initChart;
    document.head.appendChild(script);
  } else {
    initChart();
  }

  function initChart() {
    const ctx = document.getElementById('${chart.id}');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
      type: '${chart.chartType}',
      data: ${JSON.stringify(chart.data, null, 2)},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '${chart.title}',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: ${chart.type === 'before-after' ? 'true' : 'false'}
          }
        },
        scales: {
          ${chart.chartType === 'horizontalBar' ? 'x' : 'y'}: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + '${chart.data.datasets[0].data[0] < 100 ? '%' : ''}';
              }
            }
          }
        }
      }
    });
  }
})();
</script>`;
}

/**
 * Generate chart report
 */
export function generateChartReport(result) {
  if (!result.success || result.charts.length === 0) {
    return '\n⚠️  No charts generated\n';
  }

  return `
=== CHART GENERATION REPORT ===

Statistics found: ${result.statisticsFound}
Charts generated: ${result.charts.length}

Charts:
${result.charts.map((chart, i) => `  ${i + 1}. ${chart.title} (${chart.chartType})`).join('\n')}

✅ Charts embedded in content
`;
}

export default { generateCharts, generateChartReport };
