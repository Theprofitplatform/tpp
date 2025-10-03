#!/bin/bash

# Script to extract Cloudflare tunnel URL and update .env.local
# Run this after starting the tunnel to automatically configure the frontend

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Cloudflare Tunnel URL Extractor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cloudflare-tunnel process is running
if ! pm2 describe cloudflare-tunnel &> /dev/null; then
    echo "❌ ERROR: cloudflare-tunnel is not running"
    echo ""
    echo "Start it with:"
    echo "  ./scripts/start-production.sh"
    exit 1
fi

echo "📊 Extracting tunnel URL from logs..."
echo ""

# Get the tunnel URL from logs
TUNNEL_URL=$(pm2 logs cloudflare-tunnel --lines 100 --nostream 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ ERROR: Could not find tunnel URL in logs"
    echo ""
    echo "The tunnel might still be starting. Wait 10 seconds and try again:"
    echo "  ./scripts/update-tunnel-url.sh"
    echo ""
    echo "Or check logs manually:"
    echo "  pm2 logs cloudflare-tunnel"
    exit 1
fi

echo "✅ Found tunnel URL: $TUNNEL_URL"
echo ""

# Update .env.local
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating $ENV_FILE..."
    cat > "$ENV_FILE" << EOF
CLOUDFLARE_API_TOKEN=ScYo0g7TUQg79oHQ7bztswx-ew9tJTckWuPEXeT5

# Backend API URL - VPS via Cloudflare Tunnel
PUBLIC_API_URL=$TUNNEL_URL
EOF
else
    echo "📝 Updating $ENV_FILE..."
    # Update or add PUBLIC_API_URL
    if grep -q "^PUBLIC_API_URL=" "$ENV_FILE"; then
        sed -i "s|^PUBLIC_API_URL=.*|PUBLIC_API_URL=$TUNNEL_URL|" "$ENV_FILE"
    else
        echo "" >> "$ENV_FILE"
        echo "# Backend API URL - VPS via Cloudflare Tunnel" >> "$ENV_FILE"
        echo "PUBLIC_API_URL=$TUNNEL_URL" >> "$ENV_FILE"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SUCCESS! .env.local updated with:"
echo ""
echo "   PUBLIC_API_URL=$TUNNEL_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Test the API endpoint:"
echo "   curl $TUNNEL_URL/health"
echo ""
echo "2. Rebuild and deploy frontend:"
echo "   npm run build && npm run deploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
