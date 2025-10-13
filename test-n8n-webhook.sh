#!/bin/bash
# Automated n8n Webhook Activation Checker and Tester

set -e

WEBHOOK_ID="54xYxJPXqDOV40L3"
WEBHOOK_URL="https://n8n.theprofitplatform.com.au/webhook/blog-test"
N8N_API_URL="https://n8n.theprofitplatform.com.au/api/v1"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 n8n Webhook Activation Checker & Tester${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if workflow is active
echo -e "${YELLOW}🔍 Checking workflow status...${NC}"
WORKFLOW_STATUS=$(curl -s "${N8N_API_URL}/workflows/${WEBHOOK_ID}" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" | jq -r '.active')

if [ "$WORKFLOW_STATUS" = "true" ]; then
    echo -e "${GREEN}✅ Workflow is ACTIVE!${NC}"
    echo ""

    # Test the webhook
    echo -e "${BLUE}🚀 Testing webhook...${NC}"
    echo -e "${BLUE}📍 URL: ${WEBHOOK_URL}${NC}"
    echo ""

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
      -H "Content-Type: application/json" \
      -d '{
        "test": true,
        "message": "Automated test from Claude Code!",
        "source": "n8n-webhook-tester",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    echo -e "${BLUE}📊 Response:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}HTTP Status:${NC} $HTTP_CODE"
    echo ""
    echo -e "${BLUE}Body:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ SUCCESS! Webhook is working!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}💬 Check Discord for notification!${NC}"
        echo -e "${BLUE}🌐 View execution: https://n8n.theprofitplatform.com.au/workflow/${WEBHOOK_ID}${NC}"
    else
        echo -e "${RED}❌ Webhook test failed with HTTP $HTTP_CODE${NC}"
        exit 1
    fi

elif [ "$WORKFLOW_STATUS" = "false" ]; then
    echo -e "${YELLOW}⚠️  Workflow is INACTIVE${NC}"
    echo ""
    echo -e "${BLUE}📋 To activate:${NC}"
    echo "1. Go to: https://n8n.theprofitplatform.com.au/workflow/${WEBHOOK_ID}"
    echo "2. Click the TOGGLE SWITCH in the top-right"
    echo "3. Run this script again to test"
    echo ""
    echo -e "${YELLOW}Attempting auto-activation...${NC}"

    # Try to activate via API
    curl -s -X PUT "${N8N_API_URL}/workflows/${WEBHOOK_ID}" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"active": true}' > /dev/null 2>&1

    sleep 2

    # Check again
    NEW_STATUS=$(curl -s "${N8N_API_URL}/workflows/${WEBHOOK_ID}" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" | jq -r '.active')

    if [ "$NEW_STATUS" = "true" ]; then
        echo -e "${GREEN}✅ Auto-activation successful! Re-running test...${NC}"
        echo ""
        exec "$0"
    else
        echo -e "${RED}❌ Auto-activation failed${NC}"
        echo -e "${YELLOW}Please activate manually in the n8n UI${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Could not determine workflow status${NC}"
    exit 1
fi
