# 🔧 Troubleshooting Flowchart

**Diagnose and fix automation issues step-by-step**

---

## 🚨 Quick Diagnostic Commands

Before starting, run these to gather information:

```bash
npm run automation:verify-env    # Check environment
npm run automation:status:quick  # Quick health check
npm run automation:test          # Run all tests
```

---

## 📋 Main Decision Tree

### START HERE: What's the problem?

```
┌─────────────────────────────┐
│   What's the issue?         │
└──────────┬──────────────────┘
           │
           ├─→ [Setup/Installation] → See Section A
           ├─→ [Running Automation] → See Section B
           ├─→ [Quality Issues] → See Section C
           ├─→ [Performance/Speed] → See Section D
           ├─→ [Health/Monitoring] → See Section E
           └─→ [Other] → See Section F
```

---

## Section A: Setup & Installation Issues

### A1: "npm run automation:test" fails

```
Run: npm run automation:verify-env

├─→ Node.js version < 18?
│   └─→ FIX: Install Node.js 18+ from nodejs.org
│
├─→ ANTHROPIC_API_KEY not set?
│   └─→ FIX: export ANTHROPIC_API_KEY=sk-ant-your-key-here
│
├─→ Missing dependencies?
│   └─→ FIX: npm install
│
└─→ Missing directories?
    └─→ FIX: npm run automation:setup
```

**Detailed Steps:**

#### Problem: API Key Not Set
```bash
# Check if key is set
echo $ANTHROPIC_API_KEY

# If empty, set it
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Make permanent
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
source ~/.bashrc

# Verify
npm run automation:test
```

#### Problem: Wrong Node Version
```bash
# Check current version
node --version

# If < 18, install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 18+
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version
```

#### Problem: Missing Dependencies
```bash
# Remove old node_modules
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Verify
npm run automation:test
```

---

## Section B: Running Automation Issues

### B1: "Command not found" or "Script not found"

```
Check: Does the script file exist?
├─→ ls automation/scripts/

Is the command correct?
├─→ npm run automation:list  (shows all commands)

Is package.json updated?
└─→ cat package.json | grep "automation:"
```

**Fix:**
```bash
# List all available commands
npm run automation:list

# If script exists but command doesn't work
npm install  # Reinstall to update scripts

# If script is missing
git pull  # Get latest code
# Or restore from backup
bash automation/scripts/restore-system.sh backup-file.tar.gz
```

### B2: "No pages generated" or "Empty output"

```
┌─────────────────────────────┐
│  API Key Check              │
└──────┬──────────────────────┘
       │
       ├─→ Is ANTHROPIC_API_KEY set?
       │   └─→ echo $ANTHROPIC_API_KEY
       │
       ├─→ Is the key valid?
       │   └─→ Check at console.anthropic.com
       │
       ├─→ Do you have API credits?
       │   └─→ Check billing at console.anthropic.com
       │
       └─→ Check logs for errors
           └─→ cat automation/logs/*.log
```

**Debugging Steps:**
```bash
# 1. Verify API key is set and valid
echo $ANTHROPIC_API_KEY
# Should start with: sk-ant-

# 2. Test with a simple automation
npm run automation:gbp-posts

# 3. Check logs immediately
cat automation/logs/*.log | tail -50

# 4. Run with verbose output (if available)
NODE_DEBUG=* npm run automation:suburb-pages
```

### B3: "Permission denied" errors

```bash
# Make all scripts executable
chmod +x automation/scripts/*.sh
chmod +x automation/scripts/*.mjs

# Or specific script
chmod +x automation/scripts/vps-monitor.sh

# Verify
ls -l automation/scripts/
```

### B4: Automation runs but fails partway through

```
Check the logs:
cat automation/logs/*.log

Common issues:
├─→ API rate limit hit
│   └─→ FIX: Wait 1 minute, try again
│
├─→ Network connection lost
│   └─→ FIX: Check internet, retry
│
├─→ Disk full
│   └─→ FIX: npm run automation:backup then clean old files
│
└─→ Out of memory
    └─→ FIX: Close other applications, retry
```

---

## Section C: Quality Issues

### C1: Generated content is poor quality

```
Run quality analysis:
npm run automation:analyze-content

├─→ Low readability score (<60)?
│   └─→ FIX: Adjust max_tokens, simplify prompts
│
├─→ Too much AI fingerprinting?
│   └─→ FIX: Add "avoid clichés" to prompts
│
├─→ Low keyword density (<1%)?
│   └─→ FIX: Add keyword emphasis to prompts
│
└─→ Generic/not local enough?
    └─→ FIX: Add more local context to prompts
```

**Improvement Steps:**

#### Step 1: Analyze Current Quality
```bash
# Analyze all generated content
npm run automation:analyze-content

# Analyze specific file
npm run automation:analyze-content src/content/locations/bondi.md
```

#### Step 2: Identify Patterns
```
Low scores on:
- Readability? → Simplify language in prompts
- Keyword density? → Add keyword emphasis
- Local content? → Add more suburb-specific details
- Structure? → Add heading requirements to prompts
```

#### Step 3: Edit Prompts
```bash
# Edit the generation script
nano automation/scripts/generate-suburb-pages.mjs

# Look for the prompt and add:
# - "Use simple, clear language"
# - "Include specific mentions of [suburb name]"
# - "Add local landmarks and context"
# - "Use clear headings (H2, H3)"
```

#### Step 4: Test Changes
```bash
# Generate one page to test
# (Modify script to generate just 1 suburb for testing)

npm run automation:suburb-pages

# Analyze quality
npm run automation:analyze-content src/content/locations/test-suburb.md
```

### C2: Content is repetitive across pages

```
Issue: All pages sound the same

Fixes:
1. Add variety to prompts
   - Use different examples for each run
   - Add "avoid repeating phrases" instruction

2. Generate in smaller batches
   - 3-5 pages at a time instead of 10

3. Manual editing
   - Review each page before publishing
   - Add unique local details
```

---

## Section D: Performance & Speed Issues

### D1: Automations are slow

```
Check: npm run automation:status:quick

├─→ High CPU usage?
│   └─→ Close other applications
│
├─→ High memory usage (>85%)?
│   └─→ Restart system or reduce batch size
│
├─→ Network slow?
│   └─→ Check internet speed (API calls)
│
└─→ Disk nearly full (>80%)?
    └─→ Clean up old files
```

**Optimization Steps:**

```bash
# 1. Check system resources
npm run automation:monitor

# 2. Clean up old files
find automation/logs/ -name "*.log" -mtime +30 -delete
find automation/generated/ -mtime +60 -exec gzip {} \;

# 3. Reduce batch sizes
# Edit scripts to generate fewer items per run
# e.g., Change from 10 suburbs to 5

# 4. Run during off-peak hours
# Set cron to run at night
```

### D2: API costs too high

```
Run: npm run automation:cost-estimate

├─→ Generating too frequently?
│   └─→ FIX: Reduce from daily to weekly
│
├─→ max_tokens too high?
│   └─→ FIX: Lower from 2000 to 1500
│
├─→ Unnecessary generations?
│   └─→ FIX: Skip optional automations
│
└─→ Review actual usage
    └─→ Check console.anthropic.com billing
```

**Cost Reduction Checklist:**

```bash
# 1. Calculate current costs
npm run automation:cost-estimate

# 2. Review monthly usage
npm run automation:status

# 3. Reduce frequency
# Edit automation-orchestrator.mjs
# Change weekly → bi-weekly
# Change daily → 2x per week

# 4. Lower max_tokens in scripts
# Edit each script:
# max_tokens: 2000 → 1500 (saves ~25%)

# 5. Skip optional generations
# Comment out in orchestrator:
# // { name: 'link-outreach', time: '10:00', day: 1 }
```

---

## Section E: Health & Monitoring Issues

### E1: Low health score (<70%)

```
Run: npm run automation:health
Open: automation/reports/health-dashboard.html

Check dashboard for:
├─→ Disk usage high?
│   └─→ Clean old files, create backup
│
├─→ Memory usage high?
│   └─→ Restart system
│
├─→ Automation failures?
│   └─→ Check logs, fix errors
│
└─→ Not run recently?
    └─→ Check cron setup
```

**Health Improvement Steps:**

```bash
# 1. Generate full health report
npm run automation:health
open automation/reports/health-dashboard.html

# 2. Address each issue
# For disk space:
npm run automation:backup
find automation/logs/ -name "*.log" -mtime +30 -delete
tar -czf old-content-$(date +%Y-%m).tar.gz automation/generated/
rm -rf automation/generated/*/2024-*

# For memory:
# Restart computer or kill heavy processes

# For failures:
cat automation/logs/alerts.log
# Fix the specific error shown

# For stale runs:
crontab -l  # Check cron schedule
npm run automation:scheduled  # Run manually
```

### E2: Cron job not running

```
┌─────────────────────────────┐
│  Cron Troubleshooting       │
└──────┬──────────────────────┘
       │
       ├─→ Is cron running?
       │   └─→ service cron status
       │       (or: systemctl status cron)
       │
       ├─→ Is crontab configured?
       │   └─→ crontab -l
       │
       ├─→ Are environment variables set in cron?
       │   └─→ Add to crontab:
       │       ANTHROPIC_API_KEY=your-key
       │
       └─→ Check cron logs
           └─→ cat automation/logs/cron.log
```

**Cron Setup Fix:**

```bash
# 1. Check if cron is running
service cron status
# If not: sudo service cron start

# 2. Edit crontab
crontab -e

# 3. Add this (update paths):
# Set API key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Daily automation (6 AM)
0 6 * * * cd /full/path/to/tpp && npm run automation:scheduled >> automation/logs/cron.log 2>&1

# 4. Test manually first
cd /full/path/to/tpp
npm run automation:scheduled

# 5. Wait for cron to run, then check
tail -f automation/logs/cron.log
```

---

## Section F: Other Issues

### F1: Git conflicts after updates

```bash
# 1. Backup your current changes
npm run automation:backup

# 2. Stash local changes
git stash

# 3. Pull latest
git pull

# 4. Restore your changes
git stash pop

# 5. Resolve conflicts if any
# Edit conflicted files
# Then: git add . && git commit
```

### F2: System restore needed

```bash
# 1. List available backups
ls -lh automation/backups/

# 2. Restore from backup
bash automation/scripts/restore-system.sh automation/backups/backup-YYYY-MM-DD.tar.gz

# 3. Verify restoration
npm run automation:test
npm run automation:monitor
```

### F3: Need to migrate to new server

```bash
# On old server:
# 1. Create backup
npm run automation:backup

# 2. Copy backup to new server
scp automation/backups/backup-*.tar.gz user@new-server:/path/

# On new server:
# 1. Install Node.js 18+
# 2. Clone repository
git clone [repo-url]

# 3. Install dependencies
npm install

# 4. Restore backup
bash automation/scripts/restore-system.sh /path/to/backup-*.tar.gz

# 5. Set API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# 6. Verify
npm run automation:verify-env
npm run automation:test
```

---

## 📊 Diagnostic Flowchart

### Complete Diagnostic Process

```
START
  │
  ├─→ Run: npm run automation:verify-env
  │   ├─→ All PASS? → Environment OK
  │   └─→ Any FAIL? → Fix failed checks → Re-verify
  │
  ├─→ Run: npm run automation:test
  │   ├─→ 10/10 PASS? → System OK
  │   └─→ Any FAIL? → Check specific test → Fix → Re-test
  │
  ├─→ Run: npm run automation:status:quick
  │   ├─→ Health >90%? → System healthy
  │   └─→ Health <90%? → Check recommendations → Fix
  │
  └─→ Run automation
      ├─→ Success? → Monitor quality
      └─→ Failure? → Check logs → Fix error → Retry
```

---

## 🆘 Emergency Procedures

### Complete System Failure

```bash
# 1. Don't panic - you have backups!

# 2. Verify what's working
node --version  # Node OK?
npm --version   # npm OK?
echo $ANTHROPIC_API_KEY  # API key set?

# 3. Check if it's just one script
npm run automation:list
npm run automation:gbp-posts  # Try simplest one

# 4. If nothing works, restore from backup
ls automation/backups/
bash automation/scripts/restore-system.sh automation/backups/latest-backup.tar.gz

# 5. If no backups, reinstall
rm -rf node_modules
npm install
npm run automation:setup
export ANTHROPIC_API_KEY=your-key
npm run automation:test
```

### Lost All Data

```bash
# 1. Check git history
git log --all --full-history -- automation/data/*

# 2. Restore from git
git checkout HEAD~1 -- automation/data/

# 3. Or restore from backup
bash automation/scripts/restore-system.sh backup-file.tar.gz

# 4. If no backup exists, recreate
# Copy automation/data/clients.json.example to clients.json
# Edit with your client data
# Status file will regenerate on next run
```

---

## 💡 Prevention Tips

### Avoid Common Issues

**1. Always have backups**
```bash
# Create weekly backups
npm run automation:backup

# Set up automatic backups in cron
0 0 * * 0 cd /path/to/tpp && npm run automation:backup
```

**2. Monitor regularly**
```bash
# Daily quick check (30 seconds)
npm run automation:status:quick

# Weekly full check (5 minutes)
npm run automation:monitor
npm run automation:health
```

**3. Test before deploying**
```bash
# Always test after changes
npm run automation:test
npm run automation:verify-env

# Test single automation before bulk run
# Modify script to generate 1 item, test, then run full batch
```

**4. Keep documentation updated**
```bash
# When you customize, document it
echo "Changed max_tokens to 1500 on 2025-01-19" >> automation/CUSTOM-CHANGES.md
```

**5. Version control**
```bash
# Commit working state
git add .
git commit -m "Working automation setup"
git push

# Tag stable versions
git tag v2.1.0-stable
git push --tags
```

---

## 📞 Getting Help

### If you're still stuck:

**1. Gather information**
```bash
# Create a diagnostic report
npm run automation:verify-env > diagnostic-report.txt
npm run automation:test >> diagnostic-report.txt
cat automation/logs/*.log >> diagnostic-report.txt

# Review the report
cat diagnostic-report.txt
```

**2. Check documentation**
- `automation/INDEX.md` - Documentation map
- `automation/MAINTENANCE-GUIDE.md` - Maintenance procedures
- `automation/SYSTEM-OVERVIEW.md` - Complete system reference

**3. Review logs**
```bash
# Health logs
cat automation/logs/health-check.log

# Alert logs
cat automation/logs/alerts.log

# Cron logs
cat automation/logs/cron.log

# All recent logs
tail -100 automation/logs/*.log
```

**4. Ask for help**
Include in your request:
- What you're trying to do
- Error message (full text)
- Output of `npm run automation:verify-env`
- Relevant log entries
- What you've already tried

---

## ✅ Issue Resolution Checklist

After fixing an issue:

- [ ] Run `npm run automation:verify-env` - all checks pass?
- [ ] Run `npm run automation:test` - 10/10 passing?
- [ ] Run `npm run automation:status:quick` - health >90%?
- [ ] Test the specific automation that failed
- [ ] Create a backup: `npm run automation:backup`
- [ ] Document what you fixed (for future reference)
- [ ] Update cron if needed

---

**🔧 Most issues can be solved in under 5 minutes with this flowchart!**

**Remember: When in doubt, check the logs and verify the environment first.**

**Last Updated:** January 19, 2025
**Version:** 2.1.0
