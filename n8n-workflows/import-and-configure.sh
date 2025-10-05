#!/bin/bash
set -e

SCRIPT_DIR="/home/avi/projects/astro-site/n8n-workflows"
N8N_URL="https://n8n.theprofitplatform.com.au"

echo "🚀 Importing workflow to n8n..."
echo ""

# Prompt for OAuth credentials
echo "Enter your Google OAuth credentials:"
read -p "Client ID: " CLIENT_ID
read -sp "Client Secret: " CLIENT_SECRET
echo ""
echo ""

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Both Client ID and Secret are required"
    exit 1
fi

# Save credentials temporarily
CRED_FILE=$(mktemp)
cat > "$CRED_FILE" << EOF
{
  "name": "Gmail OAuth2 for Tool Agent",
  "type": "gmailOAuth2",
  "data": {
    "clientId": "$CLIENT_ID",
    "clientSecret": "$CLIENT_SECRET",
    "scope": "https://www.googleapis.com/auth/gmail.send"
  }
}
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Workflow Import Instructions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: $N8N_URL/workflows"
echo ""
echo "2. Click '+ Add Workflow' (top right)"
echo ""
echo "3. Click the menu icon (⋮) → 'Import from File'"
echo ""
echo "4. Select: $SCRIPT_DIR/tool-improvement-agent-workflow.json"
echo ""
echo "5. After import, click the 'Send Gmail' node"
echo ""
echo "6. In credentials, click 'Create New'"
echo ""
echo "7. Enter these values:"
echo "   Name: Gmail OAuth2 for Tool Agent"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo ""
echo "8. Click 'Connect my account' and authorize"
echo ""
echo "9. Save the workflow"
echo ""
echo "10. Toggle 'Active' switch (top right)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Your credentials are ready to paste!"
echo ""
echo "⏱️  The workflow will then run automatically every 30 minutes"
echo ""
echo "🧪 Test it: Click 'Execute Workflow' to send a test email"
echo ""

# Cleanup
rm -f "$CRED_FILE"

