# Complete Content Automation Guide

## Overview

This guide documents the complete content automation workflow using Claude API for blog posts and DeepSeek API for social media/email generation.

---

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT WORKFLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. BLOG GENERATION (Claude API)                            │
│     ├─ High-quality, SEO-optimized                          │
│     ├─ 2,500+ words with schemas                            │
│     ├─ Charts, internal links, readability                  │
│     └─ Output: src/content/blog/<slug>.md                   │
│                                                              │
│  2. SOCIAL MEDIA GENERATION (DeepSeek API)                  │
│     ├─ LinkedIn (professional thought leadership)           │
│     ├─ Twitter (8-tweet thread)                             │
│     ├─ Email (personal newsletter)                          │
│     ├─ Facebook (community-focused)                         │
│     └─ Output: automation/content-variants/<slug>/          │
│                                                              │
│  3. VALIDATION & QUALITY CHECKS                             │
│     ├─ Hashtag relevance                                    │
│     ├─ Statistics verification                              │
│     ├─ Sydney-specific content                              │
│     └─ Character limits                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Generate Blog Post (Claude)
```bash
npm run content:blog
# or
node automation/scripts/generate-blog-post.js
```

**What it does:**
- Generates 2,500+ word blog post
- Adds FAQ + HowTo + Article schemas
- Creates charts and visualizations
- Optimizes readability
- Adds internal links
- Fetches cover image from Unsplash

**Output:** `src/content/blog/2025-10-10-<topic>.md`

---

### Generate Social Media (DeepSeek)
```bash
npm run social:generate <blog-slug>
# or
node automation/scripts/social-media-generator.js <blog-slug>
```

**Example:**
```bash
npm run social:generate content-marketing-strategy-for-sydney-b2b-companies-in-2025
```

**What it does:**
- Reads published blog post
- Generates 4 platform-specific variants
- Validates content quality
- Saves to `automation/content-variants/<slug>/`

**Output:**
```
automation/content-variants/<slug>/
├── email.txt          # Newsletter with subject line
├── linkedin.txt       # Professional thought leadership post
├── twitter.txt        # 8-tweet thread
├── facebook.txt       # Community-focused post
└── metadata.json      # Generation metadata
```

---

## 📋 Complete Workflow

### Step 1: Generate Blog Post
```bash
npm run content:blog
```

Follow the prompts:
1. Enter blog topic or keyword
2. Review suggested title
3. Wait for generation (~2-5 minutes)
4. Blog post saved to `src/content/blog/`

### Step 2: Review & Publish Blog
```bash
# Build and preview
npm run build
npm run preview

# Visit http://localhost:4321/blog/<slug>
# Review content quality
# Make any manual edits if needed
```

### Step 3: Deploy Blog
```bash
npm run deploy
# or
git add . && git commit -m "Add blog post" && git push
```

### Step 4: Generate Social Media Variants
```bash
# Use the blog slug (filename without date prefix)
npm run social:generate remarketing-campaigns-that-actually-convert-for-sydney-ecommerce
```

**Expected output:**
```
🚀 Generating social media content variants...
📝 Blog post: remarketing-campaigns-that-actually-convert-for-sydney-ecommerce

✅ Loaded blog post: Remarketing Campaigns That Actually Convert for Sydney eCommerce
   Word count: 2527
   Category: Google Ads

🎨 Generating content variants...

📱 Generating LinkedIn post...
   ✅ LinkedIn post generated (252 words, 1704 chars)

🐦 Generating Twitter thread...
   ✅ Twitter thread generated (8 tweets)

📧 Generating email newsletter...
   ✅ Email newsletter generated

📘 Generating Facebook post...
   ✅ Facebook post generated (90 words, 666 chars)

💾 Variants saved to: automation/content-variants/<slug>/

✅ Generated 4/4 variants
```

### Step 5: Review Generated Content
```bash
# Read the generated variants
cat automation/content-variants/<slug>/email.txt
cat automation/content-variants/<slug>/linkedin.txt
cat automation/content-variants/<slug>/twitter.txt
cat automation/content-variants/<slug>/facebook.txt
```

### Step 6: Post to Social Media
- Copy content from variant files
- Paste to respective platforms
- Schedule or post immediately

---

## 🛠️ Configuration

### Environment Variables

Required in `.env.local`:
```bash
# Claude API (for blog generation)
CLAUDE_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=sk-ant-...  # Alternative name

# DeepSeek API (for social media)
DEEPSEEK_API_KEY=sk-...

# Unsplash API (for images)
UNSPLASH_ACCESS_KEY=...
```

### API Costs

**Per blog post automation cycle:**
- Blog generation (Claude): $0.50-1.00
- Social media (DeepSeek): $0.02-0.05
- **Total: ~$0.52-1.05 per complete cycle**

**Monthly estimates:**
- 20 blog posts/month: ~$10-20
- Very cost-effective for automation

---

## 📊 Quality Validation

The system automatically validates:

### ✅ Hashtag Relevance
- Checks hashtags match blog category
- Warns if irrelevant hashtags detected
- Example: Content Marketing post shouldn't have #GoogleAds

### ✅ Statistics Verification
- Compares social media claims to blog content
- Flags potentially fabricated statistics
- Ensures data consistency

### ✅ Sydney-Specific Content
- Verifies local references (suburbs, postcodes)
- Checks for Sydney keywords
- Scores local relevance (0-10)

### ✅ Character Limits
- Twitter: 280 chars per tweet
- Email subject: <50 chars
- LinkedIn: <3000 chars
- Facebook: Optimal 80-150 words

---

## 📝 Case Study Library

Located at: `automation/case-studies/`

### Available Case Studies:

1. **Tech Traffic Increase** (`tech-traffic-increase.json`)
   - Category: Content Marketing
   - Results: 47% traffic increase, 240 leads in Q3
   - Location: Sydney CBD

2. **eCommerce Remarketing** (`ecommerce-remarketing.json`)
   - Category: Google Ads
   - Results: 4.7% conversion rate, 580% ROAS
   - Location: Bondi

3. **Local SEO Success** (`local-seo-law-firm-2024.json`)
   - Category: SEO
   - Results: 3x map appearances, 156% organic traffic
   - Location: Parramatta

### Using Case Studies

```javascript
import { getCaseStudyByCategory } from './case-studies/case-study-loader.js';

const caseStudy = await getCaseStudyByCategory('Content Marketing');
console.log(caseStudy.results[0].metric); // "47% increase"
```

### Adding New Case Studies

1. Get client permission for anonymized results
2. Create JSON file using template in `automation/case-studies/README.md`
3. Set `verified: true` after approval
4. Generator scripts will automatically use them

---

## 🔧 Troubleshooting

### Issue: "DeepSeek API key not configured"
**Solution:**
```bash
# Add to .env.local
echo "DEEPSEEK_API_KEY=sk-your-key-here" >> .env.local
```

### Issue: "Blog post not found"
**Solution:**
- Use the slug without date prefix
- Example: Use `my-blog-post` not `2025-10-10-my-blog-post`
- Check `src/content/blog/` for exact filename

### Issue: Social media generation timeout
**Solution:**
- DeepSeek may be experiencing high load
- Wait 30 seconds and retry
- Check API key is valid

### Issue: Hashtags not relevant to topic
**Solution:**
- Already fixed in Facebook generator
- LinkedIn/Twitter: Edit prompt in generator files
- Or manually edit generated content

### Issue: Statistics look fabricated
**Solution:**
- Run validation: Check `metadata.json` for warnings
- Manually review statistics against blog post
- Use case study library for verified examples

---

## 📈 Performance Tips

### 1. Batch Social Media Generation
```bash
# Generate social for multiple posts
for slug in post1 post2 post3; do
  npm run social:generate $slug
done
```

### 2. Automate with Cron
```bash
# Add to crontab for daily blog generation
0 9 * * * cd /path/to/tpp && npm run content:blog
```

### 3. Use Case Studies
- Reduces fabricated examples
- Increases credibility
- Faster generation (less AI "creativity")

### 4. Pre-approve Blog Topics
Create queue file:
```json
// automation/topic-queue.json
{
  "queue": [
    "How to optimize Google Ads for Sydney businesses",
    "Local SEO checklist for 2025",
    "Content marketing mistakes to avoid"
  ]
}
```

---

## 🎨 Customization

### Modify LinkedIn Tone
Edit: `automation/scripts/linkedin-generator.js`
```javascript
const systemPrompt = 'You are a [YOUR TONE] LinkedIn creator...';
```

### Change Email Format
Edit: `automation/scripts/email-generator.js`
```javascript
// Modify prompt structure
const prompt = `Transform this into a [YOUR STYLE] email...`;
```

### Add New Platform
1. Create `automation/scripts/<platform>-generator.js`
2. Follow pattern from existing generators
3. Add to `social-media-generator.js` parallel calls

---

## 📊 Analytics & Tracking

### Generated Content Metadata
Every generation creates `metadata.json`:
```json
{
  "blog": {
    "title": "...",
    "wordCount": 2527,
    "url": "..."
  },
  "variants": {
    "linkedIn": { "wordCount": 252, "hashtags": [...] },
    "twitter": { "tweetCount": 8, "avgChars": 146 },
    "email": { "subject": "...", "wordCount": 288 },
    "facebook": { "wordCount": 90, "hashtags": [...] }
  },
  "summary": {
    "total": 4,
    "successful": 4,
    "failed": 0
  }
}
```

### Track Performance
- Monitor engagement by platform
- A/B test DeepSeek vs Claude social content
- Compare cost per engagement

---

## 🔒 Security Best Practices

1. **Never commit API keys**
   - Use `.env.local` (in .gitignore)
   - Rotate keys quarterly

2. **Client data protection**
   - Anonymize case studies
   - Get permission before using results
   - Remove identifying information

3. **Content review**
   - Always review AI-generated content
   - Verify statistics and claims
   - Check for brand voice consistency

---

## 📞 Support

**Issues or Questions?**
1. Check troubleshooting section above
2. Review generator logs in terminal
3. Validate API keys are configured
4. Check `automation/content-variants/<slug>/metadata.json` for errors

**Common Errors:**
- `ENOENT: no such file` → Blog slug incorrect
- `API error: 401` → Invalid API key
- `API error: 429` → Rate limit exceeded (wait 1 minute)
- `Timeout` → Network/API issue (retry)

---

## 🎯 Best Practices

### Content Quality
- ✅ Always review generated content before posting
- ✅ Add personal anecdotes to email newsletters
- ✅ Customize CTAs for each platform
- ✅ Use case study library for credibility

### SEO Optimization
- ✅ Blog posts: Focus on depth and comprehensiveness
- ✅ Use Claude's schema markup (FAQ, HowTo)
- ✅ Internal linking builds topical authority
- ✅ Monitor rankings and adjust strategy

### Social Media Strategy
- ✅ LinkedIn: Professional, data-driven
- ✅ Twitter: Punchy, thread-friendly
- ✅ Email: Personal, conversational
- ✅ Facebook: Community-focused, storytelling

### Automation Ethics
- ✅ Disclose AI assistance if asked
- ✅ Verify all statistics and claims
- ✅ Maintain human oversight
- ✅ Focus on providing value, not just volume

---

## 📚 Additional Resources

- **DeepSeek API Docs:** https://api-docs.deepseek.com/
- **Claude API Docs:** https://docs.anthropic.com/
- **Blog CLI Tools:** See `tools/blog-cli.mjs`
- **Case Study Template:** `automation/case-studies/README.md`

---

## 🚀 Next Steps

1. **Test the workflow** - Generate 1-2 blog posts
2. **Review quality** - Compare against your standards
3. **Adjust prompts** - Customize tone/style as needed
4. **Build case study library** - Add verified examples
5. **Scale production** - Increase volume once validated

---

**Last Updated:** 2025-10-10
**Version:** 1.0
**Maintained by:** TPP Automation Team
