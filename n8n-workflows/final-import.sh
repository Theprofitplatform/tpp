#!/bin/bash
set -e

cd /home/avi/projects/astro-site/n8n-workflows

echo "🚀 Importing Tool Improvement Agent workflow to n8n..."
echo ""

# Prepare SQL with escaped JSON
cat tool-improvement-agent-workflow.json | jq -r '.nodes' > /tmp/nodes.txt
cat tool-improvement-agent-workflow.json | jq -r '.connections' > /tmp/connections.txt

# Create SQL import file
cat > /tmp/import-workflow.sql << 'EOF'
\set nodes_json `cat /tmp/nodes.txt`
\set conn_json `cat /tmp/connections.txt`

INSERT INTO workflow_entity (
    name,
    active,
    nodes,
    connections,
    settings,
    "staticData",
    "createdAt",
    "updatedAt"
) VALUES (
    'Tool Improvement Agent',
    false,
    :'nodes_json'::jsonb,
    :'conn_json'::jsonb,
    '{"executionOrder": "v1"}'::jsonb,
    '{"cycleCount": 0}'::jsonb,
    NOW(),
    NOW()
) RETURNING id, name, active;
EOF

# Execute import
export PGPASSWORD='n8npassword'
psql -h localhost -U n8nuser -d n8n -f /tmp/import-workflow.sql

# Cleanup
rm -f /tmp/nodes.txt /tmp/connections.txt /tmp/import-workflow.sql

echo ""
echo "✅ Workflow imported successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Success! Workflow is now in n8n"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Final Steps:"
echo ""
echo "1. Open: https://n8n.theprofitplatform.com.au/workflows"
echo ""
echo "2. Find 'Tool Improvement Agent' in your workflows"
echo ""
echo "3. Click on it to open"
echo ""
echo "4. Configure Gmail (click 'Send Gmail' node):"
echo "   • Create new OAuth2 credential"
echo "   • Enter Google Client ID & Secret"
echo "   • Authorize access"
echo ""
echo "5. Activate workflow (toggle switch top-right)"
echo ""
echo "6. Receive improvement reports every 30 minutes!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For Gmail OAuth setup, run: ./setup-gmail.sh"
echo ""
