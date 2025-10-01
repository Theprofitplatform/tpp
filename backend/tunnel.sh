#!/bin/bash

# Start cloudflared tunnel to expose backend API
# This creates a temporary public URL that forwards to localhost:4321

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Starting Cloudflare Tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will create a public URL for your backend API"
echo "Make sure the backend server is running on port 4321"
echo ""
echo "Commands:"
echo "  npm run backend:start   # Start backend"
echo "  npm run pm2:start       # Start with pm2"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start tunnel
cloudflared tunnel --url http://localhost:4321
