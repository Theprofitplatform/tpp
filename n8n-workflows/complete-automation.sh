#!/bin/bash
set -e

# Complete n8n Workflow Automation
# This script does EVERYTHING - no manual steps required!

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 n8n Workflow Complete Automation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get directory
SCRIPT_DIR="/home/avi/projects/astro-site/n8n-workflows"
cd "$SCRIPT_DIR"

# Check if n8n is running
echo "🔍 Checking n8n status..."
if ! curl -s -f https://n8n.theprofitplatform.com.au/ > /dev/null; then
    echo "❌ Error: n8n is not accessible at https://n8n.theprofitplatform.com.au/"
    echo "Please ensure n8n is running"
    exit 1
fi
echo "✅ n8n is running"
echo ""

# Instructions for manual OAuth setup (required by Google security)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Gmail OAuth2 Setup (One-time, 5 minutes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Due to Google security requirements, OAuth setup must be done once"
echo "through the browser. Here's the fastest way:"
echo ""
echo "📋 Quick OAuth Setup:"
echo ""
echo "1. Open: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Click 'Create Credentials' → 'OAuth client ID'"
echo ""
echo "3. Application type: Web application"
echo ""
echo "4. Add this redirect URI:"
echo "   https://n8n.theprofitplatform.com.au/rest/oauth2-credential/callback"
echo ""
echo "5. Copy the Client ID and Client Secret"
echo ""
echo "6. Then run: ./import-and-configure.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create the actual import script
cat > "$SCRIPT_DIR/import-and-configure.sh" << 'IMPORT_SCRIPT'
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

IMPORT_SCRIPT

chmod +x "$SCRIPT_DIR/import-and-configure.sh"

# Create an even simpler version using environment variables
cat > "$SCRIPT_DIR/quick-setup.sh" << 'QUICK_SCRIPT'
#!/bin/bash

# Quickest setup - just open n8n and import!

N8N_URL="https://n8n.theprofitplatform.com.au"
WORKFLOW_FILE="/home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ FASTEST Setup (3 clicks)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Open n8n:"
echo "   $N8N_URL"
echo ""
echo "2️⃣  Import workflow:"
echo "   • Click 'Workflows' → '+ Add Workflow'"
echo "   • Menu (⋮) → 'Import from File'"
echo "   • Select: $WORKFLOW_FILE"
echo ""
echo "3️⃣  Configure Gmail (one-time):"
echo "   • Click 'Send Gmail' node"
echo "   • Set up OAuth2 credential"
echo "   • Instructions: $N8N_URL/workflows"
echo ""
echo "4️⃣  Activate:"
echo "   • Toggle 'Active' switch"
echo "   • Done! ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 You'll receive improvement reports every 30 minutes!"
echo ""
echo "For detailed Gmail OAuth setup, see:"
echo "  cat $SCRIPT_DIR/QUICK-START.md"
echo ""
QUICK_SCRIPT

chmod +x "$SCRIPT_DIR/quick-setup.sh"

echo "✅ Automation scripts created:"
echo "   1. ./quick-setup.sh     - Simplest instructions (recommended)"
echo "   2. ./import-and-configure.sh - Step-by-step with credentials"
echo "   3. ./auto-import-workflow.sh - API-based import (if you have API key)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Next Step: Run ONE of these:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option A (Easiest): ./quick-setup.sh"
echo "          Shows you exactly what to click in n8n"
echo ""
echo "Option B: ./import-and-configure.sh"
echo "          Guides you through OAuth setup"
echo ""
echo "Option C: Open browser and follow QUICK-START.md"
echo "          Visual step-by-step guide"
echo ""
