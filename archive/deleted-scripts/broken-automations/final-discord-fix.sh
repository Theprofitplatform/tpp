#!/bin/bash

# Final script to fix Discord notification template syntax
# Uses n8n API to update workflow with proper expressions

N8N_URL="https://n8n.theprofitplatform.com.au/api/v1"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"
WORKFLOW_ID="tdAwda77Mv7Mud3D"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Fixing Discord notification template syntax...${NC}"

# Get current workflow
WORKFLOW_JSON=$(curl -s -X GET "${N8N_URL}/workflows/${WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json")

echo -e "${YELLOW}📋 Current workflow retrieved${NC}"

# Create updated workflow with fixed Discord messages
UPDATED_WORKFLOW=$(echo "$WORKFLOW_JSON" | jq '
  .nodes = (.nodes | map(
    if .id == "success-notification" then
      .parameters.text = "✅ Blog Automation Triggered Successfully!\n\n**Workflow**: Manual Blog Automation\n**Timestamp**: {{ $now }}\n**Status**: ✅ Success\n\n🤖 *Manual Blog Automation*\n📅 {{ $now }}"
    elif .id == "error-notification" then
      .parameters.text = "❌ Blog Automation Failed!\n\n**Workflow**: Manual Blog Automation\n**Timestamp**: {{ $now }}\n**Error**: {{ $json.error || \"Unknown error\" }}\n\n🤖 *Manual Blog Automation*\n📅 {{ $now }}"
    else
      .
    end
  ))
')

echo -e "${YELLOW}📝 Updated workflow prepared${NC}"

# Update the workflow
RESPONSE=$(curl -s -X PUT "${N8N_URL}/workflows/${WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_WORKFLOW")

if echo "$RESPONSE" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Discord notifications updated successfully!${NC}"
  echo -e "${YELLOW}📝 Success notification now uses proper n8n expressions${NC}"
  echo -e "${YELLOW}📝 Error notification now uses proper n8n expressions${NC}"
  echo -e "${YELLOW}🔧 Template syntax {{ }} should now resolve to actual values${NC}"
else
  echo -e "${RED}❌ Failed to update workflow${NC}"
  echo "Response: $RESPONSE"
fi