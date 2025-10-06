/**
 * Statistics Enrichment Module
 * Replaces Claude-generated statistics with real, cited data from Perplexity
 *
 * Phase 2 Enhancement: Real-Time Data Integration
 */

import { getPerplexityClient } from './perplexity-client.js';

/**
 * Extract statistics from content (reuse chart-generator patterns)
 */
function extractStatistics(content) {
  const statistics = [];
  const lines = content.split('\n');

  const patterns = {
    percentage: /(\d+(?:\.\d+)?%)/g,
    currency: /\$[\d,]+(?:\.\d+)?/g,
    multiplier: /(\d+(?:\.\d+)?x)/g,
    largeNumber: /\b(\d{1,3}(?:,\d{3})+|\d{4,})\+?\b/g,
    improvement: /(\d+(?:\.\d+)?%)?\s*(?:increase|improvement|gain|growth|boost|higher)/gi,
    reduction: /(\d+(?:\.\d+)?%)?\s*(?:decrease|reduction|drop|decline|lower|save|saving)/gi
  };

  lines.forEach((line, index) => {
    // Skip headings, code blocks, links, and very short lines
    if (line.match(/^#{1,6}\s/) ||
        line.match(/^```/) ||
        line.match(/^\[/) ||
        line.trim().length < 30) {
      return;
    }

    // Check if line contains statistics
    let hasStatistic = false;
    Object.entries(patterns).forEach(([type, pattern]) => {
      if (pattern.test(line)) {
        hasStatistic = true;
      }
    });

    if (hasStatistic) {
      // Get surrounding context (previous + current + next line)
      const contextLines = [];
      if (index > 0) contextLines.push(lines[index - 1]);
      contextLines.push(line);
      if (index < lines.length - 1) contextLines.push(lines[index + 1]);

      const fullContext = contextLines
        .filter(l => l.trim().length > 0)
        .join(' ')
        .trim();

      statistics.push({
        line: line.trim(),
        lineNumber: index + 1,
        context: fullContext.substring(0, 300), // First 300 chars
        type: hasStatistic ? 'statistic' : 'claim',
        priority: calculatePriority(line)
      });
    }
  });

  return statistics;
}

/**
 * Calculate priority for enrichment (higher = more important)
 */
function calculatePriority(line) {
  let score = 5; // Base score

  // High priority patterns
  if (line.match(/according to|study|research|report|survey/i)) score += 5;
  if (line.match(/\d+%/)) score += 3; // Percentages are highly visible
  if (line.match(/increase|improve|boost|grow/i)) score += 2;
  if (line.match(/sydney|australia/i)) score += 2;
  if (line.match(/\$[\d,]+/)) score += 2; // Money stats

  // Lower priority
  if (line.match(/example|instance|such as/i)) score -= 2;
  if (line.length < 50) score -= 1;

  return score;
}

/**
 * Parse Perplexity response to extract enriched statistic
 */
function parseEnrichment(response, originalLine) {
  if (!response.success || !response.content) {
    return null;
  }

  const content = response.content;

  // Check if no data found
  if (content.includes('NOT_FOUND')) {
    return null;
  }

  // Try to extract structured format
  const statisticMatch = content.match(/Statistic:\s*(.+?)(?:\n|$)/i);
  const sourceMatch = content.match(/Source:\s*(.+?)(?:\n|$)/i);
  const urlMatch = content.match(/URL:\s*(.+?)(?:\n|$)/i);

  if (!statisticMatch) {
    // Fallback: use first paragraph if it contains numbers
    const firstPara = content.split('\n\n')[0];
    if (firstPara.match(/\d+%|\$[\d,]+|\d{3,}/)) {
      return {
        enrichedText: firstPara.trim(),
        source: sourceMatch ? sourceMatch[1].trim() : null,
        url: urlMatch ? urlMatch[1].trim() : null,
        citations: response.citations
      };
    }
    return null;
  }

  return {
    enrichedText: statisticMatch[1].trim(),
    source: sourceMatch ? sourceMatch[1].trim() : null,
    url: urlMatch ? urlMatch[1].trim() : null,
    citations: response.citations
  };
}

/**
 * Format enriched statistic with citation
 */
function formatWithCitation(enrichedData, citationNumber) {
  let formatted = enrichedData.enrichedText;

  // Add citation marker if we have a source
  if (enrichedData.source && citationNumber) {
    formatted += ` [${citationNumber}]`;
  }

  return formatted;
}

/**
 * Main enrichment function
 * @param {string} content - Blog post content
 * @param {Object} metadata - Post metadata (title, category, tags)
 * @returns {Promise<Object>} Enriched content with citations
 */
export async function enrichStatistics(content, metadata = {}) {
  console.log('\n🔍 Enriching statistics with real-time data (Perplexity)...');

  const perplexityClient = getPerplexityClient();

  if (!perplexityClient) {
    console.log('   ⚠️  Perplexity client not available, skipping enrichment');
    return {
      content,
      enriched: 0,
      citations: [],
      success: false
    };
  }

  try {
    // 1. Extract statistics from content
    const statistics = extractStatistics(content);

    if (statistics.length === 0) {
      console.log('   No statistics found for enrichment');
      return {
        content,
        enriched: 0,
        citations: [],
        success: true
      };
    }

    console.log(`   Found ${statistics.length} potential statistics`);

    // 2. Prioritize top statistics (enrich top 5-8 to control costs)
    const priorityStats = statistics
      .sort((a, b) => b.priority - a.priority)
      .slice(0, Math.min(8, statistics.length));

    console.log(`   Enriching top ${priorityStats.length} statistics...`);

    // 3. Query Perplexity for each statistic
    const enrichments = [];
    const allCitations = [];

    for (let i = 0; i < priorityStats.length; i++) {
      const stat = priorityStats[i];

      console.log(`   [${i + 1}/${priorityStats.length}] Querying: "${stat.line.substring(0, 60)}..."`);

      try {
        const result = await perplexityClient.enrichStatistic(
          stat.line,
          {
            topic: metadata.title,
            category: metadata.category,
            tags: metadata.tags
          }
        );

        if (result.success) {
          const parsed = parseEnrichment(result, stat.line);

          if (parsed) {
            enrichments.push({
              original: stat.line,
              lineNumber: stat.lineNumber,
              enriched: parsed,
              priority: stat.priority
            });

            if (parsed.citations && parsed.citations.length > 0) {
              allCitations.push(...parsed.citations);
            }

            console.log(`      ✓ Enriched with ${parsed.citations?.length || 0} citations`);
          } else {
            console.log(`      ⚠️  No verified data found`);
          }
        }
      } catch (error) {
        console.warn(`      ❌ Error: ${error.message}`);
      }

      // Rate limiting between requests
      if (i < priorityStats.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2s between requests
      }
    }

    // 4. Replace statistics in content
    let enrichedContent = content;
    let replacementCount = 0;
    const citationMap = new Map();

    // Build citation map
    const uniqueCitations = deduplicateCitations(allCitations);
    uniqueCitations.forEach((citation, index) => {
      citationMap.set(citation, index + 1);
    });

    // Replace each enrichment
    for (const enrichment of enrichments) {
      const originalLine = enrichment.original;
      const enrichedData = enrichment.enriched;

      // Get citation number
      const citationNum = enrichedData.citations && enrichedData.citations.length > 0
        ? citationMap.get(enrichedData.citations[0])
        : null;

      const enrichedLine = formatWithCitation(enrichedData, citationNum);

      // Replace in content (be careful with partial matches)
      if (enrichedContent.includes(originalLine)) {
        enrichedContent = enrichedContent.replace(originalLine, enrichedLine);
        replacementCount++;
      }
    }

    // 5. Add bibliography if we have citations
    if (uniqueCitations.length > 0) {
      enrichedContent += generateBibliography(uniqueCitations);
    }

    console.log(`\n   ✅ Enriched ${replacementCount} statistics with ${uniqueCitations.length} unique citations`);

    return {
      content: enrichedContent,
      enriched: replacementCount,
      citations: uniqueCitations,
      success: true,
      enrichments: enrichments.length
    };

  } catch (error) {
    console.error('   ❌ Statistics enrichment failed:', error.message);
    return {
      content,
      enriched: 0,
      citations: [],
      success: false,
      error: error.message
    };
  }
}

/**
 * Deduplicate citations
 */
function deduplicateCitations(citations) {
  const seen = new Set();
  return citations.filter(citation => {
    const key = typeof citation === 'string' ? citation : JSON.stringify(citation);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generate bibliography section
 */
function generateBibliography(citations) {
  if (citations.length === 0) return '';

  let bibliography = '\n\n---\n\n## References\n\n';

  citations.forEach((citation, index) => {
    const citationText = typeof citation === 'string'
      ? citation
      : citation.url || citation.title || 'Source';

    bibliography += `[${index + 1}] ${citationText}\n`;
  });

  return bibliography;
}

/**
 * Generate enrichment report
 */
export function generateEnrichmentReport(result) {
  if (!result.success) {
    return '\n⚠️  Statistics enrichment failed or skipped\n';
  }

  if (result.enriched === 0) {
    return '\n⚠️  No statistics enriched (none found or all failed)\n';
  }

  return `
=== STATISTICS ENRICHMENT REPORT ===

Statistics enriched: ${result.enriched}
Citations added: ${result.citations.length}
Success rate: ${result.enrichments > 0 ? Math.round((result.enriched / result.enrichments) * 100) : 0}%

${result.citations.length > 0 ? `Citations:\n${result.citations.slice(0, 3).map((c, i) => `  ${i + 1}. ${typeof c === 'string' ? c.substring(0, 80) : c.url || 'Source'}`).join('\n')}${result.citations.length > 3 ? `\n  ... and ${result.citations.length - 3} more` : ''}` : ''}

✅ Real-time data integration complete
`;
}

export default { enrichStatistics, generateEnrichmentReport };
