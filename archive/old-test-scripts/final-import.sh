#!/bin/bash
# Final correct n8n workflow import

set -euo pipefail

WORKFLOW_FILE="/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json"
WORKFLOW_NAME="Advanced SEO Optimization & Analysis Chain"

echo "🚀 Final n8n Workflow Import"
echo "============================="
echo ""

# Generate UUID for workflow
WORKFLOW_ID=$(uuidgen)
PG_CRED_ID=$(uuidgen)
SMTP_CRED_ID=$(uuidgen)

# Read JSON
NODES_JSON=$(cat "$WORKFLOW_FILE" | jq -c '.nodes')
CONNECTIONS_JSON=$(cat "$WORKFLOW_FILE" | jq -c '.connections')

echo "📊 Importing workflow (ID: $WORKFLOW_ID)..."

# Escape for SQL
NODES_ESC=$(echo "$NODES_JSON" | sed "s/'/''/g")
CONNECTIONS_ESC=$(echo "$CONNECTIONS_JSON" | sed "s/'/''/g")

sudo -u postgres psql -d n8n <<EOF
-- Delete existing
DELETE FROM workflow_entity WHERE name = '$WORKFLOW_NAME';

-- Insert workflow
INSERT INTO workflow_entity (
    id, name, active, nodes, connections, settings, "staticData", "versionId", "triggerCount", "isArchived", "createdAt", "updatedAt"
) VALUES (
    '$WORKFLOW_ID',
    '$WORKFLOW_NAME',
    true,
    '$NODES_ESC'::json,
    '$CONNECTIONS_ESC'::json,
    '{"executionOrder": "v1"}'::json,
    null,
    '1',
    0,
    false,
    NOW(),
    NOW()
);

-- Create PostgreSQL credential
INSERT INTO credentials_entity (
    id, name, data, type, "createdAt", "updatedAt", "shared"
) VALUES (
    '$PG_CRED_ID',
    'PostgreSQL - Main DB',
    '{"host":"localhost","database":"n8n","user":"n8nuser","password":"","port":5432,"ssl":"disable"}'::json,
    'postgres',
    NOW(),
    NOW(),
    false
) ON CONFLICT (id) DO NOTHING;

-- Create SMTP credential
INSERT INTO credentials_entity (
    id, name, data, type, "createdAt", "updatedAt", "shared"
) VALUES (
    '$SMTP_CRED_ID',
    'SMTP - TPP',
    '{"host":"smtp.gmail.com","port":587,"user":"seo@theprofitplatform.com.au","password":"","secure":false}'::json,
    'smtp',
    NOW(),
    NOW(),
    false
) ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Workflow:', id, name, active FROM workflow_entity WHERE id = '$WORKFLOW_ID';
SELECT 'PostgreSQL Cred:', id, name FROM credentials_entity WHERE id = '$PG_CRED_ID';
SELECT 'SMTP Cred:', id, name FROM credentials_entity WHERE id = '$SMTP_CRED_ID';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Workflow imported successfully!"
    echo ""
    echo "🔄 Restarting n8n..."
    sudo systemctl restart n8n
    sleep 5

    if systemctl is-active --quiet n8n; then
        echo "   ✅ n8n restarted and running"
    else
        echo "   ❌ n8n failed to start"
        exit 1
    fi

    echo ""
    echo "=" * 60
    echo "✅ SETUP COMPLETE!"
    echo "=" * 60
    echo ""
    echo "🔗 Workflow Details:"
    echo "   ID: $WORKFLOW_ID"
    echo "   Name: $WORKFLOW_NAME"
    echo "   Status: Active"
    echo ""
    echo "🔗 Webhook URL:"
    echo "   https://n8n.theprofitplatform.com.au/webhook/seo-optimization"
    echo ""
    echo "⚠️  Set passwords in n8n UI:"
    echo "   1. Open: https://n8n.theprofitplatform.com.au/workflow/$WORKFLOW_ID"
    echo "   2. Click 'Fetch Competitor Data' node"
    echo "   3. Set PostgreSQL password for n8nuser"
    echo "   4. Click 'Send Email Report' node"
    echo "   5. Set Gmail app password"
    echo "   6. Save workflow"
    echo ""
    echo "🧪 Run tests:"
    echo "   cd /home/avi/projects/astro-site"
    echo "   node scripts/test-seo-workflow.cjs"
    echo ""
else
    echo "❌ Import failed"
    exit 1
fi
