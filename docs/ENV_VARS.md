# Environment Variables

## Frontend (Astro Site)

### Required
- `PUBLIC_API_URL` - API endpoint URL
  - **Development**: `http://localhost:3001` or `http://localhost:4321`
  - **Production**: `https://api3.theprofitplatform.com.au`
  - **Default**: Falls back to production URL if not set

### Optional
- None (static site)

## API Service (Local Dev)

Location: `api/.env`

```bash
# Port configuration
PORT=3001

# Email configuration (optional for contact forms)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# N8N Integration (optional)
N8N_WEBHOOK_URL=https://n8n.theprofitplatform.com.au/webhook/...
```

See `api/.env.example` for template

## Backend Service (Rank Tracker)

Location: `backend/.env`

```bash
# Server configuration
PORT=4321
NODE_ENV=production

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Database (SQLite - no config needed)
# Database file: backend/rank-tracker.db
```

See `backend/.env.example` for template

## Visual Testing (scripts/visual-check)

Location: `scripts/visual-check/.env`

```bash
# Gemini AI API Key
GOOGLE_AI_API_KEY=your-gemini-api-key

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
REPORT_EMAIL=recipient@example.com

# Site to test
TEST_URL=https://theprofitplatform.com.au
```

## N8N QA Tests

Location: `tests/n8n-qa/.env`

```bash
# N8N Configuration
N8N_API_URL=https://n8n.theprofitplatform.com.au/api/v1
N8N_API_KEY=your-n8n-api-key

# Test configuration
TEST_TIMEOUT=30000
```

See `tests/n8n-qa/.env.example` for template

## Security Notes

⚠️ **NEVER commit .env files to git!**

All `.env` files are excluded via `.gitignore`

For Gmail SMTP:
1. Enable 2FA on your Google account
2. Generate an app password at: https://myaccount.google.com/apppasswords
3. Use the app password (16 characters) in SMTP_PASS

## Deployment

### Cloudflare Pages
Set `PUBLIC_API_URL` in Cloudflare Pages environment variables:
- Dashboard → Pages → tpp-new → Settings → Environment variables
- Value: `https://api3.theprofitplatform.com.au`

### VPS (Backend)
- Copy `.env.example` to `.env` in backend/
- Update values for production
- Managed by PM2 (ecosystem.config.js)
