/**
 * Discord Webhook Notifier
 * Sends rich notifications to Discord when social media content is generated
 */

/**
 * Send notification to Discord webhook with automatic content truncation
 * @param {string} webhookUrl - Discord webhook URL
 * @param {Object} data - Notification data
 * @returns {Promise<boolean>} Success status
 */
export async function sendDiscordNotification(webhookUrl, data) {
  try {
    // Discord has a 2000 character limit per message content
    // Truncate content if needed
    if (data.content && data.content.length > 1950) {
      console.warn(`⚠️  Message truncated from ${data.content.length} to 1950 chars`);
      data.content = data.content.substring(0, 1947) + '...';
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error.message);
    return false;
  }
}

/**
 * Create rich embed for social media generation summary
 * @param {Object} results - Social media generation results
 * @returns {Object} Discord embed object
 */
export function createSocialMediaEmbed(results) {
  const { blog, variants, summary } = results;

  // Determine color based on success rate
  const successRate = (summary.successful / summary.total) * 100;
  const color = successRate === 100 ? 0x00ff00 : // Green for 100%
                successRate >= 75 ? 0xffff00 :    // Yellow for 75%+
                0xff0000;                          // Red for <75%

  const embed = {
    title: '📱 Social Media Content Generated',
    description: `Blog: **${blog.title}**`,
    color: color,
    fields: [],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'The Profit Platform • Content Automation'
    }
  };

  // Blog info
  embed.fields.push({
    name: '📝 Blog Post',
    value: `**Words:** ${blog.wordCount.toLocaleString()}\n**URL:** ${blog.url}`,
    inline: false
  });

  // Summary
  embed.fields.push({
    name: '📊 Generation Summary',
    value: `✅ **${summary.successful}/${summary.total}** variants generated successfully`,
    inline: false
  });

  // LinkedIn
  if (variants.linkedIn && variants.linkedIn.success) {
    const ln = variants.linkedIn;
    embed.fields.push({
      name: '📱 LinkedIn',
      value: `**${ln.wordCount}** words | **${ln.charCount}** chars\n` +
             `**Hashtags:** ${ln.hashtags.join(', ')}`,
      inline: true
    });
  }

  // Twitter
  if (variants.twitter && variants.twitter.success) {
    const tw = variants.twitter;
    embed.fields.push({
      name: '🐦 Twitter',
      value: `**${tw.tweetCount}** tweets | Avg **${tw.avgChars}** chars\n` +
             `Total **${tw.totalChars}** characters`,
      inline: true
    });
  }

  // Email
  if (variants.email && variants.email.success) {
    const em = variants.email;
    embed.fields.push({
      name: '📧 Email',
      value: `**Subject:** ${em.subject}\n` +
             `**${em.wordCount}** words | **${em.charCount}** chars`,
      inline: true
    });
  }

  // Facebook
  if (variants.facebook && variants.facebook.success) {
    const fb = variants.facebook;
    embed.fields.push({
      name: '📘 Facebook',
      value: `**${fb.wordCount}** words | **${fb.charCount}** chars\n` +
             `**Hashtags:** ${fb.hashtags.join(', ')}`,
      inline: true
    });
  }

  // Add failures if any
  if (summary.failed > 0) {
    const failures = [];
    Object.entries(variants).forEach(([platform, data]) => {
      if (!data.success) {
        failures.push(`❌ ${platform}: ${data.error}`);
      }
    });

    if (failures.length > 0) {
      embed.fields.push({
        name: '⚠️ Failures',
        value: failures.join('\n'),
        inline: false
      });
    }
  }

  return embed;
}

/**
 * Generate AI image prompts for social media posts
 * @param {Object} results - Social media generation results
 * @returns {Object} Image prompts for each platform
 */
export function generateImagePrompts(results) {
  const { blog, variants } = results;
  const prompts = {};

  // Extract key themes from blog title and category
  const title = blog.title || 'Business Marketing';
  const category = variants.linkedIn?.metadata?.category || 'Marketing';

  // LinkedIn image prompt
  if (variants.linkedIn && variants.linkedIn.success) {
    prompts.linkedin = {
      platform: 'LinkedIn',
      style: 'Professional, corporate, data-driven',
      prompt: `Create a professional LinkedIn post image for: "${title}".
Style: Clean, modern, business-focused with data visualization elements.
Colors: Blues, greys, professional palette.
Elements: Charts, graphs, or infographics showing business growth.
Mood: Authoritative, trustworthy, expert.
Text overlay: Minimal - just key statistic or title.
Dimensions: 1200x627px (LinkedIn recommended).
Avoid: Stock photos of handshakes, generic office scenes.
Focus: ${category} concept with Sydney business context.`
    };
  }

  // Twitter image prompt
  if (variants.twitter && variants.twitter.success) {
    prompts.twitter = {
      platform: 'Twitter',
      style: 'Eye-catching, punchy, social-media friendly',
      prompt: `Create an attention-grabbing Twitter thread image for: "${title}".
Style: Bold, colorful, designed to stop scrolling.
Colors: High contrast, vibrant but professional.
Elements: Large bold text with key statistic or hook.
Mood: Urgent, actionable, engaging.
Text overlay: One key number or statement (large font).
Dimensions: 1200x675px (Twitter card).
Avoid: Too much text, cluttered design.
Focus: ${category} with clear visual hierarchy.`
    };
  }

  // Email header image prompt
  if (variants.email && variants.email.success) {
    prompts.email = {
      platform: 'Email Newsletter',
      style: 'Clean, readable, email-optimized',
      prompt: `Create an email newsletter header image for: "${title}".
Style: Simple, clean, email-safe design.
Colors: Brand colors - professional but welcoming.
Elements: Hero image with subtle text overlay.
Mood: Helpful, informative, trustworthy.
Text overlay: Subject line or key benefit.
Dimensions: 600x400px (email optimal, won't break on mobile).
Avoid: Complex designs that don't render well in email clients.
Focus: ${category} with clear value proposition.`
    };
  }

  // Facebook image prompt
  if (variants.facebook && variants.facebook.success) {
    prompts.facebook = {
      platform: 'Facebook',
      style: 'Community-focused, relatable, local',
      prompt: `Create a Facebook post image for Sydney businesses: "${title}".
Style: Friendly, community-oriented, relatable.
Colors: Warm, inviting, social-friendly palette.
Elements: Local Sydney imagery (harbour, CBD, suburbs) with business context.
Mood: Approachable, helpful, community-focused.
Text overlay: Question or statement that drives engagement.
Dimensions: 1200x630px (Facebook recommended).
Avoid: Too corporate, overly salesy.
Focus: ${category} with Sydney local business angle.`
    };
  }

  return prompts;
}

/**
 * Create copy-paste ready content messages
 * @param {Object} results - Social media generation results
 * @returns {Array} Array of message objects
 */
export function createCopyPasteMessages(results) {
  const messages = [];
  const { variants, blog } = results;

  // LinkedIn - Copy-paste ready
  if (variants.linkedIn && variants.linkedIn.success && variants.linkedIn.formatted) {
    const content = variants.linkedIn.formatted;

    messages.push({
      content: '**📱 LINKEDIN POST - Ready to Copy**\n' +
               '```\n' + content + '\n```\n' +
               `🔗 Blog: ${blog.url}`
    });
  }

  // Twitter - Copy-paste ready
  if (variants.twitter && variants.twitter.success && variants.twitter.formatted) {
    const content = variants.twitter.formatted;

    messages.push({
      content: '**🐦 TWITTER THREAD - Ready to Copy**\n' +
               'Copy each section below and post as separate tweets:\n' +
               '```\n' + content + '\n```\n' +
               `🔗 Blog: ${blog.url}`
    });
  }

  // Email - Copy-paste ready
  if (variants.email && variants.email.success && variants.email.formatted) {
    const content = variants.email.formatted;

    messages.push({
      content: '**📧 EMAIL NEWSLETTER - Ready to Copy**\n' +
               `**Subject Line:** ${variants.email.subject}\n\n` +
               '```\n' + content + '\n```\n' +
               `🔗 Blog: ${blog.url}`
    });
  }

  // Facebook - Copy-paste ready
  if (variants.facebook && variants.facebook.success && variants.facebook.formatted) {
    const content = variants.facebook.formatted;

    messages.push({
      content: '**📘 FACEBOOK POST - Ready to Copy**\n' +
               '```\n' + content + '\n```\n' +
               `🔗 Blog: ${blog.url}`
    });
  }

  return messages;
}

/**
 * Create individual image prompt messages (one per platform)
 * @param {Object} results - Social media generation results
 * @returns {Array} Array of Discord messages with image prompts
 */
export function createIndividualImagePromptMessages(results) {
  const prompts = generateImagePrompts(results);
  const messages = [];

  // Header message with tips
  messages.push({
    content: '**🎨 AI IMAGE PROMPTS - Use with Midjourney/DALL-E/Canva**\n\n' +
             '*Copy each prompt below to generate perfect images for each platform:*'
  });

  // Individual prompt messages
  Object.entries(prompts).forEach(([platform, data]) => {
    messages.push({
      content: `**${data.platform} Image Prompt:**\n` +
               '```\n' + data.prompt + '\n```'
    });
  });

  // Tips message
  messages.push({
    content: '**💡 Quick Tips:**\n' +
             '• Use these prompts in Midjourney, DALL-E 3, or Canva AI\n' +
             '• Adjust colors to match your brand\n' +
             '• Add your logo after generation\n' +
             '• Test multiple variations for best results'
  });

  return messages;
}

/**
 * Create image prompts message (legacy - combines all prompts)
 * @param {Object} results - Social media generation results
 * @returns {Object} Discord message with image prompts
 * @deprecated Use createIndividualImagePromptMessages for better Discord compatibility
 */
export function createImagePromptsMessage(results) {
  const prompts = generateImagePrompts(results);

  let content = '**🎨 AI IMAGE PROMPTS - Use with Midjourney/DALL-E/Canva**\n\n';
  content += '*Copy these prompts to generate perfect images for each platform:*\n\n';

  Object.entries(prompts).forEach(([platform, data]) => {
    content += `**${data.platform}:**\n`;
    content += '```\n' + data.prompt + '\n```\n\n';
  });

  content += '**💡 Quick Tips:**\n';
  content += '• Use these prompts in Midjourney, DALL-E 3, or Canva AI\n';
  content += '• Adjust colors to match your brand\n';
  content += '• Add your logo after generation\n';
  content += '• Test multiple variations for best results\n';

  return { content };
}

/**
 * Create detailed content preview embeds (legacy format)
 * @param {Object} results - Social media generation results
 * @returns {Array} Array of Discord embed objects
 */
export function createContentPreviewEmbeds(results) {
  const embeds = [];
  const { variants, blog } = results;

  // LinkedIn Preview
  if (variants.linkedIn && variants.linkedIn.success && variants.linkedIn.formatted) {
    const content = variants.linkedIn.formatted;
    const preview = content.length > 1000 ? content.substring(0, 1000) + '...' : content;

    embeds.push({
      title: '📱 LinkedIn Post Preview',
      description: preview,
      color: 0x0077b5, // LinkedIn blue
      url: blog.url
    });
  }

  // Twitter Preview
  if (variants.twitter && variants.twitter.success && variants.twitter.tweets) {
    const tweets = variants.twitter.tweets;
    const preview = tweets.slice(0, 3).join('\n\n---\n\n');

    embeds.push({
      title: '🐦 Twitter Thread Preview (First 3 tweets)',
      description: preview,
      color: 0x1da1f2, // Twitter blue
      url: blog.url
    });
  }

  // Email Preview
  if (variants.email && variants.email.success && variants.email.formatted) {
    const content = variants.email.formatted;
    const preview = content.length > 1000 ? content.substring(0, 1000) + '...' : content;

    embeds.push({
      title: '📧 Email Newsletter Preview',
      description: `**Subject:** ${variants.email.subject}\n\n${preview}`,
      color: 0xea4335, // Gmail red
      url: blog.url
    });
  }

  // Facebook Preview
  if (variants.facebook && variants.facebook.success && variants.facebook.formatted) {
    const content = variants.facebook.formatted;

    embeds.push({
      title: '📘 Facebook Post Preview',
      description: content,
      color: 0x1877f2, // Facebook blue
      url: blog.url
    });
  }

  return embeds;
}

/**
 * Send comprehensive social media notification to Discord
 * @param {string} webhookUrl - Discord webhook URL
 * @param {Object} results - Social media generation results
 * @param {Object} options - Notification options
 * @returns {Promise<boolean>} Success status
 */
export async function sendSocialMediaNotification(webhookUrl, results, options = {}) {
  const {
    includePreviews = true,
    includeMetadata = false,     // Changed default to false
    copyPasteFormat = true,      // New option for copy-paste ready format
    username = 'Content Automation Bot',
    avatarUrl = null
  } = options;

  try {
    // Send summary embed
    const summaryEmbed = createSocialMediaEmbed(results);
    const payload = {
      username,
      embeds: [summaryEmbed]
    };

    if (avatarUrl) {
      payload.avatar_url = avatarUrl;
    }

    // Send summary
    const summarySuccess = await sendDiscordNotification(webhookUrl, payload);
    if (!summarySuccess) {
      return false;
    }

    // Send content in copy-paste ready format or previews
    if (includePreviews) {
      if (copyPasteFormat) {
        // Send copy-paste ready format
        const copyPasteMessages = createCopyPasteMessages(results);

        for (const message of copyPasteMessages) {
          await sendDiscordNotification(webhookUrl, {
            username,
            ...message
          });

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Send image prompts after content (individual messages to avoid 2000 char limit)
        const imagePromptMessages = createIndividualImagePromptMessages(results);
        for (const message of imagePromptMessages) {
          await sendDiscordNotification(webhookUrl, {
            username,
            ...message
          });
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Send traditional preview embeds
        const previewEmbeds = createContentPreviewEmbeds(results);

        // Discord limits to 10 embeds per message, send in batches
        for (let i = 0; i < previewEmbeds.length; i += 10) {
          const batch = previewEmbeds.slice(i, i + 10);
          await sendDiscordNotification(webhookUrl, {
            username,
            embeds: batch
          });

          // Small delay between batches to avoid rate limiting
          if (i + 10 < previewEmbeds.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }

    // Send metadata file attachment if requested
    if (includeMetadata) {
      // Send metadata as code block since Discord doesn't support file uploads via webhook
      const metadataJson = JSON.stringify(results, null, 2);
      const truncatedMetadata = metadataJson.length > 1900
        ? metadataJson.substring(0, 1900) + '\n...(truncated)'
        : metadataJson;

      await sendDiscordNotification(webhookUrl, {
        username,
        content: '**Full Metadata:**\n```json\n' + truncatedMetadata + '\n```'
      });
    }

    console.log('✅ Discord notifications sent successfully');
    return true;

  } catch (error) {
    console.error('Failed to send comprehensive Discord notification:', error.message);
    return false;
  }
}

/**
 * Send simple text notification to Discord
 * @param {string} webhookUrl - Discord webhook URL
 * @param {string} message - Message to send
 * @param {Object} options - Notification options
 * @returns {Promise<boolean>} Success status
 */
export async function sendSimpleNotification(webhookUrl, message, options = {}) {
  const {
    username = 'Content Automation Bot',
    avatarUrl = null
  } = options;

  const payload = {
    username,
    content: message
  };

  if (avatarUrl) {
    payload.avatar_url = avatarUrl;
  }

  return await sendDiscordNotification(webhookUrl, payload);
}

export default {
  sendDiscordNotification,
  createSocialMediaEmbed,
  createContentPreviewEmbeds,
  createCopyPasteMessages,
  generateImagePrompts,
  createImagePromptsMessage,
  createIndividualImagePromptMessages,
  sendSocialMediaNotification,
  sendSimpleNotification
};
