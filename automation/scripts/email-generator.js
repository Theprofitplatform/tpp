/**
 * Email Newsletter Generator
 * Transforms blog content into personal email newsletters
 *
 * Week 3: Multi-Channel Distribution
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generate email newsletter from blog content
 * @param {string} content - Full blog post content
 * @param {Object} metadata - Post metadata (title, category, tags, author, etc.)
 * @returns {Promise<Object>} Email newsletter with subject line
 */
export async function generateEmailNewsletter(content, metadata) {
  console.log('\n📧 Generating email newsletter...');

  try {
    // Extract key insights
    const contentPreview = content.substring(0, 2000);

    const prompt = `Transform this blog post into a personal email newsletter for Sydney business owners.

**Blog Post Details:**
Title: ${metadata.title}
Category: ${metadata.category}
Author: ${metadata.author || 'Avi'}
Tags: ${metadata.tags.join(', ')}

**Content Preview:**
${contentPreview}

**Requirements:**
1. Length: 800-1,200 words (newsletter optimal)
2. Format: Plain text (no HTML)
3. Tone: Personal, conversational, helpful
4. Structure:
   - Subject line: <50 characters, compelling, specific
   - Greeting: "Hey [First Name],"
   - Opening: Personal introduction (2-3 sentences)
   - Body: 3-4 condensed key insights from blog
   - CTA: Clear invitation to read full post
   - Sign-off: "Cheers, ${metadata.author || 'Avi'}"
   - P.S.: Additional value or urgency

5. Style:
   - Write like you're emailing a friend
   - Use "I" and "you" language
   - Break up text with line breaks
   - Make it scannable
   - Sydney-specific when relevant

**Important:**
- Subject line must be intriguing (not clickbait)
- Opening should hook reader immediately
- Condense blog insights (don't just copy)
- CTA should feel natural, not pushy
- P.S. should add real value

**Format:**
SUBJECT: [Subject line here]

---

[Email body]

Return ONLY the email (with subject line), no explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const emailText = message.content[0].text.trim();

    // Parse subject and body
    const subjectMatch = emailText.match(/SUBJECT:\s*(.+?)(?:\n|$)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : metadata.title;

    // Remove subject line from body
    const body = emailText
      .replace(/SUBJECT:\s*.+?\n+---\n+/, '')
      .trim();

    // Calculate metadata
    const wordCount = body.split(/\s+/).length;
    const charCount = body.length;

    console.log(`   ✅ Email newsletter generated`);
    console.log(`   📊 Subject: "${subject}" (${subject.length} chars)`);
    console.log(`   📊 Body: ${wordCount} words, ${charCount} chars`);

    return {
      subject,
      body,
      platform: 'email',
      wordCount,
      charCount,
      subjectLength: subject.length,
      metadata: {
        title: metadata.title,
        category: metadata.category,
        author: metadata.author || 'Avi',
        slug: metadata.slug,
        url: metadata.url
      },
      success: true
    };

  } catch (error) {
    console.error('   ❌ Email generation failed:', error.message);
    return {
      subject: null,
      body: null,
      platform: 'email',
      success: false,
      error: error.message
    };
  }
}

/**
 * Format email with blog URL and personalization
 */
export function formatEmail(emailData, blogUrl, options = {}) {
  const {
    firstName = '[First Name]',
    customGreeting = null
  } = options;

  let formatted = emailData.body;

  // Replace placeholders
  formatted = formatted.replace(/\[First Name\]/g, firstName);
  formatted = formatted.replace(/\[BLOG_URL\]/g, blogUrl);

  // Replace greeting if custom provided
  if (customGreeting) {
    formatted = formatted.replace(/Hey \[First Name\],?/g, customGreeting);
  }

  return {
    subject: emailData.subject,
    body: formatted
  };
}

/**
 * Generate plain text version optimized for deliverability
 */
export function generatePlainTextVersion(emailData, blogUrl) {
  // Already plain text, just format URL
  let plainText = emailData.body;

  // Replace [BLOG_URL] with actual URL
  plainText = plainText.replace(/\[BLOG_URL\]/g, blogUrl);

  // Ensure no HTML entities
  plainText = plainText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return plainText;
}

export default {
  generateEmailNewsletter,
  formatEmail,
  generatePlainTextVersion
};
