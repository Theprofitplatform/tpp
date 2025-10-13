# n8n Workflow Templates for VPS Blog Automation

This document provides ready-to-use n8n workflow templates for integrating with your VPS blog automation system.

## Available API Endpoints

Your backend server now provides these automation endpoints:

- `POST /api/automation/blog-staging` - Trigger blog staging workflow
- `POST /api/automation/blog-automation` - Trigger full blog automation
- `POST /api/automation/health-check` - Trigger health check
- `GET /api/automation/status` - Get automation status

**Base URL**: `http://localhost:4321`
**Authentication**: `x-api-key: automation-key-2025`

> **Note**: Since n8n runs on the same VPS as the backend, use `localhost:4321` for API calls.

## Workflow Templates

### 1. Manual Blog Automation Trigger

Use this workflow to manually trigger blog automation from n8n.

**n8n JSON Template:**
```json
{
  "name": "Manual Blog Automation Trigger",
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:4321/api/automation/blog-automation",
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
    }
  ],
  "connections": {
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
```

### 2. Health Check Monitor

Use this workflow to monitor your VPS automation health status.

**n8n JSON Template:**
```json
{
  "name": "VPS Health Check Monitor",
  "nodes": [
    {
      "parameters": {
        "method": "GET",
        "url": "http://localhost:4321/api/automation/status",
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
```

### 3. Blog Staging Workflow

Use this workflow to trigger only the staging process without full deployment.

**n8n JSON Template:**
```json
{
  "name": "Blog Staging Workflow",
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:4321/api/automation/blog-staging",
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
            }
          ]
        },
        "options": {}
      },
      "id": "staging-trigger",
      "name": "Trigger Blog Staging",
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
      "id": "check-result",
      "name": "Check Result",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "message": "✅ Blog staging triggered successfully!\nWorkflow: {{ $json.workflow }}\nTimestamp: {{ $json.timestamp }}"
      },
      "id": "success-msg",
      "name": "Success Message",
      "type": "n8n-nodes-base.discord",
      "typeVersion": 1,
      "position": [680, 240]
    },
    {
      "parameters": {
        "message": "❌ Blog staging failed!\nError: {{ $json.error }}"
      },
      "id": "error-msg",
      "name": "Error Message",
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
            "node": "Trigger Blog Staging",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Trigger Blog Staging": {
      "main": [
        [
          {
            "node": "Check Result",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Result": {
      "main": [
        [
          {
            "node": "Success Message",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Setup Instructions

### 1. Configure n8n HTTP Request Nodes

For each workflow:
1. The URLs are already set to `http://14.202.179.32:4321` (your VPS IP)
2. Ensure the API key `automation-key-2025` matches your backend configuration
3. Configure Discord webhook credentials in n8n

### 2. Authentication Setup

In n8n, create a credential for HTTP Header Authentication:
- **Name**: `VPS-Automation-API` (⚠️ No spaces allowed!)
- **Type**: `HTTP Header Auth`
- **Headers**: `x-api-key: automation-key-2025`

### 3. Discord Integration

Set up Discord webhook credentials in n8n:
- **Name**: `Blog-Bot-Webhook` (⚠️ No spaces allowed!)
- **Webhook URL**: Your Discord webhook URL
- **Username**: `Blog Automation Bot`

### 4. Import Workflows

1. Copy the JSON template
2. In n8n, click "Import from JSON"
3. Paste the template
4. Update URLs and credentials
5. Activate the workflow

## API Reference

### Trigger Blog Automation
```http
POST /api/automation/blog-automation
Content-Type: application/json
x-api-key: automation-key-2025

{
  "force": false,
  "topicId": null,
  "timeout": 7200000,
  "enableGitCommit": true,
  "enableDeployment": true
}
```

### Trigger Blog Staging
```http
POST /api/automation/blog-staging
Content-Type: application/json
x-api-key: automation-key-2025

{
  "force": false,
  "topicId": null,
  "timeout": 3600000
}
```

### Get Automation Status
```http
GET /api/automation/status
x-api-key: automation-key-2025
```

## Security Notes

- API keys are configured in `backend/.env`
- Rate limiting is enabled (10 requests per 5 minutes)
- All endpoints require authentication
- Use HTTPS in production environments