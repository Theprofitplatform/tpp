#!/bin/bash
set -e

echo "🚀 Importing Tool Improvement Agent workflow directly to n8n database..."
echo ""

# Database credentials from .n8n.env
DB_HOST="localhost"
DB_NAME="n8n"
DB_USER="n8nuser"
DB_PASS="n8npassword"

# Export password for psql
export PGPASSWORD="$DB_PASS"

# Create a temporary SQL file with the workflow JSON
cat > /tmp/n8n-workflow-import.sql << 'EOSQL'
-- Import Tool Improvement Agent Workflow
DO $$
DECLARE
    workflow_json jsonb;
    workflow_id text := 'tool-improvement-' || floor(random() * 1000000)::text;
BEGIN
    -- Read the workflow file
    workflow_json := $$WORKFLOW_JSON$$;

    -- Insert the workflow
    INSERT INTO workflow_entity (
        id,
        name,
        active,
        nodes,
        connections,
        settings,
        "staticData",
        tags,
        "pinData",
        "versionId",
        "createdAt",
        "updatedAt"
    )
    SELECT
        workflow_id,
        workflow_json->>'name',
        false,  -- Start inactive, will activate after Gmail setup
        workflow_json->'nodes',
        workflow_json->'connections',
        workflow_json->'settings',
        workflow_json->'staticData',
        COALESCE(workflow_json->'tags', '[]'::jsonb),
        COALESCE(workflow_json->'pinData', '{}'::jsonb),
        COALESCE(workflow_json->>'versionId', '1'),
        NOW(),
        NOW()
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        nodes = EXCLUDED.nodes,
        connections = EXCLUDED.connections,
        settings = EXCLUDED.settings,
        "staticData" = EXCLUDED."staticData",
        "updatedAt" = NOW();

    RAISE NOTICE 'Workflow imported with ID: %', workflow_id;
END $$;
EOSQL

# Replace the placeholder with actual workflow JSON (escaped)
WORKFLOW_JSON=$(cat /home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json | jq -c .)

# Use a simpler direct psql approach
echo "📦 Creating workflow in database..."

psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" << EOSQL
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
    '$(cat /home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json | jq -c .nodes)',
    '$(cat /home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json | jq -c .connections)',
    '{"executionOrder": "v1"}',
    '{"cycleCount": 0}',
    NOW(),
    NOW()
) RETURNING id, name;
EOSQL

echo ""
echo "✅ Workflow imported successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open n8n: https://n8n.theprofitplatform.com.au/workflows"
echo ""
echo "2. Find 'Tool Improvement Agent' workflow"
echo ""
echo "3. Click to open it"
echo ""
echo "4. Configure Gmail OAuth2 (one-time):"
echo "   • Click 'Send Gmail' node"
echo "   • Create new Gmail OAuth2 credential"
echo "   • Follow the OAuth wizard"
echo ""
echo "5. Activate the workflow (toggle switch)"
echo ""
echo "6. Done! You'll receive reports every 30 minutes"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cleanup
rm -f /tmp/n8n-workflow-import.sql
unset PGPASSWORD
EOSQL

chmod +x /home/avi/projects/astro-site/n8n-workflows/db-import.sh

echo "✅ Database import script created!"
echo ""
