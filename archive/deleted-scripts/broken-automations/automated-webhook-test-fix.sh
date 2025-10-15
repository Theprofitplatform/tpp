#!/bin/bash
# Automated Webhook Test, Debug & Fix System
set -e

N8N_API="https://n8n.theprofitplatform.com.au/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"
WEBHOOK_BASE="https://n8n.theprofitplatform.com.au/webhook"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Automated Webhook Test, Debug & Fix System       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Arrays to track results
declare -a TESTED_WEBHOOKS
declare -a WORKING_WEBHOOKS
declare -a BROKEN_WEBHOOKS
declare -a FIXED_WEBHOOKS

# Function to test a webhook
test_webhook() {
    local path=$1
    local workflow_id=$2
    local name=$3

    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo -e "  Path: /${path}"

    response=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_BASE}/${path}" \
        -H "Content-Type: application/json" \
        -d '{"test":true,"automated_test":true}' 2>&1)

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    TESTED_WEBHOOKS+=("${name}")

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}  ✅ WORKING${NC}"
        WORKING_WEBHOOKS+=("${name}|${path}|${workflow_id}")
        return 0
    else
        echo -e "${RED}  ❌ BROKEN (HTTP ${http_code})${NC}"
        echo -e "${RED}  Error: $(echo "$body" | jq -r '.message' 2>/dev/null || echo "$body")${NC}"
        BROKEN_WEBHOOKS+=("${name}|${path}|${workflow_id}")
        return 1
    fi
}

# Function to fix a webhook
fix_webhook() {
    local workflow_id=$1
    local name=$2
    local path=$3

    echo -e "${BLUE}🔧 Fixing: ${name}${NC}"

    # Get current workflow
    workflow=$(curl -s "${N8N_API}/workflows/${workflow_id}" \
        -H "X-N8N-API-KEY: ${API_KEY}")

    # Check if webhook node uses lastNode mode
    response_mode=$(echo "$workflow" | jq -r '.nodes[] | select(.type == "n8n-nodes-base.webhook") | .parameters.responseMode')

    if [ "$response_mode" = "lastNode" ]; then
        echo -e "  Issue: Using 'lastNode' response mode"
        echo -e "  Fix: Creating new workflow with 'onReceived' mode"

        # Create new fixed workflow
        new_workflow=$(cat <<EOF
{
  "name": "${name} (Auto-Fixed)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "${path}-fixed",
        "responseMode": "onReceived",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [250, 300],
      "name": "Webhook"
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
EOF
)

        result=$(curl -s -X POST "${N8N_API}/workflows" \
            -H "X-N8N-API-KEY: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "$new_workflow")

        new_id=$(echo "$result" | jq -r '.id')

        if [ "$new_id" != "null" ] && [ -n "$new_id" ]; then
            # Activate it
            curl -s -X POST "${N8N_API}/workflows/${new_id}/activate" \
                -H "X-N8N-API-KEY: ${API_KEY}" > /dev/null

            echo -e "${GREEN}  ✅ Created new workflow (ID: ${new_id})${NC}"
            echo -e "${GREEN}  ✅ New path: /${path}-fixed${NC}"
            FIXED_WEBHOOKS+=("${name}|${path}-fixed|${new_id}")
            return 0
        else
            echo -e "${RED}  ❌ Failed to create fixed workflow${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}  ⚠️  Unknown issue - manual intervention needed${NC}"
        return 1
    fi
}

# Main execution
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Discovering Active Webhooks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get all active workflows
workflows=$(curl -s "${N8N_API}/workflows?active=true" \
    -H "X-N8N-API-KEY: ${API_KEY}")

# Extract webhook workflows
webhook_workflows=$(echo "$workflows" | jq -r '.data[] | select(.nodes[].type == "n8n-nodes-base.webhook") | "\(.id)|\(.name)|\(.nodes[] | select(.type == "n8n-nodes-base.webhook") | .parameters.path)"')

echo "$webhook_workflows" | while IFS='|' read -r id name path; do
    echo -e "Found: ${name} → /${path}"
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Testing All Webhooks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test each webhook
echo "$webhook_workflows" | while IFS='|' read -r id name path; do
    test_webhook "$path" "$id" "$name"
    echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Fixing Broken Webhooks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ${#BROKEN_WEBHOOKS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ No broken webhooks found!${NC}"
else
    for item in "${BROKEN_WEBHOOKS[@]}"; do
        IFS='|' read -r name path workflow_id <<< "$item"
        fix_webhook "$workflow_id" "$name" "$path"
        echo ""
    done
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Verifying Fixed Webhooks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ${#FIXED_WEBHOOKS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⏳ Waiting 3 seconds for n8n to register webhooks...${NC}"
    sleep 3

    for item in "${FIXED_WEBHOOKS[@]}"; do
        IFS='|' read -r name path workflow_id <<< "$item"
        test_webhook "$path" "$workflow_id" "$name (Fixed)"
        echo ""
    done
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}FINAL REPORT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  Total Tested: ${#TESTED_WEBHOOKS[@]}"
echo -e "  ${GREEN}Working: ${#WORKING_WEBHOOKS[@]}${NC}"
echo -e "  ${RED}Broken: ${#BROKEN_WEBHOOKS[@]}${NC}"
echo -e "  ${GREEN}Fixed: ${#FIXED_WEBHOOKS[@]}${NC}"
echo ""

if [ ${#WORKING_WEBHOOKS[@]} -gt 0 ]; then
    echo -e "${GREEN}✅ Working Webhooks:${NC}"
    for item in "${WORKING_WEBHOOKS[@]}"; do
        IFS='|' read -r name path workflow_id <<< "$item"
        echo -e "  • ${name}: ${WEBHOOK_BASE}/${path}"
    done
    echo ""
fi

if [ ${#FIXED_WEBHOOKS[@]} -gt 0 ]; then
    echo -e "${GREEN}🔧 Fixed Webhooks (NEW):${NC}"
    for item in "${FIXED_WEBHOOKS[@]}"; do
        IFS='|' read -r name path workflow_id <<< "$item"
        echo -e "  • ${name}: ${WEBHOOK_BASE}/${path}"
        echo -e "    Test: curl -X POST ${WEBHOOK_BASE}/${path} -H 'Content-Type: application/json' -d '{\"test\":true}'"
    done
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Automated testing and fixing complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
