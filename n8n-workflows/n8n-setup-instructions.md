# Tool Improvement Agent - n8n Workflow Setup

## Prerequisites

1. **n8n installed** on your VPS (or use n8n cloud)
2. **Gmail OAuth2 credentials** configured in n8n

## Installation Steps

### 1. Install n8n (if not already installed)

```bash
# Via npm (recommended for VPS)
ssh tpp-vps
npm install -g n8n

# Or via Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Start n8n

```bash
# If installed via npm
n8n start

# Or with PM2 (persistent)
pm2 start n8n --name n8n-server
pm2 save
```

Access n8n at: `http://your-vps-ip:5678`

### 3. Configure Gmail OAuth2

1. Go to n8n: `http://your-vps-ip:5678`
2. Click **Credentials** → **+ Add Credential**
3. Select **Gmail OAuth2**
4. Follow the OAuth setup:
   - Go to https://console.cloud.google.com
   - Create/Select project
   - Enable Gmail API
   - Create OAuth2 credentials
   - Add authorized redirect URI: `http://your-vps-ip:5678/rest/oauth2-credential/callback`
   - Copy Client ID and Client Secret to n8n
   - Click "Connect my account" and authorize

### 4. Import Workflow

1. In n8n, click **Workflows** → **+ Add Workflow**
2. Click the **⋮** menu → **Import from File**
3. Upload: `tool-improvement-agent-workflow.json`
4. The workflow will be imported with all nodes

### 5. Configure Environment Variables (Optional)

If you want to override the default email:

```bash
# Add to n8n environment
export EMAIL_TO="your-email@example.com"
```

Or set directly in the "Send Gmail" node parameters.

### 6. Activate Workflow

1. Open the imported workflow
2. Click **Active** toggle in top-right
3. The workflow will now run every 30 minutes

## Workflow Overview

### Nodes:

1. **Every 30 Minutes** - Schedule trigger (runs every 30 min)
2. **Rotate Tools** - Cycles through tools array, tracks state
3. **Read Tool File** - Reads `.astro` file from filesystem
4. **Analyze Tool** - Analyzes content, calculates scores, generates improvements
5. **Has Improvements?** - Filters out tools with no improvements
6. **Generate Email HTML** - Creates beautiful HTML email
7. **Send Gmail** - Sends email via Gmail OAuth2
8. **Log Skip** - Logs skipped tools (no file/no improvements)

### Features:

✅ **Automatic Tool Rotation** - Cycles through 7 tools
✅ **Persistent State** - Tracks cycle count across executions
✅ **Smart Analysis** - Calculates completeness & user value scores
✅ **Comprehensive Suggestions** - 4 types of improvements with details
✅ **Professional Emails** - HTML formatted with progress bars, code examples
✅ **Error Handling** - Continues even if file doesn't exist
✅ **ROI Calculations** - Provides estimated time and ROI for each improvement

## Manual Testing

1. In n8n workflow editor, click **Execute Workflow**
2. Check execution log for results
3. Verify email was sent

## Monitoring

View workflow executions:
1. Click **Executions** tab
2. See success/failure status
3. Debug any issues

## Customization

### Change Schedule

Edit "Every 30 Minutes" node:
- Change interval (e.g., 1 hour, daily)
- Add specific times

### Add More Tools

Edit "Rotate Tools" node → Modify `tools` array:
```javascript
const tools = [
  'rank-tracker',
  'your-new-tool',
  // ... add more
];
```

### Customize Email

Edit "Generate Email HTML" node:
- Modify HTML template
- Change colors, styles
- Add/remove sections

### Use Different Email Service

Replace "Send Gmail" node with:
- Send Email (SMTP)
- SendGrid
- Mailgun
- Any other email node

## Advantages over Node.js Script

✅ **Visual Editor** - See workflow flow visually
✅ **Built-in Scheduling** - No need for cron/PM2
✅ **Easy Debugging** - View execution data for each node
✅ **No Code Deploy** - Import JSON, activate
✅ **Monitoring Dashboard** - See all executions, errors
✅ **Easy Modifications** - Change without editing code
✅ **Error Handling** - Built-in retry, error routing
✅ **Integrations** - Easy to add Slack, Discord, webhooks

## Troubleshooting

### Workflow not executing?
- Check "Active" toggle is ON
- Verify schedule trigger is enabled
- Check n8n service is running: `pm2 status`

### Email not sending?
- Verify Gmail OAuth2 credentials are connected
- Check execution log for errors
- Test Gmail credentials separately

### File not found errors?
- Check file paths in "Read Tool File" node
- Verify tools exist at: `/home/avi/projects/astro-site/src/pages/tools/`
- Create test tool files if needed

### No improvements found?
- Normal behavior if tool is complete
- Check tool file content includes mock data
- Review "Analyze Tool" node logic

## Stopping the Agent

1. Open workflow
2. Toggle **Active** to OFF
3. Or stop n8n entirely: `pm2 stop n8n-server`

## Next Steps

1. Monitor first few executions
2. Adjust tool list as needed
3. Customize email template
4. Add more improvement checks
5. Integrate with Slack/Discord notifications
6. Create dashboard to view all improvements

## Support

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Workflow repository: `/home/avi/projects/astro-site/n8n-workflows/`
