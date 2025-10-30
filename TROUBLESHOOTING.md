# 🔧 Troubleshooting Guide - Automation System

**Quick Links:**
- [API Key Issues](#api-key-issues)
- [Rate Limiting](#rate-limiting)
- [Budget & Cost Issues](#budget--cost-issues)
- [File & Permission Issues](#file--permission-issues)
- [Content Quality Issues](#content-quality-issues)
- [Dashboard Issues](#dashboard-issues)
- [Test Failures](#test-failures)
- [Performance Issues](#performance-issues)

---

## 🔑 API Key Issues

### Error: "ANTHROPIC_API_KEY not set"

**Symptoms:**
```
❌ Environment Validation Failed

Required:
  ✗ ANTHROPIC_API_KEY
    Current: Not set
```

**Solutions:**

**Option 1: Set in .env.local (Recommended)**
```bash
# Create .env.local if it doesn't exist
cp .env.local.example .env.local

# Edit and add your key
echo "ANTHROPIC_API_KEY=sk-ant-api03-your-key-here" >> .env.local
```

**Option 2: Export environment variable**
```bash
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Option 3: Set in shell profile (Permanent)**
```bash
# For bash
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here' >> ~/.bashrc
source ~/.bashrc

# For zsh
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here' >> ~/.zshrc
source ~/.zshrc
```

**Verify it's set:**
```bash
echo $ANTHROPIC_API_KEY
# Should output: sk-ant-api03-...
```

---

### Error: "Invalid API key format"

**Symptoms:**
```
❌ Environment Validation Failed

Required:
  ✗ ANTHROPIC_API_KEY
    Format: Must start with 'sk-ant-'
    Current: abc123...
```

**Cause:** API key doesn't start with `sk-ant-`

**Solution:**
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. Copy the **entire** key (starts with `sk-ant-api03-`)
4. Update your `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
```

**Common mistakes:**
- ❌ Using organization ID instead of API key
- ❌ Copying only part of the key
- ❌ Adding quotes around the key (not needed in .env files)

---

### Error: "401 Unauthorized"

**Symptoms:**
```
❌ Error: Authentication failed
Status: 401 Unauthorized
```

**Possible causes:**
1. **Invalid API key** - Key was deleted or rotated
2. **Expired key** - Key has expired
3. **Wrong account** - Using key from different account

**Solutions:**
1. Generate a new API key:
   - Go to https://console.anthropic.com/settings/keys
   - Delete old key
   - Create new key
   - Update `.env.local`

2. Verify account has credits:
   - Go to https://console.anthropic.com/settings/billing
   - Check balance
   - Add credits if needed

---

## ⏱️ Rate Limiting

### Error: "Rate limit exceeded (429)"

**Good news:** This is handled automatically by the system!

**What happens:**
```
⚠️  Rate limit hit (429). Retrying in 2.0s (attempt 1/3)...
⏳ Waiting...
✅ Retry successful
```

**The system will:**
1. Wait with exponential backoff (1s → 2s → 4s → 8s)
2. Retry up to 3 times
3. Log the retry attempts
4. Continue automatically

**You don't need to do anything.**

---

### Manual rate limit adjustment

If you're consistently hitting rate limits:

**Option 1: Reduce request rate**
```bash
# Edit .env.local
RATE_LIMIT_RPM=30  # Reduce from 50 to 30 requests/minute
```

**Option 2: Increase backoff time**
```bash
# Edit .env.local
RATE_LIMIT_BACKOFF=2000      # Start at 2s instead of 1s
RATE_LIMIT_MAX_BACKOFF=60000 # Max 60s instead of 32s
```

**Option 3: Process in smaller batches**
```bash
# Instead of all 10 suburbs at once
node automation/scripts/generate-suburb-pages.mjs

# Do 5 at a time - edit suburbs.json to mark some as "completed"
```

---

## 💰 Budget & Cost Issues

### Warning: "Budget exceeded"

**Symptoms:**
```
🚨 BUDGET EXCEEDED! $15.23 over budget
Spent: $115.23 / $100.00
```

**Solutions:**

**Option 1: Increase budget**
```bash
# Edit .env.local
MONTHLY_API_BUDGET=150  # Increase from 100 to 150
```

**Option 2: Wait until next month**
```bash
# Budget resets on 1st of each month
# Check current spend:
npm run automation:dashboard
```

**Option 3: Review spending**
```bash
# See detailed breakdown
node -e "import('./automation/lib/usage-tracker.mjs').then(m => new m.UsageTracker().generateReport())"

# Check which scripts cost the most
# Reduce usage of expensive scripts
```

---

### Unexpected high costs

**Check what's using credits:**
```bash
npm run automation:dashboard
```

Look for "Top Scripts (This Month)" section.

**Common causes:**
1. **Long content** - Longer content = more tokens = higher cost
2. **Many retries** - Failed API calls still cost money
3. **Large batches** - Processing 50 suburbs = 50x cost of 1

**Solutions:**
1. **Optimize content length**
   ```bash
   # Edit .env.local
   MAX_WORD_COUNT=1500  # Reduce from 3000
   ```

2. **Use dry-run for testing**
   ```bash
   node automation/scripts/generate-suburb-pages.mjs --dry-run
   # Costs $0.00
   ```

3. **Process in batches**
   ```bash
   # Do 5 suburbs per run instead of all 10
   ```

---

### Cost tracking not working

**Symptoms:**
```
💰 API Usage:
  No usage data available
```

**Causes:**
1. No API calls made yet (normal)
2. Usage file deleted
3. File permission issues

**Solutions:**

**Check if file exists:**
```bash
ls -la automation/data/api-usage.json
```

**If missing, run any automation:**
```bash
# This will create the file
npm run automation:suburb-pages
```

**If permission issues:**
```bash
# Fix permissions
chmod 644 automation/data/api-usage.json
```

---

## 📁 File & Permission Issues

### Error: "ENOENT: no such file or directory"

**Common causes:**

**1. Missing directory**
```bash
# Create missing directories
mkdir -p automation/data
mkdir -p automation/logs
mkdir -p automation/generated
mkdir -p automation/.cache
```

**2. Wrong working directory**
```bash
# Always run from project root
cd /path/to/tpp
node automation/scripts/generate-suburb-pages.mjs
```

**3. Missing data file**
```bash
# Check if suburbs.json exists
ls automation/data/suburbs.json

# If missing, it should have been created in setup
# Check git status to see if it was committed
```

---

### Error: "EACCES: permission denied"

**Symptoms:**
```
Error: EACCES: permission denied, open 'automation/logs/2025-01-27.log'
```

**Solutions:**

**Option 1: Fix permissions**
```bash
# Make directories writable
chmod -R 755 automation/
```

**Option 2: Check ownership**
```bash
# See who owns the files
ls -la automation/

# If owned by root or another user:
sudo chown -R $USER:$USER automation/
```

**Option 3: Run with appropriate user**
```bash
# Don't run as root unless necessary
# Run as your regular user
```

---

### Files not being created

**Check output directories:**
```bash
# Suburb pages
ls -la src/content/locations/

# GBP posts
ls -la automation/generated/gbp-posts/

# Logs
ls -la automation/logs/

# If empty, check for errors in console output
```

**Common issues:**
1. **Dry-run mode enabled** - Add actual run without --dry-run
2. **Errors during generation** - Check logs for errors
3. **Wrong output path** - Check CONFIG in script

---

## 📝 Content Quality Issues

### Content flagged as low quality

**Symptoms:**
```
📊 CONTENT VALIDATION REPORT
Overall Score: 45/100 ❌

Issues Found:
  ❌ [ERROR] Word count 250 is outside range 600-3000
  ⚠️ [WARNING] Readability too low: Difficult (38)
```

**Solutions:**

**1. Word count too low**
- Generated content is too short
- Increase max_tokens in script:
```javascript
// In generate-suburb-pages.mjs
max_tokens: 3000  // Increase from 2000
```

**2. Readability too low**
- Content is too complex
- Adjust prompt to request simpler language
- Add "Write in plain English" to prompts

**3. Keyword stuffing**
```
⚠️ [WARNING] Keyword density too high (5.2% > 3.0%)
```
- Adjust prompt to use keyword less frequently
- Add "Use the keyword naturally, no more than 5-7 times"

---

### Duplicate content detected

**Symptoms:**
```
⚠️  DUPLICATE CONTENT DETECTED
Maximum Similarity: 73.2%
Matches Found: 1
```

**This is GOOD** - The system prevented publishing duplicate content!

**Solutions:**

**1. Regenerate with different parameters**
```bash
# Delete the generated file
rm src/content/locations/bondi.md

# Run again - AI will generate different content
node automation/scripts/generate-suburb-pages.mjs
```

**2. Adjust similarity threshold (if too strict)**
```bash
# Edit .env.local
DUPLICATE_SIMILARITY_THRESHOLD=0.80  # Increase from 0.70 (70%)
```

**3. Manual review**
- Sometimes content is genuinely similar
- Review the flagged content
- Decide if it's acceptable or needs regeneration

---

### AI patterns detected

**Symptoms:**
```
⚠️ [WARNING] Contains AI phrase: "it's important to note"
⚠️ [WARNING] Contains AI phrase: "delve into"
```

**Solutions:**

**1. Update prompts**
Add to prompts:
```
AVOID these AI phrases:
- "it's important to note"
- "delve into"
- "as an AI"
- "I cannot"
```

**2. Post-processing**
```bash
# Simple find and replace
sed -i 's/it is important to note/note/g' file.md
```

**3. Manual review**
- Review flagged content
- Edit out AI phrases
- This is why you always review before publishing!

---

## 📊 Dashboard Issues

### Dashboard shows "No data available"

**Cause:** Normal for first run or no API calls yet

**Solution:**
```bash
# Run any automation to generate data
npm run automation:suburb-pages

# Then view dashboard
npm run automation:dashboard
```

---

### Dashboard not refreshing

**If using watch mode:**
```bash
npm run automation:dashboard:watch
```

**If it stops updating:**
1. Press Ctrl+C to exit
2. Run again
3. Check for errors in console

---

### Dashboard shows wrong data

**Solution: Clear cache and regenerate**
```bash
# Remove usage data
rm automation/data/api-usage.json

# Run automation again
npm run automation:suburb-pages

# View dashboard
npm run automation:dashboard
```

---

## 🧪 Test Failures

### Tests fail with "Cannot find module"

**Symptoms:**
```
Error: Cannot find module './content-validator.mjs'
```

**Solutions:**

**1. Install dependencies**
```bash
npm install
```

**2. Check file exists**
```bash
ls automation/lib/content-validator.mjs
```

**3. Run from correct directory**
```bash
# Must be in project root
pwd  # Should show /path/to/tpp
npm run test:unit
```

---

### Tests timeout

**Symptoms:**
```
Error: Test timeout exceeded (10000ms)
```

**Solutions:**

**Increase timeout in vitest.config.mjs:**
```javascript
export default defineConfig({
  test: {
    testTimeout: 30000,  // Increase from 10000
  },
});
```

---

## ⚡ Performance Issues

### Scripts running very slowly

**Normal speeds:**
- Each API call: 2-5 seconds
- 10 suburb pages: 30-60 seconds
- 12 GBP posts: 20-40 seconds

**If slower:**

**1. Check network connection**
```bash
# Test connectivity
curl -I https://api.anthropic.com
```

**2. Check if being rate limited**
- Look for retry messages in output
- If many retries, reduce batch size

**3. Check system resources**
```bash
# Check CPU and memory
top

# Node.js shouldn't use more than 200MB
```

---

### High memory usage

**Normal:** 50-100MB
**High:** >500MB

**Solutions:**

**1. Process in smaller batches**
```bash
# Instead of all at once, do 5 at a time
```

**2. Clear cache**
```bash
rm -rf automation/.cache/*
```

**3. Restart Node.js**
```bash
# Kill any hanging node processes
pkill node

# Run again
npm run automation:suburb-pages
```

---

## 🔍 Debug Mode

### Enable verbose logging

```bash
# Edit .env.local
LOG_LEVEL=debug
VERBOSE=true
```

Then run your automation:
```bash
node automation/scripts/generate-suburb-pages.mjs
```

You'll see detailed logs:
```
[DEBUG] Rate limiter: checking slot availability
[DEBUG] Current requests in window: 3
[DEBUG] Waiting for API response...
[DEBUG] Response received: 200 OK
```

---

### Check log files

```bash
# Today's log
tail -f automation/logs/$(date +%Y-%m-%d).log

# Search for errors
grep "error" automation/logs/*.log

# Search for specific script
grep "suburb-pages" automation/logs/*.log
```

---

## 🆘 Still Having Issues?

### Gather diagnostic information

```bash
# System info
node --version
npm --version
cat .env.local | grep -v "KEY"  # Don't share actual keys!

# Check file structure
ls -R automation/

# Check recent logs
tail -50 automation/logs/$(date +%Y-%m-%d).log

# Check dashboard
npm run automation:dashboard
```

### Reset to known good state

```bash
# 1. Backup current state
cp -r automation automation-backup

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Reset data files
rm automation/data/api-usage.json
# Keep suburbs.json!

# 4. Clear cache
rm -rf automation/.cache/*

# 5. Test with dry-run
node automation/scripts/generate-suburb-pages.mjs --dry-run

# 6. If successful, run for real
node automation/scripts/generate-suburb-pages.mjs
```

---

## ✅ Prevention Tips

**1. Always test with --dry-run first**
```bash
node script.mjs --dry-run
```

**2. Monitor costs regularly**
```bash
npm run automation:dashboard
```

**3. Review content before publishing**
- AI is good, not perfect
- Always add human oversight

**4. Keep backups**
```bash
# Backup data directory weekly
cp -r automation/data automation/data-backup-$(date +%Y-%m-%d)
```

**5. Update regularly**
```bash
# Check for dependency updates monthly
npm outdated
npm update
```

---

## 📚 Additional Resources

- **Quick Start Guide:** QUICK-START-GUIDE.md
- **Full Documentation:** automation/README.md
- **Implementation Details:** IMPLEMENTATION-COMPLETE.md
- **Environment Variables:** .env.local.example

**If you find a bug or have a question not covered here, check the logs first:**
```bash
tail -f automation/logs/$(date +%Y-%m-%d).log
```

The logs usually contain the exact error message and context needed to diagnose issues.
