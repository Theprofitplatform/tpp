#!/bin/bash

# n8n Database Manager Script
# Direct management of n8n workflows via PostgreSQL database

SSH_HOST="avi@theprofitplatform.com.au"
DB_NAME="n8n"
DB_USER="postgres"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to execute SQL on VPS
execute_sql() {
    local sql="$1"
    ssh "$SSH_HOST" "sudo -u postgres psql -d $DB_NAME -c \"$sql\""
}

# Function to execute SQL and return JSON
execute_sql_json() {
    local sql="$1"
    ssh "$SSH_HOST" "sudo -u postgres psql -d $DB_NAME -t -A -F',' -c \"$sql\""
}

# List all workflows
list_workflows() {
    echo -e "${YELLOW}📋 Listing all workflows...${NC}"
    execute_sql "SELECT id, name, active FROM workflow_entity ORDER BY name;"
}

# Get workflow by ID
get_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}🔍 Fetching workflow ${workflow_id}...${NC}"
    execute_sql "SELECT id, name, active, nodes, connections FROM workflow_entity WHERE id='$workflow_id';"
}

# Get workflow nodes as JSON
get_workflow_nodes() {
    local workflow_id=$1
    echo -e "${YELLOW}🔍 Fetching workflow nodes for ${workflow_id}...${NC}"
    execute_sql_json "SELECT nodes FROM workflow_entity WHERE id='$workflow_id';"
}

# Update workflow nodes
update_workflow_nodes() {
    local workflow_id=$1
    local nodes_json=$2
    echo -e "${YELLOW}📝 Updating workflow nodes for ${workflow_id}...${NC}"

    # Escape the JSON for SQL
    nodes_json_escaped=$(echo "$nodes_json" | sed "s/'/''/g")

    execute_sql "UPDATE workflow_entity SET nodes = '$nodes_json_escaped' WHERE id='$workflow_id';"
    echo -e "${GREEN}✅ Workflow nodes updated successfully${NC}"
}

# Update Discord notification text
update_discord_notification() {
    local workflow_id=$1
    local node_id=$2
    local message=$3

    echo -e "${YELLOW}💬 Updating Discord notification in workflow ${workflow_id}...${NC}"

    # Get current workflow nodes
    current_nodes=$(get_workflow_nodes "$workflow_id")

    # Update the specific node's message parameter using jq
    updated_nodes=$(echo "$current_nodes" | jq --arg node_id "$node_id" --arg message "$message" '
        map(
            if .id == $node_id then
                .parameters.message = $message
            else
                .
            end
        )
    ')

    # Update workflow
    update_workflow_nodes "$workflow_id" "$updated_nodes"
}

# Update HTTP Request node URL
update_http_node() {
    local workflow_id=$1
    local node_id=$2
    local url=$3

    echo -e "${YELLOW}🌐 Updating HTTP Request node in workflow ${workflow_id}...${NC}"

    # Get current workflow nodes
    current_nodes=$(get_workflow_nodes "$workflow_id")

    # Update the specific node's URL parameter using jq
    updated_nodes=$(echo "$current_nodes" | jq --arg node_id "$node_id" --arg url "$url" '
        map(
            if .id == $node_id then
                .parameters.url = $url
            else
                .
            end
        )
    ')

    # Update workflow
    update_workflow_nodes "$workflow_id" "$updated_nodes"
}

# Activate workflow
activate_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}✅ Activating workflow ${workflow_id}...${NC}"
    execute_sql "UPDATE workflow_entity SET active = true WHERE id='$workflow_id';"
    echo -e "${GREEN}✅ Workflow activated${NC}"
}

# Deactivate workflow
deactivate_workflow() {
    local workflow_id=$1
    echo -e "${YELLOW}⏸️  Deactivating workflow ${workflow_id}...${NC}"
    execute_sql "UPDATE workflow_entity SET active = false WHERE id='$workflow_id';"
    echo -e "${GREEN}✅ Workflow deactivated${NC}"
}

# Create new workflow from JSON file
create_workflow() {
    local workflow_name=$1
    local workflow_file=$2

    echo -e "${YELLOW}➕ Creating new workflow: ${workflow_name}...${NC}"

    if [ ! -f "$workflow_file" ]; then
        echo -e "${RED}❌ Workflow file not found: $workflow_file${NC}"
        return 1
    fi

    # Read workflow JSON
    workflow_json=$(cat "$workflow_file")

    # Generate new workflow ID
    new_id=$(uuidgen)

    # Escape JSON for SQL
    workflow_json_escaped=$(echo "$workflow_json" | sed "s/'/''/g")

    # Insert new workflow
    execute_sql "INSERT INTO workflow_entity (id, name, active, nodes, connections, settings, static_data, trigger_count) VALUES ('$new_id', '$workflow_name', false, '$workflow_json_escaped', '{}', '{}', '{}', 0);"

    echo -e "${GREEN}✅ Workflow created with ID: $new_id${NC}"
    echo "$new_id"
}

# Main menu
case "$1" in
    list)
        list_workflows
        ;;
    get)
        get_workflow "$2"
        ;;
    get-nodes)
        get_workflow_nodes "$2"
        ;;
    update-nodes)
        update_workflow_nodes "$2" "$3"
        ;;
    activate)
        activate_workflow "$2"
        ;;
    deactivate)
        deactivate_workflow "$2"
        ;;
    update-discord)
        update_discord_notification "$2" "$3" "$4"
        ;;
    update-http)
        update_http_node "$2" "$3" "$4"
        ;;
    create)
        create_workflow "$2" "$3"
        ;;
    *)
        echo "Usage: $0 {list|get|get-nodes|update-nodes|activate|deactivate|update-discord|update-http|create} [args]"
        echo ""
        echo "Commands:"
        echo "  list                              - List all workflows"
        echo "  get <workflow_id>                 - Get workflow details"
        echo "  get-nodes <workflow_id>           - Get workflow nodes as JSON"
        echo "  update-nodes <workflow_id> <json> - Update workflow nodes"
        echo "  activate <workflow_id>            - Activate workflow"
        echo "  deactivate <workflow_id>          - Deactivate workflow"
        echo "  update-discord <wf_id> <node_id> <message> - Update Discord notification"
        echo "  update-http <wf_id> <node_id> <url>        - Update HTTP Request URL"
        echo "  create <name> <workflow_file>              - Create workflow from JSON file"
        exit 1
        ;;
esac