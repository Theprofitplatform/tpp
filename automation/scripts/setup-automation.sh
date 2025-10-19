#!/bin/bash

# SEO Automation Setup Script
# One-command setup for the entire automation system

set -e  # Exit on error

echo "🤖 SEO Automation System Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}Project root: ${PROJECT_ROOT}${NC}"
echo ""

# Step 1: Create directory structure
echo "📁 Step 1/6: Creating directory structure..."
mkdir -p automation/config
mkdir -p automation/data
mkdir -p automation/generated/gbp-posts
mkdir -p automation/generated/review-emails
mkdir -p automation/generated/link-outreach
mkdir -p automation/reports
mkdir -p automation/logs
mkdir -p src/content/locations

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 2: Copy example files if needed
echo "📋 Step 2/6: Setting up configuration files..."

if [ ! -f "automation/config/.env" ]; then
    if [ -f "automation/config/.env.example" ]; then
        cp automation/config/.env.example automation/config/.env
        echo -e "${GREEN}✓ Created automation/config/.env from example${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit automation/config/.env and add your ANTHROPIC_API_KEY${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found, skipping${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

if [ ! -f "automation/data/clients.json" ]; then
    if [ -f "automation/data/clients.json.example" ]; then
        cp automation/data/clients.json.example automation/data/clients.json
        echo -e "${GREEN}✓ Created automation/data/clients.json from example${NC}"
        echo -e "${YELLOW}⚠️  Update automation/data/clients.json with your actual clients${NC}"
    else
        echo '[]' > automation/data/clients.json
        echo -e "${GREEN}✓ Created empty automation/data/clients.json${NC}"
    fi
else
    echo -e "${GREEN}✓ clients.json already exists${NC}"
fi

echo ""

# Step 3: Check dependencies
echo "📦 Step 3/6: Checking dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"

# Check if npm packages are installed
if [ ! -d "node_modules/@anthropic-ai/sdk" ]; then
    echo -e "${YELLOW}⚠️  Installing required npm packages...${NC}"
    npm install @anthropic-ai/sdk googleapis
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""

# Step 4: Check for API key
echo "🔑 Step 4/6: Checking API configuration..."

if [ -f "automation/config/.env" ]; then
    if grep -q "your_anthropic_api_key_here" automation/config/.env; then
        echo -e "${RED}✗ ANTHROPIC_API_KEY not set in .env file${NC}"
        echo ""
        echo "To get your API key:"
        echo "1. Go to: https://console.anthropic.com/"
        echo "2. Sign up or log in"
        echo "3. Go to API Keys section"
        echo "4. Create new key"
        echo "5. Copy to automation/config/.env"
        echo ""
        echo -e "${YELLOW}Setup will continue, but automations won't work until API key is set.${NC}"
    else
        # Check if API key is exported as environment variable
        if [ -z "$ANTHROPIC_API_KEY" ]; then
            echo -e "${YELLOW}⚠️  API key in .env file, but not exported to environment${NC}"
            echo "Run: export ANTHROPIC_API_KEY=your_key_here"
        else
            echo -e "${GREEN}✓ ANTHROPIC_API_KEY is configured${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi

echo ""

# Step 5: Make scripts executable
echo "🔧 Step 5/6: Making scripts executable..."

chmod +x automation/scripts/*.sh 2>/dev/null || true
chmod +x automation/scripts/*.mjs 2>/dev/null || true

echo -e "${GREEN}✓ Scripts are executable${NC}"
echo ""

# Step 6: Test basic functionality
echo "🧪 Step 6/6: Testing automation system..."

# Create a simple test to verify scripts exist
REQUIRED_SCRIPTS=(
    "automation/scripts/generate-suburb-pages.mjs"
    "automation/scripts/gbp-auto-poster.mjs"
    "automation/scripts/review-automation.mjs"
    "automation/scripts/rank-tracker.mjs"
    "automation/scripts/link-outreach.mjs"
    "automation/scripts/automation-orchestrator.mjs"
)

MISSING_SCRIPTS=0
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ ! -f "$script" ]; then
        echo -e "${RED}✗ Missing: $script${NC}"
        MISSING_SCRIPTS=$((MISSING_SCRIPTS + 1))
    fi
done

if [ $MISSING_SCRIPTS -eq 0 ]; then
    echo -e "${GREEN}✓ All automation scripts present${NC}"
else
    echo -e "${RED}✗ Missing $MISSING_SCRIPTS script(s)${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""

# Print next steps
echo "📋 Next Steps:"
echo ""
echo "1. Set your API key:"
echo "   ${BLUE}export ANTHROPIC_API_KEY=your_key_here${NC}"
echo ""
echo "2. Test the automation:"
echo "   ${BLUE}npm run automation:help${NC}"
echo ""
echo "3. Generate your first suburb pages:"
echo "   ${BLUE}npm run automation:suburb-pages${NC}"
echo ""
echo "4. Generate GBP posts:"
echo "   ${BLUE}npm run automation:gbp-posts${NC}"
echo ""
echo "5. Read the complete guide:"
echo "   ${BLUE}cat automation/AUTOMATION-SETUP-GUIDE.md${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: automation/AUTOMATION-SETUP-GUIDE.md"
echo "   - Quick Reference: automation/README.md"
echo "   - Completion Summary: LOCAL-SEO-AUTOMATION-COMPLETE.md"
echo ""

# Check if cron is available
if command -v crontab &> /dev/null; then
    echo "⏰ To set up automated scheduling:"
    echo "   ${BLUE}crontab -e${NC}"
    echo "   Add this line:"
    echo "   ${BLUE}0 6 * * * cd $PROJECT_ROOT && npm run automation:scheduled >> automation/logs/cron.log 2>&1${NC}"
    echo ""
fi

echo -e "${GREEN}🎉 Your SEO automation system is ready!${NC}"
echo ""
