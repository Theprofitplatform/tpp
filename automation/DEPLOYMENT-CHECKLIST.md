# ✅ Deployment Checklist

**Print this page and check off items as you complete them**

---

## 🎯 Pre-Deployment (15 minutes)

### Local Environment Verification

- [ ] **Test locally first**
  ```bash
  npm run automation:verify-env
  npm run automation:test
  ```
  - All checks should pass
  - 10/10 tests passing

- [ ] **Create backup of local setup**
  ```bash
  npm run automation:backup
  ```
  - Backup file created in `automation/backups/`
  - Note backup filename: ____________________

- [ ] **Document current configuration**
  ```bash
  npm run automation:status > pre-deployment-status.txt
  ```
  - Status saved to file

- [ ] **API Key ready**
  - Anthropic API key available
  - Key starts with `sk-ant-`
  - Key tested and working locally

- [ ] **Choose deployment target**
  - [ ] VPS (DigitalOcean, Vultr, Linode, Hetzner)
  - [ ] Cloud (AWS EC2, Google Cloud, Azure)
  - [ ] Local Server (Ubuntu, WSL2, macOS)

---

## 🖥️ Server Setup (20-30 minutes)

### Create Server

- [ ] **Server created**
  - Provider: ____________________
  - Server IP: ____________________
  - Server type: ____________________
  - RAM: _____ GB
  - Disk: _____ GB

- [ ] **Can connect via SSH**
  ```bash
  ssh username@YOUR_SERVER_IP
  ```
  - Connection successful
  - Username: ____________________

### Install Dependencies

- [ ] **System updated**
  ```bash
  sudo apt update
  sudo apt upgrade -y
  ```

- [ ] **Node.js 18+ installed**
  ```bash
  node --version  # Should show v18.x.x or higher
  npm --version
  ```
  - Node version: ____________________
  - NPM version: ____________________

- [ ] **Git installed**
  ```bash
  git --version
  ```
  - Git version: ____________________

- [ ] **ImageMagick installed** (optional but recommended)
  ```bash
  sudo apt install -y imagemagick
  convert --version
  ```

---

## 📦 Deploy Application (15-20 minutes)

### Transfer Code

- [ ] **Project deployed to server**
  - Method used:
    - [ ] Git clone
    - [ ] File transfer (scp/rsync)
  - Project path: ____________________

- [ ] **Dependencies installed**
  ```bash
  cd /path/to/project
  npm install
  ```
  - All dependencies installed successfully

### Configure Environment

- [ ] **API key set**
  ```bash
  echo 'export ANTHROPIC_API_KEY=sk-ant-...' >> ~/.bashrc
  source ~/.bashrc
  echo $ANTHROPIC_API_KEY  # Verify it's set
  ```

- [ ] **Project paths configured**
  ```bash
  # If using environment variables
  echo 'export PROJECT_PATH=/path/to/tpp' >> ~/.bashrc
  source ~/.bashrc
  ```

### Setup Automation System

- [ ] **Automation setup complete**
  ```bash
  npm run automation:setup
  ```

- [ ] **Environment verified**
  ```bash
  npm run automation:verify-env
  ```
  - All 11 checks passing

- [ ] **Tests passing**
  ```bash
  npm run automation:test
  ```
  - 10/10 tests passing

---

## 🧪 Test Deployment (10 minutes)

### Run Test Automations

- [ ] **GBP posts generated successfully**
  ```bash
  npm run automation:gbp-posts
  ```
  - 12 posts generated
  - Output looks good

- [ ] **Suburb pages generated successfully**
  ```bash
  npm run automation:suburb-pages
  ```
  - 10 pages generated
  - Quality acceptable

- [ ] **Health check working**
  ```bash
  npm run automation:health
  ```
  - Dashboard generated
  - Health score > 90%

- [ ] **Quick status working**
  ```bash
  npm run automation:status:quick
  ```
  - Status displayed correctly

### Quality Verification

- [ ] **Content quality verified**
  ```bash
  npm run automation:analyze-content
  ```
  - Quality scores acceptable (> 7/10)

- [ ] **Backup system working**
  ```bash
  npm run automation:backup
  ```
  - Backup created successfully

---

## ⏰ Configure Cron (10 minutes)

### Setup Scheduled Automation

- [ ] **Cron service running**
  ```bash
  sudo systemctl status cron
  # If not running: sudo systemctl start cron && sudo systemctl enable cron
  ```

- [ ] **Crontab configured**
  ```bash
  crontab -e
  ```
  - API key added to crontab
  - Schedule chosen:
    - [ ] Minimal (weekly)
    - [ ] Standard (daily)
    - [ ] Maximum (multiple times per day)

- [ ] **Cron schedule documented**
  - Schedule copied from: `automation/CRON-EXAMPLES.md`
  - Template used: ____________________

- [ ] **Test cron manually**
  ```bash
  # Run the exact cron command manually
  cd /path/to/tpp && npm run automation:scheduled >> /path/to/tpp/automation/logs/cron.log 2>&1

  # Check output
  cat /path/to/tpp/automation/logs/cron.log
  ```

---

## 🔒 Security Hardening (15 minutes)

### Basic Security

- [ ] **Firewall configured**
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw enable
  sudo ufw status
  ```

- [ ] **SSH hardened**
  - [ ] Root login disabled
  - [ ] Password auth disabled (if using keys)
  - [ ] Non-standard SSH port (optional)

- [ ] **File permissions set**
  ```bash
  chmod 700 ~/.bashrc
  chmod 700 ~/path/to/tpp/automation/data
  chmod 700 ~/path/to/tpp/automation/config
  ```

- [ ] **API key protected**
  - Not in Git history
  - Not world-readable
  - Not in config files (use environment variables)

### Optional Security

- [ ] **Fail2ban installed** (optional)
  ```bash
  sudo apt install -y fail2ban
  sudo systemctl enable fail2ban
  ```

---

## 📊 Setup Monitoring (10 minutes)

### Log Management

- [ ] **Log rotation configured**
  ```bash
  sudo nano /etc/logrotate.d/tpp-automation
  # Add rotation rules
  ```

- [ ] **Logs being written**
  ```bash
  ls -la /path/to/tpp/automation/logs/
  ```
  - cron.log exists
  - health.log exists
  - Other logs present

### Health Monitoring

- [ ] **Regular health checks scheduled**
  - Health check added to cron (every 6 hours)
  - First health check ran successfully

- [ ] **Email alerts configured** (optional)
  ```bash
  # Test email
  echo "Test from TTP Automation" | mail -s "Test" your@email.com
  ```

- [ ] **Uptime monitoring** (optional)
  - Service: ____________________
  - Check interval: ____________________
  - Alert method: ____________________

---

## 🌐 DNS & Domain (Optional, 15 minutes)

### If Using Custom Domain

- [ ] **DNS A record created**
  - Domain: ____________________
  - Points to: ____________________
  - TTL: ____________________

- [ ] **DNS propagated**
  ```bash
  dig your-domain.com
  ```

- [ ] **Nginx installed** (if serving reports)
  ```bash
  sudo apt install -y nginx
  ```

- [ ] **SSL certificate obtained** (if using HTTPS)
  ```bash
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d your-domain.com
  ```

---

## ✅ Post-Deployment Verification (15 minutes)

### System Health

- [ ] **Full system health check**
  ```bash
  npm run automation:health
  npm run automation:monitor
  ```
  - Health score: _____ % (should be > 90%)
  - All checks passing

- [ ] **Environment verification**
  ```bash
  npm run automation:verify-env
  ```
  - All 11 checks passing

- [ ] **Cost estimation**
  ```bash
  npm run automation:cost-estimate
  ```
  - Expected monthly cost: $______
  - Within budget

### Automation Testing

- [ ] **Wait for first scheduled run**
  - Scheduled time: ____________________
  - Check logs after: ____________________

- [ ] **First cron run successful**
  ```bash
  cat /path/to/tpp/automation/logs/cron.log
  ```
  - No errors
  - Content generated

- [ ] **Second cron run successful** (next day)
  - Automation ran on schedule
  - Output quality good

---

## 📋 Documentation (10 minutes)

### Record Deployment Details

- [ ] **Deployment documented**
  - Date deployed: ____________________
  - Server details saved
  - SSH credentials secured
  - Cron schedule documented

- [ ] **Team notified** (if applicable)
  - Team members informed
  - Access credentials shared (securely)
  - Documentation links shared

- [ ] **Runbook created** (optional)
  - Common tasks documented
  - Emergency contacts listed
  - Rollback procedure documented

---

## 🎓 Team Onboarding (Optional)

### If Onboarding Team Members

- [ ] **Onboarding guide shared**
  - Link to `automation/TEAM-ONBOARDING-GUIDE.md`

- [ ] **Training scheduled**
  - Week 1: ____________________
  - Week 2: ____________________
  - Week 3: ____________________

- [ ] **Team roles assigned**
  - Operator: ____________________
  - Administrator: ____________________
  - Developer: ____________________

---

## 🎯 First Week Monitoring

### Daily Checks (First 7 Days)

**Day 1:**
- [ ] Check logs: `tail -100 automation/logs/cron.log`
- [ ] Verify automation ran
- [ ] Health score: _____ %

**Day 2:**
- [ ] Check logs
- [ ] Verify automation ran
- [ ] Review generated content quality
- [ ] Health score: _____ %

**Day 3:**
- [ ] Check logs
- [ ] Verify automation ran
- [ ] Check disk space: `df -h`
- [ ] Health score: _____ %

**Day 4:**
- [ ] Check logs
- [ ] Verify automation ran
- [ ] Review API costs
- [ ] Health score: _____ %

**Day 5:**
- [ ] Check logs
- [ ] Verify automation ran
- [ ] System resources: `free -h` and `top`
- [ ] Health score: _____ %

**Day 6:**
- [ ] Check logs
- [ ] Verify automation ran
- [ ] Review all generated content
- [ ] Health score: _____ %

**Day 7:**
- [ ] Check logs
- [ ] Verify automation ran
- [ ] Full health report: `npm run automation:health`
- [ ] Create backup: `npm run automation:backup`
- [ ] Health score: _____ %

**Week 1 Summary:**
- [ ] All automations ran successfully
- [ ] No errors in logs
- [ ] Content quality acceptable
- [ ] Costs within budget
- [ ] System performance good

---

## 🔧 Optimization (Week 2+)

### After First Week

- [ ] **Review costs**
  - Actual cost: $______
  - Expected cost: $______
  - Adjustments needed:
    - [ ] Reduce frequency
    - [ ] Lower max_tokens
    - [ ] Skip optional automations

- [ ] **Review content quality**
  - Average quality score: _____ /10
  - Improvements needed:
    - [ ] Adjust prompts
    - [ ] Add more context
    - [ ] Modify templates

- [ ] **Review performance**
  - Average execution time: _____ seconds
  - System resources:
    - CPU usage: _____ %
    - Memory usage: _____ %
    - Disk usage: _____ %

- [ ] **Adjust schedule if needed**
  - New schedule: ____________________

---

## ✅ Deployment Complete!

### Final Checklist

- [ ] Server deployed and accessible
- [ ] All dependencies installed
- [ ] Automation system functional
- [ ] Tests passing (10/10)
- [ ] Cron configured and running
- [ ] Security hardened
- [ ] Monitoring set up
- [ ] Logs rotating properly
- [ ] Team notified (if applicable)
- [ ] Documentation complete
- [ ] First week monitoring complete
- [ ] System optimized based on usage

### Key Information

**Server Details:**
- Provider: ____________________
- IP Address: ____________________
- SSH User: ____________________
- Project Path: ____________________

**Cron Schedule:**
- Schedule: ____________________
- Frequency: ____________________

**Monitoring:**
- Health check frequency: ____________________
- Log location: ____________________
- Backup location: ____________________

**Costs:**
- Expected monthly cost: $______
- Actual monthly cost: $______

**Performance:**
- Health score: _____ %
- Average content quality: _____ /10
- Time saved per month: _____ hours

---

## 📞 Getting Help

### If You Get Stuck

1. **Check troubleshooting guide**
   - `automation/TROUBLESHOOTING-FLOWCHART.md`

2. **Review deployment guide**
   - `automation/DEPLOYMENT-GUIDE.md`

3. **Check cron examples**
   - `automation/CRON-EXAMPLES.md`

4. **Verify environment**
   ```bash
   npm run automation:verify-env
   ```

5. **Check logs**
   ```bash
   cat automation/logs/*.log
   ```

### Emergency Rollback

If deployment fails:

1. **Restore from backup**
   ```bash
   bash automation/scripts/restore-system.sh backup-file.tar.gz
   ```

2. **Check deployment guide rollback section**
   - `automation/DEPLOYMENT-GUIDE.md` → "Rollback Procedures"

---

**🎉 Congratulations! Your automation system is deployed to production!**

**Deployment Date:** ____________________
**Deployed By:** ____________________
**Status:** ✅ Complete

---

**Version:** 2.1.0
**Last Updated:** January 19, 2025
