# TPP Astro Deployment Instructions

## VPS Deployment with PM2

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