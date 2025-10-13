#!/bin/bash

# Script to create n8n credentials for the fixed workflow
# This script provides instructions for manual credential creation in n8n

echo "🔧 Setting up n8n credentials for Manual Blog Automation Trigger"
echo ""

# Instructions for creating HTTP Header Auth credential
echo "📋 STEP 1: Create HTTP Header Auth Credential"
echo "================================================="
echo "1. Go to n8n: https://n8n.theprofitplatform.com.au/"
echo "2. Navigate to Settings → Credentials"
echo "3. Click 'Add Credential'"
echo "4. Select 'HTTP Header Auth'"
echo "5. Configure as follows:"
echo "   - Name: VPS Automation API"
echo "   - Headers:"
echo "     - Name: x-api-key"
echo "     - Value: automation-key-2025"
echo "6. Save the credential"
echo ""

# Instructions for creating Discord Webhook credential
echo "📋 STEP 2: Create Discord Webhook Credential"
echo "============================================="
echo "1. In n8n Settings → Credentials"
echo "2. Click 'Add Credential'"
echo "3. Select 'Discord Webhook'"
echo "4. Configure as follows:"
echo "   - Name: Blog Bot Webhook"
echo "   - Webhook URL: https://discord.com/api/webhooks/1424580081195683890/TJMeZ_R3BZGA2VoAawVu2Xg-AGFgkvBpKACjFHqwT50aHT7fagHmKqOFZ3-88zjViBLS"
echo "5. Save the credential"
echo ""

# Instructions for updating the workflow
echo "📋 STEP 3: Update the Workflow"
echo "=============================="
echo "1. Go to Workflows"
echo "2. Open 'Manual Blog Automation Trigger' (ID: tdAwda77Mv7Mud3D)"
echo "3. Update the following nodes:"
echo ""
echo "   🔹 HTTP Request Node ('Trigger Blog Automation'):"
echo "   - Remove hardcoded header parameters"
echo "   - Set Authentication: 'VPS Automation API'"
echo "   - Add timeout: 30000ms"
echo ""
echo "   🔹 Discord Nodes ('Success Notification' & 'Error Notification'):"
echo "   - Remove hardcoded webhookUri"
echo "   - Set Webhook: 'Blog Bot Webhook'"
echo "   - Update success message text"
echo ""
echo "4. Save and activate the workflow"
echo ""

# Alternative: Use the fixed workflow JSON
echo "📋 ALTERNATIVE: Import Fixed Workflow"
echo "======================================"
echo "If you prefer to import the complete fixed workflow:"
echo "1. Copy the JSON from fixed-workflow.json"
echo "2. In n8n, click 'Import from JSON'"
echo "3. Paste the JSON"
echo "4. Configure credentials when prompted"
echo "5. Save and activate"
echo ""

echo "✅ All security issues will be resolved after completing these steps!"
echo ""
echo "🔍 Verification Steps:"
echo "- No hardcoded API keys in workflow"
echo "- No hardcoded Discord webhooks"
echo "- 30-second timeout configured"
echo "- Proper success/failure messages"