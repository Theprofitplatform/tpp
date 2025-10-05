# IMMEDIATE FIX: SEO Workflow Database Error

## 🚨 Problem
```
null value in column "content_id" of relation "seo_analysis" violates not-null constraint
```

## ⚡ Quick Fix Options

### Option 1: Make content_id Nullable (FASTEST - 30 seconds)

This removes the NOT NULL constraint from the database:

```bash
# Connect to PostgreSQL and run:
sudo -u postgres psql -d n8n_db -c "ALTER TABLE seo_analysis ALTER COLUMN content_id DROP NOT NULL;"
```

**Pros:**
- Immediate fix
- No workflow changes needed
- Allows workflow to continue even if content_id is missing

**Cons:**
- Data quality: Some records might not have content_id

---

### Option 2: Set Default Value (RECOMMENDED - 1 minute)

Add a default value that auto-generates when content_id is null:

```bash
# Connect to PostgreSQL and run:
sudo -u postgres psql -d n8n_db << 'EOF'
ALTER TABLE seo_analysis
ALTER COLUMN content_id SET DEFAULT 'auto-' || extract(epoch from now())::text;
EOF
```

**Pros:**
- Keeps NOT NULL constraint
- Auto-generates unique IDs
- No workflow changes needed

**Cons:**
- Generated IDs instead of user-provided ones

---

### Option 3: Fix the Workflow Mapping (BEST LONG-TERM - 2 minutes)

Update the "Store Analysis in DB" node mapping:

**In n8n UI:**

1. Open workflow: https://n8n.theprofitplatform.com.au
2. Click "Store Analysis in DB" node
3. Change the content_id mapping from:
   ```
   {{ $json.content_id }}
   ```
   To:
   ```
   {{ $('Validate & Parse Input').item.json.content_id || 'seo-' + Date.now() }}
   ```

4. Save and activate

**Pros:**
- Fixes root cause
- Uses original user-provided content_id
- Fallback to generated ID if missing

**Cons:**
- Requires manual workflow update

---

## 🎯 RECOMMENDED: 3-Step Fix (3 minutes total)

### Step 1: Temporary Database Fix (allows workflow to run)
```bash
sudo -u postgres psql -d n8n_db -c "ALTER TABLE seo_analysis ALTER COLUMN content_id DROP NOT NULL;"
```

### Step 2: Test the Workflow
```bash
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "immediate-fix-test",
    "title": "Test After Fix",
    "content": "Testing the immediate fix for database constraint",
    "keywords": ["test", "fix"],
    "target_location": "Australia"
  }'
```

### Step 3: Permanent Fix in Workflow
1. Open: https://n8n.theprofitplatform.com.au/workflow/[your-workflow-id]
2. Add a Code node before "Store Analysis in DB" named "Ensure Valid Data":

```javascript
// Get content_id from the most reliable source
const input = $('Validate & Parse Input').item.json;
const data = $input.item.json;

return {
  content_id: input.content_id || data.content_id || 'auto-' + Date.now(),
  seo_score: data.seo_score || 0,
  analysis_data: data,
  created_at: data.timestamp || new Date().toISOString()
};
```

3. Connect: `[Previous Node] → Ensure Valid Data → Store Analysis in DB`
4. Update "Store Analysis in DB" mappings to simple:
   - content_id: `{{ $json.content_id }}`
   - seo_score: `{{ $json.seo_score }}`
   - analysis_data: `{{ $json.analysis_data }}`
   - created_at: `{{ $json.created_at }}`

---

## 🔍 Debug: Check What Data is Received

Add this temporary debug node before database:

```javascript
// Debug what data we have
const data = $input.item.json;

console.log('=== DEBUG DATABASE INSERT ===');
console.log('Current data:', JSON.stringify(data, null, 2));

// Try to get content_id from various sources
const sources = {
  direct: data.content_id,
  validate_node: $('Validate & Parse Input').item.json.content_id,
  compile_node: $('Compile SEO Report & Score').item.json.content_id,
  if_node: $('Score < 80?').item.json.content_id
};

console.log('Content ID sources:', JSON.stringify(sources, null, 2));

return data;
```

Check n8n execution logs to see which source has the content_id.

---

## 🧪 Complete Test After Fix

```bash
#!/bin/bash

echo "Testing SEO Workflow Database Fix..."

# Test 1: High score (no optimization)
echo -e "\n1. Testing HIGH SCORE path (>=80)..."
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "test-high-score",
    "title": "Comprehensive SEO Guide for Australian Businesses Digital Marketing Sydney 2025",
    "content": "Extensive content with excellent keyword density, structure, and Australian relevance for local businesses in Sydney.",
    "keywords": ["SEO", "Australia", "Sydney", "digital marketing", "business"],
    "target_location": "Australia"
  }' | jq '.'

# Test 2: Low score (with optimization)
echo -e "\n2. Testing LOW SCORE path (<80)..."
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "test-low-score",
    "title": "Test",
    "content": "Short text.",
    "keywords": ["test"],
    "target_location": "Australia"
  }' | jq '.'

# Test 3: Missing content_id (should use fallback)
echo -e "\n3. Testing MISSING content_id..."
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{
    "title": "No Content ID Test",
    "content": "Testing without content_id field",
    "keywords": ["test"],
    "target_location": "Australia"
  }' | jq '.'

echo -e "\n✅ Tests complete. Check n8n execution logs for results."
```

---

## 📊 Verify Database After Fix

```bash
# Check if records were inserted
sudo -u postgres psql -d n8n_db << 'EOF'
SELECT
  id,
  content_id,
  seo_score,
  created_at
FROM seo_analysis
ORDER BY created_at DESC
LIMIT 5;
EOF
```

---

## 🎯 EXECUTE NOW (Copy & Paste)

Run this single command for immediate fix:

```bash
# Option A: Make column nullable (immediate, safest)
sudo -u postgres psql -d n8n_db -c "ALTER TABLE seo_analysis ALTER COLUMN content_id DROP NOT NULL;"

# Option B: Add default value (keeps NOT NULL)
sudo -u postgres psql -d n8n_db -c "ALTER TABLE seo_analysis ALTER COLUMN content_id SET DEFAULT 'auto-' || extract(epoch from now())::text;"

# Then test:
curl -X POST 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization' \
  -H "Content-Type: application/json" \
  -d '{"content_id":"fix-test","title":"Test","content":"Test content","keywords":["test"]}'
```

---

## 📝 Summary

**Fastest Fix (30 sec):**
```bash
sudo -u postgres psql -d n8n_db -c "ALTER TABLE seo_analysis ALTER COLUMN content_id DROP NOT NULL;"
```

**Best Fix (3 min):**
1. Run database fix above
2. Add Code node in workflow to ensure content_id
3. Update mappings to use that node

Choose based on urgency - database fix works immediately!
