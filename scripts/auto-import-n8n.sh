#!/bin/bash
# Automated n8n workflow import using direct database access

set -euo pipefail

echo "🚀 Automated n8n Workflow Import & Configuration"
echo "================================================="
echo ""

WORKFLOW_FILE="/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json"
DB_NAME="n8n"

# Read workflow JSON
if [[ ! -f "$WORKFLOW_FILE" ]]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📥 Reading workflow file..."
WORKFLOW_JSON=$(cat "$WORKFLOW_FILE")
WORKFLOW_NAME="Advanced SEO Optimization & Analysis Chain"

# Generate unique workflow ID
WORKFLOW_ID=$(date +%s)

echo "📝 Preparing SQL import..."

# Create SQL file for import
SQL_FILE="/tmp/n8n_workflow_import_$$.sql"

cat > "$SQL_FILE" <<EOF
-- Delete existing workflow with same name
DELETE FROM workflow_entity WHERE name = '$WORKFLOW_NAME';

-- Insert workflow
INSERT INTO workflow_entity (
    id,
    name,
    active,
    nodes,
    connections,
    settings,
    "staticData",
    tags,
    "versionId",
    "createdAt",
    "updatedAt"
) VALUES (
    $WORKFLOW_ID,
    '$WORKFLOW_NAME',
    true,
    '$(echo "$WORKFLOW_JSON" | jq -c '.nodes')',
    '$(echo "$WORKFLOW_JSON" | jq -c '.connections')',
    '{"executionOrder": "v1"}',
    null,
    '[]',
    1,
    NOW(),
    NOW()
);

-- Get credential IDs for linking
DO \$\$
DECLARE
    postgres_cred_id INT;
    smtp_cred_id INT;
BEGIN
    -- Check if PostgreSQL credential exists
    SELECT id INTO postgres_cred_id FROM credentials_entity WHERE name = 'PostgreSQL - Main DB' LIMIT 1;

    -- If not exists, create it (you'll need to update password manually)
    IF postgres_cred_id IS NULL THEN
        INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
        VALUES (
            'PostgreSQL - Main DB',
            '{"host":"localhost","database":"n8n","user":"n8nuser","password":"","port":5432,"ssl":"disable"}',
            'postgres',
            NOW(),
            NOW()
        ) RETURNING id INTO postgres_cred_id;

        RAISE NOTICE 'Created PostgreSQL credential with ID: %', postgres_cred_id;
    END IF;

    -- Check if SMTP credential exists
    SELECT id INTO smtp_cred_id FROM credentials_entity WHERE name = 'SMTP - TPP' LIMIT 1;

    -- If not exists, create it (you'll need to update password manually)
    IF smtp_cred_id IS NULL THEN
        INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
        VALUES (
            'SMTP - TPP',
            '{"host":"smtp.gmail.com","port":587,"user":"seo@theprofitplatform.com.au","password":"","secure":false}',
            'smtp',
            NOW(),
            NOW()
        ) RETURNING id INTO smtp_cred_id;

        RAISE NOTICE 'Created SMTP credential with ID: %', smtp_cred_id;
    END IF;
END \$\$;

-- Show results
SELECT id, name, active FROM workflow_entity WHERE name = '$WORKFLOW_NAME';
SELECT id, name, type FROM credentials_entity WHERE name IN ('PostgreSQL - Main DB', 'SMTP - TPP');
EOF

echo "📊 Importing to n8n database..."

# Execute SQL
if sudo -u postgres psql -d "$DB_NAME" -f "$SQL_FILE" 2>&1 | tee /tmp/n8n_import.log; then
    echo ""
    echo "✅ Workflow imported successfully!"

    # Extract workflow ID from log
    ACTUAL_ID=$(grep -E "^\s+[0-9]+" /tmp/n8n_import.log | head -1 | awk '{print $1}')

    if [[ -n "$ACTUAL_ID" ]]; then
        echo "   Workflow ID: $ACTUAL_ID"
        echo "   Workflow Name: $WORKFLOW_NAME"
        echo "   Status: Active"
        echo ""
    fi
else
    echo "❌ Import failed"
    exit 1
fi

# Restart n8n to load the workflow
echo "🔄 Restarting n8n to load workflow..."
sudo systemctl restart n8n
sleep 5

# Check if n8n is running
if systemctl is-active --quiet n8n; then
    echo "✅ n8n restarted successfully"
else
    echo "❌ n8n failed to restart"
    exit 1
fi

echo ""
echo "⚙️  Credential Configuration Required:"
echo ""
echo "Run these commands to set passwords:"
echo ""
echo "# PostgreSQL password (get from your setup)"
echo "sudo -u postgres psql -d n8n -c \"UPDATE credentials_entity SET data = jsonb_set(data, '{password}', '\\\"YOUR_DB_PASSWORD\\\"') WHERE name = 'PostgreSQL - Main DB';\""
echo ""
echo "# SMTP password (Gmail app password)"
echo "sudo -u postgres psql -d n8n -c \"UPDATE credentials_entity SET data = jsonb_set(data, '{password}', '\\\"YOUR_GMAIL_APP_PASSWORD\\\"') WHERE name = 'SMTP - TPP';\""
echo ""
echo "Then restart n8n:"
echo "sudo systemctl restart n8n"
echo ""
echo "Or use this automated script with your credentials:"

# Create credential update script
cat > /tmp/update_n8n_credentials.sh <<'CREDSCRIPT'
#!/bin/bash
# Update n8n credentials

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <db_password> <gmail_app_password>"
    exit 1
fi

DB_PASS="$1"
SMTP_PASS="$2"

sudo -u postgres psql -d n8n <<EOF
UPDATE credentials_entity
SET data = jsonb_set(data, '{password}', '"$DB_PASS"')
WHERE name = 'PostgreSQL - Main DB';

UPDATE credentials_entity
SET data = jsonb_set(data, '{password}', '"$SMTP_PASS"')
WHERE name = 'SMTP - TPP';

SELECT name, type,
       CASE WHEN data->>'password' = '' THEN '❌ Missing' ELSE '✅ Set' END as password_status
FROM credentials_entity
WHERE name IN ('PostgreSQL - Main DB', 'SMTP - TPP');
EOF

sudo systemctl restart n8n
echo "✅ Credentials updated and n8n restarted"
CREDSCRIPT

chmod +x /tmp/update_n8n_credentials.sh

echo "   /tmp/update_n8n_credentials.sh <db_password> <gmail_app_password>"
echo ""
echo "📋 Webhook URL (after credentials are set):"
echo "   https://n8n.theprofitplatform.com.au/webhook/seo-optimization"
echo ""
echo "🧪 Test command:"
echo "   node /home/avi/projects/astro-site/scripts/test-seo-workflow.cjs"

# Cleanup
rm -f "$SQL_FILE"
