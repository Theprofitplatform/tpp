# Cloudflare Pages Environment Variables Setup

## Required Environment Variables

After migrating to Cloudflare Pages Functions, you need to configure these environment variables in your Cloudflare Pages project.

### How to Set Environment Variables

1. Go to Cloudflare Dashboard
2. Navigate to **Pages** → **tpp-new** (or your project name)
3. Go to **Settings** → **Environment variables**
4. Add the following variables for **Production**

### Email Configuration (MailChannels)

**Note:** Cloudflare Pages Functions use MailChannels API instead of SMTP. No credentials needed!

```
SMTP_FROM=noreply@theprofitplatform.com.au
CONTACT_EMAIL=avi@theprofitplatform.com.au
```

### SERP API Configuration

```
SERP_API_KEY=your_key_here
```

### n8n Workflow Configuration (Optional)

If you're using n8n workflows, add these:

```
N8N_PAGE_PASSWORD=your_secure_password_here

# Workflow 1
N8N_WORKFLOW_1_NAME=Workflow Name
N8N_WORKFLOW_1_WEBHOOK=https://your-n8n-instance.com/webhook/...
N8N_WORKFLOW_1_ICON=🤖

# Workflow 2
N8N_WORKFLOW_2_NAME=Another Workflow
N8N_WORKFLOW_2_WEBHOOK=https://your-n8n-instance.com/webhook/...
N8N_WORKFLOW_2_ICON=⚡

# Add more workflows as needed...
```

## Important Notes

### MailChannels Integration

Cloudflare Pages Functions use **MailChannels** for email sending:
- No SMTP credentials needed
- Free tier: 5,000 emails/day
- Automatic SPF/DKIM signing
- Better deliverability than Gmail SMTP

### DNS Configuration for Email

To improve email deliverability, add these DNS records to your domain:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:relay.mailchannels.net ~all
```

**DKIM Records:**
You'll need to contact MailChannels support or use their verification process to get your DKIM keys.

### Rate Limiting

Cloudflare Pages Functions have built-in rate limiting:
- Contact form: Handled by Cloudflare's DDoS protection
- SERP API: 10 requests/min per IP (implement client-side if needed)
- n8n triggers: 20 requests/min per IP

## New API Endpoints

After deployment, your APIs will be available at:

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `https://api3.theprofitplatform.com.au/health` | `https://theprofitplatform.com.au/health` |
| `https://api3.theprofitplatform.com.au/api/contact` | `https://theprofitplatform.com.au/api/contact` |
| `https://api3.theprofitplatform.com.au/api/serp/rank-check` | `https://theprofitplatform.com.au/api/serp/rank-check` |
| `https://api3.theprofitplatform.com.au/api/n8n/trigger` | `https://theprofitplatform.com.au/api/n8n/trigger` |
| `https://api3.theprofitplatform.com.au/api/n8n/workflows` | `https://theprofitplatform.com.au/api/n8n/workflows` |

## Deployment

After setting environment variables:

```bash
npm run deploy
```

Or using Wrangler directly:

```bash
npx wrangler pages deploy dist --project-name=tpp-new
```

## Testing

After deployment, test each endpoint:

```bash
# Health check
curl https://theprofitplatform.com.au/health

# Contact form (test)
curl -X POST https://theprofitplatform.com.au/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","service":"SEO","message":"Testing new endpoint","consent":true}'

# SERP rank check
curl -X POST https://theprofitplatform.com.au/api/serp/rank-check \
  -H "Content-Type: application/json" \
  -d '{"keyword":"digital marketing","domain":"theprofitplatform.com.au","location":"Australia"}'

# n8n workflows list
curl https://theprofitplatform.com.au/api/n8n/workflows?password=your_password
```

## Migration Checklist

- [ ] Set all environment variables in Cloudflare Pages dashboard
- [ ] Deploy the updated site with `npm run deploy`
- [ ] Test all API endpoints
- [ ] Update any hardcoded API URLs in frontend
- [ ] Configure DNS records for email deliverability
- [ ] Stop the old backend: `pm2 stop tpp-backend`
- [ ] Optionally stop Cloudflare tunnel: `sudo systemctl stop cloudflared`
- [ ] Monitor Cloudflare Pages logs for any errors

## Benefits of This Migration

✅ **No VPS costs** - Runs on Cloudflare's free tier
✅ **Better performance** - Edge network, globally distributed
✅ **No maintenance** - No PM2, no tunnel, no server management
✅ **Auto-scaling** - Handles traffic spikes automatically
✅ **Better email** - MailChannels has better deliverability than Gmail SMTP
✅ **Integrated** - Backend and frontend on same domain
✅ **Security** - Cloudflare's built-in DDoS protection and WAF
