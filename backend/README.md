# TPP Backend API Setup Guide

## 🎯 Architecture Overview

Your site uses a **hybrid architecture**:
- **Frontend**: Static site hosted on Cloudflare Pages (fast, global, free)
- **Backend**: Express API running on your VPS (dynamic operations only)

## 📦 What's Included

```
backend/
├── server.js          # Express API server
├── .env.example       # Environment variables template
├── tunnel.sh          # Cloudflared tunnel helper script
├── config.yml         # Cloudflared configuration
└── README.md          # This file

Root files:
├── ecosystem.config.cjs   # PM2 configuration
└── package.json           # Updated with backend scripts
```

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy the example file and fill in your email credentials:

```bash
cd backend
cp .env.example .env
nano .env
```

**Required variables:**
```env
# Email Configuration (use Gmail App Password)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
CONTACT_EMAIL=avi@theprofitplatform.com.au
```

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App Passwords"
4. Create password for "Mail"
5. Copy 16-character password to `SMTP_PASS`

### 2. Start Backend Server (VPS)

**Option A: Development (with auto-reload)**
```bash
npm run backend:dev
```

**Option B: Production with PM2**
```bash
npm run pm2:start
npm run pm2:status    # Check status
npm run pm2:logs      # View logs
npm run pm2:restart   # Restart server
npm run pm2:stop      # Stop server
```

### 3. Expose Backend via Cloudflared Tunnel

**Quick tunnel (temporary URL):**
```bash
cd backend
./tunnel.sh
```

This creates a temporary public URL like:
```
https://random-words-1234.trycloudflare.com
```

**Update your frontend** to use this URL:
```bash
# Edit .env.local
PUBLIC_API_URL=https://your-tunnel-url.trycloudflare.com
```

Then rebuild and deploy:
```bash
npm run build
npm run deploy
```

### 4. Production Setup (Named Tunnel)

For a permanent subdomain like `api.theprofitplatform.com.au`:

```bash
# Install cloudflared on VPS
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create tpp-backend

# Note the Tunnel ID and create config
nano ~/.cloudflared/config.yml
```

**config.yml:**
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/user/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.theprofitplatform.com.au
    service: http://localhost:4321
  - service: http_status:404
```

**DNS Setup:**
```bash
cloudflared tunnel route dns tpp-backend api.theprofitplatform.com.au
```

**Run tunnel as service:**
```bash
cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## 🔧 API Endpoints

### Health Check
```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2025-10-01T18:00:00.000Z",
  "service": "TPP Backend API"
}
```

### Contact Form
```bash
POST /api/contact

Body (JSON):
{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "0400000000",
  "company": "Company Pty Ltd",
  "service": "Digital Marketing",
  "budget": "$5000-$10000",
  "message": "I need help with...",
  "consent": true
}

Response (Success):
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully."
}

Response (Error):
{
  "success": false,
  "error": "Error message"
}
```

## 🛡️ Security Features

- **Rate Limiting**: 5 submissions per 15 minutes per IP
- **Honeypot**: Spam detection via hidden field
- **CORS**: Restricted to your domains
- **Helmet**: Security headers
- **Validation**: Server-side form validation

## 📊 Monitoring

**Check server status:**
```bash
npm run pm2:status
```

**View logs:**
```bash
npm run pm2:logs           # Follow logs
tail -f logs/backend-out.log    # Output logs
tail -f logs/backend-error.log  # Error logs
```

**Test API:**
```bash
# Health check
curl http://localhost:4321/health

# Test contact form
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "SEO",
    "message": "Test message"
  }'
```

## 🔄 Deployment Workflow

**Local Development:**
1. Frontend: `npm run dev` (port 3001)
2. Backend: `npm run backend:dev` (port 4321)
3. Form posts to `http://localhost:4321/api/contact`

**Production:**
1. VPS: `npm run pm2:start` (port 4321)
2. VPS: `./backend/tunnel.sh` or use named tunnel
3. Update `PUBLIC_API_URL` in `.env.local` with tunnel URL
4. Deploy: `npm run deploy`

## 🐛 Troubleshooting

**Form not submitting:**
- Check backend is running: `npm run pm2:status`
- Check tunnel is active: `curl YOUR_TUNNEL_URL/health`
- Check browser console for CORS errors
- Verify `PUBLIC_API_URL` in `.env.local`

**Emails not sending:**
- Verify SMTP credentials in `backend/.env`
- Test transporter: `node backend/server.js` (check startup logs)
- Use Gmail App Password, not regular password
- Check spam folder

**PM2 not working:**
- Install globally: `npm install -g pm2`
- Check logs: `npm run pm2:logs`
- Restart: `npm run pm2:restart`

**Tunnel disconnects:**
- Use named tunnel for production (persistent)
- Add `cloudflared` to system startup
- Monitor with: `systemctl status cloudflared`

## 💡 Tips

1. **Keep it minimal**: Only use backend for what static can't do
2. **Monitor costs**: VPS should cost ~$5-10/month
3. **Backup strategy**: Backend code is in git, but backup `.env` separately
4. **Scale later**: If traffic grows, add more PM2 instances or use Cloudflare Workers
5. **Alternative**: Consider Cloudflare Workers/Pages Functions for serverless backend

## 📚 Next Steps

- [ ] Set up email credentials
- [ ] Start backend with PM2
- [ ] Create cloudflared tunnel
- [ ] Update frontend `.env.local`
- [ ] Test form submission
- [ ] Set up monitoring/alerts
- [ ] Configure named tunnel for production
- [ ] Add database if needed (SQLite/PostgreSQL)
- [ ] Add more API endpoints as needed

## 🆘 Support

Issues? Check:
1. Server logs: `npm run pm2:logs`
2. Network: `curl localhost:4321/health`
3. Tunnel: `curl YOUR_TUNNEL_URL/health`
4. Browser console for frontend errors
