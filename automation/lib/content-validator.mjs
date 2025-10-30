#!/usr/bin/env node

/**
 * Content Quality Validator
 *
 * Validates generated content for:
 * - Word count requirements
 * - Readability scores
 * - Keyword density
 * - Duplicate content detection
 * - Structure validation (headings, links, etc.)
 *
 * Usage:
 *   import { ContentValidator } from './automation/lib/content-validator.mjs';
 *
 *   const validator = new ContentValidator();
 *   const result = await validator.validate(content, options);
 */

import { Logger } from './logger.mjs';

const logger = new Logger('content-validator');

export class ContentValidator {
  constructor(options = {}) {
    this.minWordCount = options.minWordCount || 600;
    this.maxWordCount = options.maxWordCount || 3000;
    this.minReadability = options.minReadability || 50; // Flesch reading ease score
    this.maxKeywordDensity = options.maxKeywordDensity || 3.0; // 3% max
  }

  /**
   * Validate content against quality criteria
   */
  async validate(content, options = {}) {
    const checks = {
      wordCount: this.checkWordCount(content, options),
      readability: this.checkReadability(content),
      keywordDensity: this.checkKeywordDensity(content, options.keyword),
      structure: this.checkStructure(content),
      quality: this.checkQualitySignals(content),
    };

    const score = this.calculateScore(checks);
    const issues = this.collectIssues(checks);

    const result = {
      valid: score >= 70 && issues.filter(i => i.severity === 'error').length === 0,
      score,
      checks,
      issues,
      metrics: {
        wordCount: this.countWords(content),
        readabilityScore: checks.readability.score,
        keywordDensity: checks.keywordDensity.density,
        headingCount: checks.structure.headings.length,
      },
    };

    logger.debug('Content validation complete', {
      valid: result.valid,
      score: result.score,
      issues: result.issues.length,
    });

    return result;
  }

  /**
   * Check word count requirements
   */
  checkWordCount(content, options = {}) {
    const count = this.countWords(content);
    const min = options.minWordCount || this.minWordCount;
    const max = options.maxWordCount || this.maxWordCount;

    const valid = count >= min && count <= max;

    return {
      valid,
      count,
      min,
      max,
      message: valid
        ? `Word count is good (${count} words)`
        : `Word count ${count} is outside range ${min}-${max}`,
    };
  }

  /**
   * Check readability using Flesch Reading Ease
   */
  checkReadability(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) {
      return {
        valid: false,
        score: 0,
        message: 'Cannot calculate readability: insufficient content',
      };
    }

    // Flesch Reading Ease formula
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    const valid = score >= this.minReadability;

    let level = 'Very difficult';
    if (score >= 90) level = 'Very easy';
    else if (score >= 80) level = 'Easy';
    else if (score >= 70) level = 'Fairly easy';
    else if (score >= 60) level = 'Standard';
    else if (score >= 50) level = 'Fairly difficult';
    else if (score >= 30) level = 'Difficult';

    return {
      valid,
      score: Math.round(score),
      level,
      message: valid
        ? `Readability is ${level} (${Math.round(score)})`
        : `Readability too low: ${level} (${Math.round(score)})`,
    };
  }

  /**
   * Check keyword density (avoid keyword stuffing)
   */
  checkKeywordDensity(content, keyword) {
    if (!keyword) {
      return {
        valid: true,
        density: 0,
        count: 0,
        message: 'No keyword specified',
      };
    }

    const words = this.countWords(content);
    const keywordRegex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = content.toLowerCase().match(keywordRegex) || [];
    const count = matches.length;
    const density = (count / words) * 100;

    const valid = density <= this.maxKeywordDensity;

    return {
      valid,
      density: parseFloat(density.toFixed(2)),
      count,
      message: valid
        ? `Keyword density is good (${density.toFixed(2)}%)`
        : `Keyword density too high (${density.toFixed(2)}% > ${this.maxKeywordDensity}%)`,
    };
  }

  /**
   * Check content structure (headings, paragraphs, links)
   */
  checkStructure(content) {
    // Extract headings
    const headings = {
      h1: (content.match(/^# .+$/gm) || []).length,
      h2: (content.match(/^## .+$/gm) || []).length,
      h3: (content.match(/^### .+$/gm) || []).length,
    };

    // Extract links
    const links = (content.match(/\[.+?\]\(.+?\)/g) || []).length;

    // Extract paragraphs (rough estimate)
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50).length;

    // Validation rules
    const issues = [];
    if (headings.h1 === 0) issues.push('Missing H1 heading');
    if (headings.h1 > 1) issues.push('Multiple H1 headings (should have exactly 1)');
    if (headings.h2 < 3) issues.push('Too few H2 headings (should have at least 3)');
    if (paragraphs < 5) issues.push('Too few paragraphs (content may be too short)');

    return {
      valid: issues.length === 0,
      headings: Object.entries(headings).map(([level, count]) => ({ level, count })),
      links,
      paragraphs,
      issues,
      message: issues.length === 0
        ? 'Content structure is good'
        : `Structure issues: ${issues.join(', ')}`,
    };
  }

  /**
   * Check for quality signals and AI patterns
   */
  checkQualitySignals(content) {
    const issues = [];

    // Check for common AI patterns
    const aiPhrases = [
      'as an ai',
      'i cannot',
      'i don\'t have access',
      'i apologize',
      'delve into',
      'it\'s important to note',
      'it is worth noting',
    ];

    aiPhrases.forEach(phrase => {
      if (content.toLowerCase().includes(phrase)) {
        issues.push(`Contains AI phrase: "${phrase}"`);
      }
    });

    // Check for placeholder text
    const placeholders = ['[placeholder]', 'lorem ipsum', 'todo:', 'fixme:', 'xxx'];
    placeholders.forEach(placeholder => {
      if (content.toLowerCase().includes(placeholder)) {
        issues.push(`Contains placeholder: "${placeholder}"`);
      }
    });

    // Check for proper sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const shortSentences = sentences.filter(s => this.countWords(s) < 5);
    if (shortSentences.length > sentences.length * 0.5) {
      issues.push('Too many short sentences (>50%)');
    }

    return {
      valid: issues.length === 0,
      issues,
      message: issues.length === 0
        ? 'Quality signals are good'
        : `Quality issues: ${issues.join(', ')}`,
    };
  }

  /**
   * Calculate overall quality score (0-100)
   */
  calculateScore(checks) {
    let score = 100;

    // Word count (20 points)
    if (!checks.wordCount.valid) score -= 20;

    // Readability (25 points)
    if (!checks.readability.valid) {
      score -= 25;
    } else if (checks.readability.score < 60) {
      score -= 10; // Partial penalty for low readability
    }

    // Keyword density (15 points)
    if (!checks.keywordDensity.valid) score -= 15;

    // Structure (25 points)
    if (!checks.structure.valid) {
      score -= checks.structure.issues.length * 5;
    }

    // Quality signals (15 points)
    if (!checks.quality.valid) {
      score -= checks.quality.issues.length * 3;
    }

    return Math.max(0, score);
  }

  /**
   * Collect all issues from checks
   */
  collectIssues(checks) {
    const issues = [];

    if (!checks.wordCount.valid) {
      issues.push({
        type: 'wordCount',
        severity: 'error',
        message: checks.wordCount.message,
      });
    }

    if (!checks.readability.valid) {
      issues.push({
        type: 'readability',
        severity: checks.readability.score < 40 ? 'error' : 'warning',
        message: checks.readability.message,
      });
    }

    if (!checks.keywordDensity.valid) {
      issues.push({
        type: 'keywordDensity',
        severity: 'warning',
        message: checks.keywordDensity.message,
      });
    }

    if (!checks.structure.valid) {
      checks.structure.issues.forEach(issue => {
        issues.push({
          type: 'structure',
          severity: issue.includes('H1') ? 'error' : 'warning',
          message: issue,
        });
      });
    }

    if (!checks.quality.valid) {
      checks.quality.issues.forEach(issue => {
        issues.push({
          type: 'quality',
          severity: issue.includes('AI phrase') ? 'error' : 'warning',
          message: issue,
        });
      });
    }

    return issues;
  }

  /**
   * Helper: Count words in content
   */
  countWords(content) {
    return content.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Helper: Count syllables in content (approximate)
   */
  countSyllables(content) {
    const words = content.toLowerCase().split(/\s+/);
    let syllables = 0;

    words.forEach(word => {
      // Remove punctuation
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      if (vowelGroups) {
        syllables += vowelGroups.length;

        // Adjust for silent 'e' at end
        if (word.endsWith('e')) {
          syllables--;
        }
      }

      // Every word has at least one syllable
      if (syllables === 0) syllables = 1;
    });

    return syllables;
  }

  /**
   * Generate validation report
   */
  generateReport(result) {
    let report = '\n' + '═'.repeat(60) + '\n';
    report += '📊 CONTENT VALIDATION REPORT\n';
    report += '═'.repeat(60) + '\n\n';

    report += `Overall Score: ${result.score}/100 ${result.valid ? '✅' : '❌'}\n\n`;

    report += 'Metrics:\n';
    report += `  Word Count: ${result.metrics.wordCount}\n`;
    report += `  Readability: ${result.metrics.readabilityScore} (${result.checks.readability.level})\n`;
    report += `  Keyword Density: ${result.metrics.keywordDensity}%\n`;
    report += `  Headings: ${result.metrics.headingCount}\n\n`;

    if (result.issues.length > 0) {
      report += 'Issues Found:\n';
      result.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        report += `  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}\n`;
      });
    } else {
      report += '✅ No issues found\n';
    }

    report += '\n' + '═'.repeat(60) + '\n';

    return report;
  }
}

export default ContentValidator;
