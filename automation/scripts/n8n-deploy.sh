#!/bin/bash
# Enhanced n8n deployment for Claude Code
# Deploys workflows to n8n via API with version control support

set -e

# Configuration
N8N_URL="https://n8n.theprofitplatform.com.au/api/v1"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"

WORKFLOW_FILE="$1"
MODE="${2:-update}" # update, create, test, or validate

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage
if [ -z "$WORKFLOW_FILE" ]; then
    echo -e "${YELLOW}Usage: $0 <workflow-file.json> [update|create|test|validate]${NC}"
    echo ""
    echo "Modes:"
    echo "  update   - Update existing workflow (default)"
    echo "  create   - Create new workflow"
    echo "  test     - Test deployment without activating"
    echo "  validate - Validate JSON only, no deployment"
    echo ""
    echo "Examples:"
    echo "  $0 n8n-workflows/active/blog-automation.json"
    echo "  $0 n8n-workflows/staging/new-workflow.json create"
    echo "  $0 n8n-workflows/active/test.json test"
    exit 1
fi

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo -e "${RED}❌ Error: Workflow file not found: $WORKFLOW_FILE${NC}"
    exit 1
fi

# Validate JSON
echo -e "${BLUE}🔍 Validating JSON...${NC}"
if ! jq empty "$WORKFLOW_FILE" 2>/dev/null; then
    echo -e "${RED}❌ Error: Invalid JSON in workflow file${NC}"
    exit 1
fi
echo -e "${GREEN}✅ JSON valid${NC}"

WORKFLOW_NAME=$(jq -r '.name // "Unnamed"' "$WORKFLOW_FILE")
WORKFLOW_ID=$(jq -r '.id // empty' "$WORKFLOW_FILE")

# Validate mode only
if [ "$MODE" = "validate" ]; then
    echo -e "${GREEN}✅ Validation complete: $WORKFLOW_NAME${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Deploying workflow: ${YELLOW}$WORKFLOW_NAME${NC}"
echo -e "${BLUE}📁 File: ${NC}$WORKFLOW_FILE"
echo -e "${BLUE}🔧 Mode: ${NC}$MODE"
if [ -n "$WORKFLOW_ID" ]; then
    echo -e "${BLUE}🆔 ID: ${NC}$WORKFLOW_ID"
fi
echo ""

# Function to call n8n API
n8n_api() {
    local method=$1
    local endpoint=$2
    local data_file=$3

    if [ -z "$data_file" ]; then
        curl -s -X "$method" "${N8N_URL}${endpoint}" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "${N8N_URL}${endpoint}" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            -d @"$data_file"
    fi
}

# Backup existing workflow if updating
if [ -n "$WORKFLOW_ID" ] && [ "$MODE" != "test" ]; then
    BACKUP_DIR="n8n-workflows/archived/$(date +%Y-%m-%d)"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="${BACKUP_DIR}/$(basename "$WORKFLOW_FILE" .json)-${WORKFLOW_ID}-$(date +%H%M%S).json"

    echo -e "${BLUE}💾 Creating backup...${NC}"
    EXISTING=$(n8n_api "GET" "/workflows/${WORKFLOW_ID}" 2>/dev/null || echo "")
    if echo "$EXISTING" | jq -e '.data.id' >/dev/null 2>&1; then
        echo "$EXISTING" | jq '.data' > "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup saved: $BACKUP_FILE${NC}"
    fi
fi

# Check if workflow exists
if [ -n "$WORKFLOW_ID" ]; then
    echo -e "${BLUE}🔍 Checking if workflow exists...${NC}"
    EXISTING=$(n8n_api "GET" "/workflows/${WORKFLOW_ID}" 2>/dev/null || echo "")

    if echo "$EXISTING" | jq -e '.id' >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Found existing workflow${NC}"

        if [ "$MODE" = "update" ] || [ "$MODE" = "test" ]; then
            echo -e "${BLUE}📝 Updating workflow...${NC}"

            # Prepare workflow data - remove fields that n8n API doesn't accept (id and active are read-only)
            WORKFLOW_DATA=$(jq 'del(.id, .active, .createdAt, .updatedAt, .isArchived, .versionId, .triggerCount, .shared, .meta, .pinData, .staticData, .tags)' "$WORKFLOW_FILE")

            RESPONSE=$(curl -s -X PUT "${N8N_URL}/workflows/${WORKFLOW_ID}" \
                -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
                -H "Content-Type: application/json" \
                -d "$WORKFLOW_DATA")

            if echo "$RESPONSE" | jq -e '.id' >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Workflow updated successfully!${NC}"
                NEW_ID=$(echo "$RESPONSE" | jq -r '.id')

                # Update local file with new ID if changed
                if [ "$NEW_ID" != "$WORKFLOW_ID" ]; then
                    jq --arg id "$NEW_ID" '.id = $id' "$WORKFLOW_FILE" > "${WORKFLOW_FILE}.tmp"
                    mv "${WORKFLOW_FILE}.tmp" "$WORKFLOW_FILE"
                    echo -e "${BLUE}📝 Updated workflow ID in file: $NEW_ID${NC}"
                fi

                # Activate if not in test mode
                if [ "$MODE" != "test" ]; then
                    echo -e "${BLUE}🔄 Activating workflow...${NC}"
                    ACTIVATE_RESPONSE=$(curl -s -X PATCH "${N8N_URL}/workflows/${NEW_ID}" \
                        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
                        -H "Content-Type: application/json" \
                        -d '{"active":true}')
                    echo -e "${GREEN}✅ Workflow activated!${NC}"
                else
                    echo -e "${YELLOW}⚠️  Test mode: Workflow NOT activated${NC}"
                fi

                FINAL_ID=$NEW_ID
            else
                echo -e "${RED}❌ Error updating workflow:${NC}"
                echo "$RESPONSE" | jq '.'
                exit 1
            fi
        else
            echo -e "${YELLOW}ℹ️  Workflow exists. Use 'update' mode to modify.${NC}"
            exit 0
        fi
    else
        echo -e "${YELLOW}⚠️  Workflow ID not found on server, creating new...${NC}"
        MODE="create"
    fi
fi

# Create new workflow
if [ "$MODE" = "create" ] && [ -z "$FINAL_ID" ]; then
    echo -e "${BLUE}➕ Creating new workflow...${NC}"

    # Prepare workflow data - remove fields that n8n API doesn't accept (including id and active for new workflows)
    WORKFLOW_DATA=$(jq 'del(.id, .active, .createdAt, .updatedAt, .isArchived, .versionId, .triggerCount, .shared, .meta, .pinData, .staticData, .tags)' "$WORKFLOW_FILE")

    RESPONSE=$(curl -s -X POST "${N8N_URL}/workflows" \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$WORKFLOW_DATA")

    if echo "$RESPONSE" | jq -e '.id' >/dev/null 2>&1; then
        NEW_ID=$(echo "$RESPONSE" | jq -r '.id')
        echo -e "${GREEN}✅ Workflow created successfully!${NC}"
        echo -e "${BLUE}🆔 New workflow ID: ${YELLOW}$NEW_ID${NC}"

        # Update local file with ID
        jq --arg id "$NEW_ID" '.id = $id' "$WORKFLOW_FILE" > "${WORKFLOW_FILE}.tmp"
        mv "${WORKFLOW_FILE}.tmp" "$WORKFLOW_FILE"

        # Activate
        echo -e "${BLUE}🔄 Activating workflow...${NC}"
        ACTIVATE_RESPONSE=$(curl -s -X PATCH "${N8N_URL}/workflows/${NEW_ID}" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{"active":true}')
        echo -e "${GREEN}✅ Workflow activated!${NC}"

        # Move to active directory if not already there
        if [[ "$WORKFLOW_FILE" != *"/active/"* ]]; then
            ACTIVE_DIR="n8n-workflows/active"
            mkdir -p "$ACTIVE_DIR"
            ACTIVE_FILE="${ACTIVE_DIR}/$(basename "$WORKFLOW_FILE")"
            cp "$WORKFLOW_FILE" "$ACTIVE_FILE"
            echo -e "${BLUE}📁 Copied to: $ACTIVE_FILE${NC}"
        fi

        FINAL_ID=$NEW_ID
    else
        echo -e "${RED}❌ Error creating workflow:${NC}"
        echo "$RESPONSE" | jq '.'
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Workflow: ${YELLOW}$WORKFLOW_NAME${NC}"
echo -e "${BLUE}🆔 ID: ${YELLOW}${FINAL_ID:-$WORKFLOW_ID}${NC}"
echo -e "${BLUE}🌐 View at: ${YELLOW}https://n8n.theprofitplatform.com.au/workflow/${FINAL_ID:-$WORKFLOW_ID}${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
