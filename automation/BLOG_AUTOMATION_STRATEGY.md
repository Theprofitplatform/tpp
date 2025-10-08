# Blog Automation Environment Strategy

**Last Updated**: 2025-10-08
**Purpose**: Prevent conflicts between local and VPS automation systems

---

## 🎯 Primary Automation Strategy

### **VPS as Primary Automation Source**
- **✅ Primary Environment**: VPS (`tpp-vps`)
- **✅ Automation**: Daily blog generation (Mon-Fri 9:00 AM)
- **✅ Git Operations**: All commits and pushes from VPS
- **✅ Production**: Live blog posts and deployment

### **Local as Development Environment**
- **🔧 Purpose**: Development, testing, and debugging
- **🔧 Usage**: Manual testing only
- **🔧 Restrictions**: No automated blog generation
- **🔧 Git**: Pull changes from VPS, no automation commits

---

## ⚙️ Environment Configuration

### VPS Configuration (`tpp-vps`)
```bash
# Cron Job (Primary Automation)
0 9 * * 1-5 cd /home/avi/projects/tpp && ./automation/scripts/vps-auto-blog.sh

# Automation Scripts
- vps-auto-blog.sh (cron job)
- vps-auto-blog-advanced.sh (full features)
- vps-auto-blog-fixed.sh (enhanced error handling)
```

### Local Configuration (Development)
```bash
# No Cron Jobs
# Manual testing only
# git pull origin main before any development
```

---

## 🔄 Git Synchronization Protocol

### Daily Workflow
1. **VPS Automation** → Generates blog post → Commits → Pushes
2. **Local Development** → Pulls latest changes → Develops → Commits → Pushes (if needed)

### Conflict Prevention Rules
1. **Never run automation on both systems simultaneously**
2. **Local should always pull before development**
3. **VPS commits should be pushed immediately after generation**
4. **No manual blog generation on local during VPS automation hours (9:00 AM)**

### Git Commands
```bash
# Local: Always pull first
git pull origin main

# VPS: Commit and push after automation
git add .
git commit -m "🤖 Auto-publish blog post: [title]"
git push origin main
```

---

## 🚨 Conflict Detection & Resolution

### Warning Signs
- ❌ Local is behind VPS in git commits
- ❌ Both systems have uncommitted changes
- ❌ Duplicate blog posts with same date
- ❌ Topic queue out of sync

### Resolution Steps
1. **Check sync status**: `git log --oneline origin/main..HEAD`
2. **Commit local changes**: `git add . && git commit -m "Local changes"`
3. **Pull latest**: `git pull origin main`
4. **Resolve conflicts** if any
5. **Push resolved changes**: `git push origin main`

---

## 📋 Environment Variables Strategy

### Shared Configuration
```bash
# Both environments use same API keys
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
DISCORD_WEBHOOK_URL=https://discord.com/...
```

### Security Notes
- ✅ API keys identical on both systems
- ❌ Never commit `.env.local` to git
- ❌ Remove backup files containing secrets
- ✅ Use `.env.example` for reference

---

## 🔧 Automation Scripts Management

### VPS Scripts (Primary)
```bash
automation/scripts/vps-auto-blog.sh          # Cron job script
automation/scripts/vps-auto-blog-advanced.sh # Full features
automation/scripts/vps-auto-blog-fixed.sh    # Enhanced error handling
```

### Local Scripts (Development)
```bash
automation/scripts/generate-blog-post.js     # Manual testing
automation/scripts/diagnose-blog-issue.js    # Debugging
```

### Script Usage Rules
1. **VPS**: Use `vps-auto-blog-*.sh` scripts for automation
2. **Local**: Use `generate-blog-post.js` for manual testing only
3. **Never**: Run automation scripts on both systems simultaneously

---

## 📊 Monitoring & Health Checks

### Daily Checks
```bash
# Check VPS automation status
ssh avi@tpp-vps "cd /home/avi/projects/tpp && tail -20 automation/logs/blog-automation-*.log"

# Check git sync status
git log --oneline -3
git status

# Check topic queue
node -e "const fs=require('fs');const q=JSON.parse(fs.readFileSync('automation/topic-queue.json'));console.log('Pending:',q.queue.filter(t=>t.status==='pending').length)"
```

### Health Indicators
- ✅ VPS cron job running
- ✅ Git repositories synchronized
- ✅ No duplicate blog posts
- ✅ Topic queue consistent

---

## 🚀 Emergency Procedures

### VPS Automation Fails
1. Check logs: `automation/logs/blog-automation-*.log`
2. Test manually: `bash automation/scripts/vps-auto-blog-advanced.sh`
3. Check API connectivity: `node automation/scripts/diagnose-blog-issue.js`

### Git Conflicts Occur
1. Stop all automation
2. Resolve conflicts manually
3. Test synchronization
4. Resume automation

### Duplicate Posts Generated
1. Identify duplicate posts
2. Remove older/incorrect post
3. Update topic queue status
4. Commit corrections

---

## 📈 Performance Metrics

### Success Indicators
- ✅ 1 blog post generated daily (Mon-Fri)
- ✅ All commits pushed to GitHub
- ✅ No git conflicts
- ✅ Discord notifications working

### Failure Indicators
- ❌ Multiple posts same day
- ❌ Git synchronization issues
- ❌ API connectivity failures
- ❌ Missing Discord notifications

---

## 🔐 Security & Best Practices

### API Key Management
- Store in `.env.local` (not committed to git)
- Identical on both environments
- Regular rotation recommended
- Monitor usage and costs

### File Permissions
```bash
# VPS scripts should be executable
chmod +x automation/scripts/vps-auto-blog-*.sh

# Protect environment files
chmod 600 .env.local
```

### Backup Strategy
- Daily git commits serve as backup
- No additional backup files needed
- Remove any `.env.local.backup*` files

---

## 📞 Support & Troubleshooting

### Common Issues
1. **Git sync issues**: Pull before development
2. **API failures**: Check connectivity with diagnostic script
3. **Duplicate posts**: Check automation timing
4. **Missing commits**: Ensure VPS pushes after generation

### Contact Points
- **Automation Issues**: Check logs first
- **Git Conflicts**: Follow resolution protocol
- **API Problems**: Verify keys and connectivity

---

## ✅ Summary

**Primary Rule**: VPS handles all automated blog generation, local is for development only.

**Key Success Factors**:
1. VPS automation runs Mon-Fri 9:00 AM
2. Local always pulls before development
3. No simultaneous automation
4. Immediate git synchronization

**This strategy ensures conflict-free blog automation across environments.**