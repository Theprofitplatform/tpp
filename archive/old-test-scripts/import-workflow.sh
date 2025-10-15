#!/bin/bash

# Import SEO Workflow to n8n
# Uses n8n API or manual instructions

set -euo pipefail

echo "📤 Importing Advanced SEO Optimization Workflow to n8n..."

WORKFLOW_FILE="/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json"
N8N_URL="${N8N_URL:-https://n8n.theprofitplatform.com.au}"
N8N_API_KEY="${N8N_API_KEY:-}"

if [[ ! -f "$WORKFLOW_FILE" ]]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "Workflow: $WORKFLOW_FILE"
echo "n8n URL: $N8N_URL"
echo ""

# Method 1: Try API import (if API key is available)
if [[ -n "$N8N_API_KEY" ]]; then
    echo "Attempting API import..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -d @"$WORKFLOW_FILE" 2>&1 || echo "000")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [[ "$HTTP_CODE" == "201" ]] || [[ "$HTTP_CODE" == "200" ]]; then
        WORKFLOW_ID=$(echo "$BODY" | jq -r '.id' 2>/dev/null || echo "unknown")
        echo "✅ Workflow imported successfully!"
        echo "   Workflow ID: $WORKFLOW_ID"
        echo "   URL: $N8N_URL/workflow/$WORKFLOW_ID"
        exit 0
    else
        echo "⚠️  API import failed (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
        echo ""
    fi
fi

# Method 2: Manual import instructions
echo "📋 Manual Import Instructions:"
echo ""
echo "1. Open n8n in your browser:"
echo "   $N8N_URL"
echo ""
echo "2. Click the '+' button (Add Workflow)"
echo ""
echo "3. Click 'Import from File'"
echo ""
echo "4. Select this file:"
echo "   $WORKFLOW_FILE"
echo ""
echo "5. Configure credentials:"
echo ""
echo "   PostgreSQL (2 nodes need this):"
echo "   • Nodes: 'Fetch Competitor Data', 'Store Analysis in DB'"
echo "   • Host: localhost"
echo "   • Database: n8n"
echo "   • User: n8nuser"
echo "   • Password: [your password]"
echo "   • Port: 5432"
echo ""
echo "   SMTP/Email (1 node needs this):"
echo "   • Node: 'Send Email Report'"
echo "   • Host: smtp.gmail.com (or your SMTP)"
echo "   • Port: 587 (TLS) or 465 (SSL)"
echo "   • User: your-email@domain.com"
echo "   • Password: [app password for Gmail]"
echo ""
echo "6. Click 'Save' (top-right)"
echo ""
echo "7. Toggle 'Active' switch (top-right)"
echo ""
echo "8. Get webhook URL:"
echo "   • Click 'Webhook - SEO Request' node"
echo "   • Copy 'Production URL'"
echo "   • Should be: $N8N_URL/webhook/seo-optimization"
echo ""
echo "9. Test the workflow:"
echo "   cd /home/avi/projects/astro-site"
echo "   node scripts/test-seo-workflow.cjs"
echo ""

# Method 3: Try to copy to n8n workflows directory (if accessible)
N8N_WORKFLOWS_DIR="/home/n8n/.n8n/workflows"
if [[ -d "$N8N_WORKFLOWS_DIR" ]] && [[ -w "$N8N_WORKFLOWS_DIR" ]]; then
    echo "📁 Alternative: Copy to n8n workflows directory"
    cp "$WORKFLOW_FILE" "$N8N_WORKFLOWS_DIR/seo-optimization.json"
    echo "   ✅ Copied to: $N8N_WORKFLOWS_DIR/seo-optimization.json"
    echo "   Restart n8n to load: sudo systemctl restart n8n"
    echo ""
fi

# Create quick reference card
REF_FILE="/home/avi/projects/astro-site/scripts/workflow-credentials.txt"
cat > "$REF_FILE" <<'EOF'
=== n8n Workflow Credentials Reference ===

PostgreSQL Credential (name: "PostgreSQL - Main DB")
-----------------------------------------------------
Host: localhost
Database: n8n
User: n8nuser
Password: [set your password]
Port: 5432
SSL: Disabled

Used by nodes:
  • Fetch Competitor Data
  • Store Analysis in DB

SMTP Credential (name: "SMTP - TPP")
-------------------------------------
Host: smtp.gmail.com (or your SMTP)
Port: 587 (TLS) or 465 (SSL)
User: seo@theprofitplatform.com.au
Password: [Gmail app password]

For Gmail app password:
1. Go to: https://myaccount.google.com/apppasswords
2. Create new app password
3. Use that password here

Used by node:
  • Send Email Report

Email Settings:
  From: seo@theprofitplatform.com.au
  To: avi@theprofitplatform.com.au
  Subject: Auto-generated based on SEO score

Webhook URL (after activation)
-------------------------------
https://n8n.theprofitplatform.com.au/webhook/seo-optimization

Test with:
curl -X POST https://n8n.theprofitplatform.com.au/webhook/seo-optimization \
  -H "Content-Type: application/json" \
  -d '{"content_id":"test","title":"Test","content":"Test content","keywords":["test"]}'
EOF

echo "✅ Created credentials reference: $REF_FILE"
echo ""
echo "For n8n API key, set environment variable:"
echo "  export N8N_API_KEY='your-api-key'"
echo "  Then run this script again for automated import"
