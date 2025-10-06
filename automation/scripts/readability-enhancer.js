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
 * Main readability enhancement function with 2-pass system
 * @param {string} content - Original markdown content
 * @param {Object} metadata - Post metadata (title, category, tags)
 * @returns {Object} Enhanced content and metrics
 */
export async function enhanceReadability(content, metadata = {}) {
  console.log('\n📝 Enhancing readability (2-pass system)...');

  try {
    // PASS 1: Initial simplification
    console.log('   Pass 1: Initial simplification...');
    const pass1Result = await enhanceReadabilityPass(content, metadata, 1);

    if (!pass1Result.success) {
      return pass1Result;
    }

    let enhancedContent = pass1Result.content;
    let totalImprovements = pass1Result.improvements;

    // Calculate Flesch score after Pass 1
    const fleschAfterPass1 = estimateFleschScore(enhancedContent);
    console.log(`   Pass 1 complete: Estimated Flesch ${fleschAfterPass1}`);

    // PASS 2: Aggressive simplification if still below target
    if (fleschAfterPass1 < 55) {
      console.log('   Pass 2: Aggressive simplification (Flesch < 55)...');
      const pass2Result = await enhanceReadabilityPass(
        enhancedContent,
        metadata,
        2,
        { targetFlesch: 65, aggressive: true }
      );

      if (pass2Result.success) {
        enhancedContent = pass2Result.content;
        const fleschAfterPass2 = estimateFleschScore(enhancedContent);
        console.log(`   Pass 2 complete: Estimated Flesch ${fleschAfterPass2}`);

        // Combine improvements from both passes
        totalImprovements = {
          ...totalImprovements,
          pass2Applied: true,
          finalEstimatedFlesch: fleschAfterPass2,
          totalGain: fleschAfterPass2 - 27 // Assuming baseline ~27
        };
      }
    } else {
      console.log('   Pass 2 skipped: Flesch score acceptable');
      totalImprovements.pass2Applied = false;
      totalImprovements.finalEstimatedFlesch = fleschAfterPass1;
    }

    console.log('✅ Readability enhancement complete (2-pass)');
    console.log(`   Final estimated Flesch: ${totalImprovements.finalEstimatedFlesch}`);

    return {
      content: enhancedContent,
      improvements: totalImprovements,
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
 * Single pass of readability enhancement
 */
async function enhanceReadabilityPass(content, metadata, passNumber, options = {}) {
  const prompt = passNumber === 1
    ? buildEnhancementPrompt(content, metadata)
    : buildAggressiveEnhancementPrompt(content, metadata, options);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }]
  });

  const enhancedContent = response.content[0].text.trim();
  const improvements = calculateImprovements(content, enhancedContent);

  return {
    content: enhancedContent,
    improvements,
    success: true
  };
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
 * Build aggressive enhancement prompt for Pass 2
 */
function buildAggressiveEnhancementPrompt(content, metadata, options) {
  return `You are a professional content editor. This content has already been simplified once, but it's STILL too complex for small business owners (current Flesch ~40, target 65+).

TASK: Aggressively simplify this content to reach Flesch Reading Ease of 65+. This is PASS 2 - be more aggressive than normal.

TARGET: Flesch Reading Ease 65+ (8th-9th grade level, easily readable)
CURRENT: Flesch ~40 (College level, too difficult)

CONTENT TO SIMPLIFY FURTHER:
${content}

AGGRESSIVE SIMPLIFICATION RULES:

1. **Maximum Sentence Length: 20 words**
   - Every sentence over 20 words → Split into 2-3 sentences
   - Use periods aggressively
   - One idea per sentence

   Example:
   BEFORE: "When you improve your Quality Score from 5 to 8, you can reduce your cost-per-click by 30-50%, which means you're paying significantly less for the same keywords while maintaining or improving your ad position."

   AFTER: "Improve your Quality Score from 5 to 8. Your cost per click drops by 30-50%. You pay less for the same keywords. Your ad position stays the same or gets better."

2. **Replace ALL Complex Words**
   - 3+ syllable words → 1-2 syllable alternatives
   - Technical terms → Simple explanations in parentheses

   Replacements (MANDATORY):
   - "significantly" → "much"
   - "maintain" → "keep"
   - "approximately" → "about"
   - "additional" → "more" or "extra"
   - "previously" → "before"
   - "currently" → "now"
   - "demonstrated" → "showed"
   - "particular" → "certain" or remove
   - "essential" → "vital" or "key"
   - "numerous" → "many"
   - "however" → "but"
   - "therefore" → "so"
   - "consequently" → "so"
   - "additionally" → "also"

3. **Extreme Simplification**
   - Remove ALL unnecessary words
   - Use contractions: "it is" → "it's", "you are" → "you're"
   - Active voice ONLY
   - Direct language

4. **Add Brief Explanations**
   - First mention of technical term → add (simple explanation)
   - Example: "Quality Score (Google's 1-10 ad rating)"

5. **Paragraph Structure**
   - Maximum 2-3 sentences per paragraph
   - Add white space liberally
   - Use transition words: "Here's why", "The result", "For example"

6. **List Everything Possible**
   - Complex ideas → bullet points
   - Multiple points → numbered lists
   - Keep list items under 15 words each

7. **MAINTAIN ALL**:
   - ✅ Links (exactly as they are)
   - ✅ Examples and numbers
   - ✅ Case studies
   - ✅ Headings and structure
   - ✅ Core value and information

8. **CRITICAL TARGET**:
   - Average words per sentence: 12-15 (currently ~18)
   - Complex words: <10% (currently ~20%)
   - Reading level: 8th-9th grade
   - Flesch score: 65+

This is PASS 2. The content has already been simplified once. Be MORE aggressive this time. Prioritize readability over elegance.

OUTPUT: Return the complete simplified markdown. Same structure, but MUCH simpler language.

Begin aggressive simplification now:`;
}

/**
 * Estimate Flesch Reading Ease score
 * Flesch = 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
 */
function estimateFleschScore(content) {
  // Remove markdown formatting for accurate counting
  const plainText = content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/[#*`_]/g, '') // Remove markdown syntax
    .replace(/\n+/g, ' '); // Normalize whitespace

  // Count sentences (approximate)
  const sentences = plainText
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 10).length;

  // Count words
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length;

  // Estimate syllables (rough approximation)
  const syllables = words.split(/\s+/).reduce((count, word) => {
    return count + estimateSyllables(word);
  }, 0);

  if (sentences === 0 || words === 0) return 0;

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;

  const flesch = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);

  return Math.round(flesch * 10) / 10;
}

/**
 * Estimate syllable count for a word
 */
function estimateSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowelGroups = word.match(/[aeiouy]+/g);
  if (!vowelGroups) return 1;

  let syllableCount = vowelGroups.length;

  // Adjust for silent 'e'
  if (word.endsWith('e') && syllableCount > 1) {
    syllableCount--;
  }

  // Adjust for common patterns
  if (word.endsWith('le') && word.length > 2) {
    syllableCount++;
  }

  return Math.max(1, syllableCount);
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
