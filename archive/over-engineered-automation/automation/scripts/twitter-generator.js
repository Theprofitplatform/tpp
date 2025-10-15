/**
 * Twitter Thread Generator
 * Transforms blog content into engaging Twitter threads
 *
 * Week 3: Multi-Channel Distribution
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generate Twitter thread from blog content
 * @param {string} content - Full blog post content
 * @param {Object} metadata - Post metadata (title, category, tags, etc.)
 * @returns {Promise<Object>} Twitter thread with individual tweets
 */
export async function generateTwitterThread(content, metadata) {
  console.log('\n🐦 Generating Twitter thread...');

  try {
    // Extract key insights
    const contentPreview = content.substring(0, 1500);

    const prompt = `Transform this blog post into an engaging Twitter thread for Sydney business owners.

**Blog Post Details:**
Title: ${metadata.title}
Category: ${metadata.category}
Tags: ${metadata.tags.join(', ')}

**Content Preview:**
${contentPreview}

**Requirements:**
1. Thread length: 6-8 tweets
2. Character limit: Each tweet MUST be <280 characters (strict)
3. Structure:
   - Tweet 1: Compelling hook with emoji + thread announcement
   - Tweets 2-7: One key insight per tweet (bite-sized value)
   - Tweet 8: CTA with blog link + engagement ask

4. Format:
   - Number each tweet: 1/8, 2/8, etc.
   - Use emojis strategically (1-2 per tweet)
   - Make each tweet standalone readable
   - Use line breaks in tweets for readability

5. Style:
   - Conversational, punchy
   - No jargon - keep it simple
   - Use power words
   - Create curiosity gaps

**Important:**
- Tweet 1 must grab attention immediately
- Each insight tweet should be actionable
- Include key statistics/data
- End with: "Read the complete guide: [BLOG_URL]" + "Like/RT if you found this helpful!"

**Format:**
Return tweets separated by "---" on a new line.
Each tweet must include its number (e.g., "1/8")

Example:
🧵 THREAD: [Hook]

We found [shocking insight]

Here's what you need to know 👇

1/8
---
[Insight 1]

2/8
---
[Continue...]

Return ONLY the thread, no explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const threadText = message.content[0].text.trim();

    // Parse tweets
    const tweets = threadText
      .split('---')
      .map(tweet => tweet.trim())
      .filter(tweet => tweet.length > 0);

    // Validate tweet lengths
    const invalidTweets = tweets.filter(tweet => tweet.length > 280);
    if (invalidTweets.length > 0) {
      console.warn(`   ⚠️  ${invalidTweets.length} tweets exceed 280 chars, truncating...`);
      // Truncate long tweets
      for (let i = 0; i < tweets.length; i++) {
        if (tweets[i].length > 280) {
          tweets[i] = tweets[i].substring(0, 277) + '...';
        }
      }
    }

    console.log(`   ✅ Twitter thread generated (${tweets.length} tweets)`);
    console.log(`   📊 Avg length: ${Math.round(tweets.reduce((sum, t) => sum + t.length, 0) / tweets.length)} chars`);

    return {
      tweets,
      platform: 'twitter',
      tweetCount: tweets.length,
      totalChars: tweets.reduce((sum, t) => sum + t.length, 0),
      avgChars: Math.round(tweets.reduce((sum, t) => sum + t.length, 0) / tweets.length),
      metadata: {
        title: metadata.title,
        category: metadata.category,
        slug: metadata.slug,
        url: metadata.url
      },
      success: true
    };

  } catch (error) {
    console.error('   ❌ Twitter generation failed:', error.message);
    return {
      tweets: [],
      platform: 'twitter',
      success: false,
      error: error.message
    };
  }
}

/**
 * Format Twitter thread with blog URL
 */
export function formatTwitterThread(threadData, blogUrl) {
  return threadData.tweets.map(tweet =>
    tweet.replace(/\[BLOG_URL\]/g, blogUrl)
  );
}

/**
 * Generate thread as single text block for easy copying
 */
export function formatThreadForCopy(threadData, blogUrl) {
  const formattedTweets = formatTwitterThread(threadData, blogUrl);
  return formattedTweets.join('\n\n---\n\n');
}

export default {
  generateTwitterThread,
  formatTwitterThread,
  formatThreadForCopy
};
