# Discord Integration Guide

## Overview

Your content automation system now sends comprehensive notifications to Discord whenever social media content is generated. This provides instant visibility into generated content without needing to check the file system.

---

## 🎯 What Gets Sent to Discord

### 1. Summary Embed (Rich Card)
Beautiful color-coded embed showing:
- Blog post title and URL
- Word count statistics
- Success/failure summary (e.g., "4/4 variants generated")
- Per-platform metrics:
  - LinkedIn: word count, character count, hashtags
  - Twitter: tweet count, average characters
  - Email: subject line, word count
  - Facebook: word count, hashtags

**Color Coding:**
- 🟢 Green: 100% success
- 🟡 Yellow: 75%+ success
- 🔴 Red: <75% success

### 2. Content Previews (4 Separate Embeds)

**LinkedIn Preview:**
- First 1000 characters of the post
- LinkedIn blue color
- Direct link to blog

**Twitter Preview:**
- First 3 tweets of the thread
- Twitter blue color
- Shows formatting and emoji usage

**Email Preview:**
- Subject line
- First 1000 characters of body
- Gmail red color

**Facebook Preview:**
- Full post content
- Facebook blue color
- Shows hashtags and engagement hooks

### 3. Metadata JSON
Complete generation details in a code block:
```json
{
  "blog": { "title": "...", "wordCount": 2527, "url": "..." },
  "variants": {
    "linkedIn": { "wordCount": 252, "hashtags": [...] },
    "twitter": { "tweetCount": 8, "avgChars": 146 },
    "email": { "subject": "...", "wordCount": 288 },
    "facebook": { "wordCount": 90, "hashtags": [...] }
  },
  "summary": { "total": 4, "successful": 4, "failed": 0 }
}
```

---

## 🔧 Configuration

### Webhook URL
Your Discord webhook is configured in `.env.local`:

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1425475321377062972/Pw2bZusS-R61jxdbMaaFVkvOmhSkfYMNQ7rAO7gbY_NPXNRKNtjZu1W1ojXYpJ0-3Fj5
```

### Notification Options
Edit `automation/scripts/social-media-generator.js` (lines 120-128):

```javascript
const discordSuccess = await sendSocialMediaNotification(
  discordWebhook,
  results,
  {
    includePreviews: true,      // Show content previews
    includeMetadata: true,       // Include JSON metadata
    username: 'TPP Content Bot'  // Bot display name
  }
);
```

**Options:**
- `includePreviews`: `true` (show all 4 platform previews) or `false` (summary only)
- `includeMetadata`: `true` (include JSON) or `false` (skip metadata)
- `username`: String - Custom bot name displayed in Discord

---

## 🚀 Usage

### Automatic Notifications
Discord notifications are sent automatically when you generate social media:

```bash
npm run social:generate <blog-slug>
```

**Output:**
```
🎨 Generating content variants...
✅ Generated 4/4 variants
📬 Sending Discord notification...
✅ Discord notification sent!
```

### Disable Notifications
To temporarily disable Discord notifications:

```bash
# Option 1: Comment out in .env.local
# DISCORD_WEBHOOK_URL=https://...

# Option 2: Remove from .env.local entirely

# Option 3: Unset environment variable
unset DISCORD_WEBHOOK_URL
```

The generator will continue to work normally; it just won't send Discord notifications.

---

## 📱 Discord Channel Setup

### Creating a Webhook (If Needed)

1. **Open Discord Server Settings**
   - Navigate to your server
   - Right-click server name → Server Settings

2. **Go to Integrations**
   - Click "Integrations" in left sidebar
   - Click "Webhooks"

3. **Create Webhook**
   - Click "New Webhook"
   - Name it (e.g., "Content Automation Bot")
   - Select channel (e.g., #content-notifications)
   - Copy webhook URL

4. **Add to Environment**
   ```bash
   echo "DISCORD_WEBHOOK_URL=<your-webhook-url>" >> .env.local
   ```

### Recommended Channel Structure

```
#content-automation
├─ Blog generation logs
├─ Social media notifications
├─ Error alerts
└─ Success confirmations

#content-review
└─ Manual review of generated content before posting
```

---

## 🎨 Example Notification

When you run:
```bash
npm run social:generate remarketing-campaigns-that-actually-convert-for-sydney-ecommerce
```

Discord receives:

### Message 1: Summary Embed
```
📱 Social Media Content Generated
Blog: Remarketing Campaigns That Actually Convert for Sydney eCommerce

📝 Blog Post
Words: 3,003
URL: https://theprofitplatform.com.au/blog/remarketing-campaigns...

📊 Generation Summary
✅ 4/4 variants generated successfully

📱 LinkedIn
220 words | 1496 chars
Hashtags: Remarketing, eCommerceSydney, GoogleAds, DigitalMarketing, SydneyBusiness

🐦 Twitter
8 tweets | Avg 149 chars
Total 1195 characters

📧 Email
Subject: "Are you in the 87% losing money?"
318 words | 1945 chars

📘 Facebook
111 words | 756 chars
Hashtags: GoogleAds, Remarketing, SydneySmallBusiness, eCommerceTips
```

### Message 2-5: Content Previews
Each platform gets its own preview embed with the actual generated content.

### Message 6: Metadata
Full JSON with all generation details.

---

## ⚡ Advanced Features

### Custom Bot Avatar
Add custom avatar to notifications:

```javascript
const discordSuccess = await sendSocialMediaNotification(
  discordWebhook,
  results,
  {
    includePreviews: true,
    includeMetadata: true,
    username: 'TPP Content Bot',
    avatarUrl: 'https://your-site.com/bot-avatar.png'
  }
);
```

### Simple Text Notifications
Send quick text updates:

```javascript
import { sendSimpleNotification } from '../utils/discord-notifier.mjs';

await sendSimpleNotification(
  process.env.DISCORD_WEBHOOK_URL,
  '🚀 Starting blog generation...'
);
```

### Error Notifications
Automatically sends error details if generation fails:

```javascript
// Handled automatically - failed platforms shown in red
// Example:
⚠️ Failures
❌ linkedIn: Rate limit exceeded
❌ twitter: API timeout
```

---

## 🔍 Troubleshooting

### "Failed to send Discord notification"
**Causes:**
- Invalid webhook URL
- Webhook deleted in Discord
- Network connectivity issues
- Discord API rate limit

**Solutions:**
1. Verify webhook URL in `.env.local`
2. Check webhook still exists in Discord server
3. Test webhook manually:
   ```bash
   curl -X POST $DISCORD_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"content":"Test message"}'
   ```
4. Wait 1 minute if rate limited

### Notifications Not Appearing
**Check:**
1. `DISCORD_WEBHOOK_URL` is set in `.env.local`
2. Generator script loaded environment variables
3. Discord channel permissions allow webhooks
4. Webhook URL includes `/Pw2bZusS-R61jxdbMaaFVkvOmhSkfYMNQ7rAO7gbY_NPXNRKNtjZu1W1ojXYpJ0-3Fj5` token

### Duplicate Notifications
**Cause:** Running generator multiple times quickly

**Solution:** Discord has rate limits; wait 1-2 seconds between runs

---

## 📊 Benefits

✅ **Instant Visibility**
- Know immediately when content is ready
- No need to check file system

✅ **Team Collaboration**
- Everyone sees notifications
- Easy to delegate posting tasks

✅ **Mobile Access**
- Get notifications on Discord mobile app
- Review content on-the-go

✅ **Content Audit Trail**
- All generations logged in Discord
- Easy to reference past content

✅ **Quality Review**
- Preview content before posting
- Spot issues quickly

✅ **Time Savings**
- No switching between terminal and file browser
- All content in one place

---

## 🎯 Best Practices

### 1. Dedicated Channel
Create a dedicated #content-automation channel to avoid noise in other channels.

### 2. Pin Important Notifications
Pin template notifications or important results for quick reference.

### 3. Use Threads
Reply in threads for discussions about specific content pieces.

### 4. Archive Old Content
Discord auto-archives old messages; keep recent content accessible.

### 5. Multiple Webhooks
Create separate webhooks for:
- Production content (main webhook)
- Testing/staging (test webhook)
- Error notifications (errors webhook)

---

## 🔒 Security

### Webhook URL Security
⚠️ **Important:** Your webhook URL is a secret. Anyone with it can post to your Discord channel.

**Best Practices:**
1. Never commit `.env.local` to git (already in .gitignore)
2. Don't share webhook URL publicly
3. Rotate webhook if compromised (delete old, create new)
4. Use different webhooks for prod/dev/test

### Regenerating Webhook
If compromised:
1. Delete old webhook in Discord server settings
2. Create new webhook
3. Update `.env.local` with new URL
4. Test with: `npm run social:generate <slug>`

---

## 📚 API Reference

See `automation/utils/discord-notifier.mjs` for full API:

```javascript
// Send comprehensive notification
await sendSocialMediaNotification(webhookUrl, results, options)

// Send simple text message
await sendSimpleNotification(webhookUrl, message, options)

// Create custom embeds
const embed = createSocialMediaEmbed(results)
const previews = createContentPreviewEmbeds(results)
```

---

## 🎉 You're All Set!

Discord notifications are configured and working. Every time you generate social media content, you'll get a comprehensive notification in Discord.

**Next steps:**
1. Generate social media: `npm run social:generate <slug>`
2. Check your Discord channel
3. Review the beautiful embeds
4. Copy content to platforms

**Questions?** See the main documentation: `automation/CONTENT-AUTOMATION-GUIDE.md`
