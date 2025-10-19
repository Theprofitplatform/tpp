# TPP Automation - Quick Reference Card

> **Keep this handy for daily automation management**

---

## 🚀 Quick Commands

### Health & Status
```bash
npm run health          # Full health check (~30 sec)
npm run status          # Same as above
gh run list             # GitHub Actions status
```

### Blog Management
```bash
npm run topics:check    # Check topic queue health
npm run topics:generate # Generate 30 new topics
npm run blog:link-map   # Update internal links
```

### Deployment
```bash
npm run build           # Build production site
npm run deploy          # Build + deploy to Cloudflare
npm run deploy:auto     # Parity check + deploy
```

### Testing
```bash
npm run test:core:pw    # Core Playwright tests
npm run test:blog       # Blog-specific tests
```

---

## 📊 System Status URLs

- **GitHub Actions**: https://github.com/YOUR-USERNAME/tpp/actions
- **Cloudflare Pages**: https://dash.cloudflare.com
- **Website**: https://theprofitplatform.com.au
- **Healthchecks.io**: https://healthchecks.io/checks/

---

## 🔔 What to Check Weekly

**Monday Morning** (5 minutes):
```bash
# 1. Run health check
npm run health

# 2. Check topic queue
npm run topics:check

# 3. Review GitHub Actions
gh run list --limit 5

# 4. Quick website check
curl -I https://theprofitplatform.com.au
```

**If any issues found**:
- Check logs: `gh run view [run-id]`
- Review errors in health check output
- Fix critical issues
- Re-run affected automations

---

## 🚨 Alert Thresholds

### Critical (Fix Immediately)
- ❌ Website down (HTTP != 200)
- ❌ Topic queue < 5 topics
- ❌ GitHub Actions: 3+ recent failures
- ❌ VPS unreachable > 1 hour

### Warning (Fix Soon)
- ⚠️ Topic queue < 10 topics
- ⚠️ GitHub Actions: 1-2 recent failures
- ⚠️ Blog post > 14 days old
- ⚠️ Disk usage > 80%

### Info (Monitor)
- ℹ️ Uncommitted changes
- ℹ️ Unpushed commits
- ℹ️ Response time > 2s

---

## 📅 Automation Schedule

**GitHub Actions**:
- Mon/Thu 9:00 AM UTC - Daily blog post
- On push to main - Deploy + Lighthouse
- Mon 9:00 AM UTC - Weekly health check

**VPS Cron**:
- Mon 8:00 AM - Topic health check
- 1st of month 2:00 AM - Topic auto-refill
- Daily 2:30 AM - Database backup

---

## 🔧 Quick Fixes

### "Topic queue low"
```bash
npm run topics:generate 30
```

### "GitHub Action failed"
```bash
# View failure
gh run view --log-failed

# Re-run
gh run rerun [run-id]
```

### "Website down"
```bash
# Check Cloudflare status
# Check deployment logs
npm run deploy
```

### "VPS unreachable"
```bash
# Try SSH
ssh avi@your.vps.ip

# Check VPS provider dashboard
```

---

## 📁 Important Files

### Configuration
- `.env` - Environment variables
- `wrangler.toml` - Cloudflare config
- `automation/topic-queue.json` - Blog topics

### Scripts
- `scripts/simple-health-check.sh` - Health monitoring
- `automation/scripts/generate-topics.mjs` - Topic generator
- `automation/scripts/check-topic-queue.mjs` - Queue checker

### Workflows
- `.github/workflows/daily-blog-post.yml` - Blog automation
- `.github/workflows/deploy.yml` - Deployment
- `.github/workflows/health-check.yml` - Health monitoring

---

## 🆘 Emergency Contacts

**Services**:
- Cloudflare Support: https://dash.cloudflare.com/support
- GitHub Support: https://support.github.com

**Documentation**:
- Health Check Setup: `HEALTH-CHECK-SETUP.md`
- Automation Map: `AUTOMATION-MAP.md`
- Implementation Summary: `IMPLEMENTATION-SUMMARY.md`

---

## 💡 Pro Tips

1. **Check health before deploying**
   ```bash
   npm run health && npm run deploy
   ```

2. **Generate topics in bulk monthly**
   ```bash
   npm run topics:generate 30
   ```

3. **Use aliases for common commands**
   ```bash
   alias tpp-health='cd ~/projects/tpp && npm run health'
   alias tpp-status='cd ~/projects/tpp && gh run list'
   ```

4. **Set up desktop notifications** (macOS)
   ```bash
   npm run health || osascript -e 'display notification "Health check failed" with title "TPP Alert"'
   ```

---

## 📞 Quick Support

**Problem**: Health check shows errors
**Fix**: Review output, check specific services

**Problem**: Blog post not published
**Fix**: Check GitHub Actions → Daily Blog Post workflow

**Problem**: Deployment failed
**Fix**: Check Cloudflare deployment logs

**Problem**: Topic queue empty
**Fix**: `npm run topics:generate 30`

---

**Print this page and keep it near your desk! 📄**
