#!/bin/bash

# Keyword Research Tool - Production Deployment Script
# This script deploys the keyword research backend to production

set -e  # Exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Keyword Research Tool Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
echo "📂 Checking directory..."
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Error: server.js not found. Please run this script from the backend directory.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ In backend directory${NC}"
echo ""

# Step 2: Verify new files exist
echo "🔍 Verifying new files..."
if [ ! -f "keyword-research.js" ]; then
    echo -e "${RED}❌ Error: keyword-research.js not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ keyword-research.js exists${NC}"

# Step 3: Check if server.js has the endpoint
if ! grep -q "keyword-research" server.js; then
    echo -e "${RED}❌ Error: server.js doesn't contain keyword-research endpoint!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ server.js contains keyword-research endpoint${NC}"
echo ""

# Step 4: Check if PM2 is installed
echo "🔧 Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 is available${NC}"
echo ""

# Step 5: Check current PM2 processes
echo "📊 Current PM2 status:"
pm2 list
echo ""

# Step 6: Restart backend
echo "🔄 Restarting backend..."
if pm2 list | grep -q "tpp-backend"; then
    echo "   Found tpp-backend process. Restarting..."
    pm2 restart tpp-backend
elif pm2 list | grep -q "server"; then
    echo "   Found server process. Restarting..."
    pm2 restart server
else
    echo -e "${YELLOW}   No existing process found. Starting new process...${NC}"
    pm2 start server.js --name tpp-backend
    pm2 save
fi
echo -e "${GREEN}✓ Backend restarted${NC}"
echo ""

# Step 7: Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Step 8: Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:4321/health || echo "failed")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
    echo "   Check PM2 logs: pm2 logs tpp-backend"
    exit 1
fi
echo ""

# Step 9: Test keyword research endpoint
echo "🔑 Testing keyword research endpoint..."
KEYWORD_RESPONSE=$(curl -s -X POST http://localhost:4321/api/keyword-research \
  -H "Content-Type: application/json" \
  -d '{"keyword":"SEO","location":"Sydney, Australia","intent":"all"}' || echo "failed")

if echo "$KEYWORD_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Keyword research endpoint working!${NC}"
    # Parse and display response
    KEYWORD_COUNT=$(echo "$KEYWORD_RESPONSE" | grep -o '"keyword"' | wc -l)
    echo "   Keywords returned: $KEYWORD_COUNT"
else
    echo -e "${RED}❌ Keyword research endpoint failed${NC}"
    echo "   Response: $KEYWORD_RESPONSE"
    echo "   Check PM2 logs: pm2 logs tpp-backend"
    exit 1
fi
echo ""

# Step 10: Show PM2 logs
echo "📝 Recent logs:"
pm2 logs tpp-backend --lines 10 --nostream
echo ""

# Step 11: Success message
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Backend Status:"
pm2 list
echo ""
echo "🔗 Endpoints:"
echo "   Health: http://localhost:4321/health"
echo "   Keyword Research: POST /api/keyword-research"
echo ""
echo "📖 Useful Commands:"
echo "   View logs: pm2 logs tpp-backend"
echo "   Restart: pm2 restart tpp-backend"
echo "   Stop: pm2 stop tpp-backend"
echo "   Monitor: pm2 monit"
echo ""
echo "🎉 Keyword Research Tool is now LIVE!"
echo ""
