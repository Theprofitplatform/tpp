#!/bin/bash

# Backend Deployment Script for TPP Keyword Gap Analyzer
# This script automates the backend deployment process

set -e  # Exit on error

echo "🚀 TPP Backend Deployment Script"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend-server" ]; then
    echo -e "${RED}Error: backend-server directory not found${NC}"
    echo "Please run this script from the project root: /mnt/c/Users/abhis/projects/atpp/tpp"
    exit 1
fi

echo "Select deployment platform:"
echo "1) Render.com (FREE - Recommended)"
echo "2) Railway.app"
echo "3) Fly.io"
echo "4) Manual instructions"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "\n${BLUE}🎯 Render.com Deployment${NC}"
        echo "=================================="
        echo ""
        echo "Render.com offers a FREE tier with 750 hours/month - perfect for this project!"
        echo ""
        echo "Steps to deploy:"
        echo "1. Open: https://dashboard.render.com/select-repo?type=web"
        echo "2. Click 'Connect GitHub' and authorize Render"
        echo "3. Select repository: Theprofitplatform/tpp"
        echo "4. Configure:"
        echo "   - Name: tpp-backend"
        echo "   - Root Directory: backend-server"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "   - Plan: Free"
        echo "5. Click 'Create Web Service'"
        echo "6. Wait 2-3 minutes for deployment"
        echo "7. Copy your URL (e.g., https://tpp-backend.onrender.com)"
        echo ""
        echo -e "${YELLOW}Opening Render.com dashboard...${NC}"

        # Try to open browser
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://dashboard.render.com/select-repo?type=web"
        elif command -v cmd.exe &> /dev/null; then
            cmd.exe /c start "https://dashboard.render.com/select-repo?type=web"
        else
            echo "Please manually open: https://dashboard.render.com/select-repo?type=web"
        fi
        ;;

    2)
        echo -e "\n${BLUE}🎯 Railway.app Deployment${NC}"
        echo "=================================="
        echo ""

        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
            npm install -g @railway/cli
        fi

        echo "Logging into Railway (this will open your browser)..."
        railway login

        echo "Navigating to backend-server directory..."
        cd backend-server

        echo "Initializing Railway project..."
        railway init

        echo "Deploying to Railway..."
        railway up

        echo -e "${GREEN}✅ Deployment started!${NC}"
        echo ""
        echo "Getting your deployment URL..."
        railway domain

        echo ""
        echo -e "${GREEN}Copy the URL above and use it to configure Cloudflare!${NC}"
        cd ..
        ;;

    3)
        echo -e "\n${BLUE}🎯 Fly.io Deployment${NC}"
        echo "=================================="
        echo ""

        # Check if Fly CLI is installed
        if ! command -v fly &> /dev/null && ! command -v flyctl &> /dev/null; then
            echo -e "${YELLOW}Fly.io CLI not found. Installing...${NC}"
            curl -L https://fly.io/install.sh | sh
            export PATH="$HOME/.fly/bin:$PATH"
        fi

        echo "Logging into Fly.io..."
        fly auth login

        cd backend-server

        echo "Creating Fly.io app..."
        fly launch --name tpp-backend --region syd --no-deploy

        echo "Deploying to Fly.io..."
        fly deploy

        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "Getting your app URL..."
        fly status

        cd ..
        ;;

    4)
        echo -e "\n${BLUE}📖 Manual Deployment Instructions${NC}"
        echo "=================================="
        echo ""
        echo "Choose a platform and follow the guide:"
        echo ""
        echo "📄 ONE-CLICK-DEPLOY.md - Comprehensive guide with all options"
        echo "📄 QUICK-DEPLOY-GUIDE.md - 5-minute quick start"
        echo "📄 DEPLOYMENT-STATUS.md - Current status and next steps"
        echo ""
        echo "All guides are in the project root directory."
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=================================="
echo "🎉 Next Steps"
echo "==================================${NC}"
echo ""
echo "1. Copy your backend URL from above"
echo "2. Configure Cloudflare Pages:"
echo ""
echo "   cd /mnt/c/Users/abhis/projects/atpp/tpp"
echo "   npx wrangler pages project env add BACKEND_API_URL production"
echo "   # Paste your backend URL (no trailing slash)"
echo ""
echo "3. Redeploy frontend:"
echo ""
echo "   npm run deploy"
echo ""
echo "4. Test production:"
echo "   Visit: https://theprofitplatform.com.au/tools/keyword-gap"
echo ""
echo -e "${GREEN}You're done! 🚀${NC}"
