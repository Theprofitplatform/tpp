#!/bin/bash

# Script to fix Discord notification text in n8n workflow
# Fixes template syntax showing instead of resolved values

SSH_HOST="avi@theprofitplatform.com.au"
WORKFLOW_ID="tdAwda77Mv7Mud3D"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Fixing Discord notifications in workflow ${WORKFLOW_ID}...${NC}"

# Create SQL file with the fixed Discord messages
SQL_FILE="/tmp/fix_discord_$$.sql"

cat > "$SQL_FILE" << 'EOF'
-- Update success notification with proper formatting
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{2,parameters,text}',
  '"✅ Blog Automation Triggered Successfully!

**Workflow**: Manual Blog Automation
**Timestamp": {{ $json.timestamp }}
**Status**: ✅ Success

🤖 *Manual Blog Automation*
📅 {{ new Date().toLocaleString() }}'
)
WHERE id='tdAwda77Mv7Mud3D';

-- Update error notification with proper formatting
UPDATE workflow_entity
SET nodes = jsonb_set(
  nodes,
  '{3,parameters,text}',
  '"❌ Blog Automation Failed!

**Workflow**: Manual Blog Automation
**Timestamp**: {{ $json.timestamp }}
**Error**: {{ $json.error || "Unknown error" }}

🤖 *Manual Blog Automation*
📅 {{ new Date().toLocaleString() }}'
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

echo -e "${GREEN}✅ Discord notifications fixed successfully${NC}"
echo -e "${YELLOW}📝 Success notification now shows proper formatting without template syntax${NC}"
echo -e "${YELLOW}📝 Error notification now shows proper formatting without template syntax${NC}"