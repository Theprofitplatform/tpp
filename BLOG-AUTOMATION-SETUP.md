# 🤖 Automated Blog System - Setup Guide

**Daily AI-Generated Blog Posts with Zero Human Review**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Testing Locally](#testing-locally)
6. [First Production Run](#first-production-run)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Scaling the Schedule](#scaling-the-schedule)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### What It Does

- **Generates** SEO-optimized blog posts daily using Claude AI
- **Validates** content quality automatically (word count, headings, links, SEO)
- **Checks** for plagiarism against existing posts
- **Commits** to GitHub and triggers Cloudflare Pages deployment
- **Notifies** via Slack when posts are published or errors occur

### Architecture

```
Topic Queue (JSON)
    ↓
GitHub Actions (Scheduled)
    ↓
Claude API → Generate Content
    ↓
Validation + Plagiarism Check
    ↓
Commit to GitHub
    ↓
Cloudflare Pages Auto-Deploy
    ↓
Live Blog Post + Slack Notification
```

### Current Schedule

- **Month 1:** 2 posts/week (Monday, Thursday 9am UTC)
- **Month 2:** 3 posts/week (Mon, Wed, Fri)
- **Month 3:** 5 posts/week (Mon-Fri)
- **Month 4+:** Daily (7 days/week)

### Cost

- **Claude API:** ~$3-5/month with prompt caching
- **GitHub Actions:** Free (within limits)
- **Cloudflare Pages:** Free (500 builds/month)
- **Total:** $3-5/month

---

## ✅ Prerequisites

### Required

1. **GitHub Repository** (you already have this ✅)
2. **Anthropic API Key** ([console.anthropic.com](https://console.anthropic.com))
3. **Cloudflare Pages** connected to this repo (you already have this ✅)

### Optional but Recommended

4. **Slack Workspace** with webhook URL for notifications
5. **Copyscape API Key** for external plagiarism checking ($10-20/month)

---

## 🚀 Initial Setup

### Step 1: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-api03-...`)
6. **Save it securely** - you'll need it in Step 3

### Step 2: Set Up Slack Webhook (Optional)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From Scratch**
3. Name it "Blog Automation" and select your workspace
4. In **Incoming Webhooks**, toggle it **On**
5. Click **Add New Webhook to Workspace**
6. Select the channel (e.g., `#blog-posts` or `#notifications`)
7. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Secret Name | Value | Required? |
|------------|-------|-----------|
| `CLAUDE_API_KEY` | Your Anthropic API key from Step 1 | ✅ Yes |
| `SLACK_WEBHOOK_URL` | Your Slack webhook URL from Step 2 | ⚠️ Recommended |
| `COPYSCAPE_API_KEY` | Your Copyscape API key (if using) | Optional |

**Important:** Keep these secrets safe. Never commit them to your code.

### Step 4: Verify Installation

Run this command locally to check everything is set up:

```bash
npm install
npm run build
```

Expected output: Build should complete successfully with no errors.

---

## 🧪 Testing Locally

### Test 1: Generate a Blog Post Manually

```bash
# Set your API key (temporary, for testing)
export CLAUDE_API_KEY="sk-ant-api03-YOUR-KEY-HERE"

# Generate a blog post (uses first topic in queue)
npm run blog:generate
```

**Expected output:**
```
🤖 Starting blog post generation...
📌 Auto-selected topic by priority
📝 Topic: How to Optimise Your Google Business Profile...
🧠 Generating content with Claude API...
✅ Content generated (2,145 words)
🔍 Generating SEO meta description...
✅ Meta description: 153 chars
🔗 Adding internal links...
   ✓ Added link: "local seo" → /seo
   ✓ Added link: "google business profile" → /seo
   Total internal links: 2
✅ Blog post generated successfully!
📄 File: 2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025.md
```

**Check the generated file:**
```bash
ls src/content/blog/
```

You should see a new markdown file with today's date.

### Test 2: Validate Content

```bash
npm run blog:validate
```

**Expected output:**
```
🔍 Starting content validation...
📄 Validating: 2025-10-04-how-to-optimise-your-google-business-profile...
📋 Checking frontmatter...
   ✓ title: "How to Optimise Your Google Business Profile..."
   ✓ description: "Learn the proven strategies..."
   ✓ publishDate: 2025-10-04
...
✅ VALIDATION PASSED!
Content Quality Score:
   95/100 🌟
```

### Test 3: Plagiarism Check

```bash
npm run blog:plagiarism
```

**Expected output:**
```
🔍 Starting plagiarism check...
📄 Checking: 2025-10-04-...
📚 Comparing against 5 existing posts...
✅ No duplicate paragraphs detected
✅ Plagiarism check completed
```

### Test 4: Full Test (Generate + Validate)

```bash
npm run blog:test
```

This runs both generation and validation in sequence.

### Clean Up Test Files

Before going to production, delete the test-generated blog post:

```bash
rm src/content/blog/2025-10-04-*.md
```

And restore the topic to the queue manually in `automation/topic-queue.json` (move from `published` back to `queue`).

---

## 🚀 First Production Run

### Step 1: Enable GitHub Actions

The workflow is already in `.github/workflows/daily-blog-post.yml`.

**Current schedule:** Monday & Thursday at 9am UTC (8pm Sydney time)

To change the schedule, edit line 7 in the workflow file:

```yaml
schedule:
  - cron: '0 9 * * 1,4'  # Monday, Thursday
  # For daily: '0 9 * * *'
  # For Mon-Fri: '0 9 * * 1-5'
```

### Step 2: Test with Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Daily Blog Post Generator** workflow
3. Click **Run workflow** dropdown
4. Leave "topic_id" blank (auto-selects next topic)
5. Click **Run workflow** button

### Step 3: Watch the Workflow

1. Click on the running workflow
2. Watch each step execute:
   - ✅ Checkout repository
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Generate blog post
   - ✅ Validate content
   - ✅ Plagiarism check
   - ✅ Commit and push
   - ✅ Send notification

**Expected duration:** 2-3 minutes

### Step 4: Verify Results

**1. Check GitHub Commit:**
- Go to **Code** tab
- Look for commit: "🤖 Auto-publish blog post: [Title]"
- Click on it to see the changes

**2. Check Cloudflare Pages:**
- Go to Cloudflare Pages dashboard
- Look for new deployment (triggered by the commit)
- Wait ~3-5 minutes for build to complete

**3. Check Live Site:**
- Visit: `https://theprofitplatform.com.au/blog`
- Your new post should appear first (newest)

**4. Check Slack (if configured):**
- Look for notification in your selected channel
- Should show post title, word count, and URL

### Step 5: Monitor First Week

For the first week, manually check:

1. **Post Quality:** Read each generated post
2. **SEO Metrics:** Check Google Search Console
3. **Traffic:** Monitor analytics
4. **Indexing:** Verify Google is indexing posts

---

## 📊 Monitoring & Maintenance

### Daily Checks (First Month)

- [ ] Verify post published successfully
- [ ] Read post for quality/accuracy
- [ ] Check for any errors in GitHub Actions
- [ ] Monitor Slack notifications

### Weekly Checks

- [ ] Review blog traffic in Google Analytics
- [ ] Check Search Console for indexing status
- [ ] Monitor bounce rate and time on page
- [ ] Review topic queue (refill if below 30 topics)

### Monthly Checks

- [ ] Analyze which topics/categories perform best
- [ ] Update brand guidelines based on learnings
- [ ] Review and refine prompt template
- [ ] Check Claude API costs
- [ ] Audit published posts for quality

### Red Flags (Auto-Pause Triggers)

🚨 **Manually pause automation if you see:**

- Traffic drops >20% week-over-week
- Bounce rate >75% on blog posts
- Average time on page <1 minute
- Google Search Console manual action
- Indexing rate <50%

**To pause:** Disable the workflow in GitHub Actions or change schedule to `# - cron: '0 9 * * 1,4'` (comment it out)

---

## 📈 Scaling the Schedule

### Gradual Rollout Plan

**Month 1: 2 posts/week**
```yaml
# Monday, Thursday
schedule:
  - cron: '0 9 * * 1,4'
```

**Month 2: 3 posts/week**
```yaml
# Monday, Wednesday, Friday
schedule:
  - cron: '0 9 * * 1,3,5'
```

**Month 3: 5 posts/week**
```yaml
# Monday-Friday
schedule:
  - cron: '0 9 * * 1-5'
```

**Month 4+: Daily**
```yaml
# Every day
schedule:
  - cron: '0 9 * * *'
```

### How to Update Schedule

1. Edit `.github/workflows/daily-blog-post.yml`
2. Change line 7 (the `cron` schedule)
3. Commit and push
4. New schedule takes effect immediately

---

## 📝 Topic Queue Management

### Check Queue Status

```bash
node -e "console.log(require('./automation/topic-queue.json').queue.length)"
```

### Refill Queue (When Below 30 Topics)

Manually add topics to `automation/topic-queue.json`:

```json
{
  "id": 36,
  "title": "Your New Topic Title Here",
  "category": "SEO",
  "tags": ["tag1", "tag2", "tag3"],
  "targetKeyword": "your target keyword",
  "searchIntent": "informational",
  "priority": 2,
  "status": "pending"
}
```

**Tips for Topic Selection:**
- Use keyword research tools
- Check Google Search Console for query opportunities
- Monitor competitor blogs
- Track seasonal trends
- Review customer questions/FAQs

---

## 🛠️ Troubleshooting

### Issue: Workflow Fails with "Claude API Error"

**Cause:** Invalid or missing API key

**Fix:**
1. Check `CLAUDE_API_KEY` secret in GitHub
2. Verify key is valid at console.anthropic.com
3. Check API usage limits haven't been exceeded

### Issue: Validation Fails

**Common reasons:**
- Word count too low (< 1500 words)
- Missing required frontmatter fields
- Meta description wrong length
- Not enough headings

**Fix:**
- Check validation logs in GitHub Actions
- Adjust prompt template if recurring issue
- Update brand guidelines

### Issue: No Commit/Push

**Cause:** No changes detected (rare)

**Fix:**
- Check if topic was already used
- Verify topic queue has pending topics
- Manually trigger with specific topic ID

### Issue: Slack Notification Not Received

**Cause:** Invalid webhook or permissions

**Fix:**
1. Test webhook manually:
   ```bash
   curl -X POST -H 'Content-Type: application/json' \
     -d '{"text":"Test from blog automation"}' \
     YOUR_WEBHOOK_URL
   ```
2. Re-create webhook in Slack if needed
3. Update `SLACK_WEBHOOK_URL` secret in GitHub

### Issue: Cloudflare Pages Build Fails

**Cause:** Build error in Astro

**Fix:**
- Check Cloudflare Pages build logs
- Test build locally: `npm run build`
- Common issue: Invalid frontmatter in blog post
- Check blog post markdown file for syntax errors

### Issue: GitHub Actions Workflow Not Running

**Causes:**
- Repository has been inactive for 60 days (public repos)
- Workflow is disabled
- Schedule syntax error

**Fix:**
1. Go to Actions tab
2. Select workflow
3. Click "Enable workflow" if disabled
4. Check cron syntax is valid

---

## 📚 Useful Commands

```bash
# Generate blog post manually
npm run blog:generate

# Validate latest post
npm run blog:validate

# Check for plagiarism
npm run blog:plagiarism

# Full test (generate + validate)
npm run blog:test

# Generate specific topic by ID
TOPIC_ID=5 npm run blog:generate

# Build site locally
npm run build

# Preview built site
npm run preview

# Check topic queue count
cat automation/topic-queue.json | grep '"status": "pending"' | wc -l
```

---

## 🎓 Advanced Customization

### Adjust Content Length

Edit `automation/scripts/generate-blog-post.js` line 100:

```javascript
max_tokens: 8000,  // Increase for longer posts, decrease for shorter
```

### Change Author Distribution

Edit `automation/scripts/generate-blog-post.js` line 156:

```javascript
const author = Math.random() > 0.5 ? 'Avi' : 'TPP Team';
// Change to > 0.3 for more Avi posts (70% Avi, 30% TPP Team)
// Change to > 0.7 for fewer Avi posts (30% Avi, 70% TPP Team)
```

### Modify SEO Validation Rules

Edit `automation/scripts/validate-content.js`:

- Line 73: Word count min/max
- Line 90: Meta description length
- Line 105: Minimum headings
- Line 124: Internal link requirements

### Update Brand Voice

Edit `automation/brand-guidelines.md` with your specific:
- Tone preferences
- Style guidelines
- Required elements
- E-E-A-T strategies
- Example phrases

Changes take effect immediately (guidelines are loaded on each run).

---

## 📞 Support & Resources

### Documentation

- **Anthropic API Docs:** https://docs.anthropic.com
- **GitHub Actions Docs:** https://docs.github.com/actions
- **Astro Content Collections:** https://docs.astro.build/en/guides/content-collections/
- **Cloudflare Pages:** https://developers.cloudflare.com/pages/

### Monitoring Tools

- **Google Analytics 4:** Track blog traffic
- **Google Search Console:** Monitor indexing and rankings
- **Cloudflare Analytics:** View deployment stats
- **GitHub Actions Dashboard:** Monitor workflow runs

---

## ✅ Post-Setup Checklist

- [ ] Claude API key configured in GitHub secrets
- [ ] Slack webhook configured (optional)
- [ ] Tested locally with `npm run blog:test`
- [ ] First manual run completed successfully
- [ ] Post appeared on live site
- [ ] Slack notification received (if configured)
- [ ] RSS feed working: `/rss.xml`
- [ ] Blog page shows dynamic content
- [ ] Google Analytics tracking blog pageviews
- [ ] Search Console monitoring blog URLs
- [ ] Calendar reminder set for weekly monitoring
- [ ] Gradual rollout schedule planned

---

## 🎉 You're All Set!

The automated blog system is now running. It will:

✅ Generate quality blog posts automatically
✅ Validate content before publishing
✅ Check for plagiarism
✅ Deploy to production
✅ Notify you via Slack

**Current Schedule:** 2 posts/week (Mon, Thu @ 9am UTC)

**Next Steps:**
1. Monitor first few posts closely
2. Track performance metrics
3. Adjust prompts/guidelines as needed
4. Scale to daily posting over 3 months

**Questions?** Check the troubleshooting section or review workflow logs in GitHub Actions.

---

**Last Updated:** 2025-10-04
**System Version:** 1.0
**Status:** ✅ Production Ready
