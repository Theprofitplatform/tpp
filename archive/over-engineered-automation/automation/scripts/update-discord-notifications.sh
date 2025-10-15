#!/bin/bash

# Script to update Discord notifications in n8n workflow
# This updates the Discord nodes to match the cron job format

SSH_HOST="avi@theprofitplatform.com.au"
WORKFLOW_ID="tdAwda77Mv7Mud3D"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Updating Discord notifications in workflow ${WORKFLOW_ID}...${NC}"

# Create SQL file with the update commands
SQL_FILE="/tmp/update_discord_$$.sql"

cat > "$SQL_FILE" << 'EOF'
-- Update success notification
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{2,parameters,text}',
  '"✅ Blog Automation Triggered Successfully!\n\n**Workflow**: {{ $json.workflow }}\n**Timestamp**: {{ $json.timestamp }}\n**Status**: ✅ Success\n\n🤖 *Manual Blog Automation*\n📅 {{ new Date().toLocaleString() }}"'
)
WHERE id='tdAwda77Mv7Mud3D';

-- Update error notification
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{3,parameters,text}',
  '"❌ Blog Automation Failed!\n\n**Workflow**: {{ $json.workflow }}\n**Timestamp**: {{ $json.timestamp }}\n**Error**: {{ $json.error || \"Unknown error\" }}\n\n🤖 *Manual Blog Automation*\n📅 {{ new Date().toLocaleString() }}"'
)
WHERE id='tdAwda77Mv7Mud3D';
EOF

# Copy SQL file to VPS and execute
scp "$SQL_FILE" "$SSH_HOST:/tmp/update_discord.sql"

# Execute the SQL on VPS
ssh "$SSH_HOST" "sudo -u postgres psql -d n8n -f /tmp/update_discord.sql"

# Clean up
rm -f "$SQL_FILE"
ssh "$SSH_HOST" "rm -f /tmp/update_discord.sql"

echo -e "${GREEN}✅ Discord notifications updated successfully${NC}"
echo -e "${YELLOW}📝 Success notification now shows detailed blog automation status${NC}"
echo -e "${YELLOW}📝 Error notification now shows detailed error information${NC}"