# TPP Automation - Automated Setup Guide

> **One command to rule them all**

---

## 🚀 Quick Setup (2 Minutes)

The **absolute fastest** way to get monitoring set up:

```bash
npm run health:quick-setup
```

**That's it!** This will:
1. Guide you through Healthchecks.io setup (30 seconds)
2. Configure GitHub Actions (automatic)
3. Test everything works
4. Done! ✅

**Time**: 2 minutes
**What you get**: Automated weekly health checks with email alerts

---

## 📋 Automated Setup Options

### Option 1: Quick Setup (Recommended) ⭐

**For**: Users who want it done fast

```bash
npm run health:quick-setup
```

**What it does**:
- Minimal questions
- Sensible defaults
- Healthchecks.io + GitHub Actions
- 2 minutes total

### Option 2: Full Setup (More Control)

**For**: Users who want to customize everything

```bash
npm run health:setup
```

**What it does**:
- Interactive wizard
- Choose monitoring method
- Configure all integrations
- VPS deployment option
- 5-10 minutes total

### Option 3: Manual Setup (DIY)

**For**: Users who want complete control

See `HEALTH-CHECK-SETUP.md` for detailed manual instructions.

---

## 🎯 What Gets Automated

After running setup, you'll have:

**Health Checks** ✅
- Monitors all 13 automations
- Checks topic queue health
- Verifies website uptime
- Tests GitHub Actions
- 30-second runtime

**Notifications** ✅
- Healthchecks.io dashboard
- Email alerts on issues
- Optional Slack integration
- Detects silent failures

**Automation** ✅
- GitHub Actions (weekly)
- OR VPS cron job (weekly)
- OR local cron (weekly)
- Manual trigger: `npm run health`

---

## 🔧 Available Commands

### Setup Commands
```bash
npm run health:quick-setup    # 2-minute automated setup
npm run health:setup          # Full interactive setup
```

### Health Check Commands
```bash
npm run health               # Run health check now
npm run status               # Same as above
npm run health:check         # Same as above
```

### Deployment Commands
```bash
# Deploy to VPS (after setup)
./scripts/deploy-to-vps.sh your.vps.ip

# Or with environment variable
VPS_HOST=your.vps.ip ./scripts/deploy-to-vps.sh
```

---

## 📊 Setup Comparison

| Feature | Quick Setup | Full Setup | Manual |
|---------|-------------|------------|--------|
| **Time** | 2 min | 5-10 min | 15-30 min |
| **Difficulty** | Easy | Medium | Advanced |
| **Questions** | 1-2 | 5-10 | Many |
| **Control** | Low | High | Complete |
| **Recommended for** | Most users | Power users | Experts |

**95% of users should use Quick Setup**

---

## 🎬 Step-by-Step Quick Setup

### 1. Run Setup Command
```bash
npm run health:quick-setup
```

### 2. Open Healthchecks.io
The script will prompt you to visit: https://healthchecks.io

**Do this**:
1. Sign up (30 seconds, free)
2. Click "Add Check"
3. Name it: "TPP Health Monitor"
4. Set schedule: "Weekly"
5. Copy the ping URL

### 3. Paste URL
The script will ask for your ping URL:
```
Paste your Healthchecks.io ping URL: https://hc-ping.com/xxx-xxx-xxx
```

### 4. Done!
The script will:
- Save your configuration
- Test the connection
- Set up GitHub Actions
- Run a test health check

**Total time**: 2 minutes ✅

---

## 📅 What Happens After Setup

### Immediate
- Health check runs now (test)
- Healthchecks.io shows green checkmark
- GitHub Actions workflow enabled

### Weekly (Monday 9 AM UTC)
- GitHub Actions runs health check
- Results sent to Healthchecks.io
- Email sent if issues detected
- Summary available in GitHub Actions tab

### If Issues Detected
- Email from Healthchecks.io
- GitHub issue created (optional)
- Slack notification (if configured)
- Details in workflow logs

---

## 🔍 What Gets Monitored

The health check verifies:

**GitHub Actions** ✓
- Daily Blog Post workflow
- Deploy to Cloudflare workflow
- Lighthouse CI workflow
- PR Automation workflow

**Topic Management** ✓
- Pending topics count (alerts if < 10)
- Published posts count
- Next 3 topics to publish

**Website** ✓
- HTTP status (200 OK)
- Response time
- Cloudflare CDN active

**Recent Activity** ✓
- Last blog post date
- Git status
- Uncommitted changes

**VPS** ✓ (optional)
- SSH connectivity
- Cron service status
- Disk usage

---

## 🆘 Troubleshooting

### "Setup script not found"

```bash
# Make sure scripts are executable
chmod +x scripts/*.sh

# Then run again
npm run health:quick-setup
```

### "jq: command not found"

```bash
# Install jq
sudo apt-get install jq

# Then run setup again
```

### "GitHub CLI not found"

GitHub CLI is optional. Setup will work without it, you'll just need to add secrets manually.

To install (optional):
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list
sudo apt-get update
sudo apt-get install gh
```

### "Healthchecks.io ping failed"

Check your ping URL format:
- ✅ Correct: `https://hc-ping.com/xxxxx-xxx-xxx-xxx-xxxxx`
- ❌ Wrong: `https://healthchecks.io/checks/...`

You want the PING URL, not the dashboard URL.

---

## 🔐 Security & Privacy

**What data is sent**:
- Health check status (pass/fail)
- Timestamp
- No sensitive data
- No credentials
- No content

**Where it's stored**:
- Healthchecks.io (encrypted, GDPR compliant)
- GitHub Actions logs (private repo only)
- Local .env.health file (gitignored)

**Who can access**:
- Only you (and anyone with repo access)
- Healthchecks.io staff (support only)

---

## 🎓 Advanced Usage

### Deploy to Multiple VPSs

```bash
# VPS 1
VPS_HOST=vps1.example.com ./scripts/deploy-to-vps.sh

# VPS 2
VPS_HOST=vps2.example.com ./scripts/deploy-to-vps.sh
```

### Custom Schedule

Edit `.github/workflows/health-check.yml`:

```yaml
on:
  schedule:
    # Change this line:
    - cron: '0 9 * * 1'  # Monday 9 AM
    # To:
    - cron: '0 8 * * 1,4'  # Monday & Thursday 8 AM
```

### Add Slack

Run full setup:
```bash
npm run health:setup
```

Or manually edit `.env.health`:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 📞 Quick Reference

**Start monitoring**: `npm run health:quick-setup`

**Check status**: `npm run health`

**View Healthchecks.io**: https://healthchecks.io/checks/

**View GitHub Actions**: `gh workflow list`

**Trigger manually**: `gh workflow run health-check`

**View logs**: `gh run view --log`

---

## ✅ Success Checklist

After setup, verify:

- [ ] Ran `npm run health:quick-setup` or `npm run health:setup`
- [ ] Healthchecks.io dashboard shows green check
- [ ] GitHub Actions workflow is enabled
- [ ] Test health check passed: `npm run health`
- [ ] Received test notification (if configured)
- [ ] Configuration saved to `.env.health`

**All checked?** You're done! ✅

---

## 🎯 Next Steps

**After automated setup**:

1. **Wait 1 week** - Let it run
2. **Review results** - Check Healthchecks.io dashboard
3. **Check email** - Did you get alerts?
4. **Adjust if needed** - Change frequency/notifications

**Don't build anything else yet!**

The automated setup is complete and working. Use it for 1 month before considering more complex solutions.

---

## 📚 Related Documentation

**Quick Start**: This file (you are here)
**Detailed Setup**: `HEALTH-CHECK-SETUP.md`
**Daily Commands**: `QUICK-REFERENCE.md`
**Full Documentation**: `README-AUTOMATION.md`
**Planning (if needed later)**: `AUTOMATION-CONTROL-CENTER-PLAN.md`

---

## 🏆 Summary

**To automate everything**:
```bash
npm run health:quick-setup
```

**Time**: 2 minutes
**Result**: Automated monitoring of all 13 automations
**Maintenance**: Zero
**Cost**: $0

---

**Ready?** Run it now:
```bash
npm run health:quick-setup
```

Then forget about it. It just works. ✅
