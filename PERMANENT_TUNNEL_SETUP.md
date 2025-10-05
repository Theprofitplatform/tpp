# Permanent Cloudflare Tunnel Setup Guide

## Current Status

✅ **Temporary Solution Running:**
- Backend API: Running on VPS port 4321 via PM2
- Cloudflare Tunnel: `https://ate-britain-downloading-furniture.trycloudflare.com` (temporary)
- Frontend: Built and working with temporary URL

## Why Set Up Permanent Tunnel?

The current quick tunnel URL changes every time it restarts. A permanent tunnel provides:
- Fixed subdomain: `https://api.theprofitplatform.com.au`
- Auto-starts on system boot
- More reliable and production-ready
- No need to rebuild/redeploy frontend on restart

## Prerequisites

- SSH access to VPS (`ssh tpp-vps`)
- Cloudflare account with `theprofitplatform.com.au` domain
- Browser access for one-time authentication

## Setup Instructions

### Step 1: Transfer Setup Script to VPS

```bash
# From your local machine
scp scripts/setup-permanent-tunnel.sh tpp-vps:~/
```

### Step 2: Run Setup on VPS

```bash
# SSH into VPS
ssh tpp-vps

# Make script executable
chmod +x setup-permanent-tunnel.sh

# Run the setup script
./setup-permanent-tunnel.sh
```

### Step 3: Authenticate (First Time Only)

The script will pause and ask you to run:

```bash
cloudflared tunnel login
```

This command will:
1. Display a URL in the terminal
2. Open that URL in your browser (or copy/paste it)
3. Log into your Cloudflare account
4. Select `theprofitplatform.com.au` domain
5. Authorize the tunnel

After authorization, a certificate file will be saved to `~/.cloudflared/cert.pem`

Press Enter in the script to continue.

### Step 4: Verify Setup

Test the permanent URL:

```bash
curl https://api.theprofitplatform.com.au/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-03T...","service":"TPP Backend API"}
```

### Step 5: Update Local Environment

Update your local `.env.local`:

```bash
# .env.local
CLOUDFLARE_API_TOKEN=ScYo0g7TUQg79oHQ7bztswx-ew9tJTckWuPEXeT5

# Backend API URL - Permanent subdomain
PUBLIC_API_URL=https://api.theprofitplatform.com.au
```

### Step 6: Stop Temporary Tunnel

If you had a temporary tunnel running in PM2:

```bash
# On VPS or locally where PM2 is running
pm2 delete cloudflare-tunnel
pm2 save
```

### Step 7: Rebuild and Deploy Frontend

```bash
# From your local project directory
npm run build
npm run deploy
```

## Managing the Tunnel

### Check Status

```bash
# On VPS
sudo systemctl status cloudflared
```

### View Logs

```bash
# Real-time logs
sudo journalctl -u cloudflared -f

# Last 50 lines
sudo journalctl -u cloudflared -n 50
```

### Restart Tunnel

```bash
sudo systemctl restart cloudflared
```

### Stop Tunnel

```bash
sudo systemctl stop cloudflared
```

### List All Tunnels

```bash
cloudflared tunnel list
```

## Troubleshooting

### DNS Not Resolving

Wait 2-5 minutes for DNS propagation, then test:

```bash
nslookup api.theprofitplatform.com.au
```

### Service Won't Start

Check logs:

```bash
sudo journalctl -u cloudflared -n 100 --no-pager
```

### Backend Not Responding

Verify backend is running:

```bash
pm2 list
curl http://localhost:4321/health
```

### Remove and Recreate Tunnel

```bash
# Stop and remove service
sudo systemctl stop cloudflared
sudo systemctl disable cloudflared
sudo cloudflared service uninstall

# Delete tunnel
cloudflared tunnel delete tpp-backend

# Remove config
rm -rf ~/.cloudflared/config.yml

# Start over with setup script
./setup-permanent-tunnel.sh
```

## Architecture After Setup

```
┌──────────────────┐
│   Frontend       │
│  Cloudflare      │
│    Pages         │
└────────┬─────────┘
         │
         │ API calls to:
         │ https://api.theprofitplatform.com.au
         │
         ▼
┌──────────────────┐
│   Cloudflare     │
│     Tunnel       │
│   (systemd)      │
└────────┬─────────┘
         │
         │ Forwards to:
         │ localhost:4321
         │
         ▼
┌──────────────────┐
│   Backend API    │
│    (PM2)         │
│  Port 4321       │
└──────────────────┘
```

## Benefits of This Setup

✅ **Permanent URL** - Never changes
✅ **Auto-Start** - Starts on system boot via systemd
✅ **SSL/HTTPS** - Automatic via Cloudflare
✅ **Production-Ready** - Reliable and scalable
✅ **Easy Management** - systemctl commands
✅ **Centralized Logs** - journalctl integration
✅ **No Port Forwarding** - Works through firewalls
✅ **DDoS Protection** - Built-in via Cloudflare

## Cost

- Cloudflare Tunnel: **FREE**
- Backend hosting: Your existing VPS
- Total additional cost: **$0**

## Need Help?

Run into issues? Check:
1. VPS backend logs: `pm2 logs tpp-backend`
2. Tunnel logs: `sudo journalctl -u cloudflared -f`
3. DNS status: `nslookup api.theprofitplatform.com.au`
4. Cloudflare dashboard: https://dash.cloudflare.com
