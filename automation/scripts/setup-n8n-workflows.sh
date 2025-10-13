#!/bin/bash

# n8n Workflow Setup Script
# This script creates the automation workflows in n8n

N8N_URL="http://localhost:5678"
N8N_API_KEY="${N8N_API_KEY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if n8n is running
check_n8n() {
    log "Checking n8n status..."
    if curl -s "$N8N_URL/healthz" > /dev/null; then
        log "n8n is running"
        return 0
    else
        error "n8n is not accessible at $N8N_URL"
        return 1
    fi
}

# Create workflow via n8n API
create_workflow() {
    local workflow_name="$1"
    local workflow_file="$2"

    log "Creating workflow: $workflow_name"

    if [ ! -f "$workflow_file" ]; then
        error "Workflow file not found: $workflow_file"
        return 1
    fi

    # Import workflow via n8n API
    local response=$(curl -s -X POST \
        "$N8N_URL/rest/workflows" \
        -H "Content-Type: application/json" \
        -d "@$workflow_file")

    if echo "$response" | grep -q '"id"'; then
        log "✓ Workflow '$workflow_name' created successfully"
    else
        error "Failed to create workflow '$workflow_name'"
        echo "Response: $response"
        return 1
    fi
}

# Main execution
main() {
    log "Starting n8n workflow setup..."

    # Check n8n
    if ! check_n8n; then
        error "Please start n8n first: systemctl start n8n"
        exit 1
    fi

    # Create workflow directory
    local workflow_dir="/tmp/n8n-workflows"
    mkdir -p "$workflow_dir"

    # Create manual blog automation workflow
    cat > "$workflow_dir/blog-automation.json" << 'EOF'
{
  "name": "Manual Blog Automation Trigger",
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://14.202.179.32:4321/api/automation/blog-automation",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-api-key",
              "value": "automation-key-2025"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "force",
              "value": false
            },
            {
              "name": "enableGitCommit",
              "value": true
            },
            {
              "name": "enableDeployment",
              "value": true
            }
          ]
        },
        "options": {}
      },
      "id": "blog-automation-trigger",
      "name": "Trigger Blog Automation",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [240, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": [
            {
              "name": "success",
              "value": "={{ $json.success === true }}"
            }
          ]
        }
      },
      "id": "check-success",
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "message": "✅ Blog automation triggered successfully!\nWorkflow: {{ $json.workflow }}\nTimestamp: {{ $json.timestamp }}"
      },
      "id": "success-notification",
      "name": "Success Notification",
      "type": "n8n-nodes-base.discord",
      "typeVersion": 1,
      "position": [680, 240]
    },
    {
      "parameters": {
        "message": "❌ Blog automation failed!\nError: {{ $json.error }}"
      },
      "id": "error-notification",
      "name": "Error Notification",
      "type": "n8n-nodes-base.discord",
      "typeVersion": 1,
      "position": [680, 380]
    },
    {
      "parameters": {
        "mode": "manual"
      },
      "id": "manual-trigger",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [40, 300]
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Trigger Blog Automation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Trigger Blog Automation": {
      "main": [
        [
          {
            "node": "Check Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Success": {
      "main": [
        [
          {
            "node": "Success Notification",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
EOF

    # Create health check workflow
    cat > "$workflow_dir/health-check.json" << 'EOF'
{
  "name": "VPS Health Check Monitor",
  "nodes": [
    {
      "parameters": {
        "method": "GET",
        "url": "http://14.202.179.32:4321/api/automation/status",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-api-key",
              "value": "automation-key-2025"
            }
          ]
        },
        "options": {}
      },
      "id": "get-status",
      "name": "Get Automation Status",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [240, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": [
            {
              "name": "operational",
              "value": "={{ $json.status === 'operational' }}"
            }
          ]
        }
      },
      "id": "check-status",
      "name": "Check Status",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "message": "✅ VPS Automation Status: Operational\nRunning Workflows: {{ $json.runningWorkflows.length }}\nRecent Logs: {{ $json.recentLogs.length }}"
      },
      "id": "status-ok",
      "name": "Status OK",
      "type": "n8n-nodes-base.discord",
      "typeVersion": 1,
      "position": [680, 240]
    },
    {
      "parameters": {
        "message": "⚠️ VPS Automation Status: {{ $json.status }}\nRunning Workflows: {{ $json.runningWorkflows }}\nRecent Logs: {{ $json.recentLogs }}"
      },
      "id": "status-warning",
      "name": "Status Warning",
      "type": "n8n-nodes-base.discord",
      "typeVersion": 1,
      "position": [680, 380]
    },
    {
      "parameters": {
        "interval": 3600000
      },
      "id": "schedule",
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [40, 300]
    }
  ],
  "connections": {
    "Schedule": {
      "main": [
        [
          {
            "node": "Get Automation Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Automation Status": {
      "main": [
        [
          {
            "node": "Check Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Status": {
      "main": [
        [
          {
            "node": "Status OK",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Status Warning",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
EOF

    # Create workflows
    create_workflow "Manual Blog Automation" "$workflow_dir/blog-automation.json"
    create_workflow "VPS Health Check Monitor" "$workflow_dir/health-check.json"

    log "n8n workflow setup completed!"
    log "Access n8n at: http://localhost:5678"
    log "You'll need to configure Discord webhook credentials manually in the n8n UI"
}

# Run main function
main "$@"