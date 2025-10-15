# 🔧 n8n Webhook Registration Issue - Fix

## 🔍 The Problem

Your webhooks show as "Active: true" in the n8n API, but they fail with:
```
"Workflow Webhook Error: Workflow could not be started!"
```

This happens when n8n's webhook registry isn't properly synchronized. Common causes:
1. n8n service needs restart to register new webhooks
2. Webhook paths have conflicts
3. Database sync issue

## ✅ Solution: Restart n8n on VPS

### Quick Fix (Recommended)

SSH into your VPS and restart n8n:

```bash
ssh root@n8n.theprofitplatform.com.au

# Check if n8n is running as Docker or systemd
docker ps | grep n8n

# If Docker:
docker restart n8n

# OR if systemd:
systemctl restart n8n

# Check status
systemctl status n8n
# OR
docker logs n8n --tail 50
```

### After Restart

Wait 30 seconds, then test:

```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/minimal-test \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

Expected: HTTP 200 with your data echoed back

---

## 🔍 Alternative: Check n8n Logs

If restart doesn't help, check logs for errors:

```bash
# Docker logs
docker logs n8n --tail 100

# Or systemd logs
journalctl -u n8n -n 100 --no-pager
```

Look for errors mentioning:
- Webhook registration
- Database connection
- Port conflicts (5678)

---

## 🧪 Test Different Webhook

Try the older "Test Webhook" that was already on your system:

```bash
# First, activate it in UI
# https://n8n.theprofitplatform.com.au/workflow/AfLztyEjVxj2uv5Z

# Then test
curl -X POST https://n8n.theprofitplatform.com.au/webhook-test/test \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

If THIS works, it means our new webhooks just need n8n restart.

---

## 🔧 Manual Webhook Test in n8n UI

1. Go to: https://n8n.theprofitplatform.com.au/workflow/XXLvBVPAUGWt35oD
2. Click **"Execute Workflow"** button (play icon, top right)
3. Select **"Using webhook"**
4. Copy the **test URL** shown
5. Test with curl using that URL

If the test URL works but production doesn't, it confirms n8n restart is needed.

---

## 📋 Checklist

- [ ] SSH into VPS
- [ ] Check if n8n is Docker or systemd
- [ ] Restart n8n service
- [ ] Wait 30 seconds
- [ ] Test webhook with curl
- [ ] Check n8n logs if still failing

---

## 🆘 If Still Not Working

### Check n8n Configuration

```bash
# Check n8n environment variables
docker exec n8n env | grep N8N_

# Key variables to verify:
# N8N_HOST=n8n.theprofitplatform.com.au
# N8N_PROTOCOL=https
# WEBHOOK_URL=https://n8n.theprofitplatform.com.au/
```

### Check Database Connection

```bash
# If using PostgreSQL
docker exec n8n n8n-cli info

# Should show database connection status
```

### Check Webhook Registration Table

The issue might be that webhooks aren't being written to the database. This requires n8n restart.

---

## ✅ Expected Behavior After Fix

Once n8n restarts:

1. **Minimal Webhook Test**:
   ```bash
   curl -X POST https://n8n.theprofitplatform.com.au/webhook/minimal-test \
     -H "Content-Type: application/json" \
     -d '{"test":"hello"}'
   ```
   **Response**: `{"test":"hello"}` (HTTP 200)

2. **Test Script**:
   ```bash
   ./test-n8n-webhook.sh
   ```
   **Response**: ✅ Success! with Discord notification

3. **n8n Executions**:
   - Go to https://n8n.theprofitplatform.com.au/executions
   - Should see successful webhook executions

---

## 🎯 Quick Commands for VPS

```bash
# Connect to VPS
ssh root@n8n.theprofitplatform.com.au

# Restart n8n (Docker)
docker restart n8n && docker logs -f n8n

# Restart n8n (systemd)
systemctl restart n8n && journalctl -u n8n -f

# Check if webhooks registered
docker logs n8n 2>&1 | grep -i webhook | tail -20
```

---

## 📞 Next Steps

1. **SSH into VPS** and restart n8n
2. **Wait 30 seconds** for it to fully start
3. **Run test script**: `bash test-n8n-webhook.sh`
4. **If successful**: ✅ Webhooks are working!
5. **If still failing**: Check logs and report errors

Let me know the result after restarting n8n!
