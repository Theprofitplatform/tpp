# n8n Integration Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### Step 1: Verify Backend is Running
```bash
curl -X GET "http://14.202.179.32:4321/api/automation/status" \
  -H "x-api-key: automation-key-2025"
```

**Expected Response:**
```json
{"success":true,"status":"operational","runningWorkflows":[],"recentLogs":[],"timestamp":"..."}
```

### Step 2: Set Up n8n Credentials

1. Go to n8n: https://n8n.theprofitplatform.com.au/
2. Navigate to **Settings** → **Credentials**
3. Click **Add Credential** → Select **HTTP Header Auth**
4. Configure:
   - **Name**: `VPS-Automation-API` (no spaces!)
   - **Header Name**: `x-api-key`
   - **Header Value**: `automation-key-2025`
5. Save

### Step 3: Configure Discord Webhook (Optional but Recommended)

1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential** → Select **Discord Webhook**
3. Configure:
   - **Name**: `Blog-Bot-Webhook` (no spaces!)
   - **Webhook URL**: `https://discord.com/api/webhooks/1424580081195683890/TJMeZ_R3BZGA2VoAawVu2Xg-AGFgkvBpKACjFHqwT50aHT7fagHmKqOFZ3-88zjViBLS`
4. Save

### Step 4: Import Workflows

#### Option A: Manual Blog Automation
1. Copy the JSON from [`n8n-workflow-templates.md`](./n8n-workflow-templates.md) → Section 1
2. In n8n, click **Import from JSON**
3. Paste and import
4. Open the workflow
5. Click on "Trigger Blog Automation" node
6. Set **Authentication** to `VPS-Automation-API`
7. Click on "Success Notification" and "Error Notification" nodes
8. Set **Webhook** to `Blog-Bot-Webhook`
9. Save and activate workflow

#### Option B: Health Check Monitor
1. Copy the JSON from [`n8n-workflow-templates.md`](./n8n-workflow-templates.md) → Section 2
2. Import and configure as above
3. Adjust schedule trigger if needed (default: every hour)

#### Option C: Blog Staging Workflow
1. Copy the JSON from [`n8n-workflow-templates.md`](./n8n-workflow-templates.md) → Section 3
2. Import and configure as above
3. Use for testing before full deployment

### Step 5: Test Your Setup

1. Open the "Manual Blog Automation Trigger" workflow
2. Click **Execute Workflow**
3. Check:
   - ✅ Node execution should show success
   - ✅ Discord should receive notification
   - ✅ Backend logs should show trigger

## API Endpoints Quick Reference

| Endpoint | Method | Description | API Key Required |
|----------|--------|-------------|------------------|
| `/api/automation/status` | GET | Get automation status | ✅ |
| `/api/automation/blog-automation` | POST | Trigger full blog automation | ✅ |
| `/api/automation/blog-staging` | POST | Trigger staging only | ✅ |
| `/api/automation/health-check` | POST | Trigger health check | ✅ |

**Base URL**: `http://localhost:4321`
**API Key Header**: `x-api-key: automation-key-2025`

## Request Body Parameters

### Blog Automation
```json
{
  "force": false,              // Force execution even if already running
  "topicId": null,             // Specific topic ID (null for auto-select)
  "timeout": 7200000,          // Execution timeout (2 hours)
  "enableGitCommit": true,     // Enable git commits
  "enableDeployment": true     // Enable Cloudflare deployment
}
```

### Blog Staging
```json
{
  "force": false,              // Force execution even if already running
  "topicId": null,             // Specific topic ID (null for auto-select)
  "timeout": 3600000           // Execution timeout (1 hour)
}
```

## Common Issues & Quick Fixes

### Issue: "Invalid or missing API key"
**Fix**: Check that the API key in n8n credential matches `automation-key-2025`

### Issue: "Connection refused"
**Fix**: Verify backend is running:
```bash
curl http://14.202.179.32:4321/health
```

### Issue: "Too many requests"
**Fix**: Rate limit is 10 requests per 5 minutes. Wait before retrying.

### Issue: Discord notifications not working
**Fix**:
1. Test webhook URL directly:
```bash
curl -X POST "https://discord.com/api/webhooks/1424580081195683890/TJMeZ_R3BZGA2VoAawVu2Xg-AGFgkvBpKACjFHqwT50aHT7fagHmKqOFZ3-88zjViBLS" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test notification"}'
```
2. Update webhook URL in Discord if expired

## Testing API Directly (Without n8n)

### Test Status Endpoint
```bash
curl -X GET "http://14.202.179.32:4321/api/automation/status" \
  -H "x-api-key: automation-key-2025"
```

### Trigger Blog Automation
```bash
curl -X POST "http://14.202.179.32:4321/api/automation/blog-automation" \
  -H "x-api-key: automation-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "force": false,
    "enableGitCommit": true,
    "enableDeployment": true
  }'
```

### Trigger Staging Only
```bash
curl -X POST "http://14.202.179.32:4321/api/automation/blog-staging" \
  -H "x-api-key: automation-key-2025" \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

## Next Steps

Once you've got the basics working:

1. **Schedule Regular Posts**: Use the Schedule Trigger node in n8n
2. **Add Monitoring**: Set up health check monitoring
3. **Customize Notifications**: Add more Discord channels or other notification services
4. **Error Handling**: Add error handling workflows for failed automation

## Full Documentation

For detailed information, see:
- [`n8n-integration-guide.md`](./n8n-integration-guide.md) - Complete integration guide
- [`n8n-workflow-templates.md`](./n8n-workflow-templates.md) - Full JSON workflow templates

## Security Notes

- **API Keys**: Never commit API keys to version control
- **Rate Limiting**: Respect the 10 requests per 5 minutes limit
- **Firewall**: Ensure port 4321 is accessible from n8n
- **HTTPS**: Consider adding HTTPS in production

## Support

If you encounter issues:
1. Check backend logs: `tail -f backend/server.log`
2. Check n8n execution logs in the workflow interface
3. Test API endpoints directly with curl
4. Review the troubleshooting section in [`n8n-integration-guide.md`](./n8n-integration-guide.md)

---

**Ready to automate?** Start with the Manual Blog Automation workflow and test it out!
