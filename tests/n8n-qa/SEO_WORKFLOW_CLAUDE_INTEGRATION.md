# SEO Optimization Workflow - Claude Code AI Integration

**Date**: 2025-10-04
**Workflow ID**: fefa4ab2-72c7-4485-8356-e0eb7fd6a049
**Claude API**: http://localhost:3000 ✅ LIVE

---

## 🎯 Integration Plan

Enhance your SEO Optimization workflow with FREE Claude Code AI for:
- Intelligent keyword analysis
- Content optimization suggestions
- Meta tag generation
- Competitive analysis
- SEO score calculation
- Automated recommendations

---

## 📋 Step-by-Step Integration

### Step 1: Open SEO Workflow in n8n

1. Go to: https://n8n.theprofitplatform.com.au
2. Navigate to **Workflows**
3. Open **"SEO Optimization with Claude Code"** (ID: fefa4ab2-72c7-4485-8356-e0eb7fd6a049)

### Step 2: Add Claude Code API Node

**After your data collection node**, add:

**Node Type**: HTTP Request
**Node Name**: Claude - SEO Analysis

**Configuration**:
```
Method: POST
URL: http://localhost:3000/api/claude/seo

Headers:
  Content-Type: application/json

Body (JSON):
{
  "url": "{{ $json.pageUrl }}",
  "content": "{{ $json.pageContent }}",
  "keywords": {{ $json.targetKeywords || [] }}
}
```

### Step 3: Process Claude Response

**Add a "Set" node** after Claude API:

**Node Name**: Extract SEO Insights

**Values to Set**:
```javascript
// SEO Score
seoScore: {{ $json.analysis.match(/Score: (\d+)/)?.[1] || 0 }}

// Recommendations
recommendations: {{ $json.analysis }}

// Priority Issues
priorityIssues: {{ $json.analysis.match(/CRITICAL:.*?(?=\n\n)/gs) || [] }}

// Quick Wins
quickWins: {{ $json.analysis.match(/QUICK WIN:.*?(?=\n\n)/gs) || [] }}
```

---

## 🔥 Enhanced Workflow Structure

### Current Flow:
```
Trigger → Fetch Page → Extract Data → Send Report
```

### Enhanced Flow with Claude:
```
Trigger
  → Fetch Page Content
  → Claude SEO Analysis ← NEW!
  → Extract Insights ← NEW!
  → Generate Report (AI-Enhanced)
  → Send Email/Slack
  → (Optional) Auto-implement fixes
```

---

## 💡 Use Cases

### 1. **Automated Page Analysis**

**HTTP Request to Claude**:
```json
{
  "url": "https://theprofitplatform.com.au/services",
  "content": "{{ $json.htmlContent }}",
  "keywords": ["digital marketing", "automation", "consulting"]
}
```

**Claude will analyze**:
- Title tag optimization
- Meta description quality
- Header structure (H1, H2, H3)
- Keyword density
- Internal linking
- Image alt texts
- Content readability
- Mobile optimization

### 2. **Competitive Keyword Analysis**

**HTTP Request**:
```json
{
  "prompt": "Analyze these competitor keywords and suggest improvements: {{ $json.competitorKeywords }}",
  "context": "Our website: theprofitplatform.com.au, Focus: automation consulting"
}
```

### 3. **Content Gap Analysis**

**HTTP Request**:
```json
{
  "prompt": "Identify content gaps based on: Current pages: {{ $json.ourPages }}, Competitor topics: {{ $json.competitorTopics }}"
}
```

### 4. **Meta Tag Generation**

**HTTP Request to `/api/claude/generate`**:
```json
{
  "type": "meta tags",
  "topic": "{{ $json.pageTitle }}",
  "keywords": {{ $json.targetKeywords }},
  "tone": "professional",
  "length": "short"
}
```

---

## 🚀 Example Workflow Configuration

### Node 1: Webhook Trigger
```json
{
  "httpMethod": "POST",
  "path": "seo-analyze",
  "responseMode": "lastNode"
}
```

### Node 2: HTTP Request - Fetch Page
```json
{
  "url": "{{ $json.targetUrl }}",
  "method": "GET"
}
```

### Node 3: Extract Content
```javascript
// Use Code node or HTML Extract node
const html = $input.all()[0].json.body;
const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
const metaDesc = html.match(/<meta name="description" content="(.*?)"/i)?.[1] || '';
const h1 = html.match(/<h1.*?>(.*?)<\/h1>/i)?.[1] || '';

return {
  url: $json.targetUrl,
  title,
  metaDescription: metaDesc,
  h1,
  content: html.replace(/<[^>]*>/g, '').substring(0, 5000)
};
```

### Node 4: Claude SEO Analysis ✨ NEW
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/claude/seo",
  "body": {
    "url": "={{ $json.url }}",
    "content": "={{ $json.content }}",
    "keywords": ["automation", "consulting", "digital marketing"]
  }
}
```

### Node 5: Extract Insights
```javascript
const analysis = $input.all()[0].json.analysis;

// Extract SEO score
const scoreMatch = analysis.match(/(?:Score|Rating):\s*(\d+)/i);
const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

// Extract recommendations
const recommendations = analysis
  .split('\n')
  .filter(line => line.includes('•') || line.includes('-'))
  .slice(0, 10);

// Extract critical issues
const critical = analysis.match(/CRITICAL:.*?(?=\n\n|$)/gs) || [];
const warnings = analysis.match(/WARNING:.*?(?=\n\n|$)/gs) || [];

return {
  url: $json.url,
  seoScore: score,
  grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'F',
  recommendations,
  criticalIssues: critical,
  warnings,
  fullAnalysis: analysis,
  timestamp: new Date().toISOString()
};
```

### Node 6: IF - Score Check
```javascript
// Route based on SEO score
{{ $json.seoScore < 60 }}
```

**True path**: Send alert + Create improvement task
**False path**: Log success

### Node 7a: Send Alert (Score < 60)
```json
{
  "channel": "#seo-alerts",
  "message": "⚠️ Low SEO Score Alert\n\nURL: {{ $json.url }}\nScore: {{ $json.seoScore }}/100 ({{ $json.grade }})\n\nCritical Issues:\n{{ $json.criticalIssues.join('\n') }}\n\nRecommendations:\n{{ $json.recommendations.slice(0,5).join('\n') }}"
}
```

### Node 7b: Generate Improvement Plan
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/claude/generate",
  "body": {
    "type": "action plan",
    "topic": "SEO improvements for {{ $json.url }}",
    "context": "Current score: {{ $json.seoScore }}, Issues: {{ $json.criticalIssues }}",
    "tone": "professional",
    "length": "medium"
  }
}
```

### Node 8: Save to Database/Notion
```json
{
  "url": "={{ $json.url }}",
  "score": "={{ $json.seoScore }}",
  "grade": "={{ $json.grade }}",
  "analysis": "={{ $json.fullAnalysis }}",
  "actionPlan": "={{ $json.improvementPlan }}",
  "analyzedAt": "={{ $json.timestamp }}"
}
```

---

## 🎨 Advanced Patterns

### Pattern 1: Continuous Monitoring

**Schedule Trigger** → Daily at 9 AM
```
1. Fetch all pages
2. Loop through each
3. Analyze with Claude
4. Compare with previous scores
5. Alert on regressions
6. Generate weekly report
```

### Pattern 2: Competitor Comparison

```
1. Fetch competitor pages
2. Extract their keywords
3. Claude analysis: "Compare our SEO vs competitor"
4. Generate competitive insights
5. Create action items
```

### Pattern 3: Content Optimization Pipeline

```
1. Draft content (CMS/Notion)
2. Claude SEO preview
3. If score < 70: Suggest improvements
4. Human review
5. Implement changes
6. Re-analyze
7. Publish when optimal
```

---

## 📊 Sample Claude API Requests

### 1. Full Page SEO Analysis

**Request**:
```bash
curl -X POST http://localhost:3000/api/claude/seo \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://theprofitplatform.com.au",
    "content": "Your page content here...",
    "keywords": ["automation", "consulting", "vps"]
  }'
```

**Response**:
```json
{
  "success": true,
  "analysis": "# SEO Analysis Report\n\n## Overall Score: 72/100 (B)\n\n### Critical Issues:\n- CRITICAL: Missing H1 tag\n- CRITICAL: Meta description too short (98 chars)\n\n### Warnings:\n- Title tag could be more compelling\n- Low keyword density for 'automation'\n\n### Quick Wins:\n• Add H1 with primary keyword\n• Extend meta description to 150-160 chars\n• Add 2-3 internal links\n\n### Recommendations:\n1. Optimize title tag: Include 'automation' earlier\n2. Add structured data (Schema.org)\n3. Improve image alt texts (3 missing)\n4. Add FAQ section for featured snippets",
  "keywords": ["automation", "consulting", "vps"],
  "url": "https://theprofitplatform.com.au"
}
```

### 2. Keyword Suggestion

**Request**:
```bash
curl -X POST http://localhost:3000/api/claude/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "keyword list",
    "topic": "VPS automation consulting",
    "length": "short"
  }'
```

### 3. Content Gap Analysis

**Request**:
```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze content gaps: We have pages about VPS, automation, n8n. Competitors cover: Docker, CI/CD, monitoring. What should we create?"
  }'
```

---

## 🔧 Testing Your Integration

### Test 1: Single Page Analysis

**Manual trigger with test data**:
```json
{
  "targetUrl": "https://theprofitplatform.com.au",
  "targetKeywords": ["automation", "consulting"]
}
```

### Test 2: Batch Analysis

**Loop through pages**:
```javascript
const pages = [
  "https://theprofitplatform.com.au",
  "https://theprofitplatform.com.au/services",
  "https://theprofitplatform.com.au/blog"
];

// Split in Batches node → 1 at a time
// Delay 5s between requests
```

---

## 📈 Expected Results

### Before Claude Integration:
- Manual SEO reviews
- Generic recommendations
- No AI insights
- Time-consuming analysis

### After Claude Integration:
- ✅ Automated intelligent analysis
- ✅ Specific, actionable recommendations
- ✅ Continuous monitoring
- ✅ Competitive insights
- ✅ Content gap identification
- ✅ $0 cost (FREE Claude Code API!)

---

## 🎯 Quick Start (5 Minutes)

1. **Open workflow**: https://n8n.theprofitplatform.com.au
2. **Add HTTP Request node** after data collection
3. **Configure**:
   - URL: `http://localhost:3000/api/claude/seo`
   - Method: POST
   - Body: `{"url": "{{ $json.pageUrl }}", "content": "{{ $json.content }}"}`
4. **Add Set node** to extract insights
5. **Test** with a sample page
6. **Activate** workflow

---

## 🔍 Monitoring & Optimization

### View Claude API Logs:
```bash
sudo tail -f /opt/claude-code-api/logs/output.log
```

### Check API Health:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/status
```

### Monitor Performance:
```bash
# API uptime
sudo systemctl status claude-code-api

# Memory usage
curl http://localhost:3000/status | jq '.server.memory'
```

---

## 💡 Pro Tips

1. **Cache Results**: Store analysis in n8n memory/database to avoid re-analyzing same content
2. **Rate Limiting**: Add 3-5s delays between requests for stability
3. **Error Handling**: Always check `$json.success` before processing
4. **Batch Processing**: Use "Split in Batches" for multiple pages
5. **Alerting**: Set up Slack/email for scores below threshold
6. **Scheduling**: Run daily/weekly for continuous monitoring

---

## 📚 Additional Resources

- **API Documentation**: `/home/avi/projects/astro-site/tests/n8n-qa/claude-code-api/`
- **Test Results**: `TEST_RESULTS.md`
- **n8n Templates**: `n8n-templates/README.md`
- **Claude API Logs**: `/opt/claude-code-api/logs/output.log`

---

## 🎉 Summary

**You now have**:
- ✅ FREE Claude Sonnet 4.5 API running on VPS
- ✅ SEO analysis endpoint at `http://localhost:3000/api/claude/seo`
- ✅ Complete integration guide for n8n
- ✅ Example workflows and configurations
- ✅ Monitoring and optimization tips

**Next Steps**:
1. Open your SEO workflow in n8n
2. Add the HTTP Request node as shown above
3. Test with a sample URL
4. Watch Claude analyze your SEO instantly!

---

**Cost**: $0 (100% FREE)
**Setup Time**: 5 minutes
**Value**: PRICELESS 🚀
