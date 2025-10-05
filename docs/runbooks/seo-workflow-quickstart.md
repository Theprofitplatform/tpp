# 🚀 Quick Start - SEO Workflow Testing

## ✅ Setup Status: 90% Complete

### What's Done ✅
- ✅ Ollama running with Mistral 7B + Llama3.2 1B
- ✅ PostgreSQL database configured
- ✅ Tables created with seed data
- ✅ Test suite ready
- ✅ All documentation created

### What's Left (5 minutes) ⏱️
1. Import workflow to n8n
2. Configure credentials
3. Run tests

---

## Step 1: Import Workflow (2 min)

```bash
# Open n8n in browser
open https://n8n.theprofitplatform.com.au

# Or copy this path for import:
/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json
```

**In n8n UI**:
1. Click **"+"** → **"Import from File"**
2. Select the workflow JSON file
3. Click **"Import"**

---

## Step 2: Configure Credentials (2 min)

### PostgreSQL Credential
```
Name: PostgreSQL - Main DB
Host: localhost
Database: n8n
User: n8nuser
Password: [your n8n db password]
Port: 5432
```

### SMTP Credential (Gmail)
```
Name: SMTP - TPP
Host: smtp.gmail.com
Port: 587
User: seo@theprofitplatform.com.au
Password: [Gmail app password from https://myaccount.google.com/apppasswords]
```

---

## Step 3: Activate & Test (1 min)

**In n8n**:
1. Click **"Save"**
2. Toggle **"Active"** switch ON

**Run Tests**:
```bash
cd /home/avi/projects/astro-site
node scripts/test-seo-workflow.cjs
```

---

## Expected Test Results

```
✅ Test 1: Australian Business Content
   SEO Score: 85-92/100
   Status: No optimization needed

✅ Test 2: Poor Quality Content
   SEO Score: 35-45/100 → 85-90/100
   Status: Auto-optimized ✨

✅ Test 3: Financial Services
   SEO Score: 65-75/100
   Status: Recommendations provided

✅ Test 4: E-commerce Content
   SEO Score: 78-88/100
   Status: Australian keywords detected

✅ Test 5: Technical Content
   SEO Score: 30-40/100 → 80-85/100
   Status: Auto-optimized ✨

📊 Success Rate: 100%
🎉 All tests passed!
```

---

## Quick Reference

### Files Location
```
Workflow:    n8n-workflows/advanced-seo-optimization-workflow.json
Test Suite:  scripts/test-seo-workflow.cjs
Docs:        scripts/SEO_WORKFLOW_TEST.md
Setup Guide: scripts/SETUP_COMPLETE.md
```

### Webhook URL
```
https://n8n.theprofitplatform.com.au/webhook/seo-optimization
```

### Manual Test
```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/seo-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "quick-test",
    "title": "Digital Marketing Australia",
    "content": "Expert marketing services for Australian businesses",
    "keywords": ["marketing", "Australia"],
    "target_location": "Australia"
  }'
```

---

## Troubleshooting

### Issue: Workflow 404
**Fix**: Ensure workflow is Active in n8n

### Issue: Ollama connection error
**Fix**: `sudo systemctl restart ollama`

### Issue: Database connection failed
**Fix**: Check PostgreSQL credentials in n8n

### Issue: Email not sending
**Fix**: Use Gmail app password (not regular password)

---

## Support Files

| File | Purpose |
|------|---------|
| `scripts/SETUP_COMPLETE.md` | Complete setup guide |
| `scripts/SEO_WORKFLOW_TEST.md` | Technical documentation |
| `scripts/IMPORT_SEO_WORKFLOW.md` | Import instructions |
| `scripts/workflow-credentials.txt` | Credentials reference |

---

**Status**: Ready to import! 🎯

**Next**: Open https://n8n.theprofitplatform.com.au
