#!/bin/bash

# Production startup script for TPP Backend + Cloudflare Tunnel
# This script starts both the backend server and Cloudflare tunnel using PM2

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 TPP Backend Production Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ ERROR: cloudflared is not installed"
    echo ""
    echo "Install with:"
    echo "  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared"
    echo "  chmod +x cloudflared"
    echo "  sudo mv cloudflared /usr/local/bin/"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ ERROR: PM2 is not installed"
    echo ""
    echo "Install with:"
    echo "  npm install -g pm2"
    exit 1
fi

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env not found"
    echo "   Using environment variables from ecosystem.config.cjs"
fi

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pm2 delete tpp-backend cloudflare-tunnel 2>/dev/null || true

# Start all processes
echo ""
echo "✅ Starting backend server and tunnel..."
pm2 start ecosystem.config.cjs

# Wait for processes to start
sleep 3

# Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Getting Cloudflare Tunnel URL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 2
pm2 logs cloudflare-tunnel --lines 50 --nostream | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1 | tee /tmp/tpp-tunnel-url.txt || echo "⚠️  Tunnel URL not found yet. Check logs with: pm2 logs cloudflare-tunnel"

echo ""
if [ -f /tmp/tpp-tunnel-url.txt ] && [ -s /tmp/tpp-tunnel-url.txt ]; then
    TUNNEL_URL=$(cat /tmp/tpp-tunnel-url.txt)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! Your backend is now running at:"
    echo ""
    echo "   🌐 $TUNNEL_URL"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 NEXT STEPS:"
    echo ""
    echo "1. Update .env.local with the tunnel URL:"
    echo "   PUBLIC_API_URL=$TUNNEL_URL"
    echo ""
    echo "2. Rebuild and deploy frontend:"
    echo "   npm run build && npm run deploy"
    echo ""
else
    echo "⚠️  Could not extract tunnel URL automatically."
    echo ""
    echo "Run this command to get the URL:"
    echo "  pm2 logs cloudflare-tunnel --lines 20"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Useful Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  pm2 status              # Check process status"
echo "  pm2 logs                # View all logs"
echo "  pm2 logs tpp-backend    # Backend logs only"
echo "  pm2 logs cloudflare-tunnel  # Tunnel logs only"
echo "  pm2 restart all         # Restart all processes"
echo "  pm2 stop all            # Stop all processes"
echo "  pm2 delete all          # Remove all processes"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Production environment is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
