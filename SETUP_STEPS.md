# 🚀 Complete Backend Setup Guide

Follow these steps in order. Should take ~10 minutes.

---

## Step 1: Get Gmail App Password (3 min)

### Option A: Using Your Personal Gmail

1. Go to https://myaccount.google.com/security
2. Make sure **2-Step Verification** is ON
   - If not, enable it first (required for App Passwords)
3. Search for "App Passwords" or go to https://myaccount.google.com/apppasswords
4. Click "Select app" → Choose "Mail"
5. Click "Select device" → Choose "Other" → Type "TPP Backend"
6. Click **Generate**
7. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
8. **IMPORTANT:** Remove spaces when you paste it

### Option B: Using Your Business Gmail (@theprofitplatform.com.au)

Same steps as above, but use your business Google Workspace account.

---

## Step 2: Configure Backend Environment (1 min)

Open your backend `.env` file:

```bash
nano backend/.env
```

Update with your credentials:

```env
# Server Configuration
PORT=4321
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3001,https://theprofitplatform.com.au

# Email Configuration - UPDATE THESE
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com          # ← Change this
SMTP_PASS=abcdefghijklmnop               # ← Paste App Password (no spaces)
SMTP_FROM=noreply@theprofitplatform.com.au

# Contact email (where form submissions go)
CONTACT_EMAIL=avi@theprofitplatform.com.au
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Start Backend Server (1 min)

### Option A: Using PM2 (Recommended for VPS)

```bash
npm run pm2:start
```

Check status:
```bash
npm run pm2:status
```

View logs:
```bash
npm run pm2:logs
```

Should see:
```
✅ Email server is ready to send messages
🚀 TPP Backend API Server Running
```

### Option B: Development Mode (for testing)

```bash
npm run backend:dev
```

Keep this terminal open. Open a new terminal for next steps.

---

## Step 4: Test Backend Locally (1 min)

Open a new terminal and test:

```bash
# Health check
curl http://localhost:4321/health

# Test form submission
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@gmail.com",
    "service": "SEO",
    "message": "Testing the backend API setup"
  }'
```

**Check your email!** You should receive:
1. An auto-reply to your test email
2. A notification at `CONTACT_EMAIL`

If emails arrive → **Backend is working!** ✅

---

## Step 5: Install Cloudflared (2 min)

### On Windows (WSL):
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

### On Mac:
```bash
brew install cloudflared
```

### On Linux VPS:
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

Verify installation:
```bash
cloudflared --version
```

---

## Step 6: Create Cloudflared Tunnel (2 min)

### Quick Tunnel (Temporary - Good for Testing)

```bash
cd backend
./tunnel.sh
```

OR:

```bash
cloudflared tunnel --url http://localhost:4321
```

You'll see output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-words-1234.trycloudflare.com                                               |
+--------------------------------------------------------------------------------------------+
```

**Copy that URL!** You'll need it in the next step.

**Note:** Keep this terminal open. If you close it, the tunnel stops.

---

## Step 7: Update Frontend (2 min)

Edit your `.env.local` file:

```bash
nano .env.local
```

Update the API URL:

```env
CLOUDFLARE_API_TOKEN=your-token-here

# Backend API URL - UPDATE THIS
PUBLIC_API_URL=https://your-tunnel-url.trycloudflare.com
```

**Replace** `https://your-tunnel-url.trycloudflare.com` with the URL from Step 6.

---

## Step 8: Rebuild and Deploy Frontend (2 min)

```bash
npm run build
npm run deploy
```

---

## Step 9: Test Live Form (1 min)

1. Go to https://theprofitplatform.com.au
2. Scroll to contact form
3. Fill it out with your real email
4. Submit

**You should receive:**
- Auto-reply email immediately
- Submission appears in your CONTACT_EMAIL inbox

---

## 🎉 Done!

Your backend is now live and processing forms!

---

## What's Running?

```
Frontend (Cloudflare Pages)
    ↓
    | Submit Form
    ↓
Cloudflared Tunnel (Public URL)
    ↓
    | Proxy to localhost
    ↓
Backend API (Port 4321)
    ↓
    | Send Emails
    ↓
Gmail SMTP
```

---

## Making It Permanent

Right now, the tunnel is temporary. To make it permanent:

### Create Named Tunnel (Recommended for Production)

```bash
# Authenticate with Cloudflare
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create tpp-backend

# Note the Tunnel ID shown in output
```

Configure the tunnel:

```bash
nano ~/.cloudflared/config.yml
```

Add:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/yourusername/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.theprofitplatform.com.au
    service: http://localhost:4321
  - service: http_status:404
```

Set up DNS:

```bash
cloudflared tunnel route dns tpp-backend api.theprofitplatform.com.au
```

Run as system service:

```bash
cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

Then update your `.env.local`:

```env
PUBLIC_API_URL=https://api.theprofitplatform.com.au
```

---

## Troubleshooting

### Backend won't start
```bash
npm run pm2:logs
# Check for errors in output
```

### Emails not sending
- Verify Gmail App Password (no spaces)
- Check 2-Step Verification is enabled
- Try creating a new App Password
- Check logs: `npm run pm2:logs`

### Tunnel won't connect
```bash
# Make sure backend is running first
npm run pm2:status

# Test backend directly
curl http://localhost:4321/health
```

### Form submissions fail
- Check browser console for errors
- Verify tunnel URL in `.env.local`
- Test tunnel: `curl TUNNEL_URL/health`
- Check CORS errors (tunnel URL must match exactly)

---

## Quick Commands Reference

```bash
# Backend
npm run pm2:start       # Start backend
npm run pm2:stop        # Stop backend
npm run pm2:restart     # Restart backend
npm run pm2:logs        # View logs
npm run pm2:status      # Check status

# Tunnel
./backend/tunnel.sh     # Start quick tunnel
cloudflared tunnel list # List tunnels

# Deploy
npm run build          # Build frontend
npm run deploy         # Deploy to Cloudflare Pages
```

---

## Need Help?

Check the full documentation:
- `backend/README.md` - Complete backend docs
- `BACKEND_QUICKSTART.md` - Quick reference

Or test manually:
```bash
# Test backend
curl http://localhost:4321/health

# Test tunnel
curl https://your-tunnel-url.trycloudflare.com/health

# Check logs
npm run pm2:logs
```
