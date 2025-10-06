# 🔒 Permanent Backend Setup

## ✅ What's Already Done:

1. **Backend running with PM2** ✅
   - Process saved and will restart automatically
   - Running on port 4321
   - Emails working perfectly

2. **PM2 Commands:**
   ```bash
   pm2 status        # Check status
   pm2 logs          # View logs
   pm2 restart all   # Restart backend
   pm2 stop all      # Stop backend
   pm2 start all     # Start backend
   ```

---

## 🌐 Option 1: Keep Using Quick Tunnel (Easiest)

**Current tunnel:** `https://october-split-babies-donate.trycloudflare.com`

### Pros:
- Already working
- No DNS configuration needed
- Free

### Cons:
- URL changes if tunnel restarts
- No uptime guarantee
- Random URL name

### To Keep Running:
```bash
# In a separate terminal (or use tmux/screen)
cloudflared tunnel --url http://localhost:4321
```

**Or run in background:**
```bash
nohup cloudflared tunnel --url http://localhost:4321 > tunnel.log 2>&1 &
```

---

## 🚀 Option 2: Named Tunnel with Custom Subdomain (Recommended)

This gives you `api.theprofitplatform.com.au` permanently.

### Step 1: Authenticate Cloudflared

**Open this URL in your browser:**
```
https://dash.cloudflare.com/argotunnel?aud=&callback=https%3A%2F%2Flogin.cloudflareaccess.org%2FX-97DHxTTR_qVzLcgwg9iNeDT7X4dtu-uWT9B-FG71o%3D
```

**Or run this command and it will open automatically:**
```bash
cloudflared tunnel login
```

**After authenticating, you'll see:**
```
You have successfully logged in.
```

### Step 2: Create Named Tunnel

```bash
cloudflared tunnel create tpp-backend
```

**Save the Tunnel ID shown in the output!** (looks like: `abcd1234-5678-90ab-cdef-1234567890ab`)

### Step 3: Create Config File

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

**Add this configuration** (replace YOUR_TUNNEL_ID with the ID from Step 2):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/abhi/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.theprofitplatform.com.au
    service: http://localhost:4321
  - service: http_status:404
```

### Step 4: Set Up DNS

```bash
cloudflared tunnel route dns tpp-backend api.theprofitplatform.com.au
```

This automatically creates a CNAME record in Cloudflare DNS.

### Step 5: Test the Tunnel

```bash
cloudflared tunnel run tpp-backend
```

**Test it:**
```bash
curl https://api.theprofitplatform.com.au/health
```

### Step 6: Run as System Service

**Install as service:**
```bash
sudo cloudflared service install
```

**Start and enable:**
```bash
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**Check status:**
```bash
sudo systemctl status cloudflared
```

**View logs:**
```bash
sudo journalctl -u cloudflared -f
```

### Step 7: Update Frontend

```bash
# Edit .env.local
nano .env.local
```

**Change:**
```env
PUBLIC_API_URL=https://api.theprofitplatform.com.au
```

**Rebuild and deploy:**
```bash
npm run build
npm run deploy
```

---

## 🎯 Quick Decision Guide

**Use Quick Tunnel if:**
- You're testing/developing
- You don't mind the tunnel being temporary
- You can manually restart if needed

**Use Named Tunnel if:**
- You want a permanent solution
- You want a professional subdomain
- You need 24/7 uptime

---

## 📊 Current Status

✅ **Backend:** Running with PM2 on port 4321
✅ **Emails:** Working (Gmail SMTP configured)
✅ **Frontend:** Deployed to Cloudflare Pages
✅ **Tunnel:** Quick tunnel active (temporary)

**Next step:** Choose Option 1 or Option 2 above!

---

## 🆘 Troubleshooting

### Backend won't start
```bash
pm2 logs tpp-backend
pm2 restart tpp-backend
```

### Tunnel disconnects
```bash
# Quick tunnel
cloudflared tunnel --url http://localhost:4321

# Named tunnel
sudo systemctl restart cloudflared
```

### Check what's running
```bash
pm2 status                           # Backend
sudo systemctl status cloudflared    # Named tunnel
ps aux | grep cloudflared            # Any cloudflared process
```

### Kill old tunnels
```bash
pkill cloudflared
```

### Test backend directly
```bash
curl http://localhost:4321/health
```

### Test through tunnel
```bash
curl https://october-split-babies-donate.trycloudflare.com/health
# OR
curl https://api.theprofitplatform.com.au/health
```

---

## 💡 Recommended Production Setup

1. **PM2 for backend** ✅ (Done)
2. **Named Cloudflared tunnel** with `api.theprofitplatform.com.au`
3. **Cloudflared as systemd service** for auto-restart
4. **Monitoring:** Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
5. **Logs:** Rotate logs with logrotate
6. **Backups:** Backup `.env` and `ecosystem.config.cjs` files

---

## 📝 Summary Commands

```bash
# Backend Management
pm2 status                    # Check backend
pm2 logs tpp-backend         # View logs
pm2 restart tpp-backend      # Restart

# Quick Tunnel (Temporary)
cloudflared tunnel --url http://localhost:4321

# Named Tunnel (Permanent)
cloudflared tunnel login                           # Authenticate
cloudflared tunnel create tpp-backend             # Create tunnel
cloudflared tunnel route dns tpp-backend api.theprofitplatform.com.au  # DNS
cloudflared tunnel run tpp-backend                # Run manually
sudo systemctl start cloudflared                  # Run as service
sudo systemctl status cloudflared                 # Check service

# Testing
curl http://localhost:4321/health                 # Test backend
curl https://TUNNEL_URL/health                    # Test tunnel
```

---

## 🎉 You're Done!

Your backend is now running permanently with PM2. Choose your tunnel option and you're fully set up!
