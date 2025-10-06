/**
 * Readability Analyzer
 * Analyzes content readability and provides optimization suggestions
 * Uses Flesch Reading Ease and Flesch-Kincaid Grade Level
 */

/**
 * Analyze content readability
 * @param {string} content - The markdown content
 * @returns {object} Readability analysis with scores and recommendations
 */
export function analyzeReadability(content) {
  // Strip markdown formatting for accurate analysis
  const plainText = stripMarkdown(content);

  const sentences = extractSentences(plainText);
  const words = extractWords(plainText);
  const syllables = countTotalSyllables(words);

  // Calculate metrics
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
  const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  // Analyze specific issues
  const issues = identifyIssues(plainText, sentences, words, fleschScore, fkGrade);

  // Generate recommendations
  const recommendations = generateRecommendations(fleschScore, fkGrade, issues);

  return {
    scores: {
      fleschReadingEase: Math.round(fleschScore * 10) / 10,
      fleschKincaidGrade: Math.round(fkGrade * 10) / 10,
      interpretation: interpretFleschScore(fleschScore)
    },
    metrics: {
      totalWords: words.length,
      totalSentences: sentences.length,
      totalSyllables: syllables,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100
    },
    issues,
    recommendations,
    summary: generateSummary(fleschScore, fkGrade, issues)
  };
}

/**
 * Strip markdown formatting
 */
function stripMarkdown(content) {
  return content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Remove bold/italic
    .replace(/\*\*([^\*]+)\*\*/g, '$1')
    .replace(/\*([^\*]+)\*/g, '$1')
    // Remove headings markers
    .replace(/^#+\s*/gm, '')
    // Remove list markers
    .replace(/^[-*]\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Clean up
    .trim();
}

/**
 * Extract sentences
 */
function extractSentences(text) {
  // Split on sentence-ending punctuation
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.split(/\s+/).length >= 3); // At least 3 words

  return sentences;
}

/**
 * Extract words
 */
function extractWords(text) {
  const words = text
    .toLowerCase()
    .match(/\b[a-z]+\b/g) || [];

  return words.filter(w => w.length > 0);
}

/**
 * Count syllables in a word
 */
function countSyllables(word) {
  word = word.toLowerCase();

  // Special cases
  if (word.length <= 3) return 1;

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  if (!vowelGroups) return 1;

  let syllableCount = vowelGroups.length;

  // Adjust for silent 'e'
  if (word.endsWith('e') && syllableCount > 1) {
    syllableCount--;
  }

  // Adjust for common patterns
  if (word.match(/[^aeiouy]ed$/)) {
    syllableCount--;
  }

  return Math.max(1, syllableCount);
}

/**
 * Count total syllables
 */
function countTotalSyllables(words) {
  return words.reduce((total, word) => total + countSyllables(word), 0);
}

/**
 * Interpret Flesch Reading Ease score
 */
function interpretFleschScore(score) {
  if (score >= 90) return 'Very Easy (5th grade)';
  if (score >= 80) return 'Easy (6th grade)';
  if (score >= 70) return 'Fairly Easy (7th grade)';
  if (score >= 60) return 'Standard (8th-9th grade)';
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (score >= 30) return 'Difficult (College)';
  return 'Very Difficult (College graduate)';
}

/**
 * Identify specific readability issues
 */
function identifyIssues(text, sentences, words, fleschScore, fkGrade) {
  const issues = [];

  // 1. Check for difficult score
  if (fleschScore < 50) {
    issues.push({
      type: 'reading-ease',
      severity: 'high',
      message: `Reading ease score ${fleschScore.toFixed(1)} is too low for general business audience`,
      target: '60-70 for business content'
    });
  }

  // 2. Check grade level
  if (fkGrade > 12) {
    issues.push({
      type: 'grade-level',
      severity: 'medium',
      message: `Grade level ${fkGrade.toFixed(1)} is too high`,
      target: '10-12 for business content'
    });
  }

  // 3. Check for long sentences
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 25);
  if (longSentences.length > sentences.length * 0.2) {
    issues.push({
      type: 'sentence-length',
      severity: 'medium',
      message: `${longSentences.length} sentences are too long (>25 words)`,
      examples: longSentences.slice(0, 2).map(s => s.substring(0, 80) + '...'),
      target: 'Average 15-20 words per sentence'
    });
  }

  // 4. Check for passive voice
  const passiveIndicators = text.match(/\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi) || [];
  const passivePercentage = (passiveIndicators.length / sentences.length) * 100;

  if (passivePercentage > 10) {
    issues.push({
      type: 'passive-voice',
      severity: 'low',
      message: `${passivePercentage.toFixed(1)}% passive voice detected`,
      count: passiveIndicators.length,
      target: '<10% passive voice'
    });
  }

  // 5. Check for complex words
  const complexWords = words.filter(w => countSyllables(w) >= 3);
  const complexWordPercentage = (complexWords.length / words.length) * 100;

  if (complexWordPercentage > 15) {
    issues.push({
      type: 'complex-words',
      severity: 'medium',
      message: `${complexWordPercentage.toFixed(1)}% complex words (3+ syllables)`,
      target: '<15% complex words'
    });
  }

  // 6. Check for jargon
  const jargonTerms = detectJargon(text);
  if (jargonTerms.length > 10) {
    issues.push({
      type: 'jargon',
      severity: 'low',
      message: `${jargonTerms.length} technical terms detected`,
      examples: jargonTerms.slice(0, 5),
      suggestion: 'Consider explaining technical terms on first use'
    });
  }

  return issues;
}

/**
 * Detect technical jargon
 */
function detectJargon(text) {
  const jargonPatterns = [
    'attribution', 'conversion', 'roi', 'roas', 'ctr', 'cpc', 'cpa',
    'api', 'algorithm', 'analytics', 'metrics', 'kpi', 'seo', 'sem',
    'remarketing', 'retargeting', 'bidding', 'optimization', 'segmentation'
  ];

  const found = [];
  const lowerText = text.toLowerCase();

  jargonPatterns.forEach(term => {
    if (lowerText.includes(term)) {
      found.push(term);
    }
  });

  return [...new Set(found)]; // Deduplicate
}

/**
 * Generate recommendations
 */
function generateRecommendations(fleschScore, fkGrade, issues) {
  const recommendations = [];

  // High priority: Fix reading ease
  if (fleschScore < 50) {
    recommendations.push({
      priority: 'high',
      action: 'Simplify language',
      details: [
        'Use shorter sentences (15-20 words average)',
        'Replace complex words with simpler alternatives',
        'Break long paragraphs into 2-3 sentence chunks',
        'Use more active voice instead of passive'
      ],
      expectedImpact: `Improve reading ease from ${fleschScore.toFixed(1)} to 60+`
    });
  }

  // Medium priority: Reduce grade level
  if (fkGrade > 12) {
    recommendations.push({
      priority: 'medium',
      action: 'Lower grade level',
      details: [
        'Use common words instead of rare/technical terms',
        'Shorten sentences',
        'Add transitions to connect ideas',
        'Use bullet points for complex information'
      ],
      expectedImpact: `Lower grade level from ${fkGrade.toFixed(1)} to 10-12`
    });
  }

  // Address specific issues
  issues.forEach(issue => {
    if (issue.type === 'sentence-length') {
      recommendations.push({
        priority: 'medium',
        action: 'Shorten long sentences',
        details: [
          'Split sentences at conjunctions (and, but, or)',
          'Use periods instead of commas where appropriate',
          'Remove unnecessary qualifiers and modifiers'
        ],
        examples: issue.examples
      });
    }

    if (issue.type === 'passive-voice') {
      recommendations.push({
        priority: 'low',
        action: 'Convert passive to active voice',
        details: [
          'Change "was implemented" to "we implemented"',
          'Change "can be tracked" to "you can track"',
          'Change "is recommended" to "we recommend"'
        ],
        count: issue.count
      });
    }

    if (issue.type === 'jargon') {
      recommendations.push({
        priority: 'low',
        action: 'Explain technical terms',
        details: [
          'Add definitions for first use of technical terms',
          'Use analogies to explain complex concepts',
          'Consider a glossary section for heavily technical content'
        ],
        terms: issue.examples
      });
    }
  });

  return recommendations;
}

/**
 * Generate summary
 */
function generateSummary(fleschScore, fkGrade, issues) {
  let status, message;

  if (fleschScore >= 60 && fkGrade <= 12 && issues.length === 0) {
    status = 'excellent';
    message = '✅ Readability is excellent for target audience';
  } else if (fleschScore >= 50 && fkGrade <= 14 && issues.length <= 2) {
    status = 'good';
    message = '✓ Readability is acceptable with minor improvements needed';
  } else if (fleschScore < 40 || fkGrade > 14 || issues.filter(i => i.severity === 'high').length > 0) {
    status = 'poor';
    message = '⚠️ Readability needs significant improvement';
  } else {
    status = 'fair';
    message = '⚠️ Readability could be improved';
  }

  return {
    status,
    message,
    issueCount: issues.length,
    highPriorityIssues: issues.filter(i => i.severity === 'high').length,
    readableForAudience: fleschScore >= 60 && fkGrade <= 12
  };
}

/**
 * Generate plain English report
 */
export function generateReadabilityReport(analysis) {
  const lines = [];

  lines.push('=== READABILITY ANALYSIS ===\n');

  // Scores
  lines.push(`Flesch Reading Ease: ${analysis.scores.fleschReadingEase}/100`);
  lines.push(`  ${analysis.scores.interpretation}`);
  lines.push(`Flesch-Kincaid Grade: ${analysis.scores.fleschKincaidGrade}`);
  lines.push('');

  // Metrics
  lines.push('Content Metrics:');
  lines.push(`  Words: ${analysis.metrics.totalWords}`);
  lines.push(`  Sentences: ${analysis.metrics.totalSentences}`);
  lines.push(`  Avg words/sentence: ${analysis.metrics.avgWordsPerSentence}`);
  lines.push(`  Avg syllables/word: ${analysis.metrics.avgSyllablesPerWord}`);
  lines.push('');

  // Summary
  lines.push(analysis.summary.message);
  lines.push('');

  // Issues
  if (analysis.issues.length > 0) {
    lines.push('Issues Found:');
    analysis.issues.forEach((issue, i) => {
      lines.push(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
      if (issue.target) lines.push(`   Target: ${issue.target}`);
    });
    lines.push('');
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    lines.push('Recommendations:');
    analysis.recommendations.forEach((rec, i) => {
      lines.push(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      rec.details.forEach(detail => {
        lines.push(`   - ${detail}`);
      });
    });
  }

  return lines.join('\n');
}
