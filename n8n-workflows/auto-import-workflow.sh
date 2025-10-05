#!/bin/bash
set -e

# N8N Auto-Import Workflow Script
# This script automates the complete n8n workflow setup

echo "🚀 Starting n8n Workflow Auto-Import..."
echo ""

# Configuration
N8N_URL="https://n8n.theprofitplatform.com.au"
WORKFLOW_FILE="/home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json"
RECIPIENT_EMAIL="${EMAIL_TO:-abhishekmaharjan3737@gmail.com}"

echo "📋 Configuration:"
echo "  n8n URL: $N8N_URL"
echo "  Workflow: $WORKFLOW_FILE"
echo "  Email recipient: $RECIPIENT_EMAIL"
echo ""

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Error: Workflow file not found at $WORKFLOW_FILE"
    exit 1
fi

echo "✅ Workflow file found"
echo ""

# Function to get n8n API key (stored in environment or prompt)
get_api_key() {
    if [ -n "$N8N_API_KEY" ]; then
        echo "$N8N_API_KEY"
    else
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔐 n8n API Key Required"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "To get your API key:"
        echo "1. Go to: $N8N_URL"
        echo "2. Click your profile (top right)"
        echo "3. Click 'Settings'"
        echo "4. Go to 'API' tab"
        echo "5. Click 'Create API Key'"
        echo "6. Copy the key"
        echo ""
        read -sp "Enter your n8n API key: " api_key
        echo ""
        echo "$api_key"
    fi
}

# Get API key
echo "🔑 Checking for n8n API credentials..."
API_KEY=$(get_api_key)

if [ -z "$API_KEY" ]; then
    echo "❌ Error: No API key provided"
    exit 1
fi

echo "✅ API key configured"
echo ""

# Test API connection
echo "🔌 Testing n8n API connection..."
response=$(curl -s -w "\n%{http_code}" -H "X-N8N-API-KEY: $API_KEY" "$N8N_URL/api/v1/workflows" || echo "000")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" != "200" ]; then
    echo "❌ Error: Cannot connect to n8n API (HTTP $http_code)"
    echo "Please verify:"
    echo "  1. n8n is running at $N8N_URL"
    echo "  2. API key is correct"
    echo "  3. You have network access"
    exit 1
fi

echo "✅ Successfully connected to n8n API"
echo ""

# Import workflow
echo "📤 Importing workflow..."

workflow_data=$(cat "$WORKFLOW_FILE")

import_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$workflow_data")

workflow_id=$(echo "$import_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$workflow_id" ]; then
    echo "❌ Error: Failed to import workflow"
    echo "Response: $import_response"
    exit 1
fi

echo "✅ Workflow imported successfully!"
echo "   Workflow ID: $workflow_id"
echo ""

# Activate workflow
echo "⚡ Activating workflow..."

activate_response=$(curl -s -X PATCH "$N8N_URL/api/v1/workflows/$workflow_id" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"active": true}')

if echo "$activate_response" | grep -q '"active":true'; then
    echo "✅ Workflow activated successfully!"
else
    echo "⚠️  Warning: Could not activate workflow automatically"
    echo "   Please activate it manually in the n8n UI"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ✅ Workflow imported and activated"
echo ""
echo "2. 🔐 Configure Gmail OAuth2:"
echo "   • Go to: $N8N_URL/workflows/$workflow_id"
echo "   • Click the 'Send Gmail' node"
echo "   • Click 'Create New Credential'"
echo "   • Follow the OAuth2 setup wizard"
echo ""
echo "3. 📧 Gmail Setup Guide:"
echo "   a. Go to: https://console.cloud.google.com"
echo "   b. Create project or select existing"
echo "   c. Enable 'Gmail API'"
echo "   d. Create OAuth 2.0 Client ID (Web application)"
echo "   e. Add redirect URI: $N8N_URL/rest/oauth2-credential/callback"
echo "   f. Copy Client ID and Secret to n8n credential"
echo ""
echo "4. ✅ Test the workflow:"
echo "   • Open workflow in n8n"
echo "   • Click 'Execute Workflow' button"
echo "   • Check email at: $RECIPIENT_EMAIL"
echo ""
echo "5. ⏰ Automatic execution:"
echo "   • Workflow runs every 30 minutes"
echo "   • Analyzes one tool per cycle"
echo "   • Sends improvement suggestions via email"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Quick Links:"
echo "   Workflow: $N8N_URL/workflows/$workflow_id"
echo "   Credentials: $N8N_URL/settings/credentials"
echo "   Executions: $N8N_URL/workflows/$workflow_id/executions"
echo ""

# Save workflow ID for future reference
echo "$workflow_id" > /home/avi/projects/astro-site/n8n-workflows/.workflow-id
echo "💾 Workflow ID saved to: /home/avi/projects/astro-site/n8n-workflows/.workflow-id"
echo ""

# Create Gmail setup helper script
cat > /home/avi/projects/astro-site/n8n-workflows/setup-gmail.sh << 'GMAIL_SCRIPT'
#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Gmail OAuth2 Setup Guide"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Step 1: Google Cloud Console"
echo "  1. Go to: https://console.cloud.google.com"
echo "  2. Create new project: 'Tool Improvement Agent'"
echo "  3. Click 'Enable APIs & Services'"
echo "  4. Search 'Gmail API' and enable it"
echo ""
echo "Step 2: Create OAuth Credentials"
echo "  1. Go to 'Credentials' tab"
echo "  2. Click 'Create Credentials' → 'OAuth client ID'"
echo "  3. Application type: 'Web application'"
echo "  4. Name: 'n8n Tool Agent'"
echo "  5. Authorized redirect URIs:"
echo "     https://n8n.theprofitplatform.com.au/rest/oauth2-credential/callback"
echo "  6. Click 'Create'"
echo "  7. Copy 'Client ID' and 'Client Secret'"
echo ""
echo "Step 3: Configure in n8n"
N8N_URL="https://n8n.theprofitplatform.com.au"
WORKFLOW_ID=$(cat /home/avi/projects/astro-site/n8n-workflows/.workflow-id 2>/dev/null || echo "YOUR_WORKFLOW_ID")
echo "  1. Go to: $N8N_URL/workflows/$WORKFLOW_ID"
echo "  2. Click 'Send Gmail' node"
echo "  3. Click credential dropdown"
echo "  4. Click 'Create New Credential'"
echo "  5. Select 'Gmail OAuth2 API'"
echo "  6. Paste Client ID and Client Secret"
echo "  7. Click 'Connect my account'"
echo "  8. Authorize in popup window"
echo "  9. Save the workflow"
echo ""
echo "Step 4: Test"
echo "  1. Click 'Execute Workflow' button"
echo "  2. Check your email!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Need help? Read: /home/avi/projects/astro-site/n8n-workflows/QUICK-START.md"
echo ""
GMAIL_SCRIPT

chmod +x /home/avi/projects/astro-site/n8n-workflows/setup-gmail.sh

echo "📝 Gmail setup guide created: ./setup-gmail.sh"
echo "   Run it anytime with: ./setup-gmail.sh"
echo ""
echo "✨ All done! The workflow is ready to use once you configure Gmail."
echo ""
