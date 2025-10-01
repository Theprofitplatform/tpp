# 🌐 Cloudflare Tunnel Setup - Dashboard Method

Since WSL has issues with browser authentication, let's set up the tunnel via Cloudflare Dashboard.

---

## 🎯 Option 1: Create Tunnel via Dashboard (Easiest)

### Step 1: Go to Cloudflare Dashboard

1. Open: https://dash.cloudflare.com/
2. Select your account
3. Go to **Zero Trust** (left sidebar)
4. Click **Networks** → **Tunnels**
5. Click **Create a tunnel**

### Step 2: Configure Tunnel

**Name:** `tpp-backend`

**Click:** Next / Save tunnel

### Step 3: Install Connector

You'll see a command like:
```bash
cloudflared service install TOKEN_HERE
```

**Copy that command and run it in your terminal!**

### Step 4: Configure Public Hostname

In the dashboard:

**Public Hostname:**
- Subdomain: `api`
- Domain: `theprofitplatform.com.au`
- Service Type: `HTTP`
- URL: `localhost:4321`

**Click:** Save

### Step 5: Test

```bash
curl https://api.theprofitplatform.com.au/health
```

---

## 🎯 Option 2: Use Quick Tunnel (Already Working)

**Current Setup:**
- ✅ Backend running with PM2
- ✅ Quick tunnel: `https://integrated-pdt-returning-neil.trycloudflare.com`
- ✅ Everything working

**Pros:**
- Already set up
- Works perfectly
- Zero additional configuration

**Cons:**
- URL is random
- URL changes if tunnel restarts
- Need to update frontend when URL changes

### To Keep Using Quick Tunnel:

**It's already running!** Just check:

```bash
# Check tunnel is running
ps aux | grep cloudflared

# View tunnel URL
grep "trycloudflare.com" tunnel.log | grep -o "https://[^[:space:]]*"

# Test it
curl https://integrated-pdt-returning-neil.trycloudflare.com/health
```

**If tunnel stops, restart with:**
```bash
nohup cloudflared tunnel --url http://localhost:4321 > tunnel.log 2>&1 &
```

---

## 🎯 Option 3: Manual Tunnel Setup (If Dashboard Doesn't Work)

### Step 1: Download Cert Manually

1. Go to: https://dash.cloudflare.com/
2. Navigate to **Zero Trust** → **Networks** → **Tunnels**
3. Click **"Download certificate"** or get origin cert

Save it to: `~/.cloudflared/cert.pem`

### Step 2: Create Tunnel

```bash
cloudflared tunnel create tpp-backend
```

This creates a credentials file at:
`~/.cloudflared/TUNNEL_ID.json`

**Save the Tunnel ID shown!**

### Step 3: Create Config

```bash
nano ~/.cloudflared/config.yml
```

**Add:**
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/abhi/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.theprofitplatform.com.au
    service: http://localhost:4321
  - service: http_status:404
```

### Step 4: Route DNS

```bash
cloudflared tunnel route dns tpp-backend api.theprofitplatform.com.au
```

### Step 5: Run Tunnel

```bash
cloudflared tunnel run tpp-backend
```

### Step 6: Make it Permanent

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## ✅ Current Status

**What's Working Now:**

```
✅ Backend API    → PM2 on localhost:4321
✅ Quick Tunnel   → https://integrated-pdt-returning-neil.trycloudflare.com
✅ Emails         → Gmail SMTP working
✅ Frontend       → Deployed to Cloudflare Pages
```

**You have 2 choices:**

1. **Keep using Quick Tunnel** (easier, already working)
   - Just make sure it restarts after reboot

2. **Set up Named Tunnel** (permanent subdomain)
   - Use Cloudflare Dashboard (Option 1 above)
   - Get `api.theprofitplatform.com.au`

---

## 🚀 Recommendation

**For now: Keep using the Quick Tunnel!**

It's already working perfectly. You can:
- Test it thoroughly
- Get comfortable with the setup
- Upgrade to named tunnel later when needed

**When to upgrade:**
- When you need a professional subdomain
- When you want 24/7 uptime guarantee
- When you're ready for full production

---

## 📝 Quick Commands

### Check Current Setup
```bash
pm2 status                                    # Backend
ps aux | grep cloudflared                     # Tunnel process
tail -f tunnel.log                            # Tunnel logs
curl https://integrated-pdt-returning-neil.trycloudflare.com/health  # Test
```

### Restart if Needed
```bash
pm2 restart tpp-backend                       # Restart backend
pkill cloudflared                             # Kill old tunnel
nohup cloudflared tunnel --url http://localhost:4321 > tunnel.log 2>&1 &  # New tunnel
```

---

## 🎯 Next Steps

**You're already done!** Everything is working:

✅ Backend permanent with PM2
✅ Tunnel running in background
✅ Emails working
✅ Frontend deployed

**Optional:** Set up named tunnel via dashboard when you're ready for production.
