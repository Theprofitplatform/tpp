# Keyword Research Tool - Deployment Instructions

## ✅ What's Been Completed

### Frontend (DEPLOYED ✓)
- ✅ Keyword Research tool page at `/tools/keyword-research`
- ✅ Updated tools index with active "Keyword Research" card
- ✅ Form with keyword, location, intent filters
- ✅ Results table with volume, difficulty, priority
- ✅ Keyword clustering for content strategy
- ✅ Export to CSV, PDF (coming soon), Copy to clipboard
- ✅ Tips section with SEO best practices
- ✅ Responsive design matching existing tools
- ✅ **LIVE**: https://2cf2234b.tpp-new.pages.dev/tools/keyword-research

### Backend (CODE READY - NEEDS DEPLOYMENT)
- ✅ API endpoint at `/api/keyword-research`
- ✅ Parses KEYWORD_RESEARCH.md (30+ keywords)
- ✅ Generates location-based variations
- ✅ Filters by intent (commercial, informational, etc.)
- ✅ Creates keyword clusters
- ✅ Rate limiting (10 requests/min)
- ⚠️ **NEEDS**: Deploy to VPS/server running backend

## 🚀 Backend Deployment Steps

### Option 1: Deploy to Existing VPS (Recommended)

Your backend is currently running via PM2 on a VPS with Cloudflare tunnel.

1. **SSH into your VPS** where the backend is hosted

2. **Navigate to backend directory**:
   ```bash
   cd /path/to/tpp/backend
   ```

3. **Pull the latest changes**:
   ```bash
   git pull origin main
   ```

4. **Verify new files exist**:
   ```bash
   ls -la keyword-research.js
   grep "keyword-research" server.js
   ```

5. **Restart the backend** using PM2:
   ```bash
   npm run pm2:restart
   # OR
   pm2 restart tpp-backend
   ```

6. **Check logs** to ensure it started successfully:
   ```bash
   npm run pm2:logs
   # OR
   pm2 logs tpp-backend
   ```

7. **Test the endpoint**:
   ```bash
   curl -X POST https://api3.theprofitplatform.com.au/api/keyword-research \
     -H "Content-Type: application/json" \
     -d '{"keyword":"SEO","location":"Sydney, Australia","intent":"all"}'
   ```

### Option 2: Deploy from This Machine

If you have deployment access configured:

1. **SSH and pull changes**:
   ```bash
   ssh your-vps
   cd /path/to/tpp
   git pull
   pm2 restart tpp-backend
   ```

2. **Verify deployment**:
   ```bash
   pm2 status
   curl https://api3.theprofitplatform.com.au/health
   ```

## 🧪 Testing the Live Tool

Once backend is deployed:

1. **Visit**: https://2cf2234b.tpp-new.pages.dev/tools/keyword-research

2. **Test with**:
   - Keyword: "digital marketing"
   - Location: "Sydney, Australia"
   - Intent: "All Intents"

3. **Expected Result**:
   - Table with 20-30 keywords
   - Monthly volume, difficulty, priority
   - 4-6 keyword clusters
   - Export options working

## 📊 API Details

### Endpoint
```
POST /api/keyword-research
```

### Request
```json
{
  "keyword": "SEO",
  "location": "Sydney, Australia",
  "intent": "commercial"
}
```

### Response
```json
{
  "success": true,
  "keywords": [
    {
      "keyword": "SEO services Sydney",
      "volume": "1600",
      "difficulty": "Medium",
      "intent": "Commercial",
      "priority": "high",
      "type": "short"
    }
  ],
  "avgVolume": "847",
  "clusters": [
    {
      "name": "SEO Services",
      "keywords": ["SEO services Sydney", "SEO agency Sydney"]
    }
  ]
}
```

## 🔧 Troubleshooting

### Backend not responding?
```bash
# Check if PM2 process is running
pm2 status

# Restart backend
pm2 restart tpp-backend

# Check logs for errors
pm2 logs tpp-backend --lines 50
```

### Endpoint returns 404?
- Ensure `server.js` has the new endpoint (line ~1036)
- Confirm `keyword-research.js` file exists
- Check import statement at top of `server.js`

### Keywords not loading?
- Verify `KEYWORD_RESEARCH.md` exists in root directory
- Check backend logs for parsing errors
- Fallback default keywords will load if file not found

## 📝 Files Changed

- `backend/keyword-research.js` - NEW - Keyword parsing & logic
- `backend/server.js` - UPDATED - Added `/api/keyword-research` endpoint
- `src/pages/tools/keyword-research.astro` - NEW - Frontend tool page
- `src/pages/tools.astro` - UPDATED - Keyword Research now active
- `KEYWORD_RESEARCH.md` - EXISTS - Data source (30+ keywords)

## ✨ Next Steps (Optional)

1. **Integrate real-time API** (optional upgrade):
   - Google Keyword Planner API
   - DataForSEO
   - SEMrush/Ahrefs API

2. **Add keyword tracking**:
   - Save user searches to database
   - Track most popular keywords
   - Suggest trending keywords

3. **Export PDF** (currently "coming soon"):
   - Implement PDF generation library
   - Format keyword report professionally

## 🎉 Summary

**Frontend**: ✅ DEPLOYED and LIVE
**Backend**: ✅ CODE READY - Just needs restart on VPS

Once you restart the backend, the tool will be fully functional!
