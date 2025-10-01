# 🚀 Backend Quick Start

## Setup (5 minutes)

### 1. Configure Email
```bash
cd backend
cp .env.example .env
nano .env
```

Add your Gmail credentials:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=avi@theprofitplatform.com.au
```

> Get Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

### 2. Start Backend
```bash
npm run pm2:start
```

### 3. Expose via Tunnel
```bash
cd backend
./tunnel.sh
```

Copy the tunnel URL (e.g., `https://abc-xyz-123.trycloudflare.com`)

### 4. Update Frontend
```bash
# Edit .env.local
PUBLIC_API_URL=https://your-tunnel-url.trycloudflare.com

# Rebuild and deploy
npm run build
npm run deploy
```

## Usage

**Start/Stop:**
```bash
npm run pm2:start     # Start backend
npm run pm2:stop      # Stop backend
npm run pm2:restart   # Restart backend
npm run pm2:logs      # View logs
```

**Test:**
```bash
curl http://localhost:4321/health
```

**View Logs:**
```bash
npm run pm2:logs              # Live logs
tail -f logs/backend-out.log  # Output file
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run backend:dev` | Dev server with auto-reload |
| `npm run pm2:start` | Production server with PM2 |
| `npm run pm2:logs` | Follow logs |
| `npm run pm2:status` | Check server status |
| `./backend/tunnel.sh` | Start cloudflared tunnel |

## Architecture

```
┌─────────────────────────────────────────────┐
│  Cloudflare Pages (Static Frontend)        │
│  https://theprofitplatform.com.au          │
└───────────────────┬─────────────────────────┘
                    │
                    │ Form POST
                    ▼
┌─────────────────────────────────────────────┐
│  Cloudflared Tunnel                         │
│  https://xxx.trycloudflare.com              │
└───────────────────┬─────────────────────────┘
                    │
                    │ Proxy to localhost:4321
                    ▼
┌─────────────────────────────────────────────┐
│  VPS - Express API                          │
│  - Validate form                            │
│  - Send emails                              │
│  - Log submissions                          │
└─────────────────────────────────────────────┘
```

## Troubleshooting

**Form not working?**
1. Check backend: `npm run pm2:status`
2. Check tunnel: `curl TUNNEL_URL/health`
3. Check browser console
4. Verify `PUBLIC_API_URL` in `.env.local`

**Emails not sending?**
1. Check Gmail App Password (not regular password)
2. Check logs: `npm run pm2:logs`
3. Verify SMTP settings in `backend/.env`

**Need help?**
See full docs: `backend/README.md`
