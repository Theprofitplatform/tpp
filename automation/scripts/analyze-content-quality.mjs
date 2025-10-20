#!/usr/bin/env node

/**
 * Content Quality Analyzer
 *
 * Analyzes generated content for quality metrics
 * Run: npm run automation:analyze-content
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

class ContentAnalyzer {
  constructor(content, metadata = {}) {
    this.content = content;
    this.metadata = metadata;
    this.scores = {};
  }

  // Calculate word count
  getWordCount() {
    return this.content.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Calculate reading time (avg 200 words per minute)
  getReadingTime() {
    const words = this.getWordCount();
    return Math.ceil(words / 200);
  }

  // Check for SEO keyword density
  checkKeywordDensity(keyword) {
    if (!keyword) return 0;

    const lowerContent = this.content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Count occurrences
    const matches = lowerContent.match(new RegExp(lowerKeyword, 'g')) || [];
    const count = matches.length;
    const words = this.getWordCount();

    // Density percentage
    const density = (count / words) * 100;

    return {
      count,
      density: density.toFixed(2),
      score: this.scoreKeywordDensity(density)
    };
  }

  scoreKeywordDensity(density) {
    // Ideal: 1-3%
    // Good: 0.5-1% or 3-4%
    // Poor: <0.5% or >4%
    if (density >= 1 && density <= 3) return 10;
    if (density >= 0.5 && density < 1) return 8;
    if (density > 3 && density <= 4) return 7;
    if (density >= 0.2 && density < 0.5) return 5;
    return 3;
  }

  // Calculate readability (Flesch Reading Ease approximation)
  calculateReadability() {
    const sentences = this.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.content.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(words);

    if (sentences.length === 0 || words.length === 0) {
      return { score: 0, level: 'Unknown' };
    }

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula (simplified)
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    return {
      score: Math.max(0, Math.min(100, score)).toFixed(1),
      level: this.getReadabilityLevel(score),
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2)
    };
  }

  countSyllables(words) {
    return words.reduce((total, word) => {
      word = word.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length <= 3) return total + 1;

      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');

      const syllableMatches = word.match(/[aeiouy]{1,2}/g);
      return total + (syllableMatches ? syllableMatches.length : 1);
    }, 0);
  }

  getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (College graduate)';
  }

  // Check for duplicate/repetitive content
  checkRepetition() {
    const sentences = this.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));

    const repetitionRate = 1 - (uniqueSentences.size / sentences.length);

    return {
      totalSentences: sentences.length,
      uniqueSentences: uniqueSentences.size,
      repetitionRate: (repetitionRate * 100).toFixed(1),
      score: repetitionRate < 0.1 ? 10 : repetitionRate < 0.2 ? 7 : repetitionRate < 0.3 ? 5 : 3
    };
  }

  // Check content structure
  checkStructure() {
    const hasHeadings = /^#{1,6}\s+.+$/m.test(this.content);
    const hasParagraphs = this.content.split('\n\n').length > 3;
    const hasLists = /^[-*]\s+.+$/m.test(this.content) || /^\d+\.\s+.+$/m.test(this.content);

    const score = (hasHeadings ? 4 : 0) + (hasParagraphs ? 3 : 0) + (hasLists ? 3 : 0);

    return {
      hasHeadings,
      hasParagraphs,
      hasLists,
      score
    };
  }

  // Check for AI-typical phrases (things to avoid)
  checkAIFingerprints() {
    const aiPhrases = [
      'as an ai',
      'i apologize',
      'i cannot',
      'it is important to note',
      'in today\'s digital age',
      'in conclusion',
      'moreover',
      'furthermore',
      'delve into',
      'landscape of',
      'realm of',
      'it\'s worth noting'
    ];

    const lowerContent = this.content.toLowerCase();
    const found = aiPhrases.filter(phrase => lowerContent.includes(phrase));

    return {
      found,
      count: found.length,
      score: found.length === 0 ? 10 : found.length <= 2 ? 7 : found.length <= 4 ? 5 : 3
    };
  }

  // Check call-to-action presence
  checkCTA() {
    const ctaPhrases = [
      'call',
      'contact',
      'email',
      'phone',
      'book',
      'schedule',
      'get started',
      'learn more',
      'find out',
      'discover',
      'reach out',
      'get in touch'
    ];

    const lowerContent = this.content.toLowerCase();
    const found = ctaPhrases.filter(phrase => lowerContent.includes(phrase));

    return {
      found,
      count: found.length,
      score: found.length >= 2 ? 10 : found.length === 1 ? 7 : 3
    };
  }

  // Check for local mentions (suburb/location specific)
  checkLocalContent(location) {
    if (!location) return { score: 0, message: 'No location provided' };

    const lowerContent = this.content.toLowerCase();
    const lowerLocation = location.toLowerCase();

    const mentions = (lowerContent.match(new RegExp(lowerLocation, 'g')) || []).length;

    const hasLocalLandmarks = /\b(park|beach|shopping|station|school|library|hospital|cafe|restaurant)\b/gi.test(this.content);
    const hasLocalContext = /\b(local|area|community|nearby|neighborhood|suburb)\b/gi.test(this.content);

    const score = (mentions >= 3 ? 4 : mentions >= 1 ? 2 : 0) +
                  (hasLocalLandmarks ? 3 : 0) +
                  (hasLocalContext ? 3 : 0);

    return {
      locationMentions: mentions,
      hasLocalLandmarks,
      hasLocalContext,
      score
    };
  }

  // Generate overall quality score
  analyzeQuality(options = {}) {
    const results = {};

    // Word count (target: 600-1000 for blog, 150-250 for GBP)
    const wordCount = this.getWordCount();
    const targetMin = options.targetWordCount?.min || 600;
    const targetMax = options.targetWordCount?.max || 1000;

    results.wordCount = {
      count: wordCount,
      target: `${targetMin}-${targetMax}`,
      score: wordCount >= targetMin && wordCount <= targetMax ? 10 :
             wordCount >= targetMin * 0.8 && wordCount <= targetMax * 1.2 ? 7 : 5
    };

    // Reading time
    results.readingTime = {
      minutes: this.getReadingTime(),
      score: 10 // Always acceptable
    };

    // Keyword density
    if (options.keyword) {
      results.keywordDensity = this.checkKeywordDensity(options.keyword);
    }

    // Readability
    results.readability = this.calculateReadability();
    results.readability.score = results.readability.score >= 60 ? 10 :
                                results.readability.score >= 50 ? 8 :
                                results.readability.score >= 40 ? 6 : 4;

    // Repetition
    results.repetition = this.checkRepetition();

    // Structure
    results.structure = this.checkStructure();

    // AI fingerprints
    results.aiFingerprints = this.checkAIFingerprints();

    // CTA
    results.cta = this.checkCTA();

    // Local content
    if (options.location) {
      results.localContent = this.checkLocalContent(options.location);
    }

    // Calculate overall score
    const scores = [
      results.wordCount.score,
      results.keywordDensity?.score || 10,
      results.readability.score,
      results.repetition.score,
      results.structure.score,
      results.aiFingerprints.score,
      results.cta.score,
      results.localContent?.score || 10
    ];

    const overallScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

    results.overall = {
      score: parseFloat(overallScore),
      grade: this.getGrade(overallScore),
      recommendation: this.getRecommendation(overallScore)
    };

    return results;
  }

  getGrade(score) {
    if (score >= 9) return 'A+ (Excellent)';
    if (score >= 8) return 'A (Very Good)';
    if (score >= 7) return 'B (Good)';
    if (score >= 6) return 'C (Fair)';
    if (score >= 5) return 'D (Needs Work)';
    return 'F (Poor)';
  }

  getRecommendation(score) {
    if (score >= 8) return 'Ready to publish with minor review';
    if (score >= 7) return 'Good quality, review for improvements';
    if (score >= 6) return 'Acceptable, needs editing';
    if (score >= 5) return 'Significant improvements needed';
    return 'Regenerate or heavily rewrite';
  }
}

async function analyzeFile(filePath, options = {}) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract frontmatter for metadata
    let metadata = {};
    let bodyContent = content;

    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]+)$/);
    if (frontmatterMatch) {
      bodyContent = frontmatterMatch[2];
      // Parse frontmatter (simple key: value extraction)
      const frontmatter = frontmatterMatch[1];
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
      });
    }

    // Set analysis options from metadata
    if (metadata.city) options.location = metadata.city;

    const analyzer = new ContentAnalyzer(bodyContent, metadata);
    return analyzer.analyzeQuality(options);
  } catch (error) {
    throw new Error(`Failed to analyze ${filePath}: ${error.message}`);
  }
}

async function analyzeBatch(directory, pattern = '*.md') {
  const files = await fs.readdir(directory);
  const mdFiles = files.filter(f => f.endsWith('.md') && !f.includes('TEMPLATE'));

  console.log(colorize(`\nAnalyzing ${mdFiles.length} files in ${directory}...\n`, 'blue'));

  const results = [];

  for (const file of mdFiles) {
    const filePath = path.join(directory, file);
    try {
      const analysis = await analyzeFile(filePath);
      results.push({ file, analysis });
    } catch (error) {
      console.error(colorize(`✗ ${file}: ${error.message}`, 'red'));
    }
  }

  return results;
}

function displayAnalysis(filename, analysis) {
  console.log(colorize('─'.repeat(70), 'gray'));
  console.log(colorize(`📄 ${filename}`, 'bold'));
  console.log(colorize('─'.repeat(70), 'gray'));

  // Overall score
  const scoreColor = analysis.overall.score >= 8 ? 'green' :
                     analysis.overall.score >= 6 ? 'yellow' : 'red';
  console.log(`\n${colorize('Overall Score:', 'cyan')} ${colorize(analysis.overall.score + '/10', scoreColor)} (${analysis.overall.grade})`);
  console.log(`${colorize('Recommendation:', 'cyan')} ${analysis.overall.recommendation}\n`);

  // Detailed metrics
  console.log(colorize('Detailed Analysis:', 'cyan'));

  // Word count
  console.log(`  ${getScoreIcon(analysis.wordCount.score)} Word Count: ${analysis.wordCount.count} (target: ${analysis.wordCount.target}) - ${analysis.wordCount.score}/10`);

  // Keyword density
  if (analysis.keywordDensity) {
    console.log(`  ${getScoreIcon(analysis.keywordDensity.score)} Keyword Density: ${analysis.keywordDensity.density}% (${analysis.keywordDensity.count} mentions) - ${analysis.keywordDensity.score}/10`);
  }

  // Readability
  console.log(`  ${getScoreIcon(analysis.readability.score)} Readability: ${analysis.readability.score} (${analysis.readability.level}) - ${analysis.readability.score}/10`);

  // Repetition
  console.log(`  ${getScoreIcon(analysis.repetition.score)} Repetition: ${analysis.repetition.repetitionRate}% - ${analysis.repetition.score}/10`);

  // Structure
  console.log(`  ${getScoreIcon(analysis.structure.score)} Structure: ${analysis.structure.score}/10`);
  console.log(`    - Headings: ${analysis.structure.hasHeadings ? '✓' : '✗'}`);
  console.log(`    - Paragraphs: ${analysis.structure.hasParagraphs ? '✓' : '✗'}`);
  console.log(`    - Lists: ${analysis.structure.hasLists ? '✓' : '✗'}`);

  // AI fingerprints
  console.log(`  ${getScoreIcon(analysis.aiFingerprints.score)} AI Fingerprints: ${analysis.aiFingerprints.count} found - ${analysis.aiFingerprints.score}/10`);
  if (analysis.aiFingerprints.found.length > 0) {
    console.log(`    - Found: ${analysis.aiFingerprints.found.join(', ')}`);
  }

  // CTA
  console.log(`  ${getScoreIcon(analysis.cta.score)} Call-to-Action: ${analysis.cta.count} phrases - ${analysis.cta.score}/10`);

  // Local content
  if (analysis.localContent) {
    console.log(`  ${getScoreIcon(analysis.localContent.score)} Local Content: ${analysis.localContent.score}/10`);
    console.log(`    - Location mentions: ${analysis.localContent.locationMentions}`);
    console.log(`    - Local landmarks: ${analysis.localContent.hasLocalLandmarks ? '✓' : '✗'}`);
    console.log(`    - Local context: ${analysis.localContent.hasLocalContext ? '✓' : '✗'}`);
  }

  console.log('');
}

function getScoreIcon(score) {
  if (score >= 8) return colorize('✓', 'green');
  if (score >= 6) return colorize('○', 'yellow');
  return colorize('✗', 'red');
}

function displayBatchSummary(results) {
  console.log(colorize('\n═'.repeat(70), 'blue'));
  console.log(colorize('  📊 BATCH ANALYSIS SUMMARY', 'bold'));
  console.log(colorize('═'.repeat(70), 'blue') + '\n');

  const scores = results.map(r => r.analysis.overall.score);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  console.log(colorize('Overall Statistics:', 'cyan'));
  console.log(`  Total files analyzed: ${results.length}`);
  console.log(`  Average score: ${avgScore}/10`);
  console.log(`  Highest score: ${Math.max(...scores).toFixed(1)}/10`);
  console.log(`  Lowest score: ${Math.min(...scores).toFixed(1)}/10`);
  console.log('');

  // Distribution
  const excellent = scores.filter(s => s >= 8).length;
  const good = scores.filter(s => s >= 6 && s < 8).length;
  const fair = scores.filter(s => s >= 5 && s < 6).length;
  const poor = scores.filter(s => s < 5).length;

  console.log(colorize('Quality Distribution:', 'cyan'));
  console.log(`  ${colorize('Excellent (8-10):', 'green')} ${excellent} files`);
  console.log(`  ${colorize('Good (6-8):', 'yellow')} ${good} files`);
  console.log(`  ${colorize('Fair (5-6):', 'yellow')} ${fair} files`);
  console.log(`  ${colorize('Poor (<5):', 'red')} ${poor} files`);
  console.log('');

  // Top and bottom performers
  results.sort((a, b) => b.analysis.overall.score - a.analysis.overall.score);

  console.log(colorize('Top 3 Files:', 'green'));
  results.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.file}: ${r.analysis.overall.score}/10`);
  });
  console.log('');

  if (results.length > 3) {
    console.log(colorize('Bottom 3 Files (need improvement):', 'red'));
    results.slice(-3).reverse().forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.file}: ${r.analysis.overall.score}/10`);
    });
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);

  console.log('\n' + colorize('═'.repeat(70), 'blue'));
  console.log(colorize('  📝 CONTENT QUALITY ANALYZER', 'bold'));
  console.log(colorize('═'.repeat(70), 'blue'));

  if (args.length === 0) {
    // Analyze all suburb pages by default
    const suburbDir = path.join(PROJECT_ROOT, 'src/content/locations');
    const results = await analyzeBatch(suburbDir);

    if (results.length > 0) {
      // Display individual analyses
      for (const { file, analysis } of results) {
        displayAnalysis(file, analysis);
      }

      // Display summary
      displayBatchSummary(results);
    } else {
      console.log(colorize('\nNo markdown files found to analyze.', 'yellow'));
    }
  } else {
    // Analyze specific file
    const filePath = args[0];
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);

    const analysis = await analyzeFile(fullPath);
    displayAnalysis(path.basename(fullPath), analysis);
  }

  console.log(colorize('═'.repeat(70), 'blue') + '\n');
}

main().catch(error => {
  console.error(colorize('\nAnalysis error:', 'red'), error.message);
  process.exit(1);
});
