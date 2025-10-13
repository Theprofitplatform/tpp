#!/bin/bash
set -e

# Configuration
VPS_HOST="n8n.theprofitplatform.com.au"
VPS_USER="root"
DEPLOY_PATH="/tmp/n8n-workflows"
WORKFLOW_FILE="$1"

if [ -z "$WORKFLOW_FILE" ]; then
    echo "Usage: $0 <workflow-json-file>"
    exit 1
fi

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "Error: Workflow file '$WORKFLOW_FILE' not found"
    exit 1
fi

echo "🚀 Deploying n8n workflow to VPS..."
echo "📁 Workflow: $WORKFLOW_FILE"
echo "📍 Target: $VPS_USER@$VPS_HOST:$DEPLOY_PATH"

# Create deployment directory on VPS
echo "📁 Creating deployment directory..."
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "mkdir -p $DEPLOY_PATH"

# Copy workflow file to VPS
echo "📤 Copying workflow file..."
scp -o StrictHostKeyChecking=no "$WORKFLOW_FILE" "$VPS_USER@$VPS_HOST:$DEPLOY_PATH/"

# Get workflow filename
WORKFLOW_NAME=$(basename "$WORKFLOW_FILE")

echo "✅ Workflow deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Access n8n at: http://$VPS_HOST:5678"
echo "2. Go to Workflows → Import from JSON"
echo "3. Select the file: $DEPLOY_PATH/$WORKFLOW_NAME"
echo "4. Activate the workflow"
echo ""
echo "💡 You can also manually copy the workflow JSON:"
echo "ssh $VPS_USER@$VPS_HOST 'cat $DEPLOY_PATH/$WORKFLOW_NAME' | pbcopy"

# Display workflow info
echo ""
echo "📊 Workflow Information:"
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "
  echo 'File: $DEPLOY_PATH/$WORKFLOW_NAME'
  echo 'Size:' \$(wc -c < '$DEPLOY_PATH/$WORKFLOW_NAME') 'bytes'
  echo 'Workflow name:' \$(jq -r '.name // .nodes[0].parameters.name // \"Unnamed Workflow\"' '$DEPLOY_PATH/$WORKFLOW_NAME' 2>/dev/null || echo 'Unknown')
"