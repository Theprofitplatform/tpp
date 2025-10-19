# 🤖 SEO Automation - Quick Reference Card

**Keep this handy for daily use**

---

## ⚡ Quick Commands (Copy-Paste Ready)

### First Time Setup:
```bash
# 1. Test everything works
npm run automation:test

# 2. Set API key (get from https://console.anthropic.com/)
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# 3. Make it permanent
echo 'export ANTHROPIC_API_KEY=sk-ant-xxxxx' >> ~/.bashrc
source ~/.bashrc
```

### Daily Use:
```bash
# Generate 10 suburb pages
npm run automation:suburb-pages

# Generate 12 GBP posts (4 weeks worth)
npm run automation:gbp-posts

# Generate review request emails
npm run automation:reviews

# Generate link outreach emails
npm run automation:link-outreach

# Track keyword rankings
npm run automation:rank-track

# Run all scheduled automations
npm run automation:scheduled
```

### Management:
```bash
# List all automations
npm run automation:list

# Check automation status
npm run automation:status

# Get help
npm run automation:help

# Run specific automation manually
npm run automation:run suburb-pages
```

---

## 📁 Where Files Go

| What | Where | Action |
|------|-------|--------|
| Suburb pages | `src/content/locations/*.md` | Review → Publish |
| GBP posts | `automation/generated/gbp-posts/*.md` | Copy to GBP |
| Review emails | `automation/generated/review-emails/*.md` | Send via email |
| Link outreach | `automation/generated/link-outreach/*.md` | Personalize → Send |
| Ranking reports | `automation/reports/*.html` | View in browser |
| Logs | `automation/logs/*.log` | Check if errors |

---

## 💰 Cost Per Run

| Automation | Cost | Output |
|------------|------|--------|
| Suburb pages | ~$0.50 | 10 pages |
| GBP posts | ~$0.30 | 12 posts |
| Review emails | FREE | Variable |
| Link outreach | ~$0.20 | 10 emails |
| Rank tracking | FREE | HTML report |

**Monthly total: ~$30-50**

---

## ⏰ Recommended Schedule

| Task | Frequency | Day | Command |
|------|-----------|-----|---------|
| Suburb pages | Monthly | 1st | `automation:suburb-pages` |
| GBP posts | Weekly | Monday | `automation:gbp-posts` |
| Review emails | Daily | M-F | `automation:reviews` |
| Link outreach | Monthly | 1st | `automation:link-outreach` |
| Rank tracking | Weekly | Monday | `automation:rank-track` |

**Auto-schedule with cron:**
```bash
0 6 * * * cd /path/to/tpp && npm run automation:scheduled >> automation/logs/cron.log 2>&1
```

---

## 🔧 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| API Key | Anthropic API access | `automation/config/.env` |
| Clients | Review request data | `automation/data/clients.json` |
| Keywords | Ranking keywords | `automation/scripts/rank-tracker.mjs` |
| Suburbs | Target locations | `automation/scripts/generate-suburb-pages.mjs` |
| Link targets | Outreach websites | `automation/scripts/link-outreach.mjs` |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not set" | `export ANTHROPIC_API_KEY=your_key` |
| "No pages generated" | Check `automation/logs/` for errors |
| "Tests failing" | Run `npm run automation:test` |
| "GSC API error" | See `automation/AUTOMATION-SETUP-GUIDE.md` |
| Script not working | Check Node.js version: `node --version` (need v16+) |

---

## 📊 What to Review Before Publishing

### Suburb Pages:
- ✅ Suburb name/facts are accurate
- ✅ No AI-generated nonsense
- ✅ Real local insights included
- ✅ Links work correctly
- ✅ Schema markup present

### GBP Posts:
- ✅ Dates are current
- ✅ Offers are valid
- ✅ Phone numbers correct
- ✅ Images suggested
- ✅ CTAs relevant

### Review Emails:
- ✅ Client names correct
- ✅ Project details accurate
- ✅ Review link works
- ✅ Timing appropriate
- ✅ No typos

### Link Outreach:
- ✅ Target website researched
- ✅ Contact info current
- ✅ Personalization added
- ✅ Value proposition clear
- ✅ No generic templates

---

## 📈 Success Metrics to Track

| Metric | Baseline | Month 3 | Month 6 |
|--------|----------|---------|---------|
| Suburb pages live | 4 | 10 | 20 |
| GBP posts created | 0 | 36 | 72 |
| Reviews collected | 127 | 145 | 165 |
| Keywords ranked | 5 | 15 | 35 |
| Backlinks | 20 | 30 | 50 |
| Organic traffic | 100 | 150 | 220 |

---

## 🎯 Monthly Workflow

### Week 1 (1st of month):
```bash
npm run automation:suburb-pages     # Generate 10 pages
npm run automation:link-outreach    # Generate outreach
# Review + personalize + send
```

### Weekly (Mondays):
```bash
npm run automation:gbp-posts        # Generate 12 posts
npm run automation:rank-track       # Check rankings
# Review reports
```

### Daily (M-F):
```bash
npm run automation:reviews          # Check for new requests
# Send if any
```

### End of Month:
```bash
npm run automation:status           # Check what ran
# Review automation/logs/
# Analyze automation/reports/
# Optimize based on data
```

---

## 💡 Pro Tips

1. **Batch review content** - Set aside 30min/week to review all generated content
2. **Personalize outreach** - Spend 2min per email adding personal touches
3. **Track what works** - Note which suburb pages get traffic, which GBP posts get clicks
4. **Optimize prompts** - Adjust AI prompts in scripts based on output quality
5. **Stagger publishing** - Don't publish 10 pages at once, do 2-3/week
6. **Monitor logs** - Check `automation/logs/` weekly for errors
7. **Update configs** - Refresh client list, keywords, targets monthly
8. **Test before scaling** - Run small batches first, scale when quality is good

---

## 📞 Quick Help

**Documentation:**
- Quick start: `GETTING-STARTED-AUTOMATION.md`
- Complete guide: `automation/AUTOMATION-SETUP-GUIDE.md`
- This card: `AUTOMATION-QUICK-REFERENCE.md`

**Commands:**
- Help: `npm run automation:help`
- Test: `npm run automation:test`
- Status: `npm run automation:status`

**Support:**
- Check logs: `automation/logs/`
- Read guides: `automation/*.md`
- Verify tests: `npm run automation:test`

---

## ⚡ Power User Shortcuts

```bash
# Generate everything at once
npm run automation:suburb-pages && \
npm run automation:gbp-posts && \
npm run automation:reviews && \
npm run automation:link-outreach

# Check all logs
tail -f automation/logs/*.log

# Count generated files
find automation/generated -type f | wc -l

# View latest ranking report
open automation/reports/rank-report-*.html

# Quick status check
npm run automation:status && npm run automation:test
```

---

## 🎯 This Week's Actions

- [ ] Set API key permanently
- [ ] Generate first suburb pages
- [ ] Generate GBP posts
- [ ] Review generated content
- [ ] Publish 2-3 suburb pages
- [ ] Post 3 GBP updates
- [ ] Set up cron job (optional)

---

## 🚀 Bookmark These Commands

**Most used:**
```bash
npm run automation:suburb-pages
npm run automation:gbp-posts
npm run automation:status
npm run automation:help
```

**Keep handy:**
- API key: `export ANTHROPIC_API_KEY=your_key`
- Test: `npm run automation:test`
- View docs: `cat GETTING-STARTED-AUTOMATION.md`

---

**🤖 Save this file. Use it daily. Dominate local SEO.**

Print and stick on your wall or bookmark this page!
