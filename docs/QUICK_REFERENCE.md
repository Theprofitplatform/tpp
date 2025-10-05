# Quick Reference Guide

## Common Tasks

### Deploy to Production
```bash
npm run build
npm run deploy  # or wrangler pages deploy dist
```

### Run Tests
```bash
# Frontend build test
npm run build

# Production parity
npm run parity:scan

# Visual regression
cd scripts/visual-check && npm test
```

### Update Dependencies
```bash
# Frontend
npm update

# API
cd api && npm update

# Backend
cd backend && npm update

# Visual check
cd scripts/visual-check && npm update
```

### Debug Build Issues
```bash
# Clear caches
rm -rf dist/ node_modules/.cache .astro/

# Fresh install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Access Services
- **Frontend**: https://theprofitplatform.com.au
- **API (prod)**: https://api3.theprofitplatform.com.au
- **N8N**: https://n8n.theprofitplatform.com.au
- **Test**: https://test.theprofitplatform.com.au (if configured)

### Development Servers
```bash
# Frontend
npm run dev
# → http://localhost:3001

# API (local)
cd api && npm start
# → http://localhost:3001

# Backend
cd backend && npm start
# → http://localhost:4321
```

### Important Files
- `wrangler.toml` - Cloudflare Pages config
- `.env` - Local environment variables (not committed)
- `docs/architecture/CURRENT_STATE.md` - Architecture docs
- `docs/runbooks/` - Operational procedures
- `package.json` - Frontend dependencies (Astro only)
- `api/package.json` - API service dependencies
- `backend/package.json` - Backend service dependencies

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your changes"

# Push and create PR
git push -u origin feature/your-feature
gh pr create  # if using GitHub CLI
```

### Rollback to Safe State
```bash
# View available tags
git tag -l

# Rollback to pre-cleanup state
git reset --hard pre-cleanup-2025-10-05

# Or checkout a specific commit
git checkout <commit-hash>
```

### Check Service Status
```bash
# PM2 (backend)
pm2 status
pm2 logs tpp-backend

# Node processes
ps aux | grep node

# Port listeners
ss -tulpn | grep -E ":3001|:4321|:5678"
```

### Cloudflare Pages
```bash
# Deploy manually
wrangler pages deploy dist

# Check deployment status
wrangler pages deployment list

# View logs
wrangler pages deployment tail
```

### N8N Workflows
```bash
# Import workflow
# 1. Open https://n8n.theprofitplatform.com.au
# 2. Click "+" → "Import from File"
# 3. Select file from n8n-workflows/

# Test workflow
cd tests && node test-seo-workflow-complete.cjs
```

## Troubleshooting

### Build Fails
1. Check Node version: `node --version` (should be 18+)
2. Clear caches: `rm -rf node_modules/.cache .astro/ dist/`
3. Reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Check for errors in dependencies

### API Not Working
1. Check if running: `ps aux | grep "node.*server"`
2. Check port: `ss -tulpn | grep 3001`
3. Check logs: `pm2 logs tpp-backend` (if using PM2)
4. Verify env vars: `cat api/.env` or `cat backend/.env`

### Visual Tests Failing
1. Check Playwright installation: `cd scripts/visual-check && npx playwright install`
2. Verify Gemini API key in `.env`
3. Check test URL is accessible
4. Review screenshots in `screenshots/` directory

### Git Issues
1. Conflicts: `git status` then resolve manually
2. Detached HEAD: `git checkout main`
3. Lost commits: `git reflog` to find commit hash
4. Undo last commit: `git reset --soft HEAD~1`

## Performance

### Bundle Size
```bash
# Check dist size
du -sh dist/

# Analyze bundle
npm run build && ls -lh dist/_astro/
```

### Database Maintenance
```bash
# Backup database
cp backend/rank-tracker.db backend/rank-tracker.db.backup

# Vacuum and analyze
sqlite3 backend/rank-tracker.db "VACUUM; ANALYZE;"
```

### Screenshot Cleanup
```bash
# Delete old screenshots (7+ days)
find scripts/visual-check/screenshots/ -type d -mtime +7 -delete

# Check size
du -sh scripts/visual-check/screenshots/
```

## Links

- [Architecture Docs](architecture/CURRENT_STATE.md)
- [Environment Variables](ENV_VARS.md)
- [Cleanup Plan](INTELLIGENT_CLEANUP_PLAN_V2.md)
- [Cleanup Critique](CLEANUP_PLAN_CRITIQUE.md)
- [GitHub Repo](https://github.com/Theprofitplatform/tpp)
