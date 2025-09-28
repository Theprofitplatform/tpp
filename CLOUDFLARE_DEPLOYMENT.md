# Cloudflare Pages Deployment Guide

## Overview
This project is configured for dual deployment:
- **VPS Deployment**: Node.js server with PM2 on port 3001
- **Cloudflare Pages**: Static build for global CDN deployment

## Subdomain Setup
Proposed subdomain: `tpp.theprofitplatform.com.au`

## Cloudflare Pages Setup

### 1. Manual Deployment via Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Pages → Create a project
3. Connect to Git repository: `Theprofitplatform/tpp-astro`
4. Configuration:
   - **Project name**: `tpp-astro`
   - **Production branch**: `main`
   - **Build command**: `CF_PAGES=true npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or `/tpp-astro` if in monorepo)

### 2. Environment Variables
Add these to Cloudflare Pages environment variables:
```
CF_PAGES=true
NODE_VERSION=18
```

### 3. Custom Domain
1. In Pages project settings → Custom domains
2. Add custom domain: `tpp.theprofitplatform.com.au`
3. Configure DNS:
   - **Type**: CNAME
   - **Name**: tpp
   - **Target**: tpp-astro.pages.dev (or your Pages URL)

### 4. Automatic Deployment via GitHub Actions
The included GitHub Action (`.github/workflows/cloudflare-pages.yml`) requires these secrets:
- `CLOUDFLARE_API_TOKEN`: API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Build Configuration

The project automatically detects deployment environment:
- **Local/VPS**: Uses Node.js adapter with SSR
- **Cloudflare Pages**: Uses static build when `CF_PAGES=true`

## DNS Configuration

Add to your Cloudflare DNS:
```
Type: CNAME
Name: tpp
Target: tpp-astro.pages.dev
Proxy: Enabled (orange cloud)
```

## Commands

### Local Development
```bash
npm run dev  # Development server on port 3001
```

### VPS Deployment
```bash
npm run build           # Build for Node.js
npm run pm2:start      # Start with PM2
```

### Cloudflare Build
```bash
CF_PAGES=true npm run build  # Build for static deployment
```

## File Structure
```
├── .github/workflows/cloudflare-pages.yml  # GitHub Actions
├── wrangler.toml                           # Cloudflare config
├── _redirects                              # Page redirects
├── astro.config.mjs                        # Dual environment config
└── dist/                                   # Build output
```

## Testing

1. **VPS**: http://31.97.222.218:3001
2. **Cloudflare**: https://tpp.theprofitplatform.com.au (after setup)

## Security Notes

- The static build removes server-side features
- All dynamic functionality should be client-side compatible
- Environment variables are build-time only in static mode