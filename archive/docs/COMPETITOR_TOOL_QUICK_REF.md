# Competitor Analysis Tool - Quick Reference

## 🚀 Quick Start

### Frontend URL
```
https://theprofitplatform.com.au/tools/competitor-analysis/
```

### How to Use
1. Navigate to the tool page
2. Enter your website domain
3. Enter competitor's domain
4. Click "Analyze Competitor"
5. View comprehensive comparison results

---

## 🔧 Backend Management

### Check Server Status
```bash
ps aux | grep "node.*server.js" | grep -v grep
```

### Restart Backend Server
```bash
# Stop server
pkill -f "node.*server.js"

# Start server
cd backend
nohup node server.js > logs/server-$(date +%Y%m%d-%H%M%S).log 2>&1 &
```

### Check Logs
```bash
# Latest logs
tail -f backend/logs/server-new.log

# All logs
ls -lt backend/logs/
```

### Test API
```bash
curl -X POST http://localhost:4321/api/competitor-analysis \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"test.com","competitorDomain":"example.com"}'
```

---

## 📁 Important Files

### Backend
- `backend/server.js` - Main server with API endpoint (line 1117)
- `backend/competitor-analysis.js` - Analysis engine
- `backend/package.json` - Dependencies (includes cheerio)

### Frontend
- `src/pages/tools/competitor-analysis.astro` - Tool page
- `src/pages/tools.astro` - Tools listing page
- `dist/tools/competitor-analysis/index.html` - Built page

### Documentation
- `COMPETITOR_ANALYSIS_TOOL.md` - Full implementation guide
- `COMPETITOR_ANALYSIS_TEST_REPORT.md` - Test results
- `DEBUG_SUMMARY.md` - Debugging notes
- `backend/api-competitor-analysis.md` - API documentation

---

## 🐛 Common Issues

### Issue: "Endpoint not found"
**Solution:** Backend server not running
```bash
cd backend && npm start
```

### Issue: "Invalid domain format"
**Solution:** Domain validation failed - check regex in server.js:1130

### Issue: CORS errors
**Solution:** Check allowed origins in server.js:22-28

### Issue: Rate limit exceeded
**Solution:** Wait 1 hour or adjust limit in server.js:1111-1115

---

## 📊 Rate Limits

- **Competitor Analysis:** 3 requests per hour per IP
- **Configurable:** Edit `server.js:1111`

---

## 🔄 Deploy Changes

### Frontend Changes
```bash
npm run build
npm run deploy:prod
```

### Backend Changes
```bash
# Edit files
# Restart server
pkill -f "node.*server.js"
cd backend && nohup node server.js > logs/server-new.log 2>&1 &
```

---

## 📈 Monitoring

### Check Production Site
```bash
curl -I https://theprofitplatform.com.au/tools/competitor-analysis/
```

### Test Production API
```bash
curl -X POST https://but-surgery-carolina-convenience.trycloudflare.com/api/competitor-analysis \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"test.com","competitorDomain":"example.com"}'
```

### Backend Health
```bash
# Process status
ps aux | grep server.js

# Memory usage
ps aux | grep server.js | awk '{print $4"%"}'

# Disk space
df -h backend/logs/
```

---

## 🎨 Customization

### Change Theme Colors
Edit `src/pages/tools/competitor-analysis.astro:289` (Orange gradient)

### Modify Analysis Logic
Edit `backend/competitor-analysis.js`

### Adjust Rate Limits
Edit `backend/server.js:1112` (windowMs and max)

### Add More Metrics
1. Update `competitor-analysis.js` to calculate new metrics
2. Update frontend display functions
3. Rebuild and deploy

---

## 📞 Support

### Logs Location
- Backend: `backend/logs/`
- Build: Check npm output

### Debug Mode
Set in `.env`:
```
NODE_ENV=development
```

### Error Tracking
Check:
1. Browser console (F12)
2. Backend logs
3. Network tab in DevTools

---

## ✅ Health Check Commands

Run these to verify everything is working:

```bash
# 1. Backend running?
ps aux | grep server.js | grep -v grep

# 2. API responding?
curl -s http://localhost:4321/api/competitor-analysis \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"test.com","competitorDomain":"example.com"}' \
  | jq '.success'

# 3. Frontend built?
ls -lh dist/tools/competitor-analysis/index.html

# 4. Production live?
curl -I https://theprofitplatform.com.au/tools/competitor-analysis/
```

All should return success!

---

**Last Updated:** October 4, 2025
