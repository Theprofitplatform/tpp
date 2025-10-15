/**
 * Case Study Loader
 * Provides access to verified case studies for content generation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all case studies
 * @returns {Promise<Array>} Array of case studies
 */
export async function getAllCaseStudies() {
  try {
    const files = await fs.readdir(__dirname);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const caseStudies = await Promise.all(
      jsonFiles.map(async file => {
        const content = await fs.readFile(path.join(__dirname, file), 'utf-8');
        return JSON.parse(content);
      })
    );

    return caseStudies.filter(cs => cs.verified);
  } catch (error) {
    console.warn('Failed to load case studies:', error.message);
    return [];
  }
}

/**
 * Get case study by category
 * @param {string} category - Category to filter by (SEO, Google Ads, Content Marketing, etc.)
 * @returns {Promise<Object|null>} Matching case study or null
 */
export async function getCaseStudyByCategory(category) {
  const caseStudies = await getAllCaseStudies();
  const matches = caseStudies.filter(cs =>
    cs.category.toLowerCase() === category.toLowerCase()
  );

  // Return random match if multiple exist
  return matches.length > 0
    ? matches[Math.floor(Math.random() * matches.length)]
    : null;
}

/**
 * Get case study by business type
 * @param {string} businessType - Business type to filter by
 * @returns {Promise<Object|null>} Matching case study or null
 */
export async function getCaseStudyByBusinessType(businessType) {
  const caseStudies = await getAllCaseStudies();
  const matches = caseStudies.filter(cs =>
    cs.business_type.toLowerCase().includes(businessType.toLowerCase())
  );

  return matches.length > 0
    ? matches[Math.floor(Math.random() * matches.length)]
    : null;
}

/**
 * Format case study for social media
 * @param {Object} caseStudy - Case study object
 * @param {string} format - Format type ('short', 'detailed')
 * @returns {string} Formatted case study text
 */
export function formatCaseStudyForSocial(caseStudy, format = 'short') {
  if (!caseStudy) return '';

  const { business_type, location, results } = caseStudy;

  if (format === 'short') {
    const primaryResult = results[0];
    return `One ${business_type} in ${location} saw ${primaryResult.metric} in ${primaryResult.type} within ${primaryResult.timeframe}`;
  }

  // Detailed format
  const resultList = results
    .map(r => `• ${r.metric} in ${r.type}${r.improvement ? ` (${r.improvement})` : ''}`)
    .join('\n');

  return `Real results from a ${business_type} in ${location}:\n\n${resultList}\n\nTimeframe: ${results[0].timeframe}`;
}

/**
 * Get random case study for content variety
 * @returns {Promise<Object|null>} Random case study
 */
export async function getRandomCaseStudy() {
  const caseStudies = await getAllCaseStudies();
  return caseStudies.length > 0
    ? caseStudies[Math.floor(Math.random() * caseStudies.length)]
    : null;
}

export default {
  getAllCaseStudies,
  getCaseStudyByCategory,
  getCaseStudyByBusinessType,
  formatCaseStudyForSocial,
  getRandomCaseStudy
};
