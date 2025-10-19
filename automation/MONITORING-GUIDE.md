# 🏥 Automation Monitoring & Health Checks

**Complete monitoring system for your SEO automation infrastructure**

---

## 🚀 Quick Start

```bash
# Check system health (VPS monitor)
npm run automation:monitor

# Generate visual health dashboard
npm run automation:health

# View dashboard
# Open: automation/reports/health-dashboard.html
```

---

## 📊 What Gets Monitored

### System Resources
- **Disk space** - Warns at >80%, critical at >90%
- **Memory usage** - Warns at >85%, critical at >90%
- **System uptime** - Tracks how long system has been running
- **Node.js version** - Ensures compatibility

### Automation Health
- **Last run date** - Alerts if no runs in 2+ days
- **Success rate** - Tracks automation reliability
- **Recent failures** - Monitors failures in last 7 days
- **Run frequency** - Ensures scheduled tasks are executing

### Configuration
- **API keys** - Verifies ANTHROPIC_API_KEY is set
- **Required directories** - Checks all automation directories exist
- **Scripts integrity** - Ensures all scripts are present

---

## 🛠️ Monitoring Tools

### 1. VPS Monitor (`vps-monitor.sh`)

**What it does:**
- Runs health checks on system and automation
- Logs results to `automation/logs/health-check.log`
- Records alerts to `automation/logs/alerts.log`
- Returns health score and status

**Usage:**
```bash
# Run health checks
npm run automation:monitor

# Or directly
bash automation/scripts/vps-monitor.sh
```

**Output:**
```
=========================================
  SEO Automation Health Monitor
=========================================

✓ Disk space OK (57%)
✓ Memory OK (38%)
✓ API key configured
✓ All required directories present
⚠️  No automation runs recorded yet
✓ No failures in last 7 days

✓ Overall Health: EXCELLENT (100%)
```

**Exit codes:**
- `0` - All checks passed (health 100%)
- `1` - Some checks failed (health <100%)

---

### 2. Health Dashboard (`health-dashboard.mjs`)

**What it does:**
- Generates beautiful HTML dashboard
- Creates JSON data export
- Shows real-time system metrics
- Displays automation statistics
- Lists recent alerts and failures

**Usage:**
```bash
# Generate dashboard
npm run automation:health

# Dashboard saved to:
# - automation/reports/health-dashboard.html (visual)
# - automation/reports/health-dashboard.json (data)
```

**Dashboard Features:**
- 🎯 **Overall health score** (0-100 with color coding)
- 💻 **System resources** (disk, memory, uptime)
- 🤖 **Automation stats** (success rate, last run, total runs)
- ⚙️ **Configuration status** (API keys, Node version)
- ⚠️ **Recent alerts** (last 10 alerts)
- 📋 **Last automation runs** (with success/failure badges)

**Health Score Breakdown:**
- **90-100**: Excellent (Green) - All systems optimal
- **70-89**: Good (Blue) - Minor issues
- **50-69**: Fair (Yellow) - Attention needed
- **0-49**: Poor (Red) - Critical issues

---

## 📅 Recommended Monitoring Schedule

### Daily (Automated via Cron)
```bash
# Check health every 6 hours
0 */6 * * * cd /path/to/tpp && npm run automation:monitor >> automation/logs/cron-monitor.log 2>&1
```

### Weekly (Manual Review)
```bash
# Generate dashboard every Monday
0 9 * * 1 cd /path/to/tpp && npm run automation:health
```

### On-Demand
```bash
# Before deployment
npm run automation:monitor

# After deployment
npm run automation:health

# Before running automations
npm run automation:monitor && npm run automation:suburb-pages
```

---

## 🔔 Alert Thresholds

### Critical Alerts (Immediate Action Required)
- Disk usage > 90%
- Memory usage > 90%
- No automation runs in 3+ days
- Success rate < 80%
- 5+ failures in last 7 days
- API key missing

### Warning Alerts (Review Soon)
- Disk usage > 80%
- Memory usage > 85%
- No automation runs in 2+ days
- Success rate < 95%
- 1-4 failures in last 7 days

### Info Alerts (No Action Needed)
- No automation runs yet (new system)
- First-time setup messages

---

## 📝 Log Files

All monitoring outputs are saved to structured log files:

### Health Check Log
**Location:** `automation/logs/health-check.log`

**Contains:**
```
========================================
Health Check: 2025-10-19 10:21:05
========================================
Disk Usage: 57%
Memory Usage: 38%
API Key: OK
Directories: OK
Last Run: never
Recent Failures: 0
Health Score: 5/6 checks passed (83%)
========================================
```

### Alert Log
**Location:** `automation/logs/alerts.log`

**Contains:**
```
[2025-10-19T10:00:00] ALERT: High disk usage - 85%
[2025-10-19T11:00:00] WARNING: No automation runs in 2 days
[2025-10-19T12:00:00] ALERT: 3 automation failures in last 7 days
```

### Cron Monitor Log
**Location:** `automation/logs/cron-monitor.log`

**Contains:** Output from scheduled cron jobs running the monitor

---

## 🔧 Customizing Thresholds

Edit `automation/scripts/vps-monitor.sh`:

```bash
# Disk space warning threshold (%)
DISK_WARNING_THRESHOLD=80

# Memory warning threshold (%)
MEMORY_WARNING_THRESHOLD=85

# Maximum days since last automation run
MAX_DAYS_SINCE_LAST_RUN=2
```

Edit `automation/scripts/health-dashboard.mjs`:

```javascript
function calculateHealthScore(systemStats, automationStatus) {
  let score = 100;

  // Adjust these thresholds as needed
  if (systemStats.disk.usage > 90) score -= 20;
  if (automationStatus.successRate < 80) score -= 30;
  // ...
}
```

---

## 🆘 Troubleshooting

### "No automation runs recorded yet"
**Cause:** Automation hasn't run yet or status file is missing

**Fix:**
```bash
# Run any automation to generate status
npm run automation:suburb-pages
# Or
npm run automation:scheduled
```

### Health score is low
**Cause:** One or more checks failing

**Fix:**
1. Run `npm run automation:monitor` to see which checks fail
2. Check `automation/logs/health-check.log` for details
3. Check `automation/logs/alerts.log` for specific issues
4. Address issues based on alert messages

### Dashboard shows "error"
**Cause:** Missing status file or data files

**Fix:**
```bash
# Ensure automation has run at least once
npm run automation:test
npm run automation:suburb-pages

# Verify directories exist
ls -la automation/data/
ls -la automation/logs/
```

### Cron monitoring not running
**Cause:** Cron job not configured or script path wrong

**Fix:**
```bash
# Verify cron job exists
crontab -l | grep automation

# Test manually first
npm run automation:monitor

# Ensure correct paths in crontab
# Use absolute paths, not relative
```

---

## 📊 Understanding Health Metrics

### Disk Usage
- **Good**: <80%
- **Warning**: 80-90%
- **Critical**: >90%
- **Impact**: Can prevent automation from saving files

### Memory Usage
- **Good**: <85%
- **Warning**: 85-90%
- **Critical**: >90%
- **Impact**: Can cause automation scripts to crash

### Success Rate
- **Excellent**: >95%
- **Good**: 90-95%
- **Warning**: 80-90%
- **Critical**: <80%
- **Impact**: Indicates automation reliability

### Last Run Days
- **Good**: 0-1 days
- **Warning**: 2 days
- **Critical**: 3+ days
- **Impact**: Indicates whether scheduled automations are running

---

## 🎯 Integration with Automations

### Pre-Flight Checks
Run health check before critical operations:

```bash
#!/bin/bash
# Before running automation
if npm run automation:monitor; then
  echo "✓ Health check passed, running automation..."
  npm run automation:suburb-pages
else
  echo "✗ Health check failed, aborting"
  exit 1
fi
```

### Post-Run Monitoring
Generate dashboard after automation runs:

```bash
# Run automation then check health
npm run automation:scheduled && npm run automation:health
```

### Continuous Monitoring
Set up cron job for continuous monitoring:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Health check every 6 hours
0 */6 * * * cd /path/to/tpp && npm run automation:monitor >> automation/logs/cron-monitor.log 2>&1

# Dashboard generation every Monday at 9 AM
0 9 * * 1 cd /path/to/tpp && npm run automation:health >> automation/logs/cron-monitor.log 2>&1
```

---

## 📱 Setting Up Alerts

### Email Alerts (Advanced)
Modify `vps-monitor.sh` to send email on failures:

```bash
# Add at end of vps-monitor.sh
if [ $passed_checks -lt $total_checks ]; then
  # Send email alert
  echo "Health check failed: $passed_checks/$total_checks" | \
    mail -s "Automation Health Alert" your@email.com
fi
```

### Slack Webhooks (Advanced)
Add Slack notifications:

```bash
# In vps-monitor.sh
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

if [ $passed_checks -lt $total_checks ]; then
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"⚠️ Automation health: $passed_checks/$total_checks checks passed\"}"
fi
```

---

## 🎉 Best Practices

### Daily Routine
1. Check `automation/logs/cron-monitor.log` for overnight issues
2. Review dashboard: `npm run automation:health`
3. Address any warnings before they become critical

### Weekly Routine
1. Generate fresh dashboard
2. Review 7-day failure trends
3. Check disk/memory trends
4. Update thresholds if needed

### Monthly Routine
1. Review all logs and clean old entries
2. Analyze automation performance trends
3. Optimize resource usage
4. Update monitoring thresholds based on patterns

### Before Deployment
1. Run `npm run automation:monitor`
2. Ensure health score >90
3. Check no critical alerts
4. Verify API keys configured

### After Deployment
1. Run `npm run automation:health`
2. Verify all automations in status
3. Check success rate >95%
4. Monitor for new alerts

---

## 📚 Additional Resources

- **Automation Setup**: `automation/AUTOMATION-SETUP-GUIDE.md`
- **Quick Reference**: `AUTOMATION-QUICK-REFERENCE.md`
- **System Overview**: `automation/README.md`
- **Master Index**: `automation/INDEX.md`

---

## 🤝 Getting Help

### Quick Diagnostics
```bash
# Run all diagnostic tools
npm run automation:test      # Test system setup
npm run automation:monitor   # Check health
npm run automation:health    # Generate dashboard
npm run automation:status    # Show run history
```

### Check Logs
```bash
# View health check log
cat automation/logs/health-check.log | tail -50

# View alerts
cat automation/logs/alerts.log | tail -20

# View cron output
cat automation/logs/cron-monitor.log | tail -50
```

### Common Issues & Solutions

| Issue | Command | Expected Output |
|-------|---------|-----------------|
| Low health score | `npm run automation:monitor` | Shows which checks fail |
| Missing dashboard | `npm run automation:health` | Generates new dashboard |
| No automation runs | `npm run automation:suburb-pages` | Creates first run |
| Cron not working | `npm run automation:scheduled` | Tests orchestrator |

---

**🏥 Complete monitoring. Complete visibility. Complete confidence.**

Your automation system is now fully monitored and production-ready.
