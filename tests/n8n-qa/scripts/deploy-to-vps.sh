#!/bin/bash
set -euo pipefail

# VPS Deployment Script for n8n QA Test Harness
# Deploys test suite to VPS and configures systemd service for scheduled runs

echo "=========================================="
echo "n8n QA Test Harness - VPS Deployment"
echo "=========================================="

# Load environment variables
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "   Copy .env.example to .env and configure it"
  exit 1
fi

source .env

# Validate required variables
: "${VPS_HOST:?VPS_HOST not set in .env}"
: "${VPS_USER:?VPS_USER not set in .env}"
: "${VPS_DEPLOY_PATH:?VPS_DEPLOY_PATH not set in .env}"

echo "📡 Target: ${VPS_USER}@${VPS_HOST}"
echo "📁 Deploy path: ${VPS_DEPLOY_PATH}"
echo ""

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" "echo 'SSH connection successful'"; then
  echo "❌ SSH connection failed"
  echo "   Ensure SSH keys are configured and VPS is accessible"
  exit 1
fi
echo "✅ SSH connection successful"
echo ""

# Create deployment directory on VPS
echo "📁 Creating deployment directory on VPS..."
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${VPS_DEPLOY_PATH}"

# Copy files to VPS
echo "📤 Copying files to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'coverage' \
  --exclude 'test-results.json' \
  --exclude '.env' \
  ./ "${VPS_USER}@${VPS_HOST}:${VPS_DEPLOY_PATH}/"

echo "✅ Files copied"
echo ""

# Copy .env file (separately to preserve secrets)
echo "🔐 Copying .env file..."
scp .env "${VPS_USER}@${VPS_HOST}:${VPS_DEPLOY_PATH}/.env"
echo "✅ .env copied"
echo ""

# Install dependencies on VPS
echo "📦 Installing dependencies on VPS..."
ssh "${VPS_USER}@${VPS_HOST}" "cd ${VPS_DEPLOY_PATH} && npm ci"
echo "✅ Dependencies installed"
echo ""

# Create systemd service for scheduled test runs
echo "⚙️  Creating systemd service..."
ssh "${VPS_USER}@${VPS_HOST}" "cat > /tmp/n8n-qa.service << 'EOF'
[Unit]
Description=n8n QA Test Suite
After=network.target

[Service]
Type=oneshot
User=${VPS_USER}
WorkingDirectory=${VPS_DEPLOY_PATH}
ExecStart=/usr/bin/npm run test:ci
StandardOutput=append:${VPS_DEPLOY_PATH}/logs/test.log
StandardError=append:${VPS_DEPLOY_PATH}/logs/error.log

[Install]
WantedBy=multi-user.target
EOF"

ssh "${VPS_USER}@${VPS_HOST}" "sudo mv /tmp/n8n-qa.service /etc/systemd/system/n8n-qa.service"

# Create systemd timer for nightly runs
echo "⏰ Creating systemd timer..."
ssh "${VPS_USER}@${VPS_HOST}" "cat > /tmp/n8n-qa.timer << 'EOF'
[Unit]
Description=n8n QA Test Suite Timer
Requires=n8n-qa.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
EOF"

ssh "${VPS_USER}@${VPS_HOST}" "sudo mv /tmp/n8n-qa.timer /etc/systemd/system/n8n-qa.timer"

# Create logs directory
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${VPS_DEPLOY_PATH}/logs"

# Reload systemd and enable timer
echo "🔄 Enabling systemd timer..."
ssh "${VPS_USER}@${VPS_HOST}" "sudo systemctl daemon-reload"
ssh "${VPS_USER}@${VPS_HOST}" "sudo systemctl enable n8n-qa.timer"
ssh "${VPS_USER}@${VPS_HOST}" "sudo systemctl start n8n-qa.timer"

echo "✅ Systemd service and timer created"
echo ""

# Run initial test
echo "🧪 Running initial test..."
if ssh "${VPS_USER}@${VPS_HOST}" "cd ${VPS_DEPLOY_PATH} && npm run test:smoke"; then
  echo "✅ Initial test passed"
else
  echo "⚠️  Initial test had failures - check configuration"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  - Check timer status: ssh ${VPS_USER}@${VPS_HOST} 'systemctl status n8n-qa.timer'"
echo "  - View logs: ssh ${VPS_USER}@${VPS_HOST} 'tail -f ${VPS_DEPLOY_PATH}/logs/test.log'"
echo "  - Run tests manually: ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_DEPLOY_PATH} && npm test'"
echo "  - Generate report: ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_DEPLOY_PATH} && npm run report'"
echo ""
