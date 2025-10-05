# n8n SEO Workflow - Final Activation Steps

## 🎯 Current Status

✅ **COMPLETED:**
- Workflow imported to n8n database (ID: `fefa4ab2-72c7-4485-8356-e0eb7fd6a049`)
- PostgreSQL credentials created (ID: `11d7a0c8-ce78-473f-9d30-fc420ee8a71f`)
- Gmail SMTP credentials created (ID: `98467081-32fa-4247-a0cb-bbb7dce4f9bd`)
- Claude Code proxy API running on port 3100
- Database tables created (`seo_analysis`, `competitor_analysis`)
- Workflow shared with your project (55VrbeDl3nbECwkj)

⏳ **REQUIRES USER ACTION:**
- UI activation (2 clicks: Save + Active toggle)
- Set PostgreSQL password in credentials
- Set Gmail app password in credentials

---

## 🚨 WHY UI ACTIVATION IS REQUIRED

**n8n Security Design:**
- Webhooks do NOT auto-register from database changes
- This prevents unauthorized webhook creation
- **MUST** be activated through UI for security

**Current Error:**
```
"The requested webhook \"POST seo-optimization\" is not registered."
```

This is EXPECTED until you complete the UI activation steps below.

---

## ✅ ACTIVATION STEPS (2 MINUTES)

### Step 1: Open Workflow
**Direct Link:** https://n8n.theprofitplatform.com.au/workflow/fefa4ab2-72c7-4485-8356-e0eb7fd6a049

### Step 2: Set PostgreSQL Password
1. Click on "Fetch Competitor Data" node
2. Click the credentials dropdown
3. Click "Edit Credential"
4. Enter your PostgreSQL password
5. Click "Save"

### Step 3: Set Gmail SMTP Password
1. Click on "Send Email Report" node
2. Click the credentials dropdown
3. Click "Edit Credential"
4. Enter Gmail app password (see below)
5. Click "Save"

**Get Gmail App Password:**
- Visit: https://myaccount.google.com/apppasswords
- Create app password named "n8n SEO Reports"
- Use that 16-character password (not your Gmail password)

### Step 4: Activate Workflow
1. Click **"Save"** button (top-right) ✅
2. Toggle **"Active"** switch ON (top-right) ✅

**Result:** Webhook will register within 2 seconds!

---

## 🧪 TEST THE WORKFLOW

Once activated, run this curl command:

```bash
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "test-001",
    "title": "Best Digital Marketing Services for Australian Small Businesses in Sydney 2025",
    "content": "Are you a small business owner in Sydney looking to grow your online presence? Our comprehensive digital marketing services are specifically designed for Australian businesses. We understand the unique challenges of the Australian market and have helped over 200 local businesses increase their online visibility. Our services include: SEO optimization for Australian search engines, Local SEO targeting Sydney suburbs, Content marketing with Australian English, Social media management for Australian audiences, Google My Business optimization. With over 10 years of experience in the Australian digital marketing landscape, our team knows what works.",
    "keywords": ["digital marketing Australia", "SEO Sydney", "small business marketing", "local SEO", "Australian business growth"],
    "competitor_urls": ["https://example.com/competitor1", "https://example.com/competitor2"],
    "target_location": "Australia"
  }'
```

**Expected Response:**
- SEO score (0-100)
- Keyword density analysis
- Title optimization suggestions
- Heading structure analysis
- Australian SEO recommendations
- Optimized content (if score < 80)

---

## 📊 WORKFLOW FEATURES

### Parallel AI Analysis (3 nodes run simultaneously):
1. **Claude SEO Analysis** → http://127.0.0.1:3100/v1/seo/analyze
   - Keyword density calculation
   - Title optimization scoring
   - Heading structure validation
   - Readability analysis

2. **Claude Keyword Research** → http://127.0.0.1:3100/v1/seo/keywords
   - Long-tail keyword suggestions
   - Australian-specific keywords
   - Search intent classification
   - Local SEO keywords

3. **Competitor Analysis** → PostgreSQL query
   - Fetch competitor data from database
   - Compare scores and strategies

### SEO Scoring (JavaScript Code):
- Calculates 0-100 score based on:
  - Keyword count and density
  - Title optimization
  - Content length and readability
  - Heading structure
  - Australian SEO relevance
  - Mobile-friendliness

### Auto-Optimization:
- If score < 80: Calls Claude Content Optimization
- Endpoint: http://127.0.0.1:3100/v1/seo/optimize
- Generates optimized title, content, meta description

### Database Storage:
- Stores analysis in `seo_analysis` table
- Tracks scores and recommendations over time

### Email Reports:
- Sends to: avi@theprofitplatform.com.au
- Includes: SEO score, recommendations, optimized content
- Uses Gmail SMTP (app password required)

---

## 🔧 VERIFICATION CHECKLIST

After activation, verify:

- [ ] Webhook test returns JSON response (not 404)
- [ ] PostgreSQL connection works (no credential errors)
- [ ] Email sends successfully (check inbox/spam)
- [ ] Database entry created in `seo_analysis` table
- [ ] SEO score calculated correctly (0-100)
- [ ] Australian keywords included in response

---

## 🐛 TROUBLESHOOTING

### Error: "You do not have permission"
**Already Fixed!** Workflow is shared with your project.

### Error: "Webhook not registered"
**Fix:** Complete Step 4 (Save + Active toggle) above

### Error: "PostgreSQL authentication failed"
**Fix:** Set password in credentials (Step 2 above)

### Error: "SMTP authentication failed"
**Fix:** Use Gmail app password, not regular password (Step 3 above)

### Error: "Port 3100 connection refused"
**Fix:** Already running! Verify with:
```bash
curl http://127.0.0.1:3100/health
# Should return: {"status":"ok","service":"claude-proxy"}
```

---

## 📝 WORKFLOW DIAGRAM

```
Webhook Trigger (POST /webhook/seo-optimization)
    ↓
Validate & Parse Input
    ↓
┌──────────────────────────────────────────┐
│  PARALLEL EXECUTION (3 branches)         │
├──────────────────────────────────────────┤
│  1. Claude SEO Analysis (port 3100)      │
│  2. Claude Keyword Research (port 3100)  │
│  3. Fetch Competitor Data (PostgreSQL)   │
└──────────────────────────────────────────┘
    ↓
Merge All Analysis
    ↓
Compile SEO Report & Score (JavaScript)
    ↓
Score < 80? (IF node)
    ↓
YES → Claude Content Optimization (port 3100)
NO  → Skip optimization
    ↓
Store Analysis in DB (PostgreSQL)
    ↓
Send Email Report (Gmail SMTP)
    ↓
Webhook Response (JSON)
```

---

## 🎯 NEXT STEPS

1. **Complete activation** (2 minutes using steps above)
2. **Run test curl command**
3. **Check email for report**
4. **Verify database entry:**
   ```sql
   SELECT * FROM seo_analysis ORDER BY created_at DESC LIMIT 1;
   ```
5. **Integrate with production site**

---

## 📞 SUPPORT

**Workflow Details:**
- Name: "SEO Optimization with Claude Code"
- ID: `fefa4ab2-72c7-4485-8356-e0eb7fd6a049`
- URL: https://n8n.theprofitplatform.com.au/workflow/fefa4ab2-72c7-4485-8356-e0eb7fd6a049

**Claude Proxy API:**
- Status: Running ✅
- Port: 3100
- Service: claude-code-api.service
- Health: http://127.0.0.1:3100/health

**Test Scripts:**
- Full test suite: `/home/avi/projects/astro-site/scripts/test-seo-workflow.cjs`
- Run with: `node scripts/test-seo-workflow.cjs`
