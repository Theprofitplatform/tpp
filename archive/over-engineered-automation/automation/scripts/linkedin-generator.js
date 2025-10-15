/**
 * LinkedIn Post Generator
 * Transforms blog content into professional LinkedIn posts
 *
 * Week 3: Multi-Channel Distribution
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generate LinkedIn post from blog content
 * @param {string} content - Full blog post content
 * @param {Object} metadata - Post metadata (title, category, tags, etc.)
 * @returns {Promise<Object>} LinkedIn post with metadata
 */
export async function generateLinkedInPost(content, metadata) {
  console.log('\n📱 Generating LinkedIn post...');

  try {
    // Extract key insights (first 1500 chars for context)
    const contentPreview = content.substring(0, 1500);

    const prompt = `Transform this blog post into a compelling LinkedIn post for Sydney business owners and marketing professionals.

**Blog Post Details:**
Title: ${metadata.title}
Category: ${metadata.category}
Tags: ${metadata.tags.join(', ')}

**Content Preview:**
${contentPreview}

**Requirements:**
1. Length: 300-500 words (LinkedIn optimal)
2. Tone: Professional thought leadership
3. Structure:
   - Opening hook: Bold statistic, question, or provocative statement (with emoji)
   - Context: Brief problem statement or opportunity
   - Value: 3-4 key takeaways from the blog post
   - CTA: Clear call-to-action to read full post
   - Hashtags: 3-5 relevant hashtags

4. Format:
   - Use line breaks for readability (don't write walls of text)
   - Add 1-2 strategic emojis (not excessive)
   - Make it scannable

5. Style:
   - Authoritative but approachable
   - Sydney-specific when relevant
   - Focus on business impact
   - Use "you" language (direct address)

**Important:**
- Start with a hook that stops scrolling
- Make insights actionable
- Include the key statistics/data from the blog
- End with clear CTA: "Read the full guide: [BLOG_URL]"

Return ONLY the LinkedIn post text, no explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const linkedInPost = message.content[0].text.trim();

    // Calculate metadata
    const wordCount = linkedInPost.split(/\s+/).length;
    const charCount = linkedInPost.length;
    const hashtagMatches = linkedInPost.match(/#\w+/g) || [];
    const hashtags = hashtagMatches.map(tag => tag.substring(1)); // Remove # prefix

    console.log(`   ✅ LinkedIn post generated (${wordCount} words, ${charCount} chars)`);
    console.log(`   📊 Hashtags: ${hashtags.length}`);

    return {
      content: linkedInPost,
      platform: 'linkedin',
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
    console.error('   ❌ LinkedIn generation failed:', error.message);
    return {
      content: null,
      platform: 'linkedin',
      success: false,
      error: error.message
    };
  }
}

/**
 * Format LinkedIn post with blog URL
 */
export function formatLinkedInPost(postData, blogUrl) {
  let formatted = postData.content;

  // Replace [BLOG_URL] placeholder
  formatted = formatted.replace(/\[BLOG_URL\]/g, blogUrl);

  return formatted;
}

export default { generateLinkedInPost, formatLinkedInPost };
