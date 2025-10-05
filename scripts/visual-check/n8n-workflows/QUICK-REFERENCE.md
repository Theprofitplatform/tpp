# ⚡ Visual Monitoring - Quick Reference

## Trigger the Workflow

### Manual Trigger
```bash
curl -X POST http://localhost:5678/webhook/visual-check \
  -H "Content-Type: application/json" \
  -d '{"trigger": "manual"}'
```

### Check Last Execution
```bash
sudo PGPASSWORD=n8npassword psql -h localhost -U n8nuser -d n8n -c \
  "SELECT id, status, EXTRACT(EPOCH FROM (\"stoppedAt\" - \"startedAt\")) as duration
   FROM execution_entity WHERE \"workflowId\" = 'b557c2ca652c49338e1f7a0e028c53a7'
   ORDER BY \"startedAt\" DESC LIMIT 1;"
```

### View n8n Logs
```bash
sudo journalctl -u n8n --since "10 minutes ago" -f
```

### Test Email Script
```bash
cd /home/avi/projects/astro-site/scripts/visual-check
sudo -u root node send-test-email.cjs
```

### Restart n8n
```bash
sudo systemctl restart n8n
```

## Workflow Details

- **ID**: `b557c2ca652c49338e1f7a0e028c53a7`
- **Name**: Visual Monitoring
- **Status**: Active ✅
- **Webhook**: `http://localhost:5678/webhook/visual-check`
- **Email**: abhishekmaharjan3737@gmail.com
- **Duration**: ~81 seconds

## Add Scheduled Execution (Optional)

To run every 15 minutes automatically:

1. Open n8n UI: `https://n8n.theprofitplatform.com.au`
2. Find "Visual Monitoring" workflow
3. Click "Add node" → "Schedule Trigger"
4. Set: "Every 15 minutes"
5. Connect to "Run Tests" node
6. Save

## Files

- **Email Script**: `/home/avi/projects/astro-site/scripts/visual-check/send-test-email.cjs`
- **Success Summary**: `./SUCCESS-SUMMARY.md`
- **Full Guide**: `./FINAL-STATUS.md`
