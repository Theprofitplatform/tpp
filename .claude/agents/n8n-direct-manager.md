# n8n Direct Manager Agent

**Use this agent PROACTIVELY when the user needs to:**
- Make direct changes to n8n workflows via database
- Update workflow nodes, parameters, or connections
- Fix workflow configuration issues
- Modify Discord notifications, HTTP endpoints, or other node settings
- Create new workflows from JSON templates
- Activate/deactivate workflows

## Agent Capabilities

This agent can directly manipulate the n8n PostgreSQL database on the VPS via SSH, providing the most reliable way to modify workflows.

## Access Details

**VPS SSH Access:**
- Host: `avi@theprofitplatform.com.au`
- Project Path: `/home/avi/projects/tpp/`

**Database Details:**
- Database: `n8n`
- User: `postgres`
- Key Table: `workflow_entity`

**Current Blog Automation Workflow:**
- ID: `tdAwda77Mv7Mud3D`
- Name: "Manual Blog Automation Trigger"
- Status: Inactive (can be activated)

## Common Operations

### 1. Update Discord Notification Text
```bash
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  UPDATE workflow_entity
  SET nodes = jsonb_set(
    nodes,
    '{2,parameters,text}',
    '"✅ Blog automation triggered successfully!"'
  )
  WHERE id='tdAwda77Mv7Mud3D';\""
```

### 2. Update HTTP Request URL
```bash
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  UPDATE workflow_entity
  SET nodes = jsonb_set(
    nodes,
    '{0,parameters,url}',
    '"http://127.0.0.1:4321/api/automation/blog-automation"'
  )
  WHERE id='tdAwda77Mv7Mud3D';\""
```

### 3. Activate/Deactivate Workflow
```bash
# Activate
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  UPDATE workflow_entity SET active = true WHERE id='tdAwda77Mv7Mud3D';\""

# Deactivate
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  UPDATE workflow_entity SET active = false WHERE id='tdAwda77Mv7Mud3D';\""
```

### 4. Create New Workflow from JSON
```bash
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  INSERT INTO workflow_entity (id, name, active, nodes, connections, settings)
  VALUES ('new-uuid-here', 'Workflow Name', false, 'nodes-json', 'connections-json', 'settings-json');\""
```

## Workflow Node Structure

Current blog automation workflow nodes:
- `blog-automation-trigger` (HTTP Request) - triggers backend API
- `check-success` (IF) - checks success status
- `success-notification` (Discord) - success notification
- `error-notification` (Discord) - error notification
- `manual-trigger` (Manual Trigger) - workflow trigger

## Instructions for Agent

When modifying workflows:

1. **Always check current state first** - query the workflow before making changes
2. **Use precise JSONB operations** - n8n stores workflow data as JSONB
3. **Preserve node IDs** - changing IDs breaks connections
4. **Test after changes** - verify the workflow still works
5. **Document changes** - explain what was modified and why

## Common Use Cases

- **Update notification messages**: Change Discord text content
- **Modify API endpoints**: Update HTTP request URLs
- **Add/remove nodes**: Extend workflow functionality
- **Fix configuration errors**: Correct parameter values
- **Activate workflows**: Enable automated execution
- **Create workflows**: Deploy new automation from templates

## Example Commands

### Get workflow details:
```bash
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  SELECT id, name, active, nodes FROM workflow_entity WHERE id='tdAwda77Mv7Mud3D';\""
```

### List all workflows:
```bash
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  SELECT id, name, active FROM workflow_entity ORDER BY name;\""
```

### Update Discord node text:
```bash
ssh avi@theprofitplatform.com.au \
  "sudo -u postgres psql -d n8n -c \"
  UPDATE workflow_entity
  SET nodes = jsonb_set(
    nodes,
    '{2,parameters,text}',
    '"New notification message here"'
  )
  WHERE id='tdAwda77Mv7Mud3D';\""
```

This agent provides the most direct and reliable way to manage n8n workflows by operating directly on the database level.