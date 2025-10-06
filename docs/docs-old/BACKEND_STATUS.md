# 🚀 Backend Status

## ✅ Currently Running

**Backend API:**
- Status: ✅ **ONLINE**
- Process: PM2 (PID 16613)
- Port: 4321
- Email: ✅ Working (Gmail SMTP)

**Cloudflared Tunnel:**
- Status: ✅ **ONLINE**
- URL: `https://integrated-pdt-returning-neil.trycloudflare.com`
- Process: Running in background (PID 17469)
- Logs: `tunnel.log`

**Frontend:**
- Deployed: ✅ https://5c9cfdf5.tpp-new.pages.dev
- API URL: Points to tunnel above

---

## 🔧 Management Commands

### Check Status
```bash
# Backend
pm2 status
pm2 logs tpp-backend

# Tunnel
ps aux | grep cloudflared
tail -f tunnel.log

# Test endpoints
curl http://localhost:4321/health
curl https://integrated-pdt-returning-neil.trycloudflare.com/health
```

### Restart Services
```bash
# Backend
pm2 restart tpp-backend

# Tunnel (if needed)
pkill cloudflared
nohup cloudflared tunnel --url http://localhost:4321 > tunnel.log 2>&1 &
```

### View Logs
```bash
pm2 logs tpp-backend    # Backend logs
tail -f tunnel.log      # Tunnel logs
```

---

## 📊 What's Permanent

✅ **Backend with PM2**
- Saves state automatically
- Restarts if crashes
- Survives terminal close
- Command: `pm2 list` to see all processes

✅ **Tunnel (Background Process)**
- Runs in background with `nohup`
- Survives terminal close
- Will need manual restart after system reboot

---

## 🔄 After System Reboot

If your system reboots, you need to:

1. **Start PM2 backend:**
   ```bash
   pm2 resurrect
   # OR
   pm2 start ecosystem.config.cjs
   ```

2. **Start tunnel:**
   ```bash
   nohup cloudflared tunnel --url http://localhost:4321 > tunnel.log 2>&1 &
   ```

3. **Get new tunnel URL:**
   ```bash
   sleep 5
   grep "trycloudflare.com" tunnel.log | grep -o "https://[^[:space:]]*"
   ```

4. **Update frontend (if tunnel URL changed):**
   ```bash
   nano .env.local  # Update PUBLIC_API_URL
   npm run build
   npm run deploy
   ```

---

## 🎯 For Production (Permanent Subdomain)

See `PERMANENT_SETUP.md` for:
- Creating a named tunnel
- Setting up `api.theprofitplatform.com.au`
- Running cloudflared as a system service
- No more URL changes!

---

## 📝 Quick Reference

| Service | Status | URL |
|---------|--------|-----|
| Backend API | ✅ Online | http://localhost:4321 |
| Cloudflared Tunnel | ✅ Online | https://integrated-pdt-returning-neil.trycloudflare.com |
| Frontend | ✅ Deployed | https://5c9cfdf5.tpp-new.pages.dev |

**Last Updated:** 2025-10-01 21:29 AEST
