/**
 * Content Validator
 * Validates generated blog and social media content for common issues
 */

/**
 * Validate blog post content for quality issues
 * @param {string} content - Blog post markdown content
 * @param {Object} metadata - Post metadata (title, description, etc.)
 * @returns {Object} Validation result with warnings and errors
 */
export function validateBlogContent(content, metadata = {}) {
  const warnings = [];
  const errors = [];

  // 1. Check for uncited statistics
  const uncitedStats = findUncitedStatistics(content);
  if (uncitedStats.length > 0) {
    uncitedStats.forEach(stat => {
      warnings.push({
        type: 'uncited_statistic',
        severity: 'medium',
        line: stat.line,
        text: stat.text,
        message: `Statistic "${stat.value}" appears without citation. Add [Source: Name] after it.`
      });
    });
  }

  // 2. Check for AI clichés
  const cliches = findAIClichés(content, metadata);
  if (cliches.length > 0) {
    cliches.forEach(cliche => {
      warnings.push({
        type: 'ai_cliche',
        severity: 'low',
        line: cliche.line,
        text: cliche.text,
        message: `AI cliché detected: "${cliche.phrase}". Replace with more natural language.`
      });
    });
  }

  // 3. Check for fabricated Sydney statistics
  const fabricatedSydneyStats = findFabricatedSydneyStats(content);
  if (fabricatedSydneyStats.length > 0) {
    fabricatedSydneyStats.forEach(stat => {
      errors.push({
        type: 'fabricated_sydney_stat',
        severity: 'high',
        line: stat.line,
        text: stat.text,
        message: `Likely fabricated: "${stat.value}". Cite source or remove.`
      });
    });
  }

  // 4. Check metadata for uncited claims
  if (metadata.description) {
    const metaStats = findStatisticsInText(metadata.description);
    if (metaStats.length > 0) {
      warnings.push({
        type: 'uncited_meta_statistic',
        severity: 'medium',
        location: 'meta_description',
        text: metadata.description,
        message: `Meta description contains statistic without citation: "${metaStats[0].value}"`
      });
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    summary: {
      totalIssues: warnings.length + errors.length,
      warningCount: warnings.length,
      errorCount: errors.length,
      uncitedStats: uncitedStats.length,
      aiCliches: cliches.length,
      fabricatedStats: fabricatedSydneyStats.length
    }
  };
}

/**
 * Find uncited statistics in content
 */
function findUncitedStatistics(content) {
  const lines = content.split('\n');
  const uncited = [];

  const statisticPatterns = [
    /\b(\d{1,3})%\s+of\s+(?:Sydney\s+)?(?:businesses|companies|stores|online stores|ecommerce|retailers)/gi,
    /\b(\d{1,3})%\s+(?:fail|struggle|make mistakes|don't|can't|won't)/gi,
    /\$[\d,]+(?:\+|K\+|M\+)\s+(?:revenue|increase|growth|savings)/gi
  ];

  lines.forEach((line, index) => {
    // Skip lines that have citations
    if (line.includes('[Source:') || line.includes('According to') || line.match(/\[\d+\]/)) {
      return;
    }

    // Skip headings and code
    if (line.match(/^#{1,6}\s/) || line.match(/^```/) || line.match(/^\[/)) {
      return;
    }

    statisticPatterns.forEach(pattern => {
      const matches = [...line.matchAll(pattern)];
      matches.forEach(match => {
        uncited.push({
          line: index + 1,
          value: match[0],
          text: line.trim()
        });
      });
    });
  });

  return uncited;
}

/**
 * Find AI clichés in content
 */
function findAIClichés(content, metadata = {}) {
  const cliches = [];
  const lines = content.split('\n');

  const clichePhrases = [
    'game-changer', 'game changer',
    'revolutionary',
    'secret weapon',
    'hidden trick', 'insider secret',
    'the secret is', 'the secret to',
    'hack', 'growth hack', 'life hack',
    'mind-blowing', 'mind blowing',
    'crushing it',
    'next level',
    'holy grail',
    'silver bullet',
    'magic formula',
    "here's what'll shock you",
    "this will surprise you",
    'shocking truth'
  ];

  lines.forEach((line, index) => {
    // Skip headings and code
    if (line.match(/^#{1,6}\s/) || line.match(/^```/)) {
      return;
    }

    clichePhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(line)) {
        cliches.push({
          line: index + 1,
          phrase: phrase,
          text: line.trim()
        });
      }
    });
  });

  // Check metadata too
  if (metadata.title) {
    clichePhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(metadata.title)) {
        cliches.push({
          line: 'title',
          phrase: phrase,
          text: metadata.title
        });
      }
    });
  }

  return cliches;
}

/**
 * Find likely fabricated Sydney statistics
 */
function findFabricatedSydneyStats(content) {
  const lines = content.split('\n');
  const fabricated = [];

  // Patterns that are commonly fabricated
  const suspiciousPatterns = [
    /(\d{2,3})%\s+of\s+Sydney\s+(?:businesses|companies|stores)\s+(?:fail|struggle|don't|can't)/gi,
    /(\d{2,3})%\s+of\s+Sydney\s+(?:remarketing|marketing|advertising)\s+campaigns\s+fail/gi
  ];

  lines.forEach((line, index) => {
    // Skip if line has citation
    if (line.includes('[Source:') || line.includes('According to') || line.match(/\[\d+\]/)) {
      return;
    }

    suspiciousPatterns.forEach(pattern => {
      const matches = [...line.matchAll(pattern)];
      matches.forEach(match => {
        fabricated.push({
          line: index + 1,
          value: match[0],
          text: line.trim()
        });
      });
    });
  });

  return fabricated;
}

/**
 * Find statistics in text (for metadata checking)
 */
function findStatisticsInText(text) {
  const stats = [];
  const patterns = [
    /\b(\d{1,3})%\s+(?:of|fail|struggle)/gi,
    /\$[\d,]+(?:\+|K\+|M\+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      stats.push({
        value: match[0]
      });
    });
  });

  return stats;
}

/**
 * Generate blog validation report
 */
export function generateBlogValidationReport(validation) {
  if (validation.valid && validation.warnings.length === 0) {
    return '✅ Content validation passed - no issues found';
  }

  let report = '\n📋 BLOG CONTENT VALIDATION REPORT\n\n';

  if (validation.errors.length > 0) {
    report += `❌ Errors (${validation.errors.length}):\n`;
    validation.errors.forEach((error, i) => {
      report += `  ${i + 1}. [${error.severity.toUpperCase()}] ${error.message}\n`;
      report += `     Line ${error.line}: "${error.text.substring(0, 80)}..."\n\n`;
    });
  }

  if (validation.warnings.length > 0) {
    report += `⚠️  Warnings (${validation.warnings.length}):\n`;
    validation.warnings.forEach((warning, i) => {
      report += `  ${i + 1}. ${warning.message}\n`;
      if (warning.line !== 'title' && warning.location !== 'meta_description') {
        report += `     Line ${warning.line}: "${warning.text.substring(0, 80)}..."\n\n`;
      } else {
        report += `     ${warning.text}\n\n`;
      }
    });
  }

  report += `\nSummary:\n`;
  report += `  Total issues: ${validation.summary.totalIssues}\n`;
  report += `  - Uncited statistics: ${validation.summary.uncitedStats}\n`;
  report += `  - AI clichés: ${validation.summary.aiCliches}\n`;
  report += `  - Fabricated stats: ${validation.summary.fabricatedStats}\n`;

  return report;
}

/**
 * =============================================================================
 * SOCIAL MEDIA VALIDATION FUNCTIONS (EXISTING)
 * =============================================================================
 */

/**
 * Validate hashtag relevance to category
 * @param {string} content - Generated content
 * @param {string} category - Blog post category
 * @returns {Object} Validation result
 */
export function validateHashtagRelevance(content, category) {
  const hashtags = content.match(/#\w+/g) || [];
  const categoryLower = category.toLowerCase();

  const issues = [];

  // Define irrelevant hashtags by category
  const irrelevantHashtags = {
    'content marketing': ['#SEOTools', '#FreeSEO', '#LocalSEO', '#GoogleAds'],
    'google ads': ['#SEO', '#ContentMarketing', '#FreeSEOTools'],
    'seo': ['#GoogleAds', '#PPC', '#SocialMedia'],
    'web design': ['#SEO', '#GoogleAds', '#ContentMarketing']
  };

  const irrelevant = irrelevantHashtags[categoryLower] || [];

  hashtags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    if (irrelevant.some(irr => tagLower === irr.toLowerCase())) {
      issues.push(`Hashtag ${tag} may not be relevant to category "${category}"`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    hashtags,
    category
  };
}

/**
 * Check for potentially fabricated statistics
 * @param {string} content - Generated content
 * @param {string} blogContent - Original blog content (to verify stats exist)
 * @returns {Object} Validation result
 */
export function checkStatisticsSources(content, blogContent = '') {
  const issues = [];

  // Find percentage claims
  const percentageMatches = content.match(/\d+%[^a-zA-Z]*(increase|decrease|more|less|better|improvement|growth)/gi) || [];

  // Find specific number claims
  const numberClaims = content.match(/\d+x (more|better|higher|increase)/gi) || [];

  const allClaims = [...percentageMatches, ...numberClaims];

  if (blogContent) {
    // Check if claims exist in original blog content
    allClaims.forEach(claim => {
      const simplified = claim.replace(/\s+/g, ' ').toLowerCase();
      if (!blogContent.toLowerCase().includes(simplified)) {
        issues.push(`Statistic "${claim}" not found in original blog post - may be fabricated`);
      }
    });
  } else {
    // Just flag for manual review if no blog content provided
    if (allClaims.length > 0) {
      issues.push(`Found ${allClaims.length} statistical claims - verify these are from the blog post`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    claims: allClaims,
    needsReview: issues.length > 0
  };
}

/**
 * Validate character limits for platforms
 * @param {Object} content - Platform-specific content object
 * @returns {Object} Validation result
 */
export function validateCharacterLimits(content) {
  const issues = [];
  const limits = {
    twitter: 280,
    linkedin: 3000,
    facebook: 63206, // Effectively unlimited, but warn at 500
    email_subject: 50
  };

  // Twitter thread validation
  if (content.platform === 'twitter' && content.tweets) {
    content.tweets.forEach((tweet, idx) => {
      if (tweet.length > limits.twitter) {
        issues.push(`Tweet ${idx + 1} exceeds ${limits.twitter} characters (${tweet.length})`);
      }
    });
  }

  // LinkedIn validation
  if (content.platform === 'linkedin' && content.charCount > limits.linkedin) {
    issues.push(`LinkedIn post exceeds ${limits.linkedin} characters (${content.charCount})`);
  }

  // Facebook optimal length
  if (content.platform === 'facebook' && content.charCount > 500) {
    issues.push(`Facebook post is ${content.charCount} chars - optimal is 80-150 words for better reach`);
  }

  // Email subject line
  if (content.platform === 'email' && content.subjectLength > limits.email_subject) {
    issues.push(`Email subject is ${content.subjectLength} chars - optimal is <${limits.email_subject}`);
  }

  return {
    valid: issues.length === 0,
    issues,
    platform: content.platform
  };
}

/**
 * Check for Sydney-specific content
 * @param {string} content - Generated content
 * @returns {Object} Validation result
 */
export function validateSydneyRelevance(content) {
  const sydneyKeywords = [
    'sydney', 'nsw', 'cbd', 'parramatta', 'bondi', 'surry hills',
    'chatswood', 'north sydney', 'newtown', 'manly', 'circular quay',
    'harbour', '2000', '2010', '2026', '2088', '2150'
  ];

  const contentLower = content.toLowerCase();
  const foundKeywords = sydneyKeywords.filter(kw => contentLower.includes(kw));

  const issues = [];
  if (foundKeywords.length === 0) {
    issues.push('Content lacks Sydney-specific references - may not resonate with local audience');
  }

  return {
    valid: foundKeywords.length > 0,
    issues,
    foundKeywords,
    score: foundKeywords.length
  };
}

/**
 * Comprehensive content validation
 * @param {Object} contentData - Generated content with metadata
 * @param {Object} options - Validation options
 * @returns {Object} Complete validation report
 */
export function validateContent(contentData, options = {}) {
  const {
    blogContent = '',
    category = '',
    checkStats = true,
    checkHashtags = true,
    checkLimits = true,
    checkSydney = true
  } = options;

  const validations = {
    timestamp: new Date().toISOString(),
    platform: contentData.platform,
    overall: { valid: true, issues: [] }
  };

  // Run validations
  if (checkHashtags && category) {
    validations.hashtags = validateHashtagRelevance(contentData.content || contentData.body, category);
    if (!validations.hashtags.valid) {
      validations.overall.valid = false;
      validations.overall.issues.push(...validations.hashtags.issues);
    }
  }

  if (checkStats && blogContent) {
    validations.statistics = checkStatisticsSources(contentData.content || contentData.body, blogContent);
    if (!validations.statistics.valid) {
      validations.overall.valid = false;
      validations.overall.issues.push(...validations.statistics.issues);
    }
  }

  if (checkLimits) {
    validations.characterLimits = validateCharacterLimits(contentData);
    if (!validations.characterLimits.valid) {
      validations.overall.valid = false;
      validations.overall.issues.push(...validations.characterLimits.issues);
    }
  }

  if (checkSydney) {
    validations.sydneyRelevance = validateSydneyRelevance(contentData.content || contentData.body);
    if (!validations.sydneyRelevance.valid) {
      // This is a warning, not a blocker
      validations.overall.issues.push(...validations.sydneyRelevance.issues);
    }
  }

  return validations;
}

/**
 * Print validation report to console
 * @param {Object} validation - Validation result from validateContent
 */
export function printValidationReport(validation) {
  console.log('\n' + '='.repeat(60));
  console.log(`📋 CONTENT VALIDATION REPORT - ${validation.platform.toUpperCase()}`);
  console.log('='.repeat(60));

  if (validation.overall.valid) {
    console.log('\n✅ All validations passed!');
  } else {
    console.log('\n⚠️  Issues found:');
    validation.overall.issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue}`);
    });
  }

  // Detailed breakdown
  if (validation.hashtags) {
    console.log(`\n📱 Hashtags: ${validation.hashtags.valid ? '✅' : '⚠️'}`);
    console.log(`   Found: ${validation.hashtags.hashtags.join(', ')}`);
  }

  if (validation.statistics) {
    console.log(`\n📊 Statistics: ${validation.statistics.valid ? '✅' : '⚠️'}`);
    console.log(`   Claims found: ${validation.statistics.claims.length}`);
  }

  if (validation.sydneyRelevance) {
    console.log(`\n🌏 Sydney Relevance: ${validation.sydneyRelevance.valid ? '✅' : '⚠️'}`);
    console.log(`   Local keywords: ${validation.sydneyRelevance.foundKeywords.join(', ')}`);
    console.log(`   Relevance score: ${validation.sydneyRelevance.score}/10`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

export default {
  validateHashtagRelevance,
  checkStatisticsSources,
  validateCharacterLimits,
  validateSydneyRelevance,
  validateContent,
  printValidationReport
};
