# n8n Integration Guide for VPS Blog Automation

## Overview

This guide provides step-by-step instructions for integrating n8n with your VPS blog automation system. The integration allows you to manually trigger blog automation workflows, monitor system health, and receive notifications through n8n.

## What We've Built

✅ **Complete API Backend** - Automation endpoints with security
✅ **Authentication System** - API key-based authentication
✅ **Rate Limiting** - Protection against abuse
✅ **n8n Workflow Templates** - Ready-to-use JSON templates
✅ **Discord Integration** - Real-time notifications

## Step-by-Step Implementation

### Step 1: Verify Backend Setup

Your backend server should already be running with these new endpoints:

```bash
# Check if backend is running
curl -X GET "http://localhost:4321/api/automation/status" -H "x-api-key: automation-key-2025"
```

**Expected Response:**
```json
{
  "success": true,
  "status": "operational",
  "runningWorkflows": [],
  "recentLogs": [],
  "timestamp": "2025-10-09T12:03:33.335Z"
}
```

### Step 2: Configure n8n Credentials

#### 2.1 HTTP Header Authentication

1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Select **HTTP Header Auth**
4. Configure:
   - **Name**: `VPS-Automation-API` (⚠️ No spaces allowed!)
   - **Headers**:
     ```
     x-api-key: automation-key-2025
     ```

#### 2.2 Discord Webhook

1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Select **Discord Webhook**
4. Configure:
   - **Name**: `Blog-Bot-Webhook` (⚠️ No spaces allowed!)
   - **Webhook URL**: `https://discord.com/api/webhooks/1424580081195683890/TJMeZ_R3BZGA2VoAawVu2Xg-AGFgkvBpKACjFHqwT50aHT7fagHmKqOFZ3-88zjViBLS`

### Step 3: Import n8n Workflows

#### 3.1 Manual Blog Automation Trigger

1. Copy the JSON template from `automation/docs/n8n-workflow-templates.md`
2. In n8n, click **Import from JSON**
3. Paste the template (URL is already set to `http://localhost:4321`)
4. Update the HTTP Request node:
   - **Authentication**: Select your `VPS-Automation-API` credential
   - **Body**: Adjust parameters as needed

#### 3.2 Health Check Monitor

1. Import the health check workflow template (URL already configured)
2. Configure the schedule trigger (default: every hour)
3. Connect Discord notifications

#### 3.3 Blog Staging Workflow

1. Import the staging workflow template (URL already configured)
2. Configure manual trigger settings

### Step 4: Test the Integration

#### 4.1 Test Manual Trigger

1. Activate the "Manual Blog Automation Trigger" workflow
2. Click **Execute Workflow**
3. Check the execution logs
4. Verify Discord notification received

#### 4.2 Test Health Check

1. Activate the "VPS Health Check Monitor" workflow
2. Wait for the scheduled execution
3. Check Discord for status notifications

### Step 5: Production Deployment

#### 5.1 Server URL Configuration

The workflow templates use localhost since n8n runs on the same VPS:
- **URL**: `http://localhost:4321`
- **Access**: Local access only (same VPS)
- **Port**: 4321 (backend API port)
- **Status**: ✅ **All endpoints now working**
- **Alternative**: You can also use external IP or domain routing if configured

#### 5.2 Environment Variables

Ensure these environment variables are set in production:

```bash
# Backend .env file
AUTOMATION_API_KEYS=automation-key-2025,blog-bot-key-2025,n8n-integration-key
PORT=4321
NODE_ENV=production
```

#### 5.3 Security Considerations

- Rotate API keys regularly
- Use HTTPS for all API calls
- Monitor rate limiting logs
- Keep n8n instance secure

## API Endpoints Reference

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/automation/blog-automation` | POST | Trigger full blog automation |
| `/api/automation/blog-staging` | POST | Trigger blog staging only |
| `/api/automation/health-check` | POST | Trigger health check |
| `/api/automation/status` | GET | Get automation status |

### Authentication

All endpoints require the `x-api-key` header:
```
x-api-key: automation-key-2025
```

### Request Examples

#### Trigger Blog Automation
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

#### Get Status
```bash
curl -X GET "http://14.202.179.32:4321/api/automation/status" \
  -H "x-api-key: automation-key-2025"
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failed
```json
{"success":false,"error":"Invalid or missing API key"}
```
**Solution**: Check that the API key in n8n matches `AUTOMATION_API_KEYS` in backend `.env`

#### 2. Connection Refused
```
Error: connect ECONNREFUSED
```
**Solution**: Verify backend server is running on port 4321

#### 3. Rate Limit Exceeded
```json
{"success":false,"error":"Too many automation requests"}
```
**Solution**: Wait 5 minutes or adjust rate limit settings

#### 4. Discord Notifications Not Working
**Solution**:
- Check Discord webhook URL in n8n credentials
- Verify webhook is active in Discord server settings
- Test webhook with simple message

### Debug Steps

1. **Check Backend Logs**:
   ```bash
   # View backend server logs
   tail -f backend/server.log
   ```

2. **Test API Directly**:
   ```bash
   curl -X GET "http://14.202.179.32:4321/api/automation/status" -H "x-api-key: automation-key-2025"
   ```

3. **Check n8n Execution Logs**:
   - Go to n8n workflow executions
   - Check individual node outputs
   - Verify HTTP response codes

4. **Verify Environment Variables**:
   ```bash
   # Check backend .env
   cat backend/.env | grep AUTOMATION_API_KEYS
   ```

## Advanced Configuration

### Custom API Keys

To add custom API keys, edit `backend/.env`:
```bash
AUTOMATION_API_KEYS=your-custom-key,another-key,automation-key-2025
```

### Rate Limiting Adjustment

Modify in `backend/server.js`:
```javascript
const automationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Increase limit
  message: { success: false, error: 'Too many requests' }
});
```

### Custom Workflow Parameters

Available parameters for blog automation:
- `force` (boolean): Force execution even if running
- `topicId` (string): Specific topic ID to process
- `timeout` (number): Execution timeout in milliseconds
- `enableGitCommit` (boolean): Enable git commits
- `enableDeployment` (boolean): Enable Cloudflare deployment

## Monitoring and Maintenance

### Regular Checks

1. **Backend Health**: Use health check workflow
2. **API Usage**: Monitor rate limiting
3. **Discord Notifications**: Ensure webhook is active
4. **Server Resources**: Monitor disk space and memory

### Backup and Recovery

1. **Export n8n Workflows**: Regularly export workflow JSON
2. **Backup API Keys**: Keep secure copies of API keys
3. **Documentation**: Update this guide with changes

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review backend server logs
3. Test API endpoints directly
4. Check n8n execution details

## Next Steps

After successful integration:

1. **Automate Regular Posts**: Set up scheduled blog generation
2. **Add Monitoring**: Create alerts for system failures
3. **Expand Workflows**: Add more automation triggers
4. **Security Review**: Regular security audits

---

**Congratulations!** You now have a fully integrated n8n workflow system for your VPS blog automation. The system provides manual triggers, health monitoring, and real-time notifications through Discord.