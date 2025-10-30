# 🚀 Quick Start Guide - Automation System v2.0

**Time to get started:** 5 minutes
**Prerequisites:** Node.js 18+, npm, Anthropic API key

---

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies (1 minute)

```bash
cd /path/to/tpp
npm install
```

This installs all required packages including:
- `@anthropic-ai/sdk` - Claude API client
- `vitest` - Testing framework
- All other dependencies

---

### Step 2: Configure Environment (2 minutes)

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit with your favorite editor
nano .env.local  # or vim, code, etc.
```

**Minimum required configuration:**
```bash
# Required: Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Optional but recommended: Monthly budget
MONTHLY_API_BUDGET=100
```

**Get your API key:**
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy it to `.env.local`

---

### Step 3: Verify Setup (30 seconds)

```bash
# Check that environment is configured correctly
npm run automation:dashboard
```

You should see:
```
═══════════════════════════════════════════════════════════════════
🤖  THE PROFIT PLATFORM - AUTOMATION DASHBOARD
═══════════════════════════════════════════════════════════════════

💰 API USAGE & COSTS
────────────────────────────────────────────────────────────────────
  No usage data available (this is normal for first run)

💊 SYSTEM HEALTH
────────────────────────────────────────────────────────────────────
  Budget Status:     GOOD
  API Connectivity:  CONNECTED
```

✅ If you see this, your setup is complete!

---

### Step 4: Test with Dry-Run (30 seconds)

Before spending any money, test the scripts:

```bash
# Test suburb page generation (no API calls)
node automation/scripts/generate-suburb-pages.mjs --dry-run

# Test GBP post generation (no API calls)
node automation/scripts/gbp-auto-poster.mjs --dry-run

# Test topic generation (no API calls)
node automation/scripts/generate-topics.mjs 25 --dry-run
```

You should see:
```
✅ Environment validated
⚠️  DRY RUN MODE - No files were written, no API calls made
```

---

### Step 5: Run Your First Automation (1 minute)

Let's generate some suburb pages:

```bash
# This will generate pages for Sydney suburbs
npm run automation:suburb-pages
```

**What happens:**
1. ✅ Validates environment
2. ✅ Loads suburb data from `automation/data/suburbs.json`
3. ✅ Generates unique content for each suburb
4. ✅ Tracks API usage and costs
5. ✅ Saves pages to `src/content/locations/`
6. ✅ Shows you a cost summary

**Example output:**
```
🚀 Starting Automated Suburb Page Generation

✅ Environment validated
📊 Found 10 suburb(s) to generate

Generating content for Bondi...
✅ Generated content for Bondi (742 words)

...

═══════════════════════════════════════════════════════════════════
📊 GENERATION SUMMARY
═══════════════════════════════════════════════════════════════════
Duration: 45.2s
✅ Successful: 10
❌ Failed: 0

💰 API Usage:
  Total Cost: $0.3456
  Total Tokens: 78,432
  Requests: 10

📁 Pages saved to: ./src/content/locations
```

---

## 🎯 Common Tasks

### Generate GBP Posts (Monthly)

```bash
npm run automation:gbp-posts
```

Generates 12 posts (3 per week for 4 weeks) in 3 formats:
- 📄 JSON (for automation)
- 📊 CSV (for spreadsheets)
- 📝 Markdown (human-readable)

Files saved to: `automation/generated/gbp-posts/`

---

### Generate Blog Topics (As Needed)

```bash
# Generate 25 topics with auto-approve
node automation/scripts/generate-topics.mjs 25 --auto

# Or review before adding
node automation/scripts/generate-topics.mjs 25
```

Topics saved to: `automation/topic-queue.json`

---

### Generate Link Outreach Emails (As Needed)

```bash
npm run automation:link-outreach
```

**Edit the target list first:**
1. Open `automation/scripts/link-outreach.mjs`
2. Update `CONFIG.targetWebsites` array
3. Add your outreach targets
4. Run the script

Emails saved to: `automation/generated/link-outreach/`

---

### Monitor System Status

```bash
# View dashboard once
npm run automation:dashboard

# Auto-refresh every 30 seconds
npm run automation:dashboard:watch
```

**Dashboard shows:**
- 💰 API usage and costs
- 📈 Monthly budget status
- 📝 Content generation stats
- 🚨 Recent errors
- 💊 System health

---

## 💰 Cost Management

### View Current Spending

```bash
npm run automation:dashboard
```

Look for the "API USAGE & COSTS" section:
```
💰 API USAGE & COSTS
────────────────────────────────────────────────────────────────────
  Monthly Budget:
  [████████████░░░░░░░░░░░░░░░░░░░░] 32.5%
  Spent: $32.50 / $100.00
  Remaining: $67.50
```

### Get Detailed Report

```bash
node -e "import('./automation/lib/usage-tracker.mjs').then(m => new m.UsageTracker().generateReport())"
```

**Shows:**
- Total costs (today/week/month)
- Cost per script
- Cost per model
- Budget status

### Set Budget Alerts

Edit `.env.local`:
```bash
MONTHLY_API_BUDGET=50  # Set your budget
```

You'll get automatic warnings at 80%:
```
⚠️  WARNING: 82.3% of monthly API budget used ($41.15/$50)
```

---

## 🧪 Testing

### Run Unit Tests

```bash
# Run all tests
npm run test:unit

# Visual test UI
npm run test:unit:ui

# Watch mode (for development)
npm run test:unit:watch
```

### Test Before Production

Always test with dry-run first:
```bash
node automation/scripts/generate-suburb-pages.mjs --dry-run
```

This:
- ✅ Validates configuration
- ✅ Shows what would happen
- ✅ Costs $0.00 (no API calls)
- ✅ Writes no files

---

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not set"

**Solution:**
```bash
# Check if key is set
echo $ANTHROPIC_API_KEY

# If empty, set it
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Or add to .env.local
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env.local
```

### "Environment Validation Failed"

**Solution:**
The error message will tell you exactly what's missing:
```
❌ Environment Validation Failed

Required:
  ✗ ANTHROPIC_API_KEY
    Claude API key from https://console.anthropic.com
    Format: Must start with 'sk-ant-'
    Current: Not set
```

Follow the instructions in the error message.

### "Rate limit exceeded (429)"

**Good news:** This is handled automatically!

The system will:
1. Wait with exponential backoff
2. Retry up to 3 times
3. Log the retry attempts

You don't need to do anything.

### "Budget exceeded"

**Solution:**
```bash
# Option 1: Increase budget
# Edit .env.local
MONTHLY_API_BUDGET=150

# Option 2: Wait until next month
# The system tracks monthly spending

# Option 3: View detailed usage
npm run automation:dashboard
```

### Scripts running slowly

**Possible causes:**
1. **Rate limiting** - Working as intended (50 req/min max)
2. **Network latency** - Normal for API calls
3. **Large batch** - Generate fewer items at once

**Not a problem if:**
- Each request takes 2-5 seconds (normal)
- You see progress updates
- No error messages

**Is a problem if:**
- Requests take >30 seconds
- No progress for minutes
- Check your internet connection

### Can't find generated files

**Check these locations:**
- Suburb pages: `src/content/locations/*.md`
- GBP posts: `automation/generated/gbp-posts/*.md`
- Outreach: `automation/generated/link-outreach/*.md`
- Topics: `automation/topic-queue.json`
- Logs: `automation/logs/YYYY-MM-DD.log`

---

## 📚 Next Steps

### 1. Customize Suburb Data

Edit `automation/data/suburbs.json`:
```json
{
  "suburbs": [
    {
      "name": "Your Suburb",
      "postcode": "2000",
      "coordinates": { "lat": "-33.8688", "lng": "151.2093" },
      "region": "Your Region",
      "priority": 1,
      "status": "pending",
      "nearbySuburbs": ["Suburb1", "Suburb2"]
    }
  ]
}
```

### 2. Set Up Monitoring

**Option A: Dashboard (recommended for local dev)**
```bash
npm run automation:dashboard:watch
```

**Option B: Slack Alerts (recommended for production)**
1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Add to `.env.local`:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```
3. Get critical error alerts automatically

### 3. Schedule Automations

**Using cron (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add this line (runs Mon-Fri at 9 AM)
0 9 * * 1-5 cd /path/to/tpp && npm run automation:suburb-pages >> automation/logs/cron.log 2>&1
```

**Using Task Scheduler (Windows):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 9 AM)
4. Action: Start a program
5. Program: `node`
6. Arguments: `automation/scripts/generate-suburb-pages.mjs`
7. Start in: `C:\path\to\tpp`

### 4. Review Generated Content

**Always review before publishing:**
- ✅ Check for accuracy
- ✅ Verify local information
- ✅ Ensure brand voice
- ✅ Remove any AI artifacts
- ✅ Add personal touches

**Content is good, not perfect.**
AI-generated content needs human oversight.

---

## ✅ Checklist: You're Ready When...

- [ ] Dependencies installed (`npm install`)
- [ ] API key configured in `.env.local`
- [ ] Dashboard shows "CONNECTED" status
- [ ] Dry-run mode works
- [ ] First automation run successful
- [ ] Generated files appear in correct locations
- [ ] Dashboard shows usage data
- [ ] Tests pass (`npm run test:unit`)

---

## 🆘 Getting Help

### Documentation
- **This guide** - Quick start instructions
- **automation/README.md** - Detailed features and examples
- **IMPLEMENTATION-COMPLETE.md** - Technical implementation details
- **.env.local.example** - All configuration options

### Check Logs
```bash
# Today's log
tail -f automation/logs/$(date +%Y-%m-%d).log

# Search logs
grep "error" automation/logs/*.log
```

### Check System Status
```bash
npm run automation:dashboard
```

### Common Issues
Most issues are configuration problems:
1. Missing API key → Set in `.env.local`
2. Wrong API key format → Must start with `sk-ant-`
3. Budget exceeded → Increase `MONTHLY_API_BUDGET`
4. Rate limit → System handles automatically

---

## 🎉 You're Ready!

Your automation system is now set up and ready to use.

**Start with:**
```bash
# 1. View dashboard
npm run automation:dashboard

# 2. Generate suburb pages
npm run automation:suburb-pages

# 3. Monitor costs
npm run automation:dashboard
```

**Remember:**
- ✅ Always test with `--dry-run` first
- ✅ Monitor costs via dashboard
- ✅ Review content before publishing
- ✅ Check logs if something goes wrong

**Happy automating!** 🚀
