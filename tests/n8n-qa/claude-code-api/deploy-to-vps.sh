#!/bin/bash
set -euo pipefail

# Deploy Claude Code API Server to VPS
# This creates a FREE local AI service for n8n workflows

echo "========================================"
echo "🚀 Deploying Claude Code API to VPS"
echo "========================================"

VPS_HOST="${VPS_HOST:-n8n.theprofitplatform.com.au}"
VPS_USER="${VPS_USER:-root}"
DEPLOY_PATH="/opt/claude-code-api"

echo "📡 Target: ${VPS_USER}@${VPS_HOST}"
echo "📁 Deploy path: ${DEPLOY_PATH}"
echo ""

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" "echo 'SSH OK'"; then
  echo "❌ SSH connection failed"
  exit 1
fi
echo "✅ SSH connection successful"
echo ""

# Create directory on VPS
echo "📁 Creating deployment directory..."
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${DEPLOY_PATH}/{logs,systemd}"

# Copy files to VPS
echo "📤 Copying files to VPS..."
scp server.js package.json test-server.js "${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/"
scp systemd/claude-code-api.service "${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/systemd/"

# Install dependencies on VPS
echo "📦 Installing dependencies on VPS..."
ssh "${VPS_USER}@${VPS_HOST}" "cd ${DEPLOY_PATH} && npm install --production"

# Setup systemd service
echo "⚙️  Setting up systemd service..."
ssh "${VPS_USER}@${VPS_HOST}" "
  sudo cp ${DEPLOY_PATH}/systemd/claude-code-api.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable claude-code-api
  sudo systemctl restart claude-code-api
"

# Check service status
echo ""
echo "📊 Checking service status..."
ssh "${VPS_USER}@${VPS_HOST}" "sudo systemctl status claude-code-api --no-pager" || true

# Test the API
echo ""
echo "🧪 Testing API endpoint..."
sleep 2
ssh "${VPS_USER}@${VPS_HOST}" "curl -s http://localhost:3000/health | jq" || echo "⚠️  Health check pending..."

echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Check service status:"
echo "   ssh ${VPS_USER}@${VPS_HOST} 'sudo systemctl status claude-code-api'"
echo ""
echo "2. View logs:"
echo "   ssh ${VPS_USER}@${VPS_HOST} 'tail -f ${DEPLOY_PATH}/logs/output.log'"
echo ""
echo "3. Test API:"
echo "   ssh ${VPS_USER}@${VPS_HOST} 'curl http://localhost:3000/health'"
echo ""
echo "4. Use in n8n workflows:"
echo "   Add HTTP Request node:"
echo "   URL: http://localhost:3000/api/claude"
echo "   Method: POST"
echo "   Body: {\"prompt\": \"your prompt here\"}"
echo ""
echo "🎉 FREE AI service ready for n8n!"
echo "========================================"
