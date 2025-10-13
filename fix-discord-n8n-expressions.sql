-- SQL script to fix Discord notification template syntax in n8n workflow
-- Workflow ID: tdAwda77Mv7Mud3D (Manual Blog Automation Trigger)
-- Uses proper n8n expressions that will be evaluated correctly

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

-- Verify the changes
SELECT
  (nodes->2->'parameters'->>'text') as success_notification,
  (nodes->3->'parameters'->>'text') as error_notification
FROM workflow_entity
WHERE id='tdAwda77Mv7Mud3D';