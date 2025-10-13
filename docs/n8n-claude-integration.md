# n8n + Claude Code Integration Guide

Complete setup for managing n8n workflows with Claude Code - making it easy to edit, validate, and deploy workflows from your local development environment.

## 🎉 What's Been Set Up

### 1. Directory Structure

```
tpp/
├── n8n-workflows/
│   ├── active/              # Currently deployed workflows
│   ├── staging/             # Test workflows before deployment
│   ├── templates/           # Reusable workflow templates
│   ├── archived/            # Historical backups
│   └── backups/             # Timestamped backups (pull-all)
└── automation/scripts/
    ├── n8n-deploy.sh        # Enhanced deployment script
    └── validate-n8n-workflow.js  # Workflow validator
```

### 2. Claude Code Integration

**Slash Commands** (Available in any Claude Code session):
- `/n8n-list` - List all workflows on VPS
- `/n8n-pull` - Pull workflow from VPS to local
- `/n8n-pull-all` - Backup all workflows
- `/n8n-deploy` - Deploy workflow to VPS
- `/n8n-test` - Test deploy without activating
- `/n8n-execute` - Manually execute workflow

**Specialized Agent**: `n8n-workflow-manager`
- Automatically activated when you mention "n8n" or "workflow"
- Expert in n8n expression syntax
- Handles deployment, validation, and troubleshooting

### 3. Helper Scripts

**n8n-claude.sh** (`~/.claude/scripts/n8n-claude.sh`)
- Unified interface for all n8n operations
- Handles API authentication automatically
- Provides colored, user-friendly output

**n8n-deploy.sh** (`automation/scripts/n8n-deploy.sh`)
- Validates JSON before deployment
- Auto-backs up existing workflows
- Strips n8n API read-only fields
- Supports test mode (dry-run)
- Provides deployment URLs

**validate-n8n-workflow.js** (`automation/scripts/validate-n8n-workflow.js`)
- Checks for common n8n issues
- Detects Discord expression syntax errors
- Validates node connections
- Warns about potential problems

---

## 🚀 Quick Start

### List All Workflows

```bash
/n8n-list
```

Output shows: ID, Name, Active status, Node count

### Pull a Workflow for Editing

```bash
/n8n-pull <workflow-id>
```

Example:
```bash
/n8n-pull CUlia6c3xTpoCzJV
# Saves to: n8n-workflows/active/manual-blog-automation-trigger-fixed-CUlia6c3xTpoCzJV.json
```

### Edit the Workflow

Use Claude Code to edit the JSON file:
```
@n8n-workflows/active/blog-automation.json Update the Discord notification message to include the blog post title
```

### Validate Before Deployment

```bash
node automation/scripts/validate-n8n-workflow.js n8n-workflows/active/blog-automation.json
```

### Test Deploy (Dry-Run)

```bash
/n8n-test n8n-workflows/active/blog-automation.json
```

This updates the workflow on VPS but **does NOT activate** it.

### Deploy to Production

```bash
/n8n-deploy n8n-workflows/active/blog-automation.json
```

This updates and activates the workflow.

---

## 📖 Common Workflows

### Workflow 1: Fix a Broken Workflow

```bash
# 1. List workflows to find the ID
/n8n-list

# 2. Pull the workflow
/n8n-pull <workflow-id>

# 3. Ask Claude to fix it
"Fix the Discord notification syntax in n8n-workflows/active/workflow-name.json"

# 4. Validate
node automation/scripts/validate-n8n-workflow.js n8n-workflows/active/workflow-name.json

# 5. Test deploy
/n8n-test n8n-workflows/active/workflow-name.json

# 6. Deploy to production
/n8n-deploy n8n-workflows/active/workflow-name.json update
```

### Workflow 2: Create New Workflow

```bash
# 1. Ask Claude to create it
"Create a new n8n workflow for social media posting"

# 2. Validate
node automation/scripts/validate-n8n-workflow.js n8n-workflows/staging/new-workflow.json

# 3. Deploy as new
/n8n-deploy n8n-workflows/staging/new-workflow.json create
```

### Workflow 3: Backup All Workflows

```bash
# Pull all workflows to timestamped backup directory
/n8n-pull-all

# Then commit to git
git add n8n-workflows/backups/
git commit -m "Backup n8n workflows $(date)"
```

---

## 🔧 Advanced Usage

### Using Helper Script Directly

```bash
# List workflows
bash ~/.claude/scripts/n8n-claude.sh list

# Pull specific workflow
bash ~/.claude/scripts/n8n-claude.sh pull <workflow-id> [output-file]

# Deploy workflow
bash ~/.claude/scripts/n8n-claude.sh deploy <workflow-file> [update|create|test]

# Validate workflow
bash ~/.claude/scripts/n8n-claude.sh validate <workflow-file>

# Execute workflow manually
bash ~/.claude/scripts/n8n-claude.sh execute <workflow-id>

# Activate/deactivate workflow
bash ~/.claude/scripts/n8n-claude.sh activate <workflow-id>
bash ~/.claude/scripts/n8n-claude.sh deactivate <workflow-id>

# Get workflow status
bash ~/.claude/scripts/n8n-claude.sh status <workflow-id>
```

### Deployment Script Modes

```bash
# Validate only (no deployment)
bash automation/scripts/n8n-deploy.sh workflow.json validate

# Test mode (update but don't activate)
bash automation/scripts/n8n-deploy.sh workflow.json test

# Update existing workflow
bash automation/scripts/n8n-deploy.sh workflow.json update

# Create new workflow
bash automation/scripts/n8n-deploy.sh workflow.json create
```

---

## ⚠️ Common Issues & Solutions

### Issue: Discord Node Expression Syntax

**Problem**: Discord notifications use wrong syntax
```json
"text": "{{workflow}}"  // ❌ WRONG
```

**Solution**: Use n8n expression syntax
```json
"text": "{{ $json.workflow }}"  // ✅ CORRECT
```

The validator will catch these errors automatically.

### Issue: Workflow Fails to Deploy

**Error**: `request/body/active is read-only`

**Solution**: Already fixed in deployment script. If you see this:
1. Update your scripts: `git pull`
2. Ensure you're using `automation/scripts/n8n-deploy.sh`

### Issue: Workflow Exists But Can't Update

**Problem**: Workflow ID changed or doesn't match

**Solution**:
1. List workflows: `/n8n-list`
2. Find correct ID
3. Update the `id` field in your JSON file
4. Deploy with `update` mode

---

## 🔐 Configuration

### API Credentials

Stored in scripts (already configured):
- **n8n URL**: `https://n8n.theprofitplatform.com.au/api/v1`
- **API Key**: Embedded in scripts (secure, not in git)

### Changing VPS or API Key

Edit both files:
1. `~/.claude/scripts/n8n-claude.sh`
2. `automation/scripts/n8n-deploy.sh`

Update these variables:
```bash
N8N_URL="https://your-n8n-domain.com/api/v1"
N8N_API_KEY="your-api-key"
```

---

## 📊 Current Workflow Inventory

**31 workflows pulled and backed up** to:
```
n8n-workflows/backups/2025-10-10-213501/
```

Key workflows:
- `manual-blog-automation-trigger-fixed-CUlia6c3xTpoCzJV.json`
- `content-research-→-ai-generation-→-seo-→-publishing-ueXKIrMfOUWoDyae.json`
- `social-media-publishing-automation-5lJTDzcTWqSRRfOj.json`
- `competitor-analysis-→-content-gap-identification-→-strategic-planning-raWp4HfY2I6g3EZd.json`

All workflows are version controlled and ready for editing.

---

## 🎯 Best Practices

1. **Always validate before deploying**
   ```bash
   node automation/scripts/validate-n8n-workflow.js workflow.json
   ```

2. **Test in test mode first**
   ```bash
   /n8n-test workflow.json
   ```

3. **Backup before major changes**
   ```bash
   /n8n-pull-all
   ```

4. **Commit workflows to git**
   ```bash
   git add n8n-workflows/
   git commit -m "Update blog automation workflow"
   ```

5. **Use the n8n-workflow-manager agent**
   - Just mention "n8n" in your request
   - Agent automatically helps with workflows

---

## 🔗 Quick Reference

### Slash Commands
```bash
/n8n-list                    # List all workflows
/n8n-pull <id>               # Pull workflow
/n8n-pull-all                # Backup all workflows
/n8n-deploy <file> [mode]    # Deploy workflow
/n8n-test <file>             # Test deploy
/n8n-execute <id>            # Run workflow manually
```

### File Locations
```
~/.claude/scripts/n8n-claude.sh           # Main helper script
~/.claude/agents/n8n-workflow-manager.md  # Specialized agent
~/.claude/commands/n8n-*                  # Slash commands
automation/scripts/n8n-deploy.sh          # Deployment script
automation/scripts/validate-n8n-workflow.js  # Validator
n8n-workflows/active/                     # Active workflows
n8n-workflows/backups/                    # Timestamped backups
```

### URLs
- **n8n UI**: https://n8n.theprofitplatform.com.au
- **Workflow URL**: https://n8n.theprofitplatform.com.au/workflow/{id}
- **API**: https://n8n.theprofitplatform.com.au/api/v1

---

## ✅ Setup Complete!

You can now:
- ✅ Edit workflows locally with Claude Code
- ✅ Validate workflows before deployment
- ✅ Deploy workflows via simple commands
- ✅ Version control all workflows in git
- ✅ Backup and restore workflows easily
- ✅ Test changes safely before production

**Next steps**: Try editing a workflow with Claude Code! Just say:
```
"Pull the blog automation workflow and update the Discord message"
```

The n8n-workflow-manager agent will handle everything for you.
