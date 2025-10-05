# Fix: SEO Workflow Database Constraint Error

## 🐛 Problem

**Error:**
```
Problem in node 'Store Analysis in DB'
null value in column "content_id" of relation "seo_analysis" violates not-null constraint
```

## 🔍 Root Cause

The workflow has two execution paths:
1. **Score >= 80:** Direct path (no optimization)
2. **Score < 80:** Optimization path (goes through Claude optimization)

When the optimization path is taken, the data flows through the "Merge Optimized Data" node, which references `$('Score < 80?').item.json.content_id`. However, this reference fails because:

- The IF node splits into two outputs
- The "true" branch (score < 80) doesn't preserve the content_id in the correct format
- The database node receives null for content_id

## ✅ Solution

### Option 1: Fix the Merge Node (Recommended)

Update the "Merge Optimized Data" node to properly reference the content_id:

**Current (broken):**
```json
{
  "id": "merged_data",
  "name": "content_id",
  "value": "={{ $('Score < 80?').item.json.content_id }}",
  "type": "string"
}
```

**Fixed:**
```json
{
  "id": "merged_data",
  "name": "content_id",
  "value": "={{ $('Compile SEO Report & Score').item.json.content_id }}",
  "type": "string"
}
```

### Option 2: Use Code Node Before Database

Add a Code node before "Store Analysis in DB" to ensure content_id is always present:

```javascript
// Ensure content_id is always available
const data = $input.item.json;

// Try to get content_id from multiple sources
const content_id = data.content_id ||
                   $('Compile SEO Report & Score').item.json.content_id ||
                   $('Validate & Parse Input').item.json.content_id ||
                   'unknown-' + Date.now();

return {
  ...data,
  content_id: content_id,
  seo_score: data.seo_score || 0,
  analysis_data: data,
  created_at: data.timestamp || new Date().toISOString()
};
```

### Option 3: Make content_id Nullable in Database

If you don't need content_id to be mandatory:

```sql
ALTER TABLE seo_analysis
ALTER COLUMN content_id DROP NOT NULL;
```

### Option 4: Set Default Value in Database

```sql
ALTER TABLE seo_analysis
ALTER COLUMN content_id SET DEFAULT 'auto-' || extract(epoch from now())::text;
```

## 🔧 Implementation Steps

### Step 1: Open the Workflow

1. Visit: https://n8n.theprofitplatform.com.au/workflow/fefa4ab2-72c7-4485-8356-e0eb7fd6a049
2. Find the "Merge Optimized Data" node
3. Edit the node

### Step 2: Update the Assignment

In the "Merge Optimized Data" node, update the `content_id` assignment:

**Change from:**
```
{{ $('Score < 80?').item.json.content_id }}
```

**Change to:**
```
{{ $('Compile SEO Report & Score').item.json.content_id }}
```

### Step 3: Add Fallback Code Node (Optional but Recommended)

Between "Merge Optimized Data" and "Store Analysis in DB":

1. Add a Code node named "Ensure Valid Data"
2. Use this code:

```javascript
const data = $input.item.json;

// Get content_id from the most reliable source
const content_id = data.content_id ||
                   $('Compile SEO Report & Score').item.json.content_id ||
                   'seo-' + Date.now();

// Ensure all required fields are present
return {
  content_id: content_id,
  seo_score: data.seo_score || 0,
  analysis_data: JSON.stringify({
    ...data,
    content_id: content_id
  }),
  created_at: data.timestamp || new Date().toISOString()
};
```

### Step 4: Update Database Node Mapping

In "Store Analysis in DB" node, ensure mappings are correct:

```json
{
  "content_id": "={{ $json.content_id }}",
  "seo_score": "={{ $json.seo_score }}",
  "analysis_data": "={{ $json.analysis_data }}",
  "created_at": "={{ $json.created_at }}"
}
```

### Step 5: Save and Test

1. Click **Save**
2. Toggle **Active** ON
3. Test with curl:

```bash
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "test-fix-001",
    "title": "Test Title",
    "content": "Test content for SEO analysis",
    "keywords": ["test"],
    "target_location": "Australia"
  }'
```

## 🧪 Verification

### Test Case 1: High Score (No Optimization)
```bash
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "high-score-test",
    "title": "SEO Optimized Title with Keywords Australia Sydney 2025",
    "content": "Comprehensive content with excellent keyword density and structure. This content includes multiple relevant keywords for Australian businesses. Local SEO optimization with Sydney, Melbourne, Brisbane locations. Digital marketing strategies for small business growth.",
    "keywords": ["SEO", "Australia", "digital marketing"],
    "target_location": "Australia"
  }'
```

**Expected:** Score >= 80, skip optimization, store directly in DB

### Test Case 2: Low Score (With Optimization)
```bash
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "low-score-test",
    "title": "Short",
    "content": "Brief content.",
    "keywords": ["test"],
    "target_location": "Australia"
  }'
```

**Expected:** Score < 80, run optimization, merge data, store in DB

## 📊 Database Schema Reference

```sql
CREATE TABLE IF NOT EXISTS seo_analysis (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL,  -- This is the problematic field
    seo_score INTEGER,
    analysis_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Add index for better query performance
CREATE INDEX idx_seo_analysis_content_id ON seo_analysis(content_id);
CREATE INDEX idx_seo_analysis_created_at ON seo_analysis(created_at);
```

## 🔍 Debugging Tips

### Check Current Data Flow

Add a "Set" node after "Compile SEO Report & Score" to inspect data:

```javascript
// Debug node
return {
  debug_content_id: $json.content_id,
  debug_score: $json.seo_score,
  debug_full_data: $json
};
```

### Check Database Logs

```bash
# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Or check n8n execution logs
# Go to: https://n8n.theprofitplatform.com.au/executions
# Click on failed execution
# View detailed error logs
```

### Test Without Database

Temporarily disable the database node:

1. Disconnect "Store Analysis in DB" from the flow
2. Test the webhook
3. Check if the response is correct
4. Reconnect and fix the mapping

## 📝 Alternative: Simplified Database Storage

If the issue persists, simplify the database storage approach:

### Create a dedicated Code node before database:

```javascript
// Prepare data for database storage
const input = $('Validate & Parse Input').item.json;
const report = $('Compile SEO Report & Score').item.json;
const optimized = $input.item.json.optimized_content || null;

return {
  content_id: input.content_id,
  seo_score: report.seo_score,
  analysis_data: JSON.stringify({
    original_content: report.original_content,
    analysis: report.analysis,
    recommendations: report.recommendations,
    optimized_content: optimized,
    timestamp: report.timestamp
  }),
  created_at: new Date().toISOString()
};
```

## ✅ Quick Fix (Immediate)

**If you need a quick fix right now:**

1. Open workflow in n8n UI
2. Go to "Store Analysis in DB" node
3. Change the content_id mapping to:
   ```
   {{ $('Validate & Parse Input').item.json.content_id }}
   ```
4. Save and activate

This pulls content_id from the original input, which is always available in both paths.

## 🎯 Best Practice Fix (Recommended)

Add a new Code node called "Prepare Database Insert" before "Store Analysis in DB":

```javascript
// Get data from previous nodes reliably
const input = $('Validate & Parse Input').item.json;
const report = $('Compile SEO Report & Score').item.json;
const currentData = $input.item.json;

// Build complete record
const record = {
  content_id: input.content_id,
  seo_score: report.seo_score || currentData.seo_score || 0,
  analysis_data: currentData.optimized_content ? {
    ...report,
    optimized_content: currentData.optimized_content
  } : report,
  created_at: report.timestamp || new Date().toISOString()
};

return record;
```

Then in "Store Analysis in DB", use simple mappings:
- content_id: `{{ $json.content_id }}`
- seo_score: `{{ $json.seo_score }}`
- analysis_data: `{{ $json.analysis_data }}`
- created_at: `{{ $json.created_at }}`

## 📞 Support

If the issue persists after trying these fixes:

1. Check n8n execution logs: https://n8n.theprofitplatform.com.au/executions
2. Verify PostgreSQL is running: `sudo systemctl status postgresql`
3. Check database connection in n8n credentials
4. Review database table exists: Log into n8n DB and run `\d seo_analysis`

---

**Status:** Fix ready to implement
**Estimated Time:** 5 minutes
**Risk Level:** Low (non-breaking change)
