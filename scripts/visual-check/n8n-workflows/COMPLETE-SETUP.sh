#!/bin/bash

###############################################################################
# n8n Visual Agent - Complete Setup Verification
###############################################################################

echo "======================================"
echo "n8n Visual Agent - Setup Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check n8n service
echo -n "1. Checking n8n service... "
if systemctl is-active --quiet n8n; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "   Run: sudo systemctl start n8n"
fi

# Check workflow in database
echo -n "2. Checking workflow in database... "
WORKFLOW_EXISTS=$(sudo PGPASSWORD=n8npassword psql -h localhost -U n8nuser -d n8n -t -c "SELECT COUNT(*) FROM workflow_entity WHERE name = 'Visual Quality Monitoring Agent';" 2>/dev/null | tr -d ' ')
if [ "$WORKFLOW_EXISTS" = "1" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
fi

# Check if workflow is active
echo -n "3. Checking workflow activation... "
WORKFLOW_ACTIVE=$(sudo PGPASSWORD=n8npassword psql -h localhost -U n8nuser -d n8n -t -c "SELECT active FROM workflow_entity WHERE name = 'Visual Quality Monitoring Agent';" 2>/dev/null | tr -d ' ')
if [ "$WORKFLOW_ACTIVE" = "t" ]; then
    echo -e "${GREEN}✓ Active${NC}"
else
    echo -e "${YELLOW}○ Inactive${NC}"
    echo "   Activate in n8n UI"
fi

# Check webhook registration
echo -n "4. Checking webhook registration... "
WEBHOOK_EXISTS=$(sudo PGPASSWORD=n8npassword psql -h localhost -U n8nuser -d n8n -t -c "SELECT COUNT(*) FROM webhook_entity WHERE \"webhookPath\" = 'visual-agent-webhook';" 2>/dev/null | tr -d ' ')
if [ "$WEBHOOK_EXISTS" -ge "1" ]; then
    echo -e "${GREEN}✓ Registered${NC}"
else
    echo -e "${YELLOW}○ Not registered${NC}"
    echo "   Restart n8n or activate workflow"
fi

# Check old systemd services
echo -n "5. Checking old systemd timer... "
if systemctl is-active --quiet visual-agent-playwright.timer; then
    echo -e "${YELLOW}○ Still running${NC}"
    echo "   Run: sudo systemctl stop visual-agent-playwright.timer"
else
    echo -e "${GREEN}✓ Stopped${NC}"
fi

echo -n "6. Checking old systemd service... "
if systemctl is-active --quiet visual-agent-playwright.service; then
    echo -e "${YELLOW}○ Still running${NC}"
    echo "   Run: sudo systemctl stop visual-agent-playwright.service"
else
    echo -e "${GREEN}✓ Stopped${NC}"
fi

# Check directories
echo -n "7. Checking screenshot directory... "
if [ -d "/home/avi/projects/astro-site/scripts/visual-check/screenshots" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    echo "   Run: mkdir -p /home/avi/projects/astro-site/scripts/visual-check/screenshots"
fi

echo -n "8. Checking test results directory... "
if [ -d "/home/avi/projects/astro-site/scripts/visual-check/test-results" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi

# Test n8n health
echo -n "9. Testing n8n health endpoint... "
HEALTH=$(curl -s http://localhost:5678/healthz 2>/dev/null)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Test webhook (without waiting for completion)
echo -n "10. Testing webhook availability... "
WEBHOOK_RESPONSE=$(curl -s -X POST --max-time 2 http://localhost:5678/webhook/visual-agent-webhook 2>&1)
if echo "$WEBHOOK_RESPONSE" | grep -q "success\|running"; then
    echo -e "${GREEN}✓ Available & responding${NC}"
elif echo "$WEBHOOK_RESPONSE" | grep -q "404"; then
    echo -e "${YELLOW}○ Not registered${NC}"
    echo "   Activate workflow in n8n UI"
elif echo "$WEBHOOK_RESPONSE" | grep -q "timed out"; then
    echo -e "${GREEN}✓ Available (execution started)${NC}"
else
    echo -e "${RED}✗ Error${NC}"
    echo "   Response: $WEBHOOK_RESPONSE"
fi

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "Workflow ID: 5c7e5232f7bb4292bafa2b38381055f2"
echo "Workflow Name: Visual Quality Monitoring Agent"
echo ""
echo "Next Steps:"
echo "1. Open n8n: https://n8n.theprofitplatform.com.au/"
echo "2. Configure SMTP credentials in email nodes"
echo "3. Test workflow execution"
echo "4. Verify email report received"
echo ""
echo "Documentation: DEPLOYMENT-STATUS.md"
echo ""
