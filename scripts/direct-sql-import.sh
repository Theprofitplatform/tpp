#!/bin/bash
# Direct SQL import for n8n workflow

set -euo pipefail

WORKFLOW_FILE="/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json"

echo "🚀 Direct n8n Workflow Import"
echo "=============================="
echo ""

# Read and escape JSON
WORKFLOW_JSON=$(cat "$WORKFLOW_FILE" | jq -c .)
WORKFLOW_NAME="Advanced SEO Optimization & Analysis Chain"
NODES_JSON=$(echo "$WORKFLOW_JSON" | jq -c '.nodes')
CONNECTIONS_JSON=$(echo "$WORKFLOW_JSON" | jq -c '.connections')

# Create PostgreSQL-ready JSON files
cat > /tmp/nodes.json <<< "$NODES_JSON"
cat > /tmp/connections.json <<< "$CONNECTIONS_JSON"

echo "📊 Importing workflow..."

sudo -u postgres psql -d n8n <<EOF
-- Delete existing
DELETE FROM workflow_entity WHERE name = '$WORKFLOW_NAME';

-- Insert workflow
INSERT INTO workflow_entity (
    name, active, nodes, connections, settings, "staticData", tags, "versionId", "createdAt", "updatedAt"
) VALUES (
    '$WORKFLOW_NAME',
    true,
    '$(cat /tmp/nodes.json | sed "s/'/''/g")'::jsonb,
    '$(cat /tmp/connections.json | sed "s/'/''/g")'::jsonb,
    '{"executionOrder": "v1"}'::jsonb,
    null,
    '[]'::jsonb,
    1,
    NOW(),
    NOW()
) RETURNING id, name, active;

-- Create credentials if needed
INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
VALUES (
    'PostgreSQL - Main DB',
    '{"host":"localhost","database":"n8n","user":"n8nuser","password":"","port":5432,"ssl":"disable"}'::jsonb,
    'postgres',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
VALUES (
    'SMTP - TPP',
    '{"host":"smtp.gmail.com","port":587,"user":"seo@theprofitplatform.com.au","password":"","secure":false}'::jsonb,
    'smtp',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Show results
\echo ''
\echo '✅ Import complete!'
\echo ''
SELECT id, name, active FROM workflow_entity WHERE name = '$WORKFLOW_NAME';
\echo ''
SELECT id, name, type FROM credentials_entity WHERE name IN ('PostgreSQL - Main DB', 'SMTP - TPP');
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Workflow imported successfully!"
    echo ""
    echo "🔄 Restarting n8n..."
    sudo systemctl restart n8n
    sleep 3
    echo "   ✅ n8n restarted"
    echo ""
    echo "🔗 Webhook URL:"
    echo "   https://n8n.theprofitplatform.com.au/webhook/seo-optimization"
    echo ""
    echo "🧪 Run tests:"
    echo "   cd /home/avi/projects/astro-site"
    echo "   node scripts/test-seo-workflow.cjs"
    echo ""
else
    echo "❌ Import failed"
    exit 1
fi

# Cleanup
rm -f /tmp/nodes.json /tmp/connections.json
