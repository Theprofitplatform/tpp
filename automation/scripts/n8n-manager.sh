#!/bin/bash

# n8n Workflow Manager Script
# Direct management of n8n workflows via API

N8N_URL="https://n8n.theprofitplatform.com.au/api/v1"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make n8n API calls
n8n_api() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -z "$data" ]; then
        curl -s -X "$method" "${N8N_URL}${endpoint}" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "${N8N_URL}${endpoint}" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# List all workflows
list_workflows() {
    echo -e "${YELLOW}📋 Listing all workflows...${NC}"
    n8n_api "GET" "/workflows" | jq -r '.data[] | "ID: \(.id) | Name: \(.name) | Active: \(.active)"'
}

# Get workflow by ID
get_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}🔍 Fetching workflow ${workflow_id}...${NC}"
    n8n_api "GET" "/workflows/${workflow_id}"
}

# Update workflow
update_workflow() {
    local workflow_id=$1
    local workflow_json=$2
    echo -e "${YELLOW}📝 Updating workflow ${workflow_id}...${NC}"
    n8n_api "PATCH" "/workflows/${workflow_id}" "$workflow_json"
}

# Create workflow
create_workflow() {
    local workflow_json=$1
    echo -e "${YELLOW}➕ Creating new workflow...${NC}"
    n8n_api "POST" "/workflows" "$workflow_json"
}

# Delete workflow
delete_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}🗑️  Deleting workflow ${workflow_id}...${NC}"
    n8n_api "DELETE" "/workflows/${workflow_id}"
}

# Activate workflow
activate_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}✅ Activating workflow ${workflow_id}...${NC}"
    n8n_api "POST" "/workflows/${workflow_id}/activate"
}

# Deactivate workflow
deactivate_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}⏸️  Deactivating workflow ${workflow_id}...${NC}"
    n8n_api "POST" "/workflows/${workflow_id}/deactivate"
}

# Execute workflow
execute_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}▶️  Executing workflow ${workflow_id}...${NC}"
    n8n_api "POST" "/workflows/${workflow_id}/execute"
}

# Update Discord notification text
update_discord_notification() {
    local workflow_id=$1
    local node_id=$2
    local message=$3

    echo -e "${YELLOW}💬 Updating Discord notification in workflow ${workflow_id}...${NC}"

    # Get current workflow
    workflow=$(get_workflow "$workflow_id")

    # Update the specific node's message parameter
    updated_workflow=$(echo "$workflow" | jq --arg node_id "$node_id" --arg message "$message" '
        .data.nodes = (.data.nodes | map(
            if .id == $node_id then
                .parameters.message = $message
            else
                .
            end
        ))
    ')

    # Update workflow
    update_workflow "$workflow_id" "$updated_workflow"
}

# Update HTTP Request node
update_http_node() {
    local workflow_id=$1
    local node_id=$2
    local url=$3

    echo -e "${YELLOW}🌐 Updating HTTP Request node in workflow ${workflow_id}...${NC}"

    # Get current workflow
    workflow=$(get_workflow "$workflow_id")

    # Update the specific node's URL parameter
    updated_workflow=$(echo "$workflow" | jq --arg node_id "$node_id" --arg url "$url" '
        .data.nodes = (.data.nodes | map(
            if .id == $node_id then
                .parameters.url = $url
            else
                .
            end
        ))
    ')

    # Update workflow
    update_workflow "$workflow_id" "$updated_workflow"
}

# Main menu
case "$1" in
    list)
        list_workflows
        ;;
    get)
        get_workflow "$2"
        ;;
    update)
        update_workflow "$2" "$3"
        ;;
    create)
        create_workflow "$2"
        ;;
    delete)
        delete_workflow "$2"
        ;;
    activate)
        activate_workflow "$2"
        ;;
    deactivate)
        deactivate_workflow "$2"
        ;;
    execute)
        execute_workflow "$2"
        ;;
    update-discord)
        update_discord_notification "$2" "$3" "$4"
        ;;
    update-http)
        update_http_node "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: $0 {list|get|update|create|delete|activate|deactivate|execute|update-discord|update-http} [args]"
        echo ""
        echo "Commands:"
        echo "  list                              - List all workflows"
        echo "  get <workflow_id>                 - Get workflow details"
        echo "  update <workflow_id> <json>       - Update workflow"
        echo "  create <json>                     - Create new workflow"
        echo "  delete <workflow_id>              - Delete workflow"
        echo "  activate <workflow_id>            - Activate workflow"
        echo "  deactivate <workflow_id>          - Deactivate workflow"
        echo "  execute <workflow_id>             - Execute workflow manually"
        echo "  update-discord <wf_id> <node_id> <message> - Update Discord notification"
        echo "  update-http <wf_id> <node_id> <url>        - Update HTTP Request URL"
        exit 1
        ;;
esac
