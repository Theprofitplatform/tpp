# Cloudflare API Setup Guide

## Step 1: Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use **"Custom token"** template
4. Configure permissions:
   ```
   Zone:Zone:Read (for all zones)
   Zone:Page Rules:Edit (for all zones)
   Account:Cloudflare Pages:Edit (for all accounts)
   ```
5. **Account Resources**: Include all accounts
6. **Zone Resources**: Include all zones
7. Click **"Continue to summary"** → **"Create Token"**
8. **Copy the token** (you'll only see it once!)

## Step 2: Get Account ID

1. In Cloudflare Dashboard, select your domain
2. In the right sidebar, copy the **Account ID**

## Step 3: Set Environment Variables

### For Local Development:
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
```

### For GitHub Actions (Repository Secrets):
1. Go to https://github.com/Theprofitplatform/tpp/settings/secrets/actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Your API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your account ID

## Step 4: Deploy via CLI

Once you have the API token, you can deploy directly:

```bash
# Set the environment variables
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"

# Deploy to Cloudflare Pages
npx wrangler pages project create tpp
npx wrangler pages deploy dist --project-name=tpp
```

## Step 5: Configure Custom Domain

After deployment, set up the subdomain:

1. In Cloudflare Pages → Custom domains
2. Add: `tpp.theprofitplatform.com.au`
3. DNS will be automatically configured

## Automatic Deployment

Once GitHub secrets are configured, every push to `main` branch will automatically deploy to Cloudflare Pages.

## Repository URL
Repository: https://github.com/Theprofitplatform/tpp
Project Name: tpp
Subdomain: tpp.theprofitplatform.com.au