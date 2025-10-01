#!/bin/bash

# Deployment Validation Script
# Usage: ./scripts/validate-deployment.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Cloudflare Pages Deployment Validation"
echo "========================================"

# Function to check command availability
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is missing${NC}"
        return 1
    fi
}

# Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"
check_command "node"
check_command "npm"
check_command "wrangler"

# Check required files
echo ""
echo -e "${BLUE}📁 Checking Configuration Files...${NC}"
check_file "package.json"
check_file "astro.config.mjs"
check_file "wrangler.toml"
check_file ".github/workflows/cloudflare-pages.yml"
check_file "_redirects"

# Test Cloudflare build
echo ""
echo -e "${BLUE}🏗️  Testing Cloudflare Build...${NC}"
if CF_PAGES=true npm run build; then
    echo -e "${GREEN}✅ Cloudflare build successful${NC}"

    # Check build output
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ Build output generated correctly${NC}"
        echo -e "${BLUE}📊 Build output size:${NC}"
        du -sh dist/
        echo -e "${BLUE}📁 Build structure:${NC}"
        ls -la dist/
    else
        echo -e "${RED}❌ Build output missing or incomplete${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Cloudflare build failed${NC}"
    exit 1
fi

# Validate wrangler configuration
echo ""
echo -e "${BLUE}⚙️  Validating Wrangler Configuration...${NC}"
if wrangler pages project list &>/dev/null; then
    echo -e "${GREEN}✅ Wrangler authenticated${NC}"
else
    echo -e "${YELLOW}⚠️  Wrangler not authenticated (run 'wrangler login')${NC}"
fi

# Check GitHub secrets (if available)
echo ""
echo -e "${BLUE}🔐 GitHub Secrets Checklist:${NC}"
echo "   □ CLOUDFLARE_API_TOKEN"
echo "   □ CLOUDFLARE_ACCOUNT_ID"
echo ""
echo -e "${YELLOW}ℹ️  These secrets must be added manually in GitHub repository settings${NC}"

# Check environment variables
echo ""
echo -e "${BLUE}🌍 Environment Variables:${NC}"
if [ "${CF_PAGES:-}" = "true" ]; then
    echo -e "${GREEN}✅ CF_PAGES is set correctly${NC}"
else
    echo -e "${YELLOW}ℹ️  CF_PAGES not set (normal for local testing)${NC}"
fi

# Domain configuration check
echo ""
echo -e "${BLUE}🌐 Domain Configuration:${NC}"
echo "   Production: tpp.theprofitplatform.com.au"
echo "   Preview: test.theprofitplatform.com.au"
echo ""
echo -e "${YELLOW}ℹ️  Verify these domains are configured in Cloudflare DNS${NC}"

# Final summary
echo ""
echo -e "${GREEN}🎉 Validation Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Add GitHub secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)"
echo "2. Configure custom domains in Cloudflare Pages dashboard"
echo "3. Set up DNS records for custom domains"
echo "4. Push to main branch to trigger automatic deployment"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "• Test build: CF_PAGES=true npm run build"
echo "• Local preview: npm run preview"
echo "• Deploy manually: wrangler pages deploy dist"
echo "• Check deployments: wrangler pages deployment list"
echo ""