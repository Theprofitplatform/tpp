# SEO Audit Tool - Quick Reference

## 🚀 Production URLs

```
Tool:    https://theprofitplatform.com.au/tools/seo-audit/
API:     https://api.theprofitplatform.com.au
Health:  https://api.theprofitplatform.com.au/health
```

## 🔧 Backend Commands (VPS)

```bash
# Check status
ssh tpp-vps "pm2 list"

# View logs
ssh tpp-vps "pm2 logs tpp-backend --lines 50"

# Restart backend
ssh tpp-vps "pm2 restart tpp-backend"

# Verify deployment
ssh tpp-vps "/home/avi/projects/tpp-website/backend/verify-deployment.sh"

# Update backend code
scp backend/server.js tpp-vps:/home/avi/projects/tpp-website/backend/
ssh tpp-vps "pm2 restart tpp-backend && pm2 save"
```

## 🎯 Frontend Commands (Local)

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Test locally
npm run dev
```

## 🧪 Testing Commands

```bash
# Test API health
curl https://api.theprofitplatform.com.au/health

# Test SEO audit
curl -X POST "https://api.theprofitplatform.com.au/api/seo-audit" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://example.com"}'

# Run full test suite
./test-seo-audit.sh
```

## 📊 Monitoring

```bash
# Check PM2 status
ssh tpp-vps "pm2 status"

# Monitor logs in real-time
ssh tpp-vps "pm2 logs tpp-backend"

# Check cron monitor log
ssh tpp-vps "tail -f /home/avi/projects/tpp-website/backend/monitor.log"
```

## 🔥 Troubleshooting

### Backend not responding
```bash
ssh tpp-vps "pm2 restart tpp-backend"
ssh tpp-vps "pm2 logs tpp-backend --lines 100"
```

### Deploy updates permanently
```bash
# 1. Copy files
scp backend/*.js tpp-vps:/home/avi/projects/tpp-website/backend/

# 2. Restart
ssh tpp-vps "cd /home/avi/projects/tpp-website/backend && pm2 restart tpp-backend"

# 3. Save config
ssh tpp-vps "pm2 save"

# 4. Verify
ssh tpp-vps "/home/avi/projects/tpp-website/backend/verify-deployment.sh"
```

## 📋 Key Files

**Backend (VPS)**:
- `/home/avi/projects/tpp-website/backend/server.js`
- `/home/avi/projects/tpp-website/backend/database.js`
- `/home/avi/projects/tpp-website/backend/.env`
- `/home/avi/projects/tpp-website/backend/verify-deployment.sh`

**Frontend (Local)**:
- `src/pages/tools/seo-audit.astro`
- `.env.local` (API URL)
- `dist/` (build output)

## 🎯 Rate Limits

- SEO Audit: **5 requests/minute**
- Speed Test: **2 requests/minute**
- Keyword Research: **10 requests/minute**

## ⚡ Quick Fixes

**API 404 error**: Backend not running or wrong endpoint
```bash
ssh tpp-vps "pm2 restart tpp-backend"
```

**Rate limit hit**: Wait 1 minute
```bash
# Check rate limit status (logs)
ssh tpp-vps "pm2 logs tpp-backend | grep 'Too many'"
```

**Frontend not updating**: Clear cache or check deployment
```bash
npm run build && npm run deploy
```

---

**Last Updated**: October 3, 2025
**Status**: ✅ All systems operational
