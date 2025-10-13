#!/bin/bash

# Script to fix Discord notification formatting in n8n workflow
# This updates the Discord nodes to use proper n8n expressions

SSH_HOST="avi@theprofitplatform.com.au"
WORKFLOW_ID="tdAwda77Mv7Mud3D"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Fixing Discord notification formatting in workflow ${WORKFLOW_ID}...${NC}"

# Create SQL file with the update commands
SQL_FILE="/tmp/fix_discord_$$.sql"

cat > "$SQL_FILE" << 'EOF'
-- Update success notification with proper n8n expressions
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{2,parameters,text}',
  '"✅ Blog Automation Triggered Successfully!\n\n**Workflow**: Manual Blog Automation\n**Timestamp": {{ $now.toISOString() }}\n**Status**: ✅ Success\n\n🤖 *Manual Blog Automation*\n📅 {{ $now.toLocaleString() }}"'
)
WHERE id='tdAwda77Mv7Mud3D';

-- Update error notification with proper n8n expressions
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{3,parameters,text}',
  '"❌ Blog Automation Failed!\n\n**Workflow**: Manual Blog Automation\n**Timestamp**: {{ $now.toISOString() }}\n**Error**: {{ $json.error || \"Unknown error\" }}\n\n🤖 *Manual Blog Automation*\n📅 {{ $now.toLocaleString() }}"'
)
WHERE id='tdAwda77Mv7Mud3D';
EOF

# Copy SQL file to VPS and execute
scp "$SQL_FILE" "$SSH_HOST:/tmp/fix_discord.sql"

# Execute the SQL on VPS
ssh "$SSH_HOST" "sudo -u postgres psql -d n8n -f /tmp/fix_discord.sql"

# Clean up
rm -f "$SQL_FILE"
ssh "$SSH_HOST" "rm -f /tmp/fix_discord.sql"

echo -e "${GREEN}✅ Discord notification formatting fixed successfully${NC}"
echo -e "${YELLOW}📝 Success notification now uses proper n8n expressions${NC}"
echo -e "${YELLOW}📝 Error notification now uses proper n8n expressions${NC}"