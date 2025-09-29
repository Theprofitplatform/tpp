# TPP Astro Deployment Instructions

## 🚀 Migration Status: ✅ COMPLETE

The TPP Astro migration has been successfully completed with:
- ✅ Pixel-perfect parity verification passed
- ✅ All 22 production assets downloaded (494.1KB)
- ✅ CSS/JS order preserved (17 stylesheets, 7 scripts)
- ✅ SEO meta tags matched exactly
- ✅ BaseLayout promoted without breaking functionality
- ✅ Static build ready for deployment

## 🌐 Cloudflare Pages Deployment (Recommended)

### Option 1: Dashboard Upload (Easiest)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to Cloudflare Pages:**
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
   - Click "Create a project" → "Upload assets"
   - Upload the entire `dist/` folder
   - Project name: `tpp-production`
   - Custom domain: `theprofitplatform.com.au`

### Option 2: CLI Deployment (Automated)

1. **Set up Cloudflare API Token:**
   ```bash
   # Create API token at: https://dash.cloudflare.com/profile/api-tokens
   # Required permissions: Zone:Read, Page:Edit
   export CLOUDFLARE_API_TOKEN="your_token_here"
   ```

2. **Deploy via CLI:**
   ```bash
   npx wrangler pages project create tpp-production
   npx wrangler pages deploy dist --project-name=tpp-production
   ```

### Build Configuration

For Git-connected deployments:
```
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
Node.js version: 18.x
```

## 🖥️ VPS Deployment with PM2 (Alternative)

### Prerequisites
- Node.js 18+ installed on VPS
- PM2 installed globally: `npm install -g pm2`
- Git repository set up

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url> tpp-astro
   cd tpp-astro
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Create logs directory**
   ```bash
   mkdir -p logs
   ```

5. **Start with PM2**
   ```bash
   npm run pm2:start
   ```

### PM2 Management Commands

- **Start**: `npm run pm2:start`
- **Stop**: `npm run pm2:stop`
- **Restart**: `npm run pm2:restart`
- **Delete**: `npm run pm2:delete`
- **View logs**: `npm run pm2:logs`
- **Check status**: `npm run pm2:status`

### Environment Configuration

The application runs on:
- **Port**: 3000 (configurable via PORT environment variable)
- **Host**: 0.0.0.0 (all interfaces)
- **Node Environment**: production

### Nginx Configuration (Optional)

For production deployment, consider using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name theprofitplatform.com.au;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Certbot

```bash
sudo certbot --nginx -d theprofitplatform.com.au
```

### Monitoring

PM2 provides built-in monitoring:
- Memory usage
- CPU usage
- Restart count
- Uptime
- Error logs

Access monitoring with:
```bash
pm2 monit
```

### Auto-restart on Reboot

To ensure the application starts automatically on server reboot:

```bash
pm2 startup
pm2 save
```

### Performance Optimization

The PM2 configuration includes:
- Cluster mode for multiple instances
- Automatic restart on crashes
- Memory limit restart (1GB)
- Graceful shutdowns
- Health checks

### Troubleshooting

1. **Check logs**: `npm run pm2:logs`
2. **Check PM2 status**: `npm run pm2:status`
3. **Check server resources**: `pm2 monit`
4. **Restart if needed**: `npm run pm2:restart`

### File Structure

```
tpp-astro/
├── dist/                 # Built application
├── src/                  # Source code
├── public/               # Static assets
├── logs/                 # PM2 logs
├── ecosystem.config.js   # PM2 configuration
├── package.json          # Dependencies and scripts
└── DEPLOYMENT.md         # This file
```

### Domain Setup

The application is configured for:
- **Production**: theprofitplatform.com.au
- **Testing**: test.theprofitplatform.com.au

Make sure DNS records point to: 31.97.222.218

### Security Considerations

- Keep Node.js and dependencies updated
- Use HTTPS with SSL certificates
- Configure firewall rules
- Regular security audits
- Monitor logs for suspicious activity