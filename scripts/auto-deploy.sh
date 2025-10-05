#!/bin/bash

# Auto-deploy script that:
# 1. Extracts current Cloudflare tunnel URL
# 2. Updates .env.local
# 3. Rebuilds frontend
# 4. Deploys to production

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Auto Deploy with Tunnel URL Update"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Extract tunnel URL
echo "📊 Step 1/3: Extracting tunnel URL from logs..."
TUNNEL_URL=$(pm2 logs cloudflare-tunnel --lines 100 --nostream 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ ERROR: Could not find tunnel URL"
    exit 1
fi

echo "✅ Found: $TUNNEL_URL"
echo ""

# Step 2: Update .env.local
echo "📝 Step 2/3: Updating .env.local..."
ENV_FILE=".env.local"

if grep -q "^PUBLIC_API_URL=" "$ENV_FILE"; then
    sed -i "s|^PUBLIC_API_URL=.*|PUBLIC_API_URL=$TUNNEL_URL|" "$ENV_FILE"
else
    echo "" >> "$ENV_FILE"
    echo "PUBLIC_API_URL=$TUNNEL_URL" >> "$ENV_FILE"
fi

echo "✅ Updated PUBLIC_API_URL=$TUNNEL_URL"
echo ""

# Step 3: Build and deploy
echo "🔨 Step 3/3: Building and deploying..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "📦 Deploying to Cloudflare Pages..."
    npx wrangler pages deploy dist --project-name=tpp

    if [ $? -eq 0 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "🌐 Production URL: https://theprofitplatform.com.au"
        echo "🔗 Backend API: $TUNNEL_URL"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        echo "❌ Deployment failed"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi
