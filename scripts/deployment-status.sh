#!/bin/bash

# Deployment Status Check
# Usage: ./scripts/deployment-status.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 Cloudflare Pages Deployment Status"
echo "====================================="

# Repository info
echo -e "${BLUE}📁 Repository Information:${NC}"
echo "  URL: https://github.com/Theprofitplatform/link"
echo "  Branch: $(git branch --show-current)"
echo "  Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
echo ""

# Configuration status
echo -e "${BLUE}⚙️  Configuration Status:${NC}"

# Check files
files=("package.json" "astro.config.mjs" "wrangler.toml" ".github/workflows/cloudflare-pages.yml")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
    fi
done

# Build test
echo ""
echo -e "${BLUE}🏗️  Build Status:${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Last build exists ($(du -sh dist/ | cut -f1))${NC}"
    echo "  Files: $(find dist/ -type f | wc -l)"
else
    echo -e "${YELLOW}⚠️  No build found - run: CF_PAGES=true npm run build${NC}"
fi

# API Token status
echo ""
echo -e "${BLUE}🔐 Authentication Status:${NC}"
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo -e "${GREEN}✅ CLOUDFLARE_API_TOKEN set locally${NC}"
    # Test token
    if wrangler whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Token is valid${NC}"
    else
        echo -e "${RED}❌ Token authentication failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CLOUDFLARE_API_TOKEN not set locally${NC}"
fi

# GitHub secrets reminder
echo ""
echo -e "${BLUE}🔑 GitHub Secrets Checklist:${NC}"
echo "  Go to: https://github.com/Theprofitplatform/link/settings/secrets/actions"
echo ""
echo "  Required secrets:"
echo "  □ CLOUDFLARE_API_TOKEN (or CLOUDFLARE_API_KEY)"
echo "  □ CLOUDFLARE_ACCOUNT_ID: 8fc18f5691f32fccc13eb17e85a0ae10"
echo ""

# Next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. 🔑 Get Valid Cloudflare API Token:"
echo "   • Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "   • Create token with 'Cloudflare Pages:Edit' template"
echo "   • Copy the new token (should be much longer than current)"
echo ""
echo "2. 🔐 Add to GitHub Secrets:"
echo "   • CLOUDFLARE_API_TOKEN: [new-token-from-step-1]"
echo "   • CLOUDFLARE_ACCOUNT_ID: 8fc18f5691f32fccc13eb17e85a0ae10"
echo ""
echo "3. 🚀 Test Deployment:"
echo "   • Push to main branch: git push origin main"
echo "   • Check Actions: https://github.com/Theprofitplatform/link/actions"
echo ""
echo "4. 🌐 Custom Domains (after deployment works):"
echo "   • Production: tpp.theprofitplatform.com.au"
echo "   • Preview: test.theprofitplatform.com.au"
echo ""

# Troubleshooting
echo -e "${YELLOW}🛠️  Troubleshooting:${NC}"
echo "• If API token invalid: Check ./scripts/cloudflare-token-guide.md"
echo "• Build issues: Run ./scripts/validate-deployment.sh"
echo "• General setup: Run ./scripts/setup-cloudflare.sh"
echo ""

echo -e "${GREEN}✨ Ready for deployment once GitHub secrets are configured!${NC}"