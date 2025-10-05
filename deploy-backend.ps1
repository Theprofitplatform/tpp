# Backend Deployment Script for TPP Keyword Gap Analyzer (PowerShell)
# This script automates the backend deployment process

Write-Host "🚀 TPP Backend Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend-server")) {
    Write-Host "Error: backend-server directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the project root: C:\Users\abhis\projects\atpp\tpp"
    exit 1
}

Write-Host "Select deployment platform:"
Write-Host "1) Render.com (FREE - Recommended)"
Write-Host "2) Railway.app"
Write-Host "3) Fly.io"
Write-Host "4) Manual instructions"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🎯 Render.com Deployment" -ForegroundColor Blue
        Write-Host "==================================" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Render.com offers a FREE tier with 750 hours/month - perfect for this project!"
        Write-Host ""
        Write-Host "Steps to deploy:"
        Write-Host "1. Open: https://dashboard.render.com/select-repo?type=web"
        Write-Host "2. Click 'Connect GitHub' and authorize Render"
        Write-Host "3. Select repository: Theprofitplatform/tpp"
        Write-Host "4. Configure:"
        Write-Host "   - Name: tpp-backend"
        Write-Host "   - Root Directory: backend-server"
        Write-Host "   - Build Command: npm install"
        Write-Host "   - Start Command: npm start"
        Write-Host "   - Plan: Free"
        Write-Host "5. Click 'Create Web Service'"
        Write-Host "6. Wait 2-3 minutes for deployment"
        Write-Host "7. Copy your URL (e.g., https://tpp-backend.onrender.com)"
        Write-Host ""
        Write-Host "Opening Render.com dashboard..." -ForegroundColor Yellow
        Start-Process "https://dashboard.render.com/select-repo?type=web"
    }

    "2" {
        Write-Host "`n🎯 Railway.app Deployment" -ForegroundColor Blue
        Write-Host "==================================" -ForegroundColor Blue
        Write-Host ""

        # Check if Railway CLI is installed
        if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
            Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
            npm install -g @railway/cli
        }

        Write-Host "Logging into Railway (this will open your browser)..."
        railway login

        Write-Host "Navigating to backend-server directory..."
        Set-Location backend-server

        Write-Host "Initializing Railway project..."
        railway init

        Write-Host "Deploying to Railway..."
        railway up

        Write-Host "`n✅ Deployment started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Getting your deployment URL..."
        railway domain

        Write-Host ""
        Write-Host "Copy the URL above and use it to configure Cloudflare!" -ForegroundColor Green
        Set-Location ..
    }

    "3" {
        Write-Host "`n🎯 Fly.io Deployment" -ForegroundColor Blue
        Write-Host "==================================" -ForegroundColor Blue
        Write-Host ""

        # Check if Fly CLI is installed
        if (-not (Get-Command fly -ErrorAction SilentlyContinue) -and -not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
            Write-Host "Fly.io CLI not found." -ForegroundColor Yellow
            Write-Host "Please install manually from: https://fly.io/docs/hands-on/install-flyctl/"
            Write-Host ""
            Write-Host "For Windows (PowerShell):"
            Write-Host 'iwr https://fly.io/install.ps1 -useb | iex'
            exit 1
        }

        Write-Host "Logging into Fly.io..."
        fly auth login

        Set-Location backend-server

        Write-Host "Creating Fly.io app..."
        fly launch --name tpp-backend --region syd --no-deploy

        Write-Host "Deploying to Fly.io..."
        fly deploy

        Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Getting your app URL..."
        fly status

        Set-Location ..
    }

    "4" {
        Write-Host "`n📖 Manual Deployment Instructions" -ForegroundColor Blue
        Write-Host "==================================" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Choose a platform and follow the guide:"
        Write-Host ""
        Write-Host "📄 ONE-CLICK-DEPLOY.md - Comprehensive guide with all options"
        Write-Host "📄 QUICK-DEPLOY-GUIDE.md - 5-minute quick start"
        Write-Host "📄 DEPLOYMENT-STATUS.md - Current status and next steps"
        Write-Host ""
        Write-Host "All guides are in the project root directory."
        exit 0
    }

    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "🎉 Next Steps" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Copy your backend URL from above"
Write-Host "2. Configure Cloudflare Pages:"
Write-Host ""
Write-Host "   cd C:\Users\abhis\projects\atpp\tpp"
Write-Host "   npx wrangler pages project env add BACKEND_API_URL production"
Write-Host "   # Paste your backend URL (no trailing slash)"
Write-Host ""
Write-Host "3. Redeploy frontend:"
Write-Host ""
Write-Host "   npm run deploy"
Write-Host ""
Write-Host "4. Test production:"
Write-Host "   Visit: https://theprofitplatform.com.au/tools/keyword-gap"
Write-Host ""
Write-Host "You're done! 🚀" -ForegroundColor Green
