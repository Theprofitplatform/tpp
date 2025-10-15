/**
 * Facebook Discord Notifier
 * Sends Facebook post and image prompt as separate Discord messages
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const DISCORD_WEBHOOK_URL = process.env.FACEBOOK_DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1425475321377062972/Pw2bZusS-R61jxdbMaaFVkvOmhSkfYMNQ7rAO7gbY_NPXNRKNtjZu1W1ojXYpJ0-3Fj5";

/**
 * Send Discord message
 */
async function sendDiscordMessage(content) {
  try {
    const payload = {
      content: content
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Discord message sent successfully!');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send Discord message:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending Discord message:', error.message);
    return false;
  }
}

/**
 * Get Facebook post content
 */
async function getFacebookPost(blogSlug) {
  try {
    const facebookPath = path.join(projectRoot, 'automation/content-variants', blogSlug, 'facebook.txt');
    const content = await fs.readFile(facebookPath, 'utf-8');
    return content;
  } catch (error) {
    console.error('❌ Error reading Facebook post:', error.message);
    return null;
  }
}

/**
 * Generate image prompt based on blog content
 */
function generateImagePrompt(blogSlug, facebookPost) {
  // Extract key themes from the Facebook post
  let businessType = "service business";
  let mainBenefit = "increasing conversions";
  let location = "Sydney";

  // Detect business type from content
  if (facebookPost.includes("dental")) {
    businessType = "dental practice";
  } else if (facebookPost.includes("café") || facebookPost.includes("coffee")) {
    businessType = "cafe";
  } else if (facebookPost.includes("plumber")) {
    businessType = "plumbing business";
  } else if (facebookPost.includes("SEO")) {
    businessType = "digital marketing agency";
  }

  // Detect main benefit
  if (facebookPost.includes("booking") || facebookPost.includes("appointment")) {
    mainBenefit = "booking appointments";
  } else if (facebookPost.includes("traffic") || facebookPost.includes("customers")) {
    mainBenefit = "attracting customers";
  } else if (facebookPost.includes("ranking") || facebookPost.includes("Google")) {
    mainBenefit = "improving search rankings";
  }

  const imagePrompt = `🎨 **IMAGE GENERATION PROMPT FOR GEMINI**

**Copy and paste this prompt into Gemini to create the perfect Facebook post image:**

\`\`\`
Create a professional, high-converting website form or landing page screenshot for a ${location} ${businessType}.

**Style Requirements:**
- Clean, modern ${businessType} website design
- Professional color scheme (blue and white recommended)
- ${location} skyline or landmarks visible in background
- High-converting contact form with relevant fields
- Clear call-to-action button related to ${mainBenefit}
- Trust elements: 5-star reviews, customer testimonials, success metrics
- Mobile-responsive design
- Professional business imagery (subtle)

**Technical Details:**
- Aspect ratio: 16:9 (landscape)
- High resolution, professional quality
- Clean, uncluttered interface
- Modern web design aesthetics
- Australian/${location} business context

**Branding:**
- Professional ${businessType} branding
- Clean, trustworthy appearance
- ${location} local business focus
- Conversion-focused design
\`\`\`

**💡 Instructions:**
1. **Copy the prompt above**
2. **Paste into Gemini**
3. **Generate the image**
4. **Download and use for Facebook post**

**🎯 Image Purpose:** This image will show a high-converting website form to illustrate the strategies mentioned in your Facebook post about ${mainBenefit}.

**Alternative Prompt (if needed):**
\`\`\`
Create a professional screenshot of a high-converting landing page for a ${location} ${businessType} showing clean contact form, strong call-to-action button, trust badges, and mobile-responsive design.
\`\`\``;

  return imagePrompt;
}

/**
 * Main function to send both messages
 */
async function sendFacebookNotifications(blogSlug) {
  console.log(`🚀 Sending Facebook notifications for: ${blogSlug}`);

  // Get Facebook post content
  const facebookPost = await getFacebookPost(blogSlug);
  if (!facebookPost) {
    console.error('❌ No Facebook post found');
    return false;
  }

  // Message 1: Facebook Post Content
  const postMessage = `📘 **FACEBOOK POST READY FOR MANUAL PUBLISHING**

**Copy and paste this optimized Facebook post:**

\`\`\`
${facebookPost}
\`\`\`

**📊 Optimization Stats:**
• ${facebookPost.split(/\s+/).length} words (Perfect Facebook length)
• ${facebookPost.length} characters
• Strategic hashtags included
• Engagement question at end
• Visual suggestion added
• Local ${facebookPost.includes('Sydney') ? 'Sydney' : 'business'} focus

**🚀 Next Steps:**
1. **Copy the post above**
2. **Wait for image prompt** (next message)
3. **Generate image using prompt**
4. **Create Facebook post** with text and image
5. **Publish and monitor** engagement

**📁 File Location:** \`automation/content-variants/${blogSlug}/facebook.txt\``;

  // Send Facebook post message
  console.log('📤 Sending Facebook post to Discord...');
  const postSent = await sendDiscordMessage(postMessage);

  if (!postSent) {
    console.error('❌ Failed to send Facebook post message');
    return false;
  }

  // Wait 2 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Message 2: Image Generation Prompt
  const imagePrompt = generateImagePrompt(blogSlug, facebookPost);

  console.log('🎨 Sending image prompt to Discord...');
  const promptSent = await sendDiscordMessage(imagePrompt);

  if (!promptSent) {
    console.error('❌ Failed to send image prompt message');
    return false;
  }

  console.log('✅ Both messages sent successfully!');
  return true;
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📘 FACEBOOK DISCORD NOTIFIER
==================================================

Usage:
  node facebook-discord-notifier.js <blog-slug>

Example:
  node facebook-discord-notifier.js conversion-rate-optimization-9-quick-wins-for-sydney-service-businesses

Features:
  ✅ Sends Facebook post as first Discord message
  ✅ Sends image generation prompt as second Discord message
  ✅ 2-second delay between messages
  ✅ Automatic content detection for relevant image prompts

==================================================
    `);
    return;
  }

  const blogSlug = args[0];
  await sendFacebookNotifications(blogSlug);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { sendFacebookNotifications };