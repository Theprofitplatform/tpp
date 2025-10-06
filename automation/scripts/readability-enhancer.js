/**
 * Readability Enhancer
 * Automatically improves content readability by simplifying complex sentences,
 * replacing jargon, and optimizing paragraph structure
 *
 * Target: Flesch Reading Ease 60-70 (vs current 23-36)
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
});

/**
 * Main readability enhancement function
 * @param {string} content - Original markdown content
 * @param {Object} metadata - Post metadata (title, category, tags)
 * @returns {Object} Enhanced content and metrics
 */
export async function enhanceReadability(content, metadata = {}) {
  console.log('\n📝 Enhancing readability...');

  try {
    // Create enhancement prompt
    const prompt = buildEnhancementPrompt(content, metadata);

    // Call Claude to enhance readability
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.3, // Lower temperature for consistency
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const enhancedContent = response.content[0].text.trim();

    // Calculate improvement metrics
    const improvements = calculateImprovements(content, enhancedContent);

    console.log('✅ Readability enhanced');
    console.log(`   Estimated Flesch improvement: ${improvements.estimatedFleschGain}+ points`);

    return {
      content: enhancedContent,
      improvements,
      success: true
    };

  } catch (error) {
    console.error('❌ Readability enhancement failed:', error.message);
    return {
      content, // Return original content if enhancement fails
      improvements: null,
      success: false,
      error: error.message
    };
  }
}

/**
 * Build Claude prompt for readability enhancement
 */
function buildEnhancementPrompt(content, metadata) {
  return `You are a professional content editor specializing in making business content more accessible to small business owners without losing depth or authority.

TASK: Improve the readability of this blog post while maintaining all key information, examples, and value.

TARGET AUDIENCE: Sydney small business owners (no technical background assumed)
TARGET READABILITY: Flesch Reading Ease 60-70 (currently ~30-40)

CONTENT TO ENHANCE:
${content}

READABILITY ENHANCEMENT RULES:

1. **Sentence Simplification** (CRITICAL)
   - Break sentences over 25 words into 2-3 shorter sentences
   - Target: 15-18 words per sentence average
   - Use periods instead of semicolons where possible
   - Split complex sentences at "and", "but", "or", "which", "that"

   Example:
   BEFORE: "When businesses design for desktop first, they typically fall into what we call the 'feature creep trap,' where designers pack in every possible feature, navigation option, and piece of content they can imagine, creating cluttered interfaces."

   AFTER: "When businesses design for desktop first, they fall into the 'feature creep trap.' Designers pack in every possible feature and navigation option. This creates cluttered interfaces."

2. **Word Choice Simplification**
   - Replace complex words (3+ syllables) with simpler alternatives
   - Keep technical terms when necessary, but add brief explanations
   - Remove unnecessary qualifiers: "very", "quite", "rather", "somewhat"

   Replacements:
   - "utilise" → "use"
   - "implement" → "use" or "set up"
   - "optimise" → "improve"
   - "comprehensive" → "complete" or "full"
   - "facilitate" → "help"
   - "substantial" → "large" or "big"
   - "ascertain" → "find out"
   - "consequently" → "so"
   - "subsequently" → "then"

3. **Paragraph Optimization**
   - Max 3-4 sentences per paragraph
   - One main idea per paragraph
   - Add transitional phrases: "Here's why", "The result?", "For example"
   - Use white space generously

4. **Active Voice Priority**
   - Replace passive voice with active voice
   - Make subjects clear and actors explicit

   Example:
   BEFORE: "Quality Score is calculated by Google in real-time."
   AFTER: "Google calculates Quality Score in real-time."

5. **List Optimization**
   - Convert complex sentences into bullet points
   - Use numbered lists for sequential steps
   - Keep list items parallel in structure

6. **Technical Terms**
   - Keep essential jargon (SEO, ROI, CPC)
   - Add brief explanations in parentheses on first use
   - Example: "Quality Score (Google's 1-10 rating of ad relevance)"

7. **Maintain ALL**:
   - ✅ Links (exactly as they are)
   - ✅ Examples and case studies
   - ✅ Statistics and numbers
   - ✅ Sydney suburb mentions
   - ✅ Headings and structure
   - ✅ Schema-ready content (FAQ Q&A, How-To steps)
   - ✅ Tone and expertise

8. **DO NOT**:
   - ❌ Remove important details
   - ❌ Oversimplify to the point of losing value
   - ❌ Change markdown formatting
   - ❌ Modify links or URLs
   - ❌ Remove case studies or examples
   - ❌ Change heading levels

ENHANCEMENT APPROACH:
1. Read each section
2. Identify long sentences (25+ words) → break them down
3. Find complex words → replace with simpler alternatives
4. Check paragraphs → split if >4 sentences
5. Convert passive voice → active voice
6. Keep all facts, examples, and value intact

OUTPUT: Return the complete enhanced markdown content. Maintain the exact same structure, headings, and formatting. Only modify sentence structure and word choice for improved readability.

Begin enhancement now:`;
}

/**
 * Calculate readability improvements
 */
function calculateImprovements(original, enhanced) {
  const originalWords = original.split(/\s+/).length;
  const enhancedWords = enhanced.split(/\s+/).length;

  const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const enhancedSentences = enhanced.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  const originalAvgWords = originalWords / originalSentences;
  const enhancedAvgWords = enhancedWords / enhancedSentences;

  // Rough Flesch gain estimation based on sentence length reduction
  // Each word reduction per sentence ≈ 2-3 Flesch points improvement
  const avgWordsReduction = originalAvgWords - enhancedAvgWords;
  const estimatedFleschGain = Math.round(avgWordsReduction * 2.5);

  return {
    originalWords,
    enhancedWords,
    wordCountChange: enhancedWords - originalWords,
    originalAvgWordsPerSentence: originalAvgWords.toFixed(1),
    enhancedAvgWordsPerSentence: enhancedAvgWords.toFixed(1),
    sentenceCountChange: enhancedSentences - originalSentences,
    estimatedFleschGain: Math.max(0, estimatedFleschGain)
  };
}

/**
 * Generate readability enhancement report
 */
export function generateEnhancementReport(improvements) {
  if (!improvements) {
    return '\n⚠️  Readability enhancement was skipped or failed\n';
  }

  return `
=== READABILITY ENHANCEMENT REPORT ===

Original avg words/sentence: ${improvements.originalAvgWordsPerSentence}
Enhanced avg words/sentence: ${improvements.enhancedAvgWordsPerSentence}
Improvement: ${(improvements.originalAvgWordsPerSentence - improvements.enhancedAvgWordsPerSentence).toFixed(1)} words shorter

Sentence count change: ${improvements.sentenceCountChange > 0 ? '+' : ''}${improvements.sentenceCountChange}
Word count change: ${improvements.wordCountChange > 0 ? '+' : ''}${improvements.wordCountChange}

Estimated Flesch Reading Ease gain: +${improvements.estimatedFleschGain} points
${improvements.estimatedFleschGain >= 20 ? '✅ Significant improvement' : improvements.estimatedFleschGain >= 10 ? '✅ Good improvement' : '⚠️  Moderate improvement'}
`;
}

export default { enhanceReadability, generateEnhancementReport };
