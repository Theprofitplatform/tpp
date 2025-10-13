# 🎯 n8n Webhook Setup Guide - Step-by-Step in UI

Complete guide to building your blog automation webhook in the n8n UI.

---

## 📋 Part 1: Create Simple Test Webhook (5 minutes)

This confirms webhooks work before building the full automation.

### Step 1: Create New Workflow

1. **Go to**: https://n8n.theprofitplatform.com.au
2. **Click**: `+ New workflow` (top right, or in sidebar)
3. **Name it**: `Simple Test Webhook` (click workflow name at top to rename)

### Step 2: Add Webhook Trigger

1. **Click**: The `+` button on the canvas (or click "Add first step")
2. **Search**: Type `webhook`
3. **Select**: `Webhook` (under "Trigger" section)

### Step 3: Configure Webhook Trigger

In the Webhook node settings panel (right side):

**HTTP Method**:
- Select: `POST`

**Path**:
- Enter: `test-simple`

**Authentication**:
- Select: `None`

**Response Mode**:
- Select: `Last Node`

**Click**: `Execute Node` (to test it once)

**Note the URL shown**: It will be something like:
```
Production: https://n8n.theprofitplatform.com.au/webhook/test-simple
Test: https://n8n.theprofitplatform.com.au/webhook-test/test-simple
```

### Step 4: Add Response Node

1. **Click**: The `+` on the connection line coming from Webhook
2. **Search**: Type `respond to webhook`
3. **Select**: `Respond to Webhook`

### Step 5: Configure Response Node

In the Respond to Webhook node:

**Respond With**:
- Select: `All Incoming Items`

That's it! Very simple.

### Step 6: Save and Activate

1. **Click**: `Save` button (top right)
2. **Toggle**: The switch next to workflow name (should turn blue/green)
   - This activates the workflow
3. **Verify**: Status shows "Active"

### Step 7: Test It!

Open your terminal and run:

```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/test-simple \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "Hello n8n!"}'
```

**Expected Response**:
```json
{
  "test": true,
  "message": "Hello n8n!",
  "headers": {...},
  "params": {},
  "query": {},
  "body": {...}
}
```

**✅ Success!** Your webhook is working!

---

## 📋 Part 2: Build Blog Automation Webhook (15 minutes)

Now that webhooks work, let's build the full blog automation.

### Step 1: Create New Workflow

1. **Go to**: https://n8n.theprofitplatform.com.au
2. **Click**: `+ New workflow`
3. **Name it**: `Blog Automation Trigger`

### Step 2: Add Webhook Trigger

1. **Click**: `+` to add first node
2. **Select**: `Webhook`
3. **Configure**:
   - HTTP Method: `POST`
   - Path: `blog-trigger`
   - Authentication: `None`
   - Response Mode: `Last Node`

### Step 3: Add Code Node (to Process Data)

1. **Click**: `+` after Webhook node
2. **Search**: `Code`
3. **Select**: `Code`
4. **Configure**:

**Mode**: `Run Once for All Items`

**Language**: `JavaScript`

**Code**:
```javascript
// Extract webhook data
const webhookData = $input.first().json;

// Get parameters or use defaults
const force = webhookData.body?.force || false;
const enableGitCommit = webhookData.body?.enableGitCommit !== false;
const enableDeployment = webhookData.body?.enableDeployment !== false;

// Return processed data for next nodes
return {
  json: {
    force: force,
    enableGitCommit: enableGitCommit,
    enableDeployment: enableDeployment,
    timestamp: new Date().toISOString(),
    triggeredBy: 'webhook'
  }
};
```

### Step 4: Add HTTP Request Node (Call Blog API)

**Option A: If you have the blog automation API running:**

1. **Click**: `+` after Code node
2. **Select**: `HTTP Request`
3. **Configure**:
   - Method: `POST`
   - URL: `http://127.0.0.1:4321/api/automation/blog-automation`
   - Authentication: `None`
   - Send Body: `Yes`
   - Body Content Type: `JSON`
   - Specify Body: `Using Fields Below`
   - Add these fields:
     - `force` → `{{ $json.force }}`
     - `enableGitCommit` → `{{ $json.enableGitCommit }}`
     - `enableDeployment` → `{{ $json.enableDeployment }}`

**Option B: If API doesn't exist yet (simulate for testing):**

1. **Click**: `+` after Code node
2. **Select**: `Code` (another code node)
3. **Configure**:

```javascript
// Simulate blog automation response
return {
  json: {
    success: true,
    message: 'Blog automation completed',
    workflow: 'blog-automation',
    timestamp: new Date().toISOString(),
    post: {
      title: 'Test Blog Post',
      status: 'published'
    }
  }
};
```

### Step 5: Add IF Node (Check Success)

1. **Click**: `+` after HTTP Request / Code node
2. **Select**: `IF`
3. **Configure**:
   - Condition Type: `Boolean`
   - Value 1: `{{ $json.success }}`
   - Operation: `Is Equal`
   - Value 2: `true` (type the word true)

### Step 6: Add Discord Success Notification

1. **Click**: `+` on the **TRUE** output of IF node
2. **Select**: `Discord`
3. **Configure**:

**Webhook URL**:
```
https://discord.com/api/webhooks/1424580081195683890/TJMeZ_R3BZGA2VoAawVu2Xg-AGFgkvBpKACjFHqwT50aHT7fagHmKqOFZ3-88zjViBLS
```

**Text**:
```
✅ **Blog Automation Successful!**

📋 Workflow: {{ $json.workflow }}
⏰ Timestamp: {{ $json.timestamp }}
📝 Message: {{ $json.message }}

🎉 Automation completed successfully!
```

### Step 7: Add Discord Error Notification

1. **Click**: `+` on the **FALSE** output of IF node
2. **Select**: `Discord`
3. **Configure**:

**Webhook URL**: (same as above)
```
https://discord.com/api/webhooks/1424580081195683890/TJMeZ_R3BZGA2VoAawVu2Xg-AGFgkvBpKACjFHqwT50aHT7fagHmKqOFZ3-88zjViBLS
```

**Text**:
```
❌ **Blog Automation Failed!**

📋 Workflow: {{ $json.workflow || 'Unknown' }}
⏰ Timestamp: {{ $json.timestamp }}
⚠️ Error: {{ $json.error || $json.message }}

🔧 Please check the automation logs.
```

### Step 8: Add Respond to Webhook Node

1. **Click**: `+` after **both** Discord nodes
2. **Select**: `Respond to Webhook`
3. **Configure**:
   - Respond With: `All Incoming Items`

**Important**: You need to connect BOTH Discord nodes to this Respond node:
- Click the dot on Success Discord → drag to Respond to Webhook
- Click the dot on Error Discord → drag to Respond to Webhook

### Step 9: Save and Activate

1. **Click**: `Save` (top right)
2. **Toggle**: Activate the workflow (switch next to name)
3. **Verify**: Shows "Active"

### Step 10: Test the Complete Workflow

```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/blog-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "force": false,
    "enableGitCommit": true,
    "enableDeployment": true
  }'
```

**Expected**:
- ✅ Workflow executes
- ✅ Discord notification appears
- ✅ Response with automation status

---

## 📊 Workflow Structure Diagram

```
┌─────────────────┐
│  Webhook        │  POST /webhook/blog-trigger
│  (Trigger)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Code Node      │  Extract & prepare parameters
│  (Process Data) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │  Call blog automation API
│  OR Code Node   │  (or simulate if API not ready)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IF Node        │  Check success === true
│  (Check Status) │
└────┬──────┬─────┘
     │      │
  TRUE│     │FALSE
     │      │
     ▼      ▼
┌─────┐  ┌─────┐
│Discord Discord│
│Success Error │
└──┬──┘  └──┬──┘
   │        │
   └───┬────┘
       ▼
┌─────────────────┐
│ Respond to      │  Return result to caller
│ Webhook         │
└─────────────────┘
```

---

## 🎯 Quick Test Checklist

After building the workflow:

- [ ] Workflow is saved
- [ ] Workflow is activated (toggle is on)
- [ ] Webhook URL is noted: `https://n8n.theprofitplatform.com.au/webhook/blog-trigger`
- [ ] Test with curl command
- [ ] Check Discord for notification
- [ ] Check n8n Executions tab for successful run
- [ ] Verify response JSON is correct

---

## 🔧 Troubleshooting Tips

### Webhook Returns 404

**Fix**: Make sure workflow is **Active** (toggle switch on)

### Workflow Doesn't Execute

**Fix**:
1. Check all nodes are connected with lines
2. Every node should have a green checkmark when valid
3. Click "Execute Workflow" in UI to test manually first

### Discord Node Fails

**Fix**:
1. Verify Discord webhook URL is correct
2. Test Discord webhook directly:
   ```bash
   curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content":"Test message"}'
   ```

### Variables Not Working ({{ $json.field }})

**Fix**:
- Use double curly braces: `{{ }}`
- Reference from previous node: `{{ $json.fieldName }}`
- For nested: `{{ $json.data.nested }}`
- Test expressions with "Test step" button

---

## 📝 Common n8n Expression Examples

```javascript
// Simple field
{{ $json.success }}

// Nested field
{{ $json.data.post.title }}

// With default value
{{ $json.title || 'No title' }}

// Timestamp
{{ $now.toISO() }}

// Format date
{{ $json.timestamp.toDateTime().toFormat('yyyy-MM-dd') }}

// Array item
{{ $json.items[0].name }}

// Join array
{{ $json.tags.join(', ') }}
```

---

## 🎉 Next Steps After Setup

Once your workflow is working:

### 1. Pull It for Version Control

```bash
# Find the workflow ID from n8n UI (in URL)
bash ~/.claude/scripts/n8n-claude.sh pull <workflow-id>

# It saves to n8n-workflows/active/
git add n8n-workflows/active/
git commit -m "Add working blog automation webhook"
```

### 2. Create Scheduled Trigger

In n8n UI:
1. Add a **Schedule Trigger** node alongside Webhook
2. Configure: Daily at specific time
3. Connect it to the same workflow path
4. Now workflow runs both on webhook AND on schedule!

### 3. Monitor Executions

- Go to: https://n8n.theprofitplatform.com.au/executions
- See all webhook calls
- Debug failed executions
- View execution logs

### 4. Create More Webhooks

Now that you know how, create webhooks for:
- Content publishing
- Social media posting
- Report generation
- Notification triggers

---

## 📞 Quick Reference

**n8n Dashboard**: https://n8n.theprofitplatform.com.au

**Your Webhook URLs**:
- Simple Test: `/webhook/test-simple`
- Blog Automation: `/webhook/blog-trigger`

**Discord Webhook**: (already in workflows)

**Test Commands**:
```bash
# Simple test
curl -X POST https://n8n.theprofitplatform.com.au/webhook/test-simple \
  -H "Content-Type: application/json" \
  -d '{"test":true}'

# Blog automation
curl -X POST https://n8n.theprofitplatform.com.au/webhook/blog-trigger \
  -H "Content-Type: application/json" \
  -d '{"force":false,"enableGitCommit":true,"enableDeployment":true}'
```

---

## ✅ Summary

**Time to Build**:
- Simple webhook: 5 minutes
- Full blog automation: 15 minutes

**What You'll Have**:
- ✅ Working webhook endpoint
- ✅ Blog automation trigger
- ✅ Discord notifications
- ✅ Error handling
- ✅ Full execution history

**Ready to start?** Follow Part 1 first, then move to Part 2! 🚀
