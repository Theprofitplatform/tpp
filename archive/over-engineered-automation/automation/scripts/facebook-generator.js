/**
 * Facebook Post Generator
 * Transforms blog content into engaging Facebook posts
 *
 * Facebook-specific requirements:
 * - 80-150 words (optimal for Facebook algorithm)
 * - Conversational, community-focused tone
 * - Emojis and visual elements encouraged
 * - Questions to drive engagement
 * - Local Sydney focus
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generate Facebook post from blog content
 * @param {string} content - Full blog post content
 * @param {Object} metadata - Post metadata (title, category, tags, etc.)
 * @returns {Promise<Object>} Facebook post with metadata
 */
export async function generateFacebookPost(content, metadata) {
  console.log('\n📘 Generating Facebook post...');

  try {
    // Extract key insights (first 1500 chars for context)
    const contentPreview = content.substring(0, 1500);

    const prompt = `Transform this blog post into an engaging Facebook post for Sydney small business owners.

**Blog Post Details:**
Title: ${metadata.title}
Category: ${metadata.category}
Tags: ${metadata.tags ? metadata.tags.join(', ') : 'SEO, Marketing, Sydney'}

**Content Preview:**
${contentPreview}

**Facebook Requirements:**
1. Length: 80-150 words (Facebook algorithm optimal)
2. Tone: Conversational, community-focused, friendly
3. Structure:
   - Opening: Shocking statistic or relatable problem with emoji
   - Story: Real Sydney business case study (use names like "Sarah's café")
   - Solution: Clear benefit of the free tools
   - Visual Note: Mention adding relevant images
   - Engagement: Question at the END to drive comments
   - CTA: Clear call-to-action to read full post

4. Format:
   - Use emojis strategically (3-5 total)
   - Make it scannable with line breaks
   - Keep paragraphs short (1-2 sentences)
   - Use specific Sydney postcodes (2000, 2026, 2088, etc.)
   - Include visual suggestion: "[Add relevant image/screenshot]"

5. Style:
   - Write like you're talking to a friend
   - Focus on community and local impact
   - Use storytelling with real business examples
   - Make it shareable and relatable

**Important:**
- Start with shocking statistic or relatable problem
- Use storytelling: "Meet [Name]'s [Business Type] in [Sydney Suburb]"
- Place engagement question AT THE END after delivering value
- Include note about adding relevant images
- End with clear CTA: "Read the complete guide: [BLOG_URL]"
- Use specific, benefit-focused hashtags (3-4 max)

**Hashtag Strategy:**
- Location: #SydneySmallBusiness, #SydneyBusiness
- Benefit: #FreeSEOTools, #GoogleRanking
- Niche: #LocalSEO, #DigitalMarketingSydney

**Facebook Algorithm Optimization:**
- Posts with questions get 2x more engagement
- Posts with images get 2.3x more engagement
- Local references increase relevance by 47%
- Keep it under 150 words for optimal reach
- Question at end drives 3x more comments

Return ONLY the Facebook post text, no explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const facebookPost = message.content[0].text.trim();

    // Calculate metadata
    const wordCount = facebookPost.split(/\s+/).length;
    const charCount = facebookPost.length;
    const hashtagMatches = facebookPost.match(/#\w+/g) || [];
    const hashtags = hashtagMatches.map(tag => tag.substring(1)); // Remove # prefix

    console.log(`   ✅ Facebook post generated (${wordCount} words, ${charCount} chars)`);
    console.log(`   📊 Hashtags: ${hashtags.length}`);

    return {
      content: facebookPost,
      platform: 'facebook',
      wordCount,
      charCount,
      hashtags,
      metadata: {
        title: metadata.title,
        category: metadata.category,
        slug: metadata.slug,
        url: metadata.url
      },
      success: true
    };

  } catch (error) {
    console.error('   ❌ Facebook generation failed:', error.message);
    return {
      content: null,
      platform: 'facebook',
      success: false,
      error: error.message
    };
  }
}

/**
 * Format Facebook post with blog URL
 */
export function formatFacebookPost(postData, blogUrl) {
  let formatted = postData.content;

  // Replace [BLOG_URL] placeholder
  formatted = formatted.replace(/\[BLOG_URL\]/g, blogUrl);

  return formatted;
}

export default { generateFacebookPost, formatFacebookPost };