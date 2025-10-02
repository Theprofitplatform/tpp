#!/bin/bash

echo "🚀 LAUNCHING PRODUCTION SITE..."
echo "=================================="

# Check current DNS
echo "📍 Current DNS Configuration:"
echo "theprofitplatform.com.au → $(dig theprofitplatform.com.au A +short)"

# Test preview site is working
echo -e "\n🔍 Testing preview site..."
PREVIEW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://tpp.pages.dev/)
if [ "$PREVIEW_STATUS" = "200" ]; then
    echo "✅ Preview site (tpp.pages.dev) is LIVE"
else
    echo "❌ Preview site not accessible"
    exit 1
fi

# Test production domain current status
echo -e "\n🔍 Testing production domain..."
PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://theprofitplatform.com.au/ || echo "000")
echo "📊 Production domain status: $PROD_STATUS"

# Since DNS points to VPS, we need to either:
# 1. Deploy the Astro build to the VPS, OR
# 2. Update DNS to point to Cloudflare Pages

echo -e "\n📋 LAUNCH OPTIONS:"
echo "=================================="
echo "Option 1: Deploy to VPS (Current DNS)"
echo "   - Copy dist/ folder to VPS"
echo "   - Update web server configuration"
echo ""
echo "Option 2: Switch DNS to Cloudflare Pages"
echo "   - Update DNS A record"
echo "   - Configure custom domain in Cloudflare"
echo ""

# For immediate launch, let's prepare the deployment package
echo "📦 Preparing deployment package..."

# Check if dist folder exists
if [ -d "tpp-astro/tpp-astro/dist" ]; then
    echo "✅ Built site found in dist/"

    # Create deployment archive
    cd tpp-astro/tpp-astro
    tar -czf ../../production-site.tar.gz -C dist .
    cd ../..

    echo "✅ Created production-site.tar.gz"
    echo "📁 Size: $(du -h production-site.tar.gz | cut -f1)"

    echo -e "\n🎯 READY FOR DEPLOYMENT!"
    echo "=================================="
    echo "1. Upload production-site.tar.gz to your VPS"
    echo "2. Extract to web root directory"
    echo "3. Update web server configuration"
    echo "4. Site will be live on theprofitplatform.com.au"

else
    echo "❌ Built site not found. Building now..."
    cd tpp-astro/tpp-astro && npm run build && cd ../..
fi

echo -e "\n✨ PRODUCTION LAUNCH READY!"