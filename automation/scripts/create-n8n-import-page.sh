#!/bin/bash
set -e

VPS_HOST="n8n.theprofitplatform.com.au"
VPS_USER="root"

echo "🌐 Creating n8n workflow import page..."

# Create HTML page for easy workflow import
HTML_CONTENT='<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>n8n Workflow Import - Manual Blog Automation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .workflow { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .code { background: #f8f8f8; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: monospace; white-space: pre-wrap; }
        .button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .button:hover { background: #005a87; }
        .steps { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>n8n Workflow Import</h1>
            <p>For user: <strong>ABHISHEK MAHARJAN</strong></p>
        </div>

        <div class="workflow">
            <h2>📝 Manual Blog Automation Trigger</h2>
            <p>This workflow allows you to manually trigger blog automation with Discord notifications.</p>

            <div class="steps">
                <h3>🚀 Quick Import Steps:</h3>
                <ol>
                    <li>Copy the JSON below (click "Select All" then Ctrl+C)</li>
                    <li>Go to <a href="http://n8n.theprofitplatform.com.au:5678" target="_blank">n8n</a></li>
                    <li>Click "Workflows" → "Import from JSON"</li>
                    <li>Paste the JSON and click "Import"</li>
                    <li>Activate the workflow and configure credentials</li>
                </ol>
            </div>

            <div class="code" id="workflow-json">
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
            </div>

            <div style="margin-top: 20px;">
                <button class="button" onclick="copyWorkflow()">📋 Copy to Clipboard</button>
                <a href="http://n8n.theprofitplatform.com.au:5678" target="_blank" class="button">🚀 Open n8n</a>
            </div>
        </div>
    </div>

    <script>
        function copyWorkflow() {
            const workflowElement = document.getElementById("workflow-json");
            const textArea = document.createElement("textarea");
            textArea.value = workflowElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("✅ Workflow JSON copied to clipboard!");
        }
    </script>
</body>
</html>'

# Write HTML to VPS
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "echo '$HTML_CONTENT' > /var/www/html/n8n-workflows/import.html"

echo "✅ Web interface created!"
echo ""
echo "🌐 Access the import page at:"
echo "   http://n8n.theprofitplatform.com.au/n8n-workflows/import.html"
echo ""
echo "📋 ABHISHEK MAHARJAN can now:"
echo "1. Open the web page above"
echo "2. Click 'Copy to Clipboard'"
echo "3. Go to n8n and import the workflow"
echo "4. Configure credentials and activate"