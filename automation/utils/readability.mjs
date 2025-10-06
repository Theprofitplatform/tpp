/**
 * Readability Scoring Utilities
 * Implements Flesch Reading Ease and Flesch-Kincaid Grade Level
 */

/**
 * Count syllables in a word (approximate)
 * @param {string} word
 * @returns {number}
 */
function countSyllables(word) {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove non-letters
  word = word.replace(/[^a-z]/g, '');

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e
  if (word.endsWith('e')) {
    syllables--;
  }

  // Ensure at least 1 syllable
  return Math.max(syllables, 1);
}

/**
 * Calculate Flesch Reading Ease score
 * Score: 0-100 (higher = easier to read)
 * - 90-100: Very Easy (5th grade)
 * - 80-89: Easy (6th grade)
 * - 70-79: Fairly Easy (7th grade)
 * - 60-69: Standard (8th-9th grade)
 * - 50-59: Fairly Difficult (10th-12th grade)
 * - 30-49: Difficult (College)
 * - 0-29: Very Difficult (College graduate)
 *
 * @param {string} text
 * @returns {Object} { score, grade, interpretation }
 */
export function fleschReadingEase(text) {
  // Remove markdown formatting
  const cleanText = text
    .replace(/#{1,6}\s/g, '') // Remove heading markers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
    .replace(/`([^`]+)`/g, '$1'); // Remove code formatting

  // Split into sentences (approximate)
  const sentences = cleanText
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0);

  // Split into words
  const words = cleanText
    .split(/\s+/)
    .filter(w => w.trim().length > 0);

  // Count syllables
  let totalSyllables = 0;
  words.forEach(word => {
    totalSyllables += countSyllables(word);
  });

  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;

  // Flesch Reading Ease formula:
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  // Interpret score
  let grade, interpretation;
  if (score >= 90) {
    grade = '5th grade';
    interpretation = 'Very Easy';
  } else if (score >= 80) {
    grade = '6th grade';
    interpretation = 'Easy';
  } else if (score >= 70) {
    grade = '7th grade';
    interpretation = 'Fairly Easy';
  } else if (score >= 60) {
    grade = '8th-9th grade';
    interpretation = 'Standard';
  } else if (score >= 50) {
    grade = '10th-12th grade';
    interpretation = 'Fairly Difficult';
  } else if (score >= 30) {
    grade = 'College';
    interpretation = 'Difficult';
  } else {
    grade = 'College graduate';
    interpretation = 'Very Difficult';
  }

  return {
    score: Math.round(score * 10) / 10,
    grade,
    interpretation,
    metrics: {
      sentences: sentenceCount,
      words: wordCount,
      syllables: totalSyllables,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100
    }
  };
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Returns US grade level needed to understand the text
 *
 * @param {string} text
 * @returns {Object} { gradeLevel, interpretation }
 */
export function fleschKincaidGradeLevel(text) {
  // Remove markdown formatting (same as above)
  const cleanText = text
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

  const sentences = cleanText
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0);

  const words = cleanText
    .split(/\s+/)
    .filter(w => w.trim().length > 0);

  let totalSyllables = 0;
  words.forEach(word => {
    totalSyllables += countSyllables(word);
  });

  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;

  // Flesch-Kincaid Grade Level formula:
  // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  const gradeLevel = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;

  // Interpret grade level
  let interpretation;
  if (gradeLevel <= 6) {
    interpretation = 'Easy (Elementary school)';
  } else if (gradeLevel <= 8) {
    interpretation = 'Plain English (Middle school)';
  } else if (gradeLevel <= 12) {
    interpretation = 'Standard (High school)';
  } else if (gradeLevel <= 16) {
    interpretation = 'Difficult (College level)';
  } else {
    interpretation = 'Very Difficult (Graduate level)';
  }

  return {
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    interpretation
  };
}

/**
 * Get comprehensive readability analysis
 * @param {string} text
 * @returns {Object}
 */
export function analyzeReadability(text) {
  const ease = fleschReadingEase(text);
  const grade = fleschKincaidGradeLevel(text);

  // Recommendations
  const recommendations = [];

  if (ease.score < 60) {
    recommendations.push('Consider shorter sentences and simpler words');
  }
  if (ease.metrics.avgWordsPerSentence > 25) {
    recommendations.push(`Average ${ease.metrics.avgWordsPerSentence} words/sentence is high. Aim for <20.`);
  }
  if (grade.gradeLevel > 12) {
    recommendations.push('Content may be too complex for general audience');
  }

  // Determine if blog-appropriate
  let blogAppropriate = true;
  let reason = '';

  if (ease.score < 50) {
    blogAppropriate = false;
    reason = 'Too difficult for blog audience (aim for 60-70)';
  } else if (grade.gradeLevel > 14) {
    blogAppropriate = false;
    reason = 'Grade level too high for blog content (aim for 8-10)';
  }

  return {
    fleschReadingEase: ease,
    fleschKincaidGrade: grade,
    blogAppropriate,
    reason,
    recommendations,
    summary: `Score: ${ease.score}/100 (${ease.interpretation}), Grade Level: ${grade.gradeLevel}`
  };
}
