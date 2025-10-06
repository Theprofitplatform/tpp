/**
 * Visual Content Suggester
 * Analyzes blog post content and recommends visual elements
 * (charts, screenshots, diagrams, infographics)
 */

/**
 * Generate visual content suggestions for a blog post
 * @param {string} content - The markdown content
 * @param {object} metadata - Post metadata
 * @returns {array} Array of visual suggestions
 */
export function generateVisualSuggestions(content, metadata) {
  const suggestions = [];
  const lines = content.split('\n');

  // 1. Detect statistics that should be visualized
  const stats = extractStatistics(content, lines);
  if (stats.length > 0) {
    suggestions.push({
      type: 'chart',
      priority: 'high',
      location: stats[0].lineNumber,
      data: stats.slice(0, 5),
      title: 'Key Statistics Visualization',
      description: `Create a bar chart or infographic showing: ${stats.slice(0, 3).map(s => s.value).join(', ')}`,
      tool: 'Canva, Google Charts, or Chart.js',
      estimatedTime: '15-20 minutes'
    });
  }

  // 2. Detect step-by-step processes needing screenshots
  const processes = extractProcesses(content, lines);
  processes.forEach(process => {
    suggestions.push({
      type: 'screenshot',
      priority: 'high',
      location: process.lineNumber,
      title: `Screenshot: ${process.title}`,
      description: `Screenshot of: ${process.description}`,
      example: process.example,
      tool: 'Snagit, Lightshot, or built-in screenshot',
      estimatedTime: '5-10 minutes'
    });
  });

  // 3. Detect comparisons needing tables/diagrams
  const comparisons = extractComparisons(content, lines);
  comparisons.forEach(comp => {
    suggestions.push({
      type: 'comparison-table',
      priority: 'medium',
      location: comp.lineNumber,
      title: comp.title,
      description: `Create comparison table/diagram for: ${comp.items.join(' vs ')}`,
      tool: 'Google Sheets, Canva, or HTML table',
      estimatedTime: '10-15 minutes'
    });
  });

  // 4. Detect case studies needing before/after visuals
  const caseStudies = extractCaseStudies(content, lines);
  caseStudies.forEach(cs => {
    suggestions.push({
      type: 'before-after-chart',
      priority: 'medium',
      location: cs.lineNumber,
      title: `Before/After: ${cs.title}`,
      description: 'Visualize improvement metrics',
      data: cs.metrics,
      tool: 'Chart.js, Google Charts, or Canva',
      estimatedTime: '15-20 minutes'
    });
  });

  // 5. Detect processes needing flowcharts/diagrams
  const workflows = extractWorkflows(content, lines);
  workflows.forEach(wf => {
    suggestions.push({
      type: 'flowchart',
      priority: 'low',
      location: wf.lineNumber,
      title: `Flowchart: ${wf.title}`,
      description: `Create process flowchart showing: ${wf.steps.join(' → ')}`,
      tool: 'Lucidchart, Miro, or Excalidraw',
      estimatedTime: '20-30 minutes'
    });
  });

  // Sort by priority and line number
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => {
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.location - b.location;
  });

  return suggestions;
}

/**
 * Extract statistics from content
 */
function extractStatistics(content, lines) {
  const stats = [];
  const statPattern = /(\d+(?:\.\d+)?%|\$[\d,]+|[\d.]+x|\d+(?:\.\d+)?% ROI)/g;

  lines.forEach((line, index) => {
    const matches = line.match(statPattern);
    if (matches && matches.length > 0) {
      // Skip if it's in a code block or heading
      if (line.trim().startsWith('```') || line.trim().startsWith('#')) {
        return;
      }

      matches.forEach(match => {
        stats.push({
          lineNumber: index + 1,
          value: match,
          context: line.trim(),
          line: line.trim()
        });
      });
    }
  });

  return stats;
}

/**
 * Extract processes that need screenshots
 */
function extractProcesses(content, lines) {
  const processes = [];

  // Look for step-by-step instructions with technical details
  const technicalKeywords = [
    'navigate to', 'click on', 'select', 'configure',
    'enable', 'settings', 'dashboard', 'interface',
    'google ads', 'google analytics', 'admin panel'
  ];

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();

    technicalKeywords.forEach(keyword => {
      if (lowerLine.includes(keyword)) {
        // Look ahead for context
        const context = lines.slice(index, Math.min(index + 3, lines.length)).join(' ');

        processes.push({
          lineNumber: index + 1,
          title: line.trim().replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, ''),
          description: context.substring(0, 150),
          example: determineScreenshotType(lowerLine),
          keyword
        });
      }
    });
  });

  // Deduplicate by line number
  const unique = [];
  const seen = new Set();
  processes.forEach(p => {
    if (!seen.has(p.lineNumber)) {
      seen.add(p.lineNumber);
      unique.push(p);
    }
  });

  return unique.slice(0, 3); // Top 3 most important
}

function determineScreenshotType(line) {
  if (line.includes('google ads')) return 'Google Ads dashboard/interface';
  if (line.includes('google analytics')) return 'Google Analytics 4 interface';
  if (line.includes('tracking') || line.includes('conversion')) return 'Conversion tracking setup screen';
  if (line.includes('settings') || line.includes('configure')) return 'Settings/configuration panel';
  return 'Interface screenshot';
}

/**
 * Extract comparisons from content
 */
function extractComparisons(content, lines) {
  const comparisons = [];

  lines.forEach((line, index) => {
    // Look for "vs", "versus", "compared to"
    if (line.match(/\bvs\.?\b|\bversus\b|\bcompared to\b/i)) {
      comparisons.push({
        lineNumber: index + 1,
        title: line.trim().replace(/^#+\s*/, ''),
        items: extractComparisonItems(line),
        line: line.trim()
      });
    }

    // Look for lists with contrasting items
    if (line.match(/^-\s+\*\*.*?:\*\*/)) {
      const nextFewLines = lines.slice(index, Math.min(index + 5, lines.length));
      const listItems = nextFewLines.filter(l => l.match(/^-\s+\*\*.*?:\*\*/));

      if (listItems.length >= 3) {
        comparisons.push({
          lineNumber: index + 1,
          title: 'Comparison Table',
          items: listItems.map(l => l.match(/\*\*(.*?):\*\*/)?.[1] || l),
          line: listItems.join('\n')
        });
      }
    }
  });

  return comparisons.slice(0, 2); // Top 2
}

function extractComparisonItems(line) {
  const matches = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
  return matches ? matches.slice(0, 3) : [];
}

/**
 * Extract case studies from content
 */
function extractCaseStudies(content, lines) {
  const caseStudies = [];

  lines.forEach((line, index) => {
    // Look for case study indicators
    if (line.match(/case study|example|we worked with|client|results?/i)) {
      // Look ahead for metrics
      const context = lines.slice(index, Math.min(index + 10, lines.length)).join('\n');
      const metrics = extractMetricsFromContext(context);

      if (metrics.length >= 2) {
        caseStudies.push({
          lineNumber: index + 1,
          title: line.trim().replace(/^#+\s*/, ''),
          metrics: metrics.slice(0, 4),
          hasBeforeAfter: context.match(/before|after|from.*to/i) !== null
        });
      }
    }
  });

  return caseStudies.slice(0, 2); // Top 2
}

function extractMetricsFromContext(context) {
  const metrics = [];
  const metricPattern = /(\d+(?:\.\d+)?%|\$[\d,]+|[\d.]+x)/g;
  const matches = context.match(metricPattern);

  if (matches) {
    matches.forEach(match => {
      metrics.push(match);
    });
  }

  return metrics;
}

/**
 * Extract workflows/processes needing flowcharts
 */
function extractWorkflows(content, lines) {
  const workflows = [];

  lines.forEach((line, index) => {
    // Look for numbered lists or step sequences
    if (line.match(/^#+.*?(workflow|process|framework|step|phase)/i)) {
      const context = lines.slice(index, Math.min(index + 15, lines.length));
      const steps = context.filter(l =>
        l.match(/^\d+\.|^-\s+\*\*Step|^###?\s*Step/i)
      );

      if (steps.length >= 3) {
        workflows.push({
          lineNumber: index + 1,
          title: line.trim().replace(/^#+\s*/, ''),
          steps: steps.map(s => s.replace(/^\d+\.\s*|^-\s*\*\*|^\*\*|^###?\s*/g, '').substring(0, 50)),
          stepCount: steps.length
        });
      }
    }
  });

  return workflows.slice(0, 1); // Top 1 workflow
}

/**
 * Generate a summary report
 */
export function generateVisualReport(suggestions) {
  const byType = {};
  suggestions.forEach(sug => {
    byType[sug.type] = (byType[sug.type] || 0) + 1;
  });

  const totalTime = suggestions.reduce((sum, sug) => {
    const time = parseInt(sug.estimatedTime.match(/\d+/)?.[0] || 0);
    return sum + time;
  }, 0);

  return {
    totalSuggestions: suggestions.length,
    byPriority: {
      high: suggestions.filter(s => s.priority === 'high').length,
      medium: suggestions.filter(s => s.priority === 'medium').length,
      low: suggestions.filter(s => s.priority === 'low').length
    },
    byType,
    estimatedTotalTime: `${totalTime}-${totalTime + 30} minutes`,
    topPriorities: suggestions.filter(s => s.priority === 'high').slice(0, 3)
  };
}
