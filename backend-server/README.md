# TPP Backend Server

Backend API server for The Profit Platform tools.

## Endpoints

- `GET /health` - Health check
- `POST /api/keyword-gap` - Keyword gap analyzer
- `POST /api/competitor-analysis` - Competitor analysis

## Local Development

```bash
npm install
npm start
```

Server runs on port 3000 (or PORT env var).

## Deploy to Cloud

### Option 1: Railway (Recommended)

**Via Dashboard:**
1. Go to https://railway.app/new
2. Click "Empty Project" → "Deploy from GitHub repo"
3. Connect GitHub and select `Theprofitplatform/tpp`
4. Root directory: `/backend-server`
5. Railway auto-detects Node.js
6. Click deployment → Generate Domain
7. Copy URL (e.g., `https://tpp-backend-production.up.railway.app`)

**Via CLI:**
```bash
cd backend-server
railway login
railway init
railway up
railway domain
```

### Option 2: Render.com (Free Tier)

**One-Click Deploy:**
1. Go to https://render.com/deploy
2. Connect GitHub repo: `Theprofitplatform/tpp`
3. Root directory: `/backend-server`
4. Render detects `render.yaml` config
5. Click "Apply" to deploy
6. Free tier includes 750 hours/month

**Manual Deploy:**
1. Go to https://dashboard.render.com
2. New → Web Service
3. Connect GitHub: `Theprofitplatform/tpp`
4. Root directory: `backend-server`
5. Build: `npm install`
6. Start: `npm start`
7. Free tier available

### Option 3: Heroku

**One-Click Deploy:**
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Theprofitplatform/tpp/tree/main/backend-server)

**Manual Deploy:**
```bash
cd backend-server
heroku login
heroku create tpp-backend
git push heroku main
heroku open
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `SERPAPI_KEY` - SerpApi API key (optional, uses mock data if not set)

## After Deployment

1. Copy your Railway app URL (e.g., `https://tpp-backend-production.up.railway.app`)
2. Add to Cloudflare Pages environment:
   - Variable: `BACKEND_API_URL`
   - Value: Your Railway URL
3. Redeploy Cloudflare Pages

## Testing

```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# Test keyword gap
curl -X POST https://your-railway-url.up.railway.app/api/keyword-gap \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"example.com","competitorDomain":"competitor.com"}'
```

## Costs

- **Railway Free Tier:** $5 credit/month
- **Estimated usage:** ~$2-5/month
- **With SerpApi:** +$10-20/month

Total: ~$12-25/month for full production setup.
