# ⚡ Quick Reference Card

**Essential commands and workflows at a glance**

---

## 🚀 Getting Started (3 commands)

```bash
npm run automation:wizard      # Interactive setup (5 min)
npm run automation:test        # Verify system
npm run automation:status:quick # Check status
```

---

## 📅 Daily/Weekly/Monthly Commands

### Daily (5 minutes)
```bash
npm run automation:status:quick  # Quick health check
```

### Weekly (30 minutes - Mondays)
```bash
npm run automation:monitor      # Full health check
npm run automation:gbp-posts    # Generate GBP posts
npm run automation:health       # Generate dashboard
```

### Monthly (1st of month)
```bash
npm run automation:suburb-pages     # Generate suburb pages
npm run automation:link-outreach    # Link building emails
npm run automation:status           # Review full history
```

---

## 🎮 All 15 npm Commands

### Content Generation
```bash
npm run automation:suburb-pages     # Generate 10 suburb pages
npm run automation:gbp-posts        # Generate 12 GBP posts
npm run automation:reviews          # Generate review requests
npm run automation:link-outreach    # Generate outreach emails
```

### Tracking & Reports
```bash
npm run automation:rank-track       # Keyword rankings report
npm run automation:health           # Health dashboard (HTML)
npm run automation:monitor          # Health check (terminal)
npm run automation:status:quick     # Quick status check
```

### Automation Management
```bash
npm run automation:scheduled        # Run scheduled tasks
npm run automation:run <name>       # Run specific automation
npm run automation:list             # List all automations
npm run automation:status           # Show run history
```

### Setup & Utilities
```bash
npm run automation:wizard           # Interactive setup
npm run automation:test             # Run test suite
npm run automation:cost-estimate    # Calculate API costs
```

---

## 📂 Key File Locations

### Configuration
```
automation/config/.env              # API keys
automation/data/clients.json        # Client data
```

### Generated Content
```
src/content/locations/              # Suburb pages
automation/generated/gbp-posts/     # GBP posts
automation/generated/review-emails/ # Review requests
automation/reports/                 # HTML/CSV reports
```

### Logs & Monitoring
```
automation/logs/health-check.log    # Health monitoring
automation/logs/alerts.log          # System alerts
automation/logs/cron.log            # Cron output
automation/data/automation-status.json # Run history
```

---

## 🏥 Health Check Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Disk | > 80% | > 90% | Clean old files |
| Memory | > 85% | > 90% | Restart system |
| API key | Missing | - | Set env variable |
| Last run | > 3 days | > 7 days | Check cron |
| Failures | > 2 | > 5 | Check logs |

---

## 💰 API Cost Reference

### Per Batch (Anthropic Claude)
| Automation | Items | Input | Output | Cost |
|-----------|-------|-------|--------|------|
| Suburb pages | 10 | 20K | 12K | $0.24 |
| GBP posts | 12 | 18K | 6K | $0.14 |
| Link outreach | 10 | 18K | 9K | $0.19 |
| Reviews | N/A | 0 | 0 | FREE |
| Rank tracker | N/A | 0 | 0 | FREE |

### Monthly Estimate
- **Typical usage:** $1-2/month
- **Heavy usage:** $5-10/month
- **Manual equivalent:** $1,900/month

---

## ⏱️ Time Savings

| Task | Manual | Automated | Savings |
|------|--------|-----------|---------|
| 10 suburb pages | 12.5 hrs | 45 sec | 99.9% |
| 12 GBP posts | 3 hrs | 30 sec | 99.7% |
| 5 review emails | 1.25 hrs | 10 sec | 99.8% |
| Rank tracking | 1 hr | 20 sec | 99.4% |
| 10 outreach emails | 5 hrs | 40 sec | 99.8% |

---

## 🎯 Success Metrics

### Target Benchmarks
- ✅ Health score: > 90%
- ✅ Success rate: > 95%
- ✅ Disk usage: < 80%
- ✅ Memory usage: < 85%
- ✅ API cost: < $10/month
- ✅ Manual review time: < 2 hours/month

---

## 🔧 Troubleshooting (Top 5 Issues)

### 1. API Key Not Found
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key' >> ~/.bashrc
```

### 2. Tests Failing
```bash
npm run automation:test        # See what failed
npm run automation:monitor     # Check health
```

### 3. Low Health Score
```bash
npm run automation:health      # See detailed dashboard
open automation/reports/health-dashboard.html
```

### 4. Cron Not Running
```bash
crontab -l                     # Check crontab
service cron status            # Check cron service
cat automation/logs/cron.log   # Check logs
```

### 5. High Disk Usage
```bash
# Clean old logs
find automation/logs/ -name "*.log" -mtime +30 -delete

# Archive old generated content
tar -czf archive-$(date +%Y-%m).tar.gz automation/generated/
```

---

## 📖 Documentation Map

### Quick Start
- `🚀-START-AUTOMATION.md` - 3-step quick start
- `AUTOMATION-QUICK-START.md` - 10-min tutorial
- `automation/README-START-HERE.md` - Complete overview

### Daily Reference
- `AUTOMATION-COMMANDS.md` - All commands
- `automation/WORKFLOW-GUIDE.md` - Daily/weekly workflows
- `automation/EXAMPLES.md` - Sample outputs

### Advanced
- `automation/MAINTENANCE-GUIDE.md` - Maintenance schedules
- `automation/PERFORMANCE-BENCHMARKS.md` - Performance data
- `automation/CUSTOMIZATION-TEMPLATES.md` - Customization guide

### System
- `automation/MONITORING-GUIDE.md` - Monitoring system
- `automation/INDEX.md` - Master index
- `CHANGELOG.md` - Version history

---

## 🔑 Environment Variables

```bash
# Required
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (for rank tracking)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Optional (for email sending)
export SENDGRID_API_KEY=your-sendgrid-key
export AUTO_SEND_EMAILS=true

# Optional (for notifications)
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
```

---

## ⏰ Cron Schedule Template

```bash
# Edit crontab
crontab -e

# Add these lines:

# Daily automation (6 AM)
0 6 * * * cd /path/to/tpp && npm run automation:scheduled >> automation/logs/cron.log 2>&1

# Health monitoring (every 6 hours)
0 */6 * * * cd /path/to/tpp && npm run automation:monitor >> automation/logs/cron-monitor.log 2>&1

# Weekly dashboard (Mondays 9 AM)
0 9 * * 1 cd /path/to/tpp && npm run automation:health >> automation/logs/cron.log 2>&1
```

---

## 🎨 Customization Quick Tips

### Change Tone/Voice
Edit prompt in script:
```javascript
const brandVoice = `
TONE: Friendly, conversational
AVOID: Jargon, overly formal language
USE: You/we, contractions, examples
`;
```

### Adjust Output Length
```javascript
max_tokens: 1500  // Was 2000 (saves 25% on costs)
```

### Add Industry-Specific Content
```javascript
const industryContext = `
Industry: Real Estate
Focus: Property values, market trends
Include: Local schools, transport, amenities
`;
```

---

## 📊 Performance Targets

### Execution Time
- Suburb pages: < 60 seconds
- GBP posts: < 40 seconds
- Review emails: < 15 seconds
- Rank tracker: < 30 seconds
- Health check: < 5 seconds

### Quality Metrics
- Content quality: > 8/10
- Keyword optimization: > 85%
- Readability score: > 70
- Brand voice match: > 80%

---

## 🆘 Getting Help

### Quick Diagnostics
```bash
npm run automation:test         # System verification
npm run automation:monitor      # Health check
npm run automation:status       # Run history
npm run automation:cost-estimate # Cost calculator
```

### Check Logs
```bash
cat automation/logs/health-check.log    # Health monitoring
cat automation/logs/alerts.log          # Alerts
tail -f automation/logs/cron.log        # Cron output
```

### Documentation
- Start: `automation/README-START-HERE.md`
- Commands: `AUTOMATION-COMMANDS.md`
- Workflows: `automation/WORKFLOW-GUIDE.md`
- Index: `automation/INDEX.md`

---

## 🎯 Monthly Checklist

### Week 1 (1st)
- [ ] Run suburb page generation
- [ ] Run link outreach
- [ ] Check health dashboard
- [ ] Review generated content

### Week 2 (Mondays)
- [ ] Generate GBP posts
- [ ] Run rank tracking
- [ ] Quick health check
- [ ] Schedule GBP posts

### Week 3 (Mondays)
- [ ] Generate GBP posts
- [ ] Run rank tracking
- [ ] Check review requests

### Week 4 (Mondays)
- [ ] Generate GBP posts
- [ ] Run rank tracking
- [ ] Review monthly metrics

### End of Month
- [ ] Clean old log files
- [ ] Review API costs
- [ ] Update client data
- [ ] Archive old content

---

## 🏆 Best Practices

### Content Quality
1. ✅ Always review AI content before publishing
2. ✅ Add local knowledge and examples
3. ✅ Include real photos and data
4. ✅ Personalize templates for brand voice

### Cost Optimization
1. ✅ Generate in batches, not daily
2. ✅ Lower max_tokens if content is too long
3. ✅ Monitor API usage monthly
4. ✅ Skip optional generations when not needed

### System Reliability
1. ✅ Run health checks weekly
2. ✅ Keep API key valid and funded
3. ✅ Backup client data regularly
4. ✅ Test automations after updates
5. ✅ Review logs monthly

---

**⚡ Print this page for quick reference at your desk**

**Version:** 2.0.0 | **Updated:** January 2025
