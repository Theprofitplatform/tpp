/**
 * Smart Internal Linker
 * Automatically finds optimal places to add internal links
 * Target: 5-8 contextual links (vs current 3)
 */

/**
 * Enhance internal links in content
 * @param {string} content - The markdown content
 * @param {object} linkMap - Internal link map with all published posts
 * @param {string} currentSlug - Slug of current post (avoid self-linking)
 * @param {object} currentTopic - Current post topic data
 * @returns {object} Enhanced content with more internal links
 */
export function enhanceInternalLinks(content, linkMap, currentSlug, currentTopic) {
  let enhancedContent = content;
  let linksAdded = 0;

  // Count existing links
  const existingLinks = (content.match(/\[.*?\]\(\/blog\/.*?\)/g) || []).length;
  console.log(`📊 Existing internal links: ${existingLinks}`);

  // Find link opportunities
  const opportunities = findLinkOpportunities(content, linkMap, currentSlug, currentTopic);

  console.log(`🔍 Found ${opportunities.length} link opportunities`);

  // Filter and sort by relevance
  const topOpportunities = opportunities
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 12); // Consider top 12

  // Add links strategically (max 8 total, avoiding clusters)
  const targetLinks = 8;
  const linksToAdd = Math.max(0, targetLinks - existingLinks);

  console.log(`🎯 Target: ${targetLinks} total links (need to add ${linksToAdd})`);

  for (let i = 0; i < topOpportunities.length && linksAdded < linksToAdd; i++) {
    const opp = topOpportunities[i];

    // Check if we should add this link (avoid clusters)
    if (shouldAddLink(enhancedContent, opp.position, existingLinks + linksAdded)) {
      enhancedContent = insertLink(enhancedContent, opp);
      linksAdded++;
      console.log(`  ✓ Added link: "${opp.anchorText}" → ${opp.targetUrl}`);
    }
  }

  const totalLinks = existingLinks + linksAdded;

  return {
    content: enhancedContent,
    linksAdded,
    totalLinks,
    wordCount: (content.match(/\w+/g) || []).length,
    linkDensity: (totalLinks / (content.match(/\w+/g) || []).length * 100).toFixed(2) + '%'
  };
}

/**
 * Find all potential link opportunities
 */
function findLinkOpportunities(content, linkMap, currentSlug, currentTopic) {
  const opportunities = [];

  Object.entries(linkMap).forEach(([slug, data]) => {
    if (slug === currentSlug) return; // Don't link to self

    // Strategy 1: Exact title mentions
    const titleMatches = findExactMatches(content, data.title);
    titleMatches.forEach(match => {
      opportunities.push({
        keyword: data.title,
        anchorText: data.title,
        position: match.index,
        targetSlug: slug,
        targetUrl: data.url,
        targetTitle: data.title,
        relevanceScore: 100, // Highest priority
        strategy: 'exact-title-match',
        context: getContext(content, match.index)
      });
    });

    // Strategy 2: Tag/keyword mentions
    const tags = data.tags || [];
    tags.forEach(tag => {
      if (tag.length < 3) return; // Skip very short tags

      const tagMatches = findKeywordMatches(content, tag);
      tagMatches.forEach(match => {
        const relevanceScore = calculateRelevance(
          match,
          tag,
          data.category,
          currentTopic.category,
          tags,
          currentTopic.tags || []
        );

        opportunities.push({
          keyword: tag,
          anchorText: tag,
          position: match.index,
          targetSlug: slug,
          targetUrl: data.url,
          targetTitle: data.title,
          relevanceScore,
          strategy: 'tag-match',
          context: getContext(content, match.index)
        });
      });
    });

    // Strategy 3: Related topic mentions (e.g., "Google Ads" when post is about Google Ads)
    const topicWords = extractTopicWords(data.title);
    topicWords.forEach(word => {
      if (word.length < 4) return; // Skip short words

      const wordMatches = findKeywordMatches(content, word);
      wordMatches.forEach(match => {
        const relevanceScore = calculateRelevance(
          match,
          word,
          data.category,
          currentTopic.category,
          tags,
          currentTopic.tags || []
        ) * 0.8; // Slightly lower than tag matches

        opportunities.push({
          keyword: word,
          anchorText: word,
          position: match.index,
          targetSlug: slug,
          targetUrl: data.url,
          targetTitle: data.title,
          relevanceScore,
          strategy: 'topic-word',
          context: getContext(content, match.index)
        });
      });
    });
  });

  // Deduplicate: If same position, keep highest relevance
  const deduplicated = deduplicateByPosition(opportunities);

  return deduplicated;
}

/**
 * Find exact matches of a phrase
 */
function findExactMatches(content, phrase) {
  const matches = [];
  const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Skip if already a link
    if (isAlreadyLinked(content, match.index)) continue;

    matches.push({
      index: match.index,
      text: match[0]
    });
  }

  return matches;
}

/**
 * Find keyword matches (with some flexibility)
 */
function findKeywordMatches(content, keyword) {
  const matches = [];

  // Try exact match first
  const exactRegex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi');
  let match;

  while ((match = exactRegex.exec(content)) !== null) {
    if (isAlreadyLinked(content, match.index)) continue;

    matches.push({
      index: match.index,
      text: match[0]
    });
  }

  // Also try plural/singular variations
  if (keyword.endsWith('s')) {
    const singular = keyword.slice(0, -1);
    const singularRegex = new RegExp(`\\b${escapeRegex(singular)}\\b`, 'gi');

    while ((match = singularRegex.exec(content)) !== null) {
      if (isAlreadyLinked(content, match.index)) continue;

      matches.push({
        index: match.index,
        text: match[0]
      });
    }
  } else {
    const plural = keyword + 's';
    const pluralRegex = new RegExp(`\\b${escapeRegex(plural)}\\b`, 'gi');

    while ((match = pluralRegex.exec(content)) !== null) {
      if (isAlreadyLinked(content, match.index)) continue;

      matches.push({
        index: match.index,
        text: match[0]
      });
    }
  }

  return matches;
}

/**
 * Check if position is already part of a link
 */
function isAlreadyLinked(content, position) {
  // Look backwards for '['  and forwards for ']('
  const before = content.substring(Math.max(0, position - 50), position);
  const after = content.substring(position, Math.min(content.length, position + 50));

  // If we find [text](url) pattern around this position, it's already linked
  if (before.includes('[') && after.includes('](')) {
    return true;
  }

  return false;
}

/**
 * Get context around a position
 */
function getContext(content, position, radius = 100) {
  const start = Math.max(0, position - radius);
  const end = Math.min(content.length, position + radius);
  return content.substring(start, end);
}

/**
 * Calculate relevance score
 */
function calculateRelevance(match, keyword, targetCategory, currentCategory, targetTags, currentTags) {
  let score = 0;

  // Base score
  score += 30;

  // Category match bonus
  if (targetCategory === currentCategory) {
    score += 30;
  }

  // Tag overlap bonus
  const sharedTags = targetTags.filter(tag => currentTags.includes(tag));
  score += sharedTags.length * 10;

  // Context relevance
  const context = match.context || '';

  // Higher score if in a heading
  if (context.match(/^#+\s/m)) {
    score += 20;
  }

  // Higher score if surrounded by related keywords
  targetTags.forEach(tag => {
    if (context.toLowerCase().includes(tag.toLowerCase())) {
      score += 5;
    }
  });

  // Lower score if in an existing link
  if (context.includes('](/')) {
    score -= 100; // Effectively exclude
  }

  // Lower score if in code block
  if (context.includes('```')) {
    score -= 100;
  }

  return Math.max(0, score);
}

/**
 * Extract topic words from title
 */
function extractTopicWords(title) {
  // Remove common words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'at',
    'how', 'what', 'why', 'when', 'where', 'guide', 'tips', 'best', 'top'
  ]);

  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= 4 && !stopWords.has(word))
    .map(word => word.replace(/[^a-z]/g, ''))
    .filter(word => word.length >= 4);
}

/**
 * Deduplicate opportunities by position
 */
function deduplicateByPosition(opportunities) {
  const byPosition = {};

  opportunities.forEach(opp => {
    const key = opp.position;

    if (!byPosition[key] || opp.relevanceScore > byPosition[key].relevanceScore) {
      byPosition[key] = opp;
    }
  });

  return Object.values(byPosition);
}

/**
 * Check if we should add a link at this position
 */
function shouldAddLink(content, position, currentLinkCount) {
  const wordCount = (content.match(/\w+/g) || []).length;

  // Max link density: 1 link per 150 words
  const maxLinks = Math.floor(wordCount / 150);

  if (currentLinkCount >= maxLinks) {
    return false;
  }

  // Check distance from nearest link (minimum 200 characters apart)
  const minDistance = 200;

  const before = content.substring(Math.max(0, position - minDistance), position);
  const after = content.substring(position, Math.min(content.length, position + minDistance));

  if (before.includes('](/blog/') || after.includes('](/blog/')) {
    return false;
  }

  return true;
}

/**
 * Insert link into content
 */
function insertLink(content, opportunity) {
  const { position, anchorText, targetUrl } = opportunity;

  // Find the exact occurrence at this position
  const before = content.substring(0, position);
  const after = content.substring(position);

  // Replace the first occurrence of the anchor text in 'after'
  const anchorRegex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, 'i');
  const newAfter = after.replace(anchorRegex, `[${anchorText}](${targetUrl})`);

  return before + newAfter;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate linking report
 */
export function generateLinkingReport(result) {
  const lines = [];

  lines.push('=== INTERNAL LINKING REPORT ===\n');
  lines.push(`Links added: ${result.linksAdded}`);
  lines.push(`Total links: ${result.totalLinks}`);
  lines.push(`Word count: ${result.wordCount}`);
  lines.push(`Link density: ${result.linkDensity}`);
  lines.push('');

  if (result.totalLinks >= 5) {
    lines.push('✅ Good internal link coverage');
  } else {
    lines.push(`⚠️  Consider adding ${5 - result.totalLinks} more internal links`);
  }

  return lines.join('\n');
}
