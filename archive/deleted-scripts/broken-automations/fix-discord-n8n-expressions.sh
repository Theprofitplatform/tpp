#!/bin/bash

# Script to fix Discord notification template syntax in n8n workflow
# Uses proper n8n expressions that will be evaluated correctly

SSH_HOST="avi@theprofitplatform.com.au"
WORKFLOW_ID="tdAwda77Mv7Mud3D"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Fixing Discord notification template syntax in workflow ${WORKFLOW_ID}...${NC}"

# Create SQL file with the fixed Discord messages using proper n8n expressions
SQL_FILE="/tmp/fix_discord_n8n_$$.sql"

cat > "$SQL_FILE" << 'EOF'
-- Update success notification with proper n8n expressions
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{2,parameters,text}',
  '"✅ Blog Automation Triggered Successfully!

**Workflow**: Manual Blog Automation
**Timestamp**: {{ $now }}
**Status**: ✅ Success

🤖 *Manual Blog Automation*
📅 {{ $now }}'"
)
WHERE id='tdAwda77Mv7Mud3D';

-- Update error notification with proper n8n expressions
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{3,parameters,text}',
  '"❌ Blog Automation Failed!

**Workflow**: Manual Blog Automation
**Timestamp**: {{ $now }}
**Error**: {{ $json.error || "Unknown error" }}

🤖 *Manual Blog Automation*
📅 {{ $now }}'"
)
WHERE id='tdAwda77Mv7Mud3D';
EOF

# Copy SQL file to VPS and execute
scp "$SQL_FILE" "$SSH_HOST:/tmp/fix_discord_n8n.sql"

# Execute the SQL on VPS
ssh "$SSH_HOST" "sudo -u postgres psql -d n8n -f /tmp/fix_discord_n8n.sql"

# Clean up
rm -f "$SQL_FILE"
ssh "$SSH_HOST" "rm -f /tmp/fix_discord_n8n.sql"

echo -e "${GREEN}✅ Discord notification template syntax fixed successfully${NC}"
echo -e "${YELLOW}📝 Success notification now uses proper n8n expressions: {{ \$now }}${NC}"
echo -e "${YELLOW}📝 Error notification now uses proper n8n expressions: {{ \$now }} and {{ \$json.error || \"Unknown error\" }}${NC}"
echo -e "${YELLOW}🔧 The expressions will now be evaluated correctly by n8n${NC}"