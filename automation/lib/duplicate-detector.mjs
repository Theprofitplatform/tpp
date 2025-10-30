#!/usr/bin/env node

/**
 * Duplicate Content Detector
 *
 * Detects duplicate or very similar content using:
 * - Exact string matching
 * - Sentence-level similarity (Jaccard similarity)
 * - N-gram overlap detection
 *
 * Usage:
 *   import { DuplicateDetector } from './automation/lib/duplicate-detector.mjs';
 *
 *   const detector = new DuplicateDetector();
 *   const result = await detector.check(newContent, existingContent);
 */

import fs from 'fs/promises';
import crypto from 'crypto';
import { Logger } from './logger.mjs';

const logger = new Logger('duplicate-detector');

export class DuplicateDetector {
  constructor(options = {}) {
    this.similarityThreshold = options.similarityThreshold || 0.70; // 70% similarity = duplicate
    this.ngramSize = options.ngramSize || 5; // 5-word shingles
  }

  /**
   * Check if content is duplicate or highly similar
   */
  async check(newContent, existingContents = []) {
    if (!Array.isArray(existingContents)) {
      existingContents = [existingContents];
    }

    const results = [];

    for (const existing of existingContents) {
      const similarity = this.calculateSimilarity(newContent, existing.content || existing);
      const isDuplicate = similarity >= this.similarityThreshold;

      if (isDuplicate) {
        results.push({
          isDuplicate: true,
          similarity,
          matchedContent: existing,
          method: 'jaccard',
        });
      }
    }

    const hasDuplicates = results.length > 0;
    const maxSimilarity = results.length > 0
      ? Math.max(...results.map(r => r.similarity))
      : 0;

    logger.debug('Duplicate detection complete', {
      hasDuplicates,
      maxSimilarity: maxSimilarity.toFixed(2),
      matchCount: results.length,
    });

    return {
      isDuplicate: hasDuplicates,
      maxSimilarity,
      matches: results,
      message: hasDuplicates
        ? `Found ${results.length} similar content(s) (max similarity: ${(maxSimilarity * 100).toFixed(1)}%)`
        : 'No duplicate content found',
    };
  }

  /**
   * Calculate similarity between two texts using multiple methods
   */
  calculateSimilarity(text1, text2) {
    // Normalize texts
    const normalized1 = this.normalize(text1);
    const normalized2 = this.normalize(text2);

    // Check exact match first
    if (normalized1 === normalized2) {
      return 1.0;
    }

    // Calculate Jaccard similarity on sentences
    const sentences1 = this.extractSentences(normalized1);
    const sentences2 = this.extractSentences(normalized2);
    const jaccardScore = this.jaccardSimilarity(sentences1, sentences2);

    // Calculate n-gram similarity
    const ngrams1 = this.extractNgrams(normalized1, this.ngramSize);
    const ngrams2 = this.extractNgrams(normalized2, this.ngramSize);
    const ngramScore = this.jaccardSimilarity(ngrams1, ngrams2);

    // Weighted average (favor n-grams as they catch paraphrasing better)
    const similarity = 0.3 * jaccardScore + 0.7 * ngramScore;

    return similarity;
  }

  /**
   * Calculate Jaccard similarity coefficient
   */
  jaccardSimilarity(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 1.0;
    if (set1.size === 0 || set2.size === 0) return 0.0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Normalize text for comparison
   */
  normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
  }

  /**
   * Extract sentences as a set
   */
  extractSentences(text) {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Ignore very short sentences

    return new Set(sentences);
  }

  /**
   * Extract n-grams (word shingles) from text
   */
  extractNgrams(text, n) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const ngrams = new Set();

    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      ngrams.add(ngram);
    }

    return ngrams;
  }

  /**
   * Generate content fingerprint (hash)
   */
  generateFingerprint(content) {
    const normalized = this.normalize(content);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Check against content database file
   */
  async checkAgainstDatabase(newContent, databasePath) {
    try {
      const data = await fs.readFile(databasePath, 'utf-8');
      const database = JSON.parse(data);

      const existingContents = database.items || database;
      return await this.check(newContent, existingContents);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('Database file not found, assuming no duplicates', {
          path: databasePath,
        });
        return {
          isDuplicate: false,
          maxSimilarity: 0,
          matches: [],
          message: 'No database file found',
        };
      }
      throw error;
    }
  }

  /**
   * Add content to database
   */
  async addToDatabase(content, metadata, databasePath) {
    let database = { items: [] };

    try {
      const data = await fs.readFile(databasePath, 'utf-8');
      database = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const fingerprint = this.generateFingerprint(content);

    database.items.push({
      fingerprint,
      content,
      metadata,
      addedAt: new Date().toISOString(),
    });

    await fs.writeFile(databasePath, JSON.stringify(database, null, 2));

    logger.debug('Content added to database', {
      fingerprint,
      totalItems: database.items.length,
    });
  }

  /**
   * Find most similar content in database
   */
  async findMostSimilar(content, databasePath, limit = 5) {
    try {
      const data = await fs.readFile(databasePath, 'utf-8');
      const database = JSON.parse(data);

      const similarities = [];

      for (const item of database.items || database) {
        const similarity = this.calculateSimilarity(content, item.content || item);
        similarities.push({
          similarity,
          item,
        });
      }

      // Sort by similarity (descending) and take top N
      similarities.sort((a, b) => b.similarity - a.similarity);

      return similarities.slice(0, limit);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Generate similarity report
   */
  generateReport(result) {
    let report = '\n' + '═'.repeat(60) + '\n';
    report += '🔍 DUPLICATE DETECTION REPORT\n';
    report += '═'.repeat(60) + '\n\n';

    if (result.isDuplicate) {
      report += `⚠️  DUPLICATE CONTENT DETECTED\n\n`;
      report += `Maximum Similarity: ${(result.maxSimilarity * 100).toFixed(1)}%\n`;
      report += `Matches Found: ${result.matches.length}\n\n`;

      result.matches.forEach((match, idx) => {
        report += `Match ${idx + 1}:\n`;
        report += `  Similarity: ${(match.similarity * 100).toFixed(1)}%\n`;
        if (match.matchedContent.metadata) {
          report += `  Metadata: ${JSON.stringify(match.matchedContent.metadata)}\n`;
        }
        report += '\n';
      });
    } else {
      report += `✅ NO DUPLICATE CONTENT FOUND\n\n`;
      report += `Maximum Similarity: ${(result.maxSimilarity * 100).toFixed(1)}%\n`;
      report += `Threshold: ${(this.similarityThreshold * 100).toFixed(1)}%\n`;
    }

    report += '═'.repeat(60) + '\n';

    return report;
  }

  /**
   * Clean old entries from database (keep only recent N items)
   */
  async cleanDatabase(databasePath, keepCount = 1000) {
    try {
      const data = await fs.readFile(databasePath, 'utf-8');
      const database = JSON.parse(data);

      if (database.items.length <= keepCount) {
        logger.debug('Database cleanup not needed', {
          current: database.items.length,
          limit: keepCount,
        });
        return;
      }

      // Sort by date (newest first) and keep only top N
      database.items.sort((a, b) =>
        new Date(b.addedAt) - new Date(a.addedAt)
      );
      database.items = database.items.slice(0, keepCount);

      await fs.writeFile(databasePath, JSON.stringify(database, null, 2));

      logger.info('Database cleaned', {
        kept: database.items.length,
        removed: database.items.length - keepCount,
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

export default DuplicateDetector;
