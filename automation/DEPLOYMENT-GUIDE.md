# 🚀 Deployment & Migration Guide

**Deploy the SEO automation system to production servers**

---

## 📋 Table of Contents

1. [Deployment Options](#deployment-options)
2. [Server Requirements](#server-requirements)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Methods](#deployment-methods)
   - [VPS Deployment](#vps-deployment-recommended)
   - [Cloud Platform Deployment](#cloud-platform-deployment)
   - [Local Server Deployment](#local-server-deployment)
5. [Migration Guide](#migration-guide)
6. [Post-Deployment Setup](#post-deployment-setup)
7. [Production Configuration](#production-configuration)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Deployment Options

### Option 1: VPS (Recommended)
**Best for:** Most users, full control, cost-effective

- **Providers:** DigitalOcean, Vultr, Linode, Hetzner
- **Cost:** $5-20/month
- **Setup Time:** 30-60 minutes
- **Maintenance:** Low (monthly updates)

**Pros:**
- Complete control over environment
- Persistent disk storage
- Simple cron scheduling
- Predictable costs

**Cons:**
- Requires basic Linux knowledge
- Manual security updates
- Server maintenance needed

### Option 2: Cloud Platform
**Best for:** Teams, enterprise, auto-scaling needs

- **Providers:** AWS EC2, Google Cloud Compute, Azure VM
- **Cost:** $10-50+/month (variable)
- **Setup Time:** 1-2 hours
- **Maintenance:** Medium (managed services available)

**Pros:**
- Auto-scaling capabilities
- Advanced monitoring
- Enterprise features
- Global distribution

**Cons:**
- Higher costs
- Complex billing
- Steeper learning curve

### Option 3: Local Server
**Best for:** Testing, small operations, on-premise requirements

- **Hardware:** Dedicated machine or VM
- **Cost:** $0 (using existing hardware)
- **Setup Time:** 30 minutes
- **Maintenance:** High (you manage everything)

**Pros:**
- No recurring costs
- Complete control
- No data leaves premises

**Cons:**
- Single point of failure
- Internet dependency
- Power/connectivity reliability

---

## 💻 Server Requirements

### Minimum Requirements

```yaml
Operating System: Ubuntu 20.04 LTS or newer (Debian-based preferred)
CPU: 1 vCPU (2+ recommended)
RAM: 1 GB (2 GB+ recommended)
Disk Space: 10 GB minimum (20 GB+ recommended)
Network: Stable internet connection
Node.js: v18.0.0 or newer
```

### Recommended Specifications

```yaml
Operating System: Ubuntu 22.04 LTS
CPU: 2 vCPUs
RAM: 4 GB
Disk Space: 40 GB SSD
Network: 1 Gbps uplink
Backups: Daily automated backups
Monitoring: Uptime monitoring enabled
```

### Software Dependencies

```bash
# Required
- Node.js 18+ (with npm)
- Git
- Bash shell

# Recommended
- ImageMagick (for image processing)
- Logrotate (for log management)
- UFW or iptables (firewall)
- Fail2ban (security)
```

---

## ✅ Pre-Deployment Checklist

### Before You Start

- [ ] **API Key Ready** - Have your Anthropic API key available
- [ ] **Server Access** - SSH credentials or cloud console access
- [ ] **Domain Ready** (optional) - DNS configured if using custom domain
- [ ] **Backup Created** - Local backup of current setup
- [ ] **Documentation Reviewed** - Read this guide completely
- [ ] **Test Locally** - Verify all automations work locally first

### Environment Validation

Run this on your LOCAL system before deployment:

```bash
# Verify everything works locally
npm run automation:verify-env
npm run automation:test

# Create a clean backup
npm run automation:backup

# Document current configuration
npm run automation:status > pre-deployment-status.txt
```

### Cost Planning

```bash
# Calculate expected monthly costs
npm run automation:cost-estimate

# Consider:
# - Server costs ($5-50/month)
# - Anthropic API costs ($5-30/month estimated)
# - Backup storage (usually free for < 10 GB)
# - Domain costs (optional, $10-15/year)

# Total estimated: $10-80/month
```

---

## 🚀 Deployment Methods

## VPS Deployment (Recommended)

### Step 1: Create VPS

**DigitalOcean Example:**

1. Go to https://digitalocean.com
2. Create new Droplet
3. Select:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $6/month (1 GB RAM, 1 vCPU, 25 GB SSD)
   - **Datacenter:** Closest to your location
   - **Authentication:** SSH keys (recommended) or password
4. Create Droplet
5. Note the IP address

**Vultr/Linode/Hetzner:**
Similar process - choose Ubuntu 22.04 LTS and at least 1 GB RAM.

### Step 2: Initial Server Setup

**Connect to server:**

```bash
# Replace YOUR_SERVER_IP with actual IP
ssh root@YOUR_SERVER_IP

# If using SSH key:
ssh -i ~/.ssh/your-key root@YOUR_SERVER_IP
```

**Create non-root user (security best practice):**

```bash
# Create automation user
adduser automation
usermod -aG sudo automation

# Copy SSH keys (if using)
rsync --archive --chown=automation:automation ~/.ssh /home/automation

# Test new user
exit
ssh automation@YOUR_SERVER_IP
```

### Step 3: Install Node.js

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Step 4: Install Dependencies

```bash
# Install Git
sudo apt install -y git

# Install ImageMagick (for image processing)
sudo apt install -y imagemagick

# Install build tools (sometimes needed)
sudo apt install -y build-essential

# Verify
git --version
convert --version  # ImageMagick
```

### Step 5: Clone Repository

**Option A: From Git (if using version control):**

```bash
# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone repository
git clone https://github.com/your-username/tpp.git
cd tpp

# Install dependencies
npm install
```

**Option B: Transfer Files (if not using Git):**

```bash
# On LOCAL machine:
# Create deployment archive (excludes node_modules, logs, etc.)
cd /path/to/local/tpp
tar -czf tpp-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=automation/logs \
  --exclude=automation/generated \
  automation/ \
  src/ \
  scripts/ \
  package.json \
  package-lock.json

# Transfer to server
scp tpp-deploy.tar.gz automation@YOUR_SERVER_IP:~/

# On SERVER:
mkdir -p ~/projects/tpp
cd ~/projects/tpp
tar -xzf ~/tpp-deploy.tar.gz
npm install
```

### Step 6: Configure Environment

```bash
# Set API key permanently
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
source ~/.bashrc

# Verify
echo $ANTHROPIC_API_KEY  # Should display your key
```

### Step 7: Setup Automation System

```bash
# Run setup script
npm run automation:setup

# Verify environment
npm run automation:verify-env

# Run tests
npm run automation:test

# All checks should pass!
```

### Step 8: Configure Production Data

```bash
# Edit client data
nano automation/data/clients.json

# Add your actual client information
# Save: Ctrl+O, Enter
# Exit: Ctrl+X

# Edit suburb data (if needed)
nano automation/data/suburbs.json
```

### Step 9: Test Automations

```bash
# Test with simplest automation first
npm run automation:gbp-posts

# Verify output
ls automation/generated/gbp-posts/

# If successful, test another
npm run automation:suburb-pages

# Check quality
npm run automation:analyze-content
```

### Step 10: Setup Cron (Scheduled Automations)

```bash
# Edit crontab
crontab -e

# Choose nano as editor (option 1)

# Add these lines:
# Set API key for cron environment
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Run daily automation at 6 AM
0 6 * * * cd /home/automation/projects/tpp && npm run automation:scheduled >> /home/automation/projects/tpp/automation/logs/cron.log 2>&1

# Run weekly backup on Sundays at 2 AM
0 2 * * 0 cd /home/automation/projects/tpp && npm run automation:backup >> /home/automation/projects/tpp/automation/logs/backup.log 2>&1

# Run health check every 6 hours
0 */6 * * * cd /home/automation/projects/tpp && npm run automation:status:quick >> /home/automation/projects/tpp/automation/logs/health.log 2>&1

# Save: Ctrl+O, Enter
# Exit: Ctrl+X

# Verify crontab
crontab -l
```

**Important Cron Notes:**
- Always use FULL paths (not `~` or relative paths)
- Set `ANTHROPIC_API_KEY` in crontab
- Redirect output to log files
- Test commands manually before adding to cron

### Step 11: Setup Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/tpp-automation

# Add this content:
/home/automation/projects/tpp/automation/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 automation automation
}

# Save and exit

# Test logrotate
sudo logrotate -d /etc/logrotate.d/tpp-automation
```

### Step 12: Setup Firewall (Security)

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS (if hosting web interface)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify
sudo ufw status
```

### Step 13: Setup Fail2ban (Optional Security)

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verify
sudo systemctl status fail2ban
```

### Step 14: Production Verification

```bash
# Run comprehensive health check
npm run automation:health

# Open report
# (If you have a GUI, transfer the file or use curl to view)
cat automation/reports/health-dashboard.html

# Check monitoring
npm run automation:monitor

# Verify cron is working
# Wait for scheduled time, then check:
cat automation/logs/cron.log
```

---

## ☁️ Cloud Platform Deployment

### AWS EC2 Deployment

**Step 1: Launch EC2 Instance**

1. Go to AWS Console → EC2
2. Launch Instance
3. Choose AMI: Ubuntu Server 22.04 LTS
4. Instance Type: t2.micro (free tier) or t2.small
5. Configure Security Group:
   - SSH (22) - Your IP only
   - HTTP (80) - Optional
   - HTTPS (443) - Optional
6. Create/select key pair
7. Launch

**Step 2: Connect**

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

**Step 3: Follow VPS Steps 3-14**

Use the same installation steps as VPS deployment above.

**AWS-Specific Considerations:**

```bash
# Install CloudWatch agent (optional monitoring)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure automated backups with S3
# Install AWS CLI
sudo apt install -y awscli

# Configure backup to S3
aws configure  # Enter credentials

# Modify backup script to sync to S3
# Edit automation/scripts/backup-system.sh
# Add: aws s3 cp "$BACKUP_PATH.tar.gz" s3://your-bucket/backups/
```

### Google Cloud Compute Engine

**Step 1: Create VM**

```bash
# Using gcloud CLI
gcloud compute instances create tpp-automation \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-small \
  --zone=us-central1-a
```

**Step 2: SSH**

```bash
gcloud compute ssh tpp-automation --zone=us-central1-a
```

**Step 3: Follow VPS Steps 3-14**

### Azure VM

**Step 1: Create VM**

1. Azure Portal → Virtual Machines → Create
2. Ubuntu Server 22.04 LTS
3. Size: B1s or B1ms
4. Configure SSH keys
5. Create

**Step 2: Connect**

```bash
ssh azureuser@your-vm-public-ip
```

**Step 3: Follow VPS Steps 3-14**

---

## 🏠 Local Server Deployment

### Ubuntu Desktop/Server

**If you're running Ubuntu locally:**

```bash
# Navigate to project
cd /path/to/tpp

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install dependencies
npm install

# Setup automation
npm run automation:setup

# Set API key
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
source ~/.bashrc

# Verify
npm run automation:verify-env
npm run automation:test

# Setup cron (follow VPS Step 10)
crontab -e
```

### Windows WSL2

```bash
# In WSL2 Ubuntu terminal:
cd /mnt/c/Users/yourname/projects/tpp

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Setup (same as Ubuntu)
npm install
npm run automation:setup

# Set API key
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
source ~/.bashrc

# For cron in WSL2, you need to start cron service manually:
sudo service cron start

# Add to ~/.bashrc to auto-start cron:
echo 'sudo service cron start' >> ~/.bashrc
```

### macOS

```bash
# Install Node.js (using Homebrew)
brew install node@18

# Navigate to project
cd ~/projects/tpp

# Setup
npm install
npm run automation:setup

# Set API key
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.zshrc
source ~/.zshrc

# For cron, use crontab (same as Linux)
crontab -e
```

---

## 📦 Migration Guide

### Migrating from Local to Production

**Scenario:** You've been running locally and want to move to a VPS.

**Step 1: Create Production Backup**

```bash
# On LOCAL machine
cd /path/to/local/tpp

# Create comprehensive backup
npm run automation:backup

# Archive will be in automation/backups/
# e.g., automation/backups/automation-backup-2025-01-19_14-30-00.tar.gz
```

**Step 2: Transfer Backup to Server**

```bash
# On LOCAL machine
scp automation/backups/automation-backup-*.tar.gz automation@YOUR_SERVER_IP:~/
```

**Step 3: Setup Production Server**

```bash
# On SERVER
# Follow VPS Deployment Steps 1-6 first
# Then restore from backup:

cd ~/projects/tpp
bash automation/scripts/restore-system.sh ~/automation-backup-*.tar.gz

# Verify restoration
npm run automation:verify-env
npm run automation:test
```

**Step 4: Update Configuration**

```bash
# Update any production-specific settings
nano automation/data/clients.json

# Update suburb list if needed
nano automation/data/suburbs.json

# Verify paths in config files
nano automation/config/defaults.json
```

**Step 5: Test Automations**

```bash
# Test each automation
npm run automation:gbp-posts
npm run automation:suburb-pages

# Verify quality
npm run automation:analyze-content

# Check health
npm run automation:health
```

**Step 6: Setup Cron**

```bash
# Configure scheduled runs (VPS Step 10)
crontab -e
```

### Migrating Between Servers

**Scenario:** Moving from one VPS to another.

**On OLD Server:**

```bash
# Create backup
npm run automation:backup

# Stop cron jobs temporarily
crontab -e
# Comment out all automation lines with #

# Download backup locally
# On LOCAL machine:
scp automation@OLD_SERVER_IP:~/projects/tpp/automation/backups/automation-backup-*.tar.gz ~/
```

**On NEW Server:**

```bash
# Follow VPS Deployment Steps 1-6

# Upload backup
# On LOCAL machine:
scp ~/automation-backup-*.tar.gz automation@NEW_SERVER_IP:~/

# On NEW server:
cd ~/projects/tpp
bash automation/scripts/restore-system.sh ~/automation-backup-*.tar.gz

# Verify
npm run automation:verify-env
npm run automation:test

# Setup cron
crontab -e
```

**Verify Both Servers:**

```bash
# On NEW server: Run test automation
npm run automation:gbp-posts

# Compare output quality
npm run automation:analyze-content

# If all looks good, decommission OLD server
```

### Migrating to Different Cloud Platform

**Process:**

1. Create backup on current platform
2. Setup new platform (follow platform-specific steps above)
3. Transfer backup via:
   - Direct SCP between servers (if accessible)
   - Download to local, upload to new server
   - Cloud storage (S3, GCS, Azure Blob) as intermediary
4. Restore on new platform
5. Verify thoroughly before decommissioning old

---

## ⚙️ Post-Deployment Setup

### DNS Configuration (Optional)

If you want a custom domain like `automation.yourdomain.com`:

**Step 1: Create A Record**

```yaml
Type: A
Name: automation
Value: YOUR_SERVER_IP
TTL: 3600
```

**Step 2: Verify DNS Propagation**

```bash
# On LOCAL machine
dig automation.yourdomain.com

# Should show your server IP
```

**Step 3: Setup Reverse Proxy (Optional)**

If you want to serve reports via web:

```bash
# Install Nginx
sudo apt install -y nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/automation

# Add:
server {
    listen 80;
    server_name automation.yourdomain.com;

    root /home/automation/projects/tpp/automation/reports;
    index health-dashboard.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/automation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 4: Setup SSL (Recommended)**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d automation.yourdomain.com

# Auto-renewal is configured automatically
```

### Email Notifications (Optional)

**Setup Email Alerts:**

```bash
# Install mailutils
sudo apt install -y mailutils

# Configure postfix (select "Internet Site")

# Test email
echo "Test from TTP Automation" | mail -s "Test" your@email.com

# Add email notifications to cron
crontab -e

# Modify cron jobs to send email on failures:
0 6 * * * cd /home/automation/projects/tpp && npm run automation:scheduled >> /home/automation/projects/tpp/automation/logs/cron.log 2>&1 || echo "Automation failed" | mail -s "TTP Alert" your@email.com
```

### Monitoring Setup

**Setup Uptime Monitoring:**

Free options:
- **UptimeRobot** - https://uptimerobot.com (free for 50 monitors)
- **Pingdom** - https://pingdom.com (free tier available)
- **StatusCake** - https://statuscake.com (free tier available)

**What to monitor:**
1. Server uptime (ping check)
2. Cron job execution (check log file timestamps)
3. Disk space (custom check)
4. API availability

**Custom Health Check Endpoint (Advanced):**

```bash
# Create simple health endpoint
nano ~/projects/tpp/automation/scripts/health-endpoint.mjs

# Add:
#!/usr/bin/env node
import { exec } from 'child_process';
import { createServer } from 'http';

const server = createServer((req, res) => {
  if (req.url === '/health') {
    exec('npm run automation:status:quick', (error, stdout) => {
      const healthData = stdout.toString();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(healthData);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
console.log('Health endpoint running on port 3000');

# Make executable
chmod +x ~/projects/tpp/automation/scripts/health-endpoint.mjs

# Run with PM2 (process manager)
npm install -g pm2
pm2 start ~/projects/tpp/automation/scripts/health-endpoint.mjs
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

---

## 🔧 Production Configuration

### Environment Variables

**Required:**

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Optional:**

```bash
# Custom output directory
export TPP_OUTPUT_DIR=/custom/path/to/output

# Log level
export TPP_LOG_LEVEL=info  # debug, info, warn, error

# Max concurrent API calls
export TPP_MAX_CONCURRENT=3

# Custom backup directory
export TPP_BACKUP_DIR=/custom/backup/path
```

**Make permanent:**

```bash
# Add to ~/.bashrc
nano ~/.bashrc

# Add all exports
export ANTHROPIC_API_KEY=sk-ant-your-key-here
export TPP_LOG_LEVEL=info

# Save and reload
source ~/.bashrc
```

### Security Hardening

**SSH Security:**

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config

# Set:
PermitRootLogin no
PasswordAuthentication no  # If using SSH keys
Port 2222  # Change default SSH port (optional)

# Restart SSH
sudo systemctl restart sshd
```

**API Key Protection:**

```bash
# Ensure .bashrc is not world-readable
chmod 700 ~/.bashrc

# Never commit API keys to Git
echo 'ANTHROPIC_API_KEY' >> ~/.gitignore

# Use environment file (alternative)
nano ~/projects/tpp/.env
# Add: ANTHROPIC_API_KEY=sk-ant-your-key-here

# Protect .env
chmod 600 ~/projects/tpp/.env

# Load in scripts:
# import dotenv from 'dotenv';
# dotenv.config();
```

**File Permissions:**

```bash
# Restrict automation directory
chmod 700 ~/projects/tpp/automation/data
chmod 700 ~/projects/tpp/automation/config

# Scripts should not be world-writable
chmod 755 ~/projects/tpp/automation/scripts/*.sh
chmod 755 ~/projects/tpp/automation/scripts/*.mjs
```

### Performance Tuning

**Node.js Memory Limit:**

```bash
# For large operations, increase memory
export NODE_OPTIONS="--max-old-space-size=2048"

# Add to ~/.bashrc for persistence
```

**Concurrent API Calls:**

```javascript
// Edit automation scripts to adjust concurrency
// automation/scripts/generate-suburb-pages.mjs

const MAX_CONCURRENT = 2;  // Lower for rate limits, higher for speed
```

**Log Management:**

```bash
# Setup automatic log cleanup
crontab -e

# Add: Clean logs older than 30 days every week
0 3 * * 0 find /home/automation/projects/tpp/automation/logs -name "*.log" -mtime +30 -delete
```

---

## ⏪ Rollback Procedures

### Immediate Rollback (Emergency)

**If deployment fails catastrophically:**

```bash
# On SERVER:
# Restore from backup
cd ~/projects/tpp
ls automation/backups/  # Find most recent backup

bash automation/scripts/restore-system.sh automation/backups/automation-backup-YYYY-MM-DD_HH-MM-SS.tar.gz

# Verify restoration
npm run automation:verify-env
npm run automation:test

# If tests pass, re-enable cron
crontab -e
```

### Gradual Rollback (Code Issues)

**If new code has issues:**

```bash
# Using Git:
git log  # Find last working commit
git checkout COMMIT_HASH

# Reinstall dependencies
npm install

# Test
npm run automation:test

# If good, update cron
# If not, continue rolling back
```

### Data Rollback

**If generated content needs to be reverted:**

```bash
# Backups include generated content
# Restore specific directories from backup:

cd ~/projects/tpp
tar -xzf automation/backups/automation-backup-*.tar.gz \
  --strip-components=1 \
  automation/generated/

# Verify content
ls automation/generated/
```

---

## 📊 Monitoring & Maintenance

### Daily Checks (Automated)

```bash
# Setup automated daily health email
crontab -e

# Add:
0 8 * * * cd /home/automation/projects/tpp && npm run automation:status:quick | mail -s "Daily Health Report" your@email.com
```

### Weekly Manual Checks (5 minutes)

```bash
# SSH to server
ssh automation@YOUR_SERVER_IP

# Check health
cd ~/projects/tpp
npm run automation:health

# Review logs
tail -100 automation/logs/cron.log
tail -100 automation/logs/alerts.log

# Check disk space
df -h

# Check system resources
free -h
top -bn1 | head -20

# Verify cron is running
crontab -l
```

### Monthly Maintenance (15 minutes)

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Node.js dependencies
cd ~/projects/tpp
npm outdated  # Check for updates
npm update    # Update packages

# Clean old backups (keep last 12)
ls -t automation/backups/*.tar.gz | tail -n +13 | xargs rm -f

# Clean old logs (done automatically with logrotate)

# Run comprehensive health check
npm run automation:health
npm run automation:monitor

# Review generated content quality
npm run automation:analyze-content

# Check API costs
npm run automation:cost-estimate
```

### Quarterly Reviews (30 minutes)

```bash
# Review automation effectiveness
# - Check content quality trends
# - Analyze API cost patterns
# - Evaluate system performance
# - Update suburb lists if needed
# - Review and update client data

# Security updates
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y

# Backup verification
# Restore from backup to test server to verify backups work

# Documentation updates
# Update CHANGELOG.md with any customizations
```

---

## 🔍 Troubleshooting

### Deployment Issues

**Problem: Cannot connect to server**

```bash
# Check server status (cloud console)
# Verify security group allows SSH from your IP
# Check SSH key permissions
chmod 400 your-key.pem

# Try verbose SSH
ssh -v automation@YOUR_SERVER_IP
```

**Problem: Node.js installation fails**

```bash
# Try alternative method
curl -fsSL https://deb.nodesource.com/setup_18.x -o setup_nodejs.sh
sudo bash setup_nodejs.sh
sudo apt install -y nodejs

# Or use NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**Problem: npm install fails**

```bash
# Clear npm cache
npm cache clean --force

# Try with different registry
npm install --registry https://registry.npmjs.org/

# Check disk space
df -h

# Check permissions
sudo chown -R $USER:$USER ~/projects/tpp
```

### Cron Issues

**Problem: Cron jobs not running**

```bash
# Check cron service
sudo systemctl status cron

# If not running:
sudo systemctl start cron
sudo systemctl enable cron

# Check crontab syntax
crontab -l

# Check cron logs
grep CRON /var/log/syslog

# Check automation logs
tail -f ~/projects/tpp/automation/logs/cron.log
```

**Problem: Cron runs but automation fails**

```bash
# Common issue: API key not set in cron environment
crontab -e

# Ensure this is at the top:
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Common issue: Wrong working directory
# Use full paths:
0 6 * * * cd /home/automation/projects/tpp && npm run automation:scheduled

# Not relative paths like ~/projects/tpp
```

### Production Performance Issues

**Problem: Automations are slow**

```bash
# Check system resources
top
free -h
df -h

# Check network speed
ping -c 10 api.anthropic.com

# Reduce concurrent operations
# Edit scripts to lower MAX_CONCURRENT

# Check API rate limits
# View logs for rate limit errors
grep "rate limit" automation/logs/*.log
```

**Problem: High API costs**

```bash
# Calculate current costs
npm run automation:cost-estimate

# Review generated content
ls -lah automation/generated/

# Reduce frequency in cron
crontab -e
# Change from daily to weekly, etc.

# Lower max_tokens in scripts
# Edit automation/scripts/*.mjs
# Change max_tokens from 2000 to 1500
```

### Data Issues

**Problem: Lost data after migration**

```bash
# Restore from backup
bash automation/scripts/restore-system.sh automation/backups/latest-backup.tar.gz

# Or restore specific directories
tar -xzf automation/backups/backup.tar.gz automation/data/
```

**Problem: Generated content disappeared**

```bash
# Check backups
ls -lh automation/backups/

# Restore generated content
tar -xzf automation/backups/backup.tar.gz automation/generated/
```

---

## 📚 Additional Resources

### Documentation

- [SYSTEM-OVERVIEW.md](SYSTEM-OVERVIEW.md) - Complete system reference
- [TROUBLESHOOTING-FLOWCHART.md](TROUBLESHOOTING-FLOWCHART.md) - Problem solving
- [MAINTENANCE-GUIDE.md](MAINTENANCE-GUIDE.md) - Ongoing maintenance
- [TEAM-ONBOARDING-GUIDE.md](TEAM-ONBOARDING-GUIDE.md) - Team training

### Quick Commands

```bash
# Health check
npm run automation:health

# Quick status
npm run automation:status:quick

# Verify environment
npm run automation:verify-env

# Run tests
npm run automation:test

# Create backup
npm run automation:backup

# Monitor system
npm run automation:monitor
```

### Support Checklist

If you need help:

- [ ] Run `npm run automation:verify-env` and save output
- [ ] Run `npm run automation:test` and note failures
- [ ] Check logs: `cat automation/logs/*.log`
- [ ] Document error messages
- [ ] Note server specifications
- [ ] List what you've already tried

---

## ✅ Deployment Verification Checklist

After deployment, verify everything works:

### Environment
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm working (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] API key set (`echo $ANTHROPIC_API_KEY`)

### System
- [ ] Dependencies installed (`npm install` completed)
- [ ] Directories created (`npm run automation:setup`)
- [ ] Environment verified (`npm run automation:verify-env` - all pass)
- [ ] Tests passing (`npm run automation:test` - 10/10)

### Automation
- [ ] Test automation runs (`npm run automation:gbp-posts`)
- [ ] Content generated (check `automation/generated/`)
- [ ] Quality acceptable (`npm run automation:analyze-content`)
- [ ] Health score >90% (`npm run automation:health`)

### Production
- [ ] Cron configured (`crontab -l` shows jobs)
- [ ] Logs rotating (`ls /etc/logrotate.d/tpp-automation`)
- [ ] Backups working (`npm run automation:backup`)
- [ ] Firewall configured (`sudo ufw status`)

### Monitoring
- [ ] Health checks automated (cron email working)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Log monitoring setup (email alerts on errors)
- [ ] Resource monitoring (disk, memory, CPU)

### Documentation
- [ ] README updated with server details
- [ ] Team has access credentials
- [ ] Backup locations documented
- [ ] Runbook created for common tasks

---

## 🎉 Post-Deployment

### Congratulations!

Your SEO automation system is now deployed to production!

**Next Steps:**

1. **Monitor for 1 week**
   - Check daily health reports
   - Review generated content
   - Verify cron jobs run successfully
   - Monitor resource usage

2. **Optimize**
   - Adjust cron schedules based on needs
   - Fine-tune quality settings
   - Optimize costs if needed

3. **Scale**
   - Add more automations as needed
   - Expand suburb coverage
   - Integrate with other tools

4. **Document**
   - Keep CHANGELOG updated
   - Document any customizations
   - Share learnings with team

---

**Deployment Difficulty:** ⭐⭐ Intermediate
**Estimated Time:** 30-60 minutes (VPS) | 1-2 hours (Cloud)
**Maintenance Required:** ~30 minutes/month

**Version:** 2.1.0
**Last Updated:** January 19, 2025
