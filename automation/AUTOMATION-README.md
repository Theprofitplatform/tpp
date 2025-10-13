# Blog Automation System

Automated blog post generation from your topic queue with multiple execution modes.

## 📊 Current Queue Status

```bash
npm run topics:check
```

**Current Stats:**
- **25 topics** queued (20 new competitive posts)
- **12 Priority 1** (high buyer intent)
- **13 Priority 2** (industry-specific niches)

---

## 🚀 Quick Start Options

### Option 1: Generate ONE Post Now (Interactive)
```bash
./automation/auto-blog-runner.sh
```

**What it does:**
- Picks next Priority 1 topic from queue
- Generates 3,000+ word blog post
- Builds site automatically
- **Asks** if you want to deploy

**Time:** ~5-8 minutes per post

---

### Option 2: Generate MULTIPLE Posts (Batch)
```bash
./automation/auto-blog-batch.sh 5
```

**What it does:**
- Generates 5 posts in one session (change number as needed)
- Processes topics in priority order
- Builds site once at the end
- **Asks** if you want to deploy

**Time:** ~30-40 minutes for 5 posts

---

### Option 3: Fully Automated (Cron)
```bash
./automation/setup-cron.sh
```

**Choose a schedule:**
1. **Daily at 9 AM (Weekdays)** - Best for steady growth
2. **Every 2 days at 10 AM** - Moderate pace
3. **Mon/Wed/Fri at 2 PM** - 3x per week
4. **Custom** - Your own schedule

**What it does:**
- Runs automatically on schedule
- Generates 1 post per run
- Auto-deploys to production
- Logs everything

**Perfect for:** Hands-off content marketing

---

## 📝 How It Works

### 1. **Topic Selection**
```javascript
// Prioritizes topics by:
1. Priority 1 first (comparison/buying guides)
2. Then Priority 2 (industry-specific)
3. Then Priority 3 (general content)
```

### 2. **Generation Process**
```bash
✅ Parse topic from queue
✅ Generate 3,000-word post with Claude
✅ Add internal links automatically
✅ Generate schema markup
✅ Optimize images
✅ Add visual suggestions
✅ Readability enhancements
✅ Save to src/content/blog/
✅ Update queue status
```

### 3. **Post-Processing**
```bash
✅ Build site (Astro)
✅ Fix trailing slashes (3,799 links)
✅ Deploy to Cloudflare Pages
✅ Update analytics dashboard
```

---

## 🎯 Your Current Queue (Top 10)

| ID | Priority | Title | Keyword | Search Vol |
|----|----------|-------|---------|------------|
| 36 | 1 | Best SEO Agency in Sydney | best seo agency sydney | 260/mo |
| 37 | 1 | How Much Does SEO Cost? | how much does seo cost sydney | 90/mo |
| 38 | 1 | Why We Show Our Prices | seo pricing transparency | - |
| 39 | 1 | In-House SEO vs Agency | in house seo vs agency | - |
| 45 | 1 | What is Local SEO? | what is local seo | 1,000/mo |
| 46 | 1 | Small Business Marketing Sydney | small business marketing sydney | 480/mo |
| 40 | 2 | SEO for Plumbers Sydney | seo for plumbers sydney | 50/mo |
| 41 | 2 | SEO for Lawyers Sydney | seo for lawyers sydney | 40/mo |
| 42 | 2 | SEO for Dentists Sydney | seo for dentists sydney | 35/mo |
| 43 | 2 | SEO for Real Estate Sydney | seo for real estate sydney | 60/mo |

---

## 💡 Recommended Strategy

### Week 1-2: Comparison & Authority Content
```bash
# Generate 4 high-intent posts manually
./automation/auto-blog-runner.sh  # Run 4 times
```
**Posts:** Best SEO Agency, SEO Costs, Pricing Transparency, In-House vs Agency

**Why:** Establish authority, compete for high-value keywords

---

### Week 3-4: Industry-Specific Landing Pages
```bash
# Batch generate 8 industry pages
./automation/auto-blog-batch.sh 8
```
**Posts:** Plumbers, Lawyers, Dentists, Real Estate, Restaurants, Electricians, Accountants, eCommerce

**Why:** Capture long-tail niche traffic with low competition

---

### Month 2+: Automated Steady Growth
```bash
# Set up Mon/Wed/Fri automation
./automation/setup-cron.sh
# Select option 3
```

**Result:** 3 posts per week, 12 per month, 144 per year

**Traffic Projection:**
- Month 3: +200 monthly visitors
- Month 6: +500 monthly visitors
- Month 12: +1,500 monthly visitors

---

## 🔧 Advanced Usage

### Manual Generation (Full Control)
```bash
cd automation/scripts
node generate-blog-post.js \
  --title "Your Title Here" \
  --keyword "target keyword" \
  --category "SEO" \
  --wordcount 3000 \
  --all-features
```

### Check Queue Status
```bash
npm run topics:check
```

### View Logs
```bash
tail -f automation/logs/auto-runner-*.log
tail -f automation/logs/cron-output.log
```

### Stop Automation
```bash
./automation/setup-cron.sh
# Select option 6 (Remove automation)
```

---

## ⚙️ Configuration

### Queue Management
Edit `automation/topic-queue.json`:
```json
{
  "queue": [
    {
      "id": 36,
      "title": "Your Title",
      "category": "SEO",
      "targetKeyword": "your keyword",
      "priority": 1,
      "status": "pending"
    }
  ]
}
```

### Scheduling Options
```bash
# Daily (Weekdays)
0 9 * * 1-5

# Every 2 days
0 10 */2 * *

# Mon/Wed/Fri
0 14 * * 1,3,5

# Twice per week (Tue/Thu)
0 10 * * 2,4
```

---

## 📈 Expected Results

### Publishing Velocity
```
Manual: 1 post per run (~5 mins)
Batch: 5 posts per run (~30 mins)
Automated: 1 post per scheduled time
```

### Traffic Growth (Conservative)
```
Month 1:   25 posts → ~200 visitors/mo
Month 3:   50 posts → ~800 visitors/mo
Month 6:  100 posts → 2,000 visitors/mo
Month 12: 200 posts → 5,000+ visitors/mo
```

### Content Quality
```
✅ 3,000+ words per post
✅ Claude Sonnet 4 (latest model)
✅ Internal linking (10-15 links)
✅ Schema markup (Article, FAQ)
✅ SEO-optimized (keyword density, headers)
✅ Sydney-focused (local relevance)
```

---

## 🚨 Troubleshooting

### "Topic queue not found"
```bash
# Ensure you're in project root
cd /path/to/tpp
./automation/auto-blog-runner.sh
```

### "No pending topics"
```bash
# Check queue
npm run topics:check

# Add more topics
npm run topics:generate
```

### "Generation failed"
```bash
# Check API key
echo $CLAUDE_API_KEY

# Check logs
tail automation/logs/auto-runner-*.log
```

### Cron not running
```bash
# Check cron jobs
crontab -l

# Check cron logs
tail /var/log/syslog | grep CRON
```

---

## 📞 Need Help?

1. Check logs: `automation/logs/`
2. Run diagnostics: `npm run blog:verify`
3. Test API: `automation/scripts/check-apis.mjs`

---

## 🎯 Next Steps

**Right now, you should:**

1. **Test the runner:**
   ```bash
   ./automation/auto-blog-runner.sh
   ```

2. **Generate first batch:**
   ```bash
   ./automation/auto-blog-batch.sh 3
   ```

3. **Set up automation:**
   ```bash
   ./automation/setup-cron.sh
   ```

**Then watch your traffic grow! 🚀**
