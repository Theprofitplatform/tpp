# 🔧 Automation System Maintenance Guide

**Keep your automation system running smoothly**

---

## 📅 Maintenance Schedule

### Daily (5 minutes)
```bash
# Morning routine
npm run automation:monitor      # Check health
cat automation/logs/alerts.log | tail -5  # Check alerts
```

**What to check:**
- ✅ Health score >90%
- ✅ No critical alerts
- ✅ Review requests processed
- ✅ Cron job ran successfully

### Weekly (30 minutes)

**Monday Morning:**
```bash
# Generate fresh dashboard
npm run automation:health

# Review automation status
npm run automation:status

# Check generated content
ls -lt automation/generated/*/
```

**What to do:**
1. Review GBP posts generated
2. Schedule posts in Google Business Profile
3. Check rank report (if tracking enabled)
4. Review any failed automations
5. Clear old log files (optional)

### Monthly (2 hours)

**First of Month:**
```bash
# Review full month
npm run automation:status

# Check disk usage
df -h .

# Review all generated content
ls -la src/content/locations/
ls -la automation/generated/
```

**What to do:**
1. **Content Review:**
   - Audit 10 new suburb pages
   - Edit any inaccuracies
   - Publish to website

2. **Data Updates:**
   - Update `automation/data/clients.json`
   - Add new target suburbs if needed
   - Update keywords to track

3. **Cost Analysis:**
   - Review Anthropic API usage
   - Calculate ROI for the month
   - Optimize if costs too high

4. **System Health:**
   - Review health trends
   - Check for recurring issues
   - Update thresholds if needed

### Quarterly (4 hours)

**Every 3 Months:**

1. **Full System Audit:**
   ```bash
   npm run automation:test
   npm run automation:health
   npm run automation:status
   ```

2. **Performance Review:**
   - Analyze automation success rates
   - Review content quality
   - Check SEO results
   - Calculate total ROI

3. **Optimization:**
   - Update AI prompts for better quality
   - Adjust scheduling if needed
   - Archive old generated content
   - Clean up logs directory

4. **Updates:**
   - Check for automation script updates
   - Update documentation if workflows changed
   - Train team on any new features

---

## 🧹 Regular Cleanup Tasks

### Log File Management

**Check log sizes:**
```bash
du -sh automation/logs/
```

**Archive old logs (keep last 30 days):**
```bash
# Archive logs older than 30 days
find automation/logs/ -name "*.log" -mtime +30 -exec gzip {} \;

# Or delete old logs
find automation/logs/ -name "*.log" -mtime +90 -delete
```

**Recommended schedule:** Monthly

### Generated Content Cleanup

**Archive old generated content:**
```bash
# Create archive directory
mkdir -p automation/archive/$(date +%Y-%m)

# Move old generated files
mv automation/generated/gbp-posts/gbp-posts-2024-*.* automation/archive/2024-12/
mv automation/generated/review-emails/review-requests-2024-*.* automation/archive/2024-12/
```

**Recommended schedule:** Quarterly

### Status File Maintenance

**Clean old status data (keep last 90 days):**
```bash
# Backup first
cp automation/data/automation-status.json automation/data/automation-status.backup.json

# Then manually edit to remove old entries
# Or write script to clean programmatically
```

**Recommended schedule:** Quarterly

---

## 🔄 Updating Configurations

### Update Target Suburbs

**File:** `automation/scripts/generate-suburb-pages.mjs`

```javascript
targetSuburbs: [
  // Add new suburbs here
  {
    name: 'Cronulla',
    postcode: '2230',
    lat: '-34.0578',
    lng: '151.1522',
    region: 'Sutherland Shire'
  },
  // Keep existing suburbs...
]
```

**After updating:**
```bash
# Test to ensure no errors
npm run automation:test
```

### Update Client List

**File:** `automation/data/clients.json`

```json
[
  {
    "id": 4,
    "name": "New Client Name",
    "email": "client@example.com",
    "projectType": "Website + SEO",
    "projectCompletionDate": "2025-10-15",
    "status": "active",
    "suburb": "Bondi"
  }
]
```

**After updating:**
```bash
# Check for review requests
npm run automation:reviews
```

### Update Keywords to Track

**File:** `automation/scripts/rank-tracker.mjs`

```javascript
keywords: [
  'your new keyword here',
  'another keyword',
  // Existing keywords...
]
```

**After updating:**
```bash
# Run rank tracker to test
npm run automation:rank-track
```

---

## 🎯 Performance Optimization

### Reduce API Costs

**1. Lower max_tokens if content is too long:**

Edit automation scripts:
```javascript
// Before
max_tokens: 2000

// After (if content is consistently too long)
max_tokens: 1500
```

**2. Generate less frequently:**

Edit schedules in `automation-orchestrator.mjs`:
```javascript
// Before: Weekly GBP posts
{ name: 'gbp-auto-poster', time: '07:00', day: 1 }

// After: Bi-weekly
// Run manually every 2 weeks instead
```

**3. Skip optional automations:**

Disable automations you're not using by commenting out in orchestrator.

### Improve Content Quality

**1. Enhance AI prompts:**

Edit prompts in automation scripts to be more specific:
```javascript
const prompt = `You are an expert local SEO content writer...

IMPORTANT:
- Include specific data points about ${suburb.name}
- Mention at least 2 local landmarks
- Reference local business types
- Use conversational, friendly tone
...
`;
```

**2. Add post-generation validation:**

Review content before publishing:
```bash
# Review suburb pages
cat src/content/locations/new-suburb.md

# Edit if needed
nano src/content/locations/new-suburb.md
```

### Speed Up Generation

**1. Reduce generation batch size:**

Edit configs to generate fewer items per run:
```javascript
// Generate 5 instead of 10
targetSuburbs: targetSuburbs.slice(0, 5)
```

**2. Run in parallel (advanced):**

Run multiple automations simultaneously:
```bash
npm run automation:gbp-posts & npm run automation:reviews
```

---

## 🐛 Troubleshooting Common Issues

### Issue: Automations Not Running on Schedule

**Diagnosis:**
```bash
# Check if cron is running
service cron status

# Check cron logs
cat automation/logs/cron.log | tail -50

# Verify crontab
crontab -l
```

**Fix:**
```bash
# Restart cron
sudo service cron restart

# Test manually first
npm run automation:scheduled

# Check environment variables in cron
# Add to crontab:
ANTHROPIC_API_KEY=your_key_here
0 6 * * * cd /path/to/tpp && npm run automation:scheduled
```

### Issue: High API Costs

**Diagnosis:**
```bash
# Check how often automations run
npm run automation:status

# Count generated files
ls automation/generated/*/*.* | wc -l
```

**Fix:**
1. Reduce generation frequency
2. Lower max_tokens in scripts
3. Skip optional generations
4. Review and optimize prompts

### Issue: Low Quality Content

**Diagnosis:**
- Review several generated suburb pages
- Compare to competitors
- Check for generic language

**Fix:**
1. **Improve prompts** - Add more specific instructions
2. **Add examples** - Show the AI what you want
3. **Increase max_tokens** - Allow more detailed content
4. **Post-process** - Edit AI content before publishing
5. **A/B test prompts** - Try different approaches

### Issue: Disk Space Running Low

**Diagnosis:**
```bash
# Check disk usage
df -h .

# Find largest directories
du -sh automation/* | sort -h
```

**Fix:**
```bash
# Clean old logs
find automation/logs/ -name "*.log" -mtime +30 -delete

# Archive old generated content
tar -czf automation-archive-2024.tar.gz automation/generated/
rm -rf automation/generated/*/2024-*

# Clean old reports
rm automation/reports/*-2024-*.html
```

### Issue: Health Score Declining

**Diagnosis:**
```bash
# Generate detailed dashboard
npm run automation:health
open automation/reports/health-dashboard.html

# Check specific issues
npm run automation:monitor
```

**Fix based on issues:**
- **High disk:** Clean up files
- **High memory:** Restart system, reduce batch sizes
- **Automation failures:** Check logs, fix errors
- **API key issues:** Verify key is set correctly

---

## 📊 Monitoring Best Practices

### Set Up Alerts

**Email notifications (optional):**

Edit `vps-monitor.sh`:
```bash
# At end of file, add:
if [ $passed_checks -lt $total_checks ]; then
  echo "Health check failed: $passed_checks/$total_checks" | \
    mail -s "Automation Alert" your@email.com
fi
```

**Slack notifications (optional):**

Create webhook, then add to `vps-monitor.sh`:
```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK"

if [ $passed_checks -lt $total_checks ]; then
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"⚠️ Automation health: $passed_checks/$total_checks\"}"
fi
```

### Dashboard Review Routine

**Weekly dashboard review:**
1. Check overall health score (target: >90%)
2. Review resource usage trends
3. Check automation success rate (target: >95%)
4. Review recent alerts
5. Note any degrading metrics

**Create alerts for:**
- Health score <85%
- Disk usage >85%
- Memory usage >90%
- Automation failures >2 in 7 days
- No runs in 3+ days

---

## 🔐 Security & Backup

### Secure Your API Keys

**Never commit API keys:**
```bash
# Ensure .env is in .gitignore
echo "automation/config/.env" >> .gitignore

# Check for exposed keys
git log -S "sk-ant-" --all
```

**Rotate API keys regularly:**
- Monthly for production
- After any suspected exposure
- When team members leave

### Backup Important Data

**What to backup:**
```bash
# Weekly backups
tar -czf backup-$(date +%Y-%m-%d).tar.gz \
  automation/data/ \
  automation/config/ \
  src/content/locations/

# Monthly full backups
tar -czf full-backup-$(date +%Y-%m).tar.gz \
  automation/ \
  src/content/
```

**Backup schedule:**
- Daily: `automation/data/`
- Weekly: Generated content
- Monthly: Full system

### Disaster Recovery

**If automation system fails:**

1. **Restore from backup:**
   ```bash
   tar -xzf backup-latest.tar.gz
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

3. **Verify system:**
   ```bash
   npm run automation:test
   npm run automation:monitor
   ```

4. **Resume operations:**
   ```bash
   npm run automation:scheduled
   ```

---

## 📈 Continuous Improvement

### Monthly Optimization Checklist

- [ ] Review content quality (sample 5 random pages)
- [ ] Check API costs vs budget
- [ ] Review automation success rates
- [ ] Update prompts if quality declining
- [ ] Add new suburbs/keywords if needed
- [ ] Archive old content
- [ ] Clean up logs
- [ ] Test new features
- [ ] Update documentation if workflows changed
- [ ] Train team on improvements

### Quarterly Strategic Review

- [ ] Analyze ROI (time saved vs costs)
- [ ] Review SEO results (rankings, traffic)
- [ ] Survey content performance
- [ ] Plan new automations
- [ ] Update annual goals
- [ ] Budget review for next quarter
- [ ] Technology updates
- [ ] Competitive analysis

### Annual Audit

- [ ] Full system review
- [ ] Compare year-over-year metrics
- [ ] Calculate total ROI
- [ ] Plan next year's roadmap
- [ ] Major version updates
- [ ] Team training refresh
- [ ] Documentation overhaul
- [ ] Process optimization

---

## 🎓 Training New Team Members

### Onboarding Checklist

**Week 1: Basics**
- [ ] Read `automation/README-START-HERE.md`
- [ ] Run setup wizard
- [ ] Generate first content
- [ ] Review sample outputs
- [ ] Understand daily workflows

**Week 2: Advanced**
- [ ] Review all documentation
- [ ] Try each automation
- [ ] Learn monitoring system
- [ ] Practice troubleshooting
- [ ] Customize configurations

**Week 3: Independence**
- [ ] Run weekly routine alone
- [ ] Handle a simulated failure
- [ ] Optimize one automation
- [ ] Document a process
- [ ] Train someone else

---

## 📞 Support & Resources

### When You Need Help

**1. Check documentation:**
- Troubleshooting: This file
- Workflows: `WORKFLOW-GUIDE.md`
- Commands: `AUTOMATION-COMMANDS.md`

**2. Run diagnostics:**
```bash
npm run automation:test
npm run automation:monitor
npm run automation:health
```

**3. Check logs:**
```bash
cat automation/logs/health-check.log
cat automation/logs/alerts.log
tail -100 automation/logs/cron.log
```

**4. Review status:**
```bash
npm run automation:status
```

---

## 🎯 Key Maintenance Metrics

Track these monthly:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Health Score | >90% | ___ | ___ |
| Success Rate | >95% | ___ | ___ |
| Disk Usage | <80% | ___ | ___ |
| Memory Usage | <85% | ___ | ___ |
| API Cost | <$60 | $___ | ___ |
| Content Quality | >8/10 | ___/10 | ___ |
| Pages Published | 5-10/mo | ___ | ___ |
| Reviews Collected | 3-5/mo | ___ | ___ |

**Review this table monthly and optimize anything below target.**

---

**🔧 Keep your automation system running smoothly with regular maintenance.**

**Recommended time investment:**
- Daily: 5 minutes
- Weekly: 30 minutes
- Monthly: 2 hours
- Quarterly: 4 hours

**Total: ~3 hours/month for a system saving you 60+ hours/month** ✅
