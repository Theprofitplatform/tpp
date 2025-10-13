# Topic Queue Management Guide

## Overview

The blog automation system uses a topic queue (`automation/topic-queue.json`) to manage upcoming blog posts. When the queue runs out, the automation stops generating posts.

**Current Status: 6 topics remaining** (approximately 6 days of content)

---

## Quick Commands

### Check Queue Status
```bash
npm run topics:check
```

Shows:
- Total topics in queue
- Pending topics count
- Warning if low (<10 topics)
- Critical alert if very low (<5 topics)
- List of next pending topics

### Generate New Topics (AI-Powered)
```bash
# Interactive mode (asks for approval)
npm run topics:generate

# Auto-approve mode (for VPS automation)
npm run topics:generate -- --auto

# Generate specific number of topics
npm run topics:generate 30
```

This will:
1. Analyze your existing topics
2. Use Claude AI to generate 20-30 new topics
3. Balance across categories (Google Ads, SEO, Web Design, etc.)
4. Include Sydney-specific keywords
5. Ask for approval before adding

**Cost:** ~$0.10-0.15 per generation (25 topics)
**Time:** ~30 seconds

---

## What Happens When Queue Runs Out?

When no pending topics remain:

1. **Automation Behavior:**
   - Daily cron job runs at 6 AM
   - Checks topic queue
   - Finds 0 pending topics
   - Logs: "No pending topics in queue, exiting"
   - **Stops generating** (exits gracefully)

2. **Notifications:**
   - Discord notification: "Topic queue is empty"
   - No blog post generated that day

3. **Recovery:**
   - Run `npm run topics:generate` to refill queue
   - Automation will resume next day at 6 AM

---

## Alert Thresholds

- **Healthy:** 10+ topics remaining (✅)
- **Warning:** 5-9 topics remaining (⚠️)
- **Critical:** 1-4 topics remaining (🚨)
- **Empty:** 0 topics remaining (❌ automation stops)

---

## Automated Topic Generation (Optional)

You can automate topic generation by adding a weekly cron job:

### On VPS:
```bash
# Edit crontab
crontab -e

# Add this line (runs every Sunday at 2 AM)
0 2 * * 0 cd /home/avi/projects/tpp && npm run topics:generate -- --auto >> automation/logs/topic-generation.log 2>&1
```

This ensures you always have topics in the queue.

---

## Manual Topic Addition

You can also add topics manually by editing `automation/topic-queue.json`:

```json
{
  "id": 34,
  "title": "Your Blog Title Here",
  "category": "SEO",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "targetKeyword": "your keyword here",
  "searchIntent": "informational",
  "priority": 3,
  "status": "pending"
}
```

**Field Guide:**
- `id`: Next available ID (check max ID in file)
- `title`: Complete blog post title (include Sydney if relevant)
- `category`: One of: `Google Ads`, `SEO`, `Web Design`, `Content Marketing`, `Digital Marketing`
- `tags`: 3-5 relevant tags
- `targetKeyword`: 2-4 word SEO keyword
- `searchIntent`: `informational`, `commercial`, or `transactional`
- `priority`: 1-5 (1=highest, 3=normal, 5=lowest)
- `status`: Always `"pending"` for new topics

---

## Topic Generation Strategy

The AI topic generator is designed to:

1. **Analyze existing content** to avoid duplicates
2. **Balance categories** across your content pillars
3. **Target Sydney businesses** with local keywords
4. **Focus on commercial intent** (converts better)
5. **Mix broad and niche topics** for diversity

**Typical output (25 topics):**
- 5-6 Google Ads topics
- 5-6 SEO topics
- 4-5 Web Design topics
- 4-5 Content Marketing topics
- 4-5 Digital Marketing topics

---

## Monitoring & Maintenance

### Weekly Check (Recommended)
```bash
ssh tpp-vps "cd ~/projects/tpp && npm run topics:check"
```

### Monthly Bulk Generation (Recommended)
```bash
# Generate 30 topics at once (1 month supply)
ssh tpp-vps "cd ~/projects/tpp && npm run topics:generate 30 -- --auto"
```

### Queue Health Dashboard
Check your queue status anytime:
```bash
# Local
npm run topics:check

# VPS
ssh tpp-vps "cd ~/projects/tpp && npm run topics:check"
```

---

## Troubleshooting

### "No pending topics" error
**Solution:** Run `npm run topics:generate`

### Topic generator fails
**Check:**
1. `ANTHROPIC_API_KEY` is set in `.env.local`
2. You have Claude API credits
3. Network connection is working

### Topics are low quality
**Solution:** Edit the prompt in `automation/scripts/generate-topics.mjs` to adjust:
- Keywords specificity
- Sydney focus
- Content depth
- Target audience

### Want different topic mix
**Edit the generator prompt** to specify:
- More/fewer topics per category
- Different industries
- Specific keyword types
- Content format preferences

---

## Best Practices

1. **Keep 15-20 topics minimum** in queue at all times
2. **Generate topics monthly** rather than weekly (more efficient)
3. **Review generated topics** before auto-approving (quality check)
4. **Monitor topic performance** - regenerate underperforming categories less
5. **Seasonal planning** - add holiday/seasonal topics manually ahead of time

---

## Cost Management

**Topic Generation Costs:**
- 25 topics: ~$0.10-0.15
- 30 topics: ~$0.12-0.18
- 50 topics: ~$0.20-0.30

**Monthly Budget (20 posts):**
- Blog posts: $10-15 (Claude API)
- Topic generation (2x/month): $0.30
- **Total: ~$10.30-15.30/month**

Very affordable for fully automated content!

---

## Future Enhancements

Potential improvements:
- [ ] Keyword research integration (DataForSEO)
- [ ] Competitor topic analysis
- [ ] Performance-based topic generation (favor high-performing categories)
- [ ] Seasonal topic suggestions
- [ ] Auto-refill when queue drops below threshold

---

## Support

**Check Status:** `npm run topics:check`
**Generate Topics:** `npm run topics:generate`
**View Queue:** `cat automation/topic-queue.json`
**VPS Logs:** `ssh tpp-vps "tail -100 ~/projects/tpp/automation/logs/blog-automation.log"`

---

**Remember:** The automation will gracefully stop when topics run out. Just refill the queue and it resumes automatically!
