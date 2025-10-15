#!/bin/bash

# Cloudflare Pages Setup Script
# Usage: ./scripts/setup-cloudflare.sh

set -euo pipefail

echo "🚀 Cloudflare Pages Automatic Deployment Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler@latest
    echo -e "${GREEN}✅ Wrangler CLI installed${NC}"
fi

echo -e "${BLUE}📋 Current Wrangler version:${NC}"
wrangler --version

echo ""
echo -e "${YELLOW}📝 To complete the setup, you need to:${NC}"
echo ""
echo "1. 🔑 Get your Cloudflare API Token:"
echo "   - Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "   - Click 'Create Token'"
echo "   - Use 'Cloudflare Pages:Edit' template"
echo "   - Select your account and zones"
echo ""
echo "2. 🏢 Get your Account ID:"
echo "   - Go to: https://dash.cloudflare.com"
echo "   - Right sidebar shows your Account ID"
echo ""
echo "3. ⚙️  Configure GitHub Secrets:"
echo "   - Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo "   - Add these secrets:"
echo "     • CLOUDFLARE_API_TOKEN (from step 1)"
echo "     • CLOUDFLARE_ACCOUNT_ID (from step 2)"
echo ""
echo "4. 🌐 Setup Custom Domain (optional):"
echo "   - In Cloudflare Dashboard → Pages → tpp-astro"
echo "   - Go to Custom domains"
echo "   - Add: tpp.theprofitplatform.com.au"
echo "   - Add: test.theprofitplatform.com.au (for previews)"
echo ""

# Check if user wants to authenticate with Cloudflare
read -p "Do you want to authenticate with Cloudflare now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔐 Authenticating with Cloudflare...${NC}"
    wrangler login
    echo -e "${GREEN}✅ Cloudflare authentication complete${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping Cloudflare authentication${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Add GitHub secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)"
echo "2. Push to main branch to trigger automatic deployment"
echo "3. Check deployment status in GitHub Actions"
echo ""
echo -e "${BLUE}🔗 Useful links:${NC}"
echo "• Cloudflare Dashboard: https://dash.cloudflare.com"
echo "• GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
echo "• Site URL (after deployment): https://tpp.theprofitplatform.com.au"
echo ""