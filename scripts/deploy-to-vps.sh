#!/bin/bash
#
# TPP Health Monitoring - VPS Deployment
# Deploys health monitoring to VPS and sets up cron job
#
# Usage:
#   ./scripts/deploy-to-vps.sh [vps-host]
#
# Or with environment variables:
#   VPS_HOST=your.vps.ip ./scripts/deploy-to-vps.sh
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ════════════════════════════════════════════════════════
# Configuration
# ════════════════════════════════════════════════════════

# Get VPS configuration from arguments or env vars or .env.health
VPS_HOST="${1:-$VPS_HOST}"
VPS_USER="${VPS_USER:-avi}"
VPS_PATH="${VPS_PROJECT_PATH:-/home/avi/projects/tpp}"

# Try to load from .env.health if not set
if [ -z "$VPS_HOST" ] && [ -f "$PROJECT_DIR/.env.health" ]; then
  source "$PROJECT_DIR/.env.health"
  VPS_HOST="${VPS_HOST}"
fi

if [ -z "$VPS_HOST" ]; then
  echo -e "${YELLOW}VPS host not specified${NC}"
  echo ""
  echo "Usage:"
  echo "  $0 your.vps.ip"
  echo ""
  echo "Or set environment variable:"
  echo "  VPS_HOST=your.vps.ip $0"
  echo ""
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TPP Health Monitoring - VPS Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "VPS Host: $VPS_HOST"
echo "VPS User: $VPS_USER"
echo "VPS Path: $VPS_PATH"
echo ""

# ════════════════════════════════════════════════════════
# Test Connection
# ════════════════════════════════════════════════════════

echo "Testing VPS connection..."

if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" 'echo ok' &>/dev/null; then
  echo -e "${YELLOW}Cannot connect to VPS${NC}"
  echo ""
  echo "Make sure SSH key authentication is set up:"
  echo "  ssh-copy-id $VPS_USER@$VPS_HOST"
  echo ""
  echo "Or test manual connection:"
  echo "  ssh $VPS_USER@$VPS_HOST"
  echo ""
  exit 1
fi

echo -e "${GREEN}✓${NC} VPS reachable"

# ════════════════════════════════════════════════════════
# Check if project exists on VPS
# ════════════════════════════════════════════════════════

echo "Checking project directory on VPS..."

if ssh "$VPS_USER@$VPS_HOST" "[ -d '$VPS_PATH' ]"; then
  echo -e "${GREEN}✓${NC} Project directory exists: $VPS_PATH"
else
  echo -e "${YELLOW}⚠${NC} Project directory not found: $VPS_PATH"
  echo ""
  read -p "Create directory? [y/N]: " CREATE_DIR

  if [[ "$CREATE_DIR" =~ ^[Yy]$ ]]; then
    ssh "$VPS_USER@$VPS_HOST" "mkdir -p '$VPS_PATH'"
    echo -e "${GREEN}✓${NC} Directory created"
  else
    echo "Deployment cancelled"
    exit 1
  fi
fi

# ════════════════════════════════════════════════════════
# Sync Files
# ════════════════════════════════════════════════════════

echo "Syncing files to VPS..."

cd "$PROJECT_DIR"

# Create temporary deployment package
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy necessary files
mkdir -p "$TEMP_DIR/scripts"
mkdir -p "$TEMP_DIR/automation"

cp scripts/simple-health-check.sh "$TEMP_DIR/scripts/"
cp scripts/health-check-with-ping.sh "$TEMP_DIR/scripts/"

if [ -f ".env.health" ]; then
  cp .env.health "$TEMP_DIR/"
fi

# Copy automation files if they exist
if [ -f "automation/topic-queue.json" ]; then
  mkdir -p "$TEMP_DIR/automation"
  cp automation/topic-queue.json "$TEMP_DIR/automation/"
fi

# Sync to VPS
rsync -avz --progress "$TEMP_DIR/" "$VPS_USER@$VPS_HOST:$VPS_PATH/"

echo -e "${GREEN}✓${NC} Files synced to VPS"

# Make scripts executable
ssh "$VPS_USER@$VPS_HOST" "chmod +x '$VPS_PATH/scripts/'*.sh"

echo -e "${GREEN}✓${NC} Scripts made executable"

# ════════════════════════════════════════════════════════
# Install Dependencies on VPS
# ════════════════════════════════════════════════════════

echo "Checking dependencies on VPS..."

# Check for jq
if ! ssh "$VPS_USER@$VPS_HOST" "command -v jq &>/dev/null"; then
  echo "Installing jq on VPS..."
  ssh "$VPS_USER@$VPS_HOST" "sudo apt-get update && sudo apt-get install -y jq"
  echo -e "${GREEN}✓${NC} jq installed"
fi

# Check for curl
if ! ssh "$VPS_USER@$VPS_HOST" "command -v curl &>/dev/null"; then
  echo "Installing curl on VPS..."
  ssh "$VPS_USER@$VPS_HOST" "sudo apt-get install -y curl"
  echo -e "${GREEN}✓${NC} curl installed"
fi

# ════════════════════════════════════════════════════════
# Test on VPS
# ════════════════════════════════════════════════════════

echo "Testing health check on VPS..."

if ssh "$VPS_USER@$VPS_HOST" "cd '$VPS_PATH' && ./scripts/simple-health-check.sh" > /tmp/vps-health-test.log 2>&1; then
  echo -e "${GREEN}✓${NC} Health check works on VPS"
else
  echo -e "${YELLOW}⚠${NC} Health check completed with warnings (normal)"
fi

echo ""
echo "VPS health check output:"
echo "────────────────────────────────────────────────────────"
cat /tmp/vps-health-test.log | head -20
echo "────────────────────────────────────────────────────────"
echo ""

# ════════════════════════════════════════════════════════
# Set Up Cron Job
# ════════════════════════════════════════════════════════

echo "Setting up cron job on VPS..."

CRON_LINE="0 9 * * 1 cd $VPS_PATH && ./scripts/health-check-with-ping.sh >> /tmp/tpp-health.log 2>&1"

# Check if cron entry already exists
if ssh "$VPS_USER@$VPS_HOST" "crontab -l 2>/dev/null | grep -q 'health-check'"; then
  echo -e "${YELLOW}⚠${NC} Cron entry already exists"

  read -p "Replace existing cron job? [y/N]: " REPLACE_CRON

  if [[ "$REPLACE_CRON" =~ ^[Yy]$ ]]; then
    # Remove old entry and add new one
    ssh "$VPS_USER@$VPS_HOST" "crontab -l 2>/dev/null | grep -v 'health-check' | { cat; echo '$CRON_LINE'; } | crontab -"
    echo -e "${GREEN}✓${NC} Cron job updated"
  fi
else
  # Add new cron entry
  ssh "$VPS_USER@$VPS_HOST" "(crontab -l 2>/dev/null || true; echo '$CRON_LINE') | crontab -"
  echo -e "${GREEN}✓${NC} Cron job added"
fi

# ════════════════════════════════════════════════════════
# Verify Cron
# ════════════════════════════════════════════════════════

echo "Verifying cron configuration..."

echo ""
echo "Current cron jobs on VPS:"
echo "────────────────────────────────────────────────────────"
ssh "$VPS_USER@$VPS_HOST" "crontab -l | grep -v '^#' | grep -v '^$'"
echo "────────────────────────────────────────────────────────"
echo ""

# ════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  VPS Deployment Complete! 🎉${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "What was deployed:"
echo "  ✓ Health check scripts"
echo "  ✓ Configuration files"
echo "  ✓ Cron job (runs Monday 9 AM)"
echo ""
echo "VPS Status:"
echo "  Host: $VPS_HOST"
echo "  Path: $VPS_PATH"
echo "  User: $VPS_USER"
echo ""
echo "Next steps:"
echo "  1. Check VPS after next Monday 9 AM"
echo "  2. View logs: ssh $VPS_USER@$VPS_HOST 'cat /tmp/tpp-health.log'"
echo "  3. Manual trigger: ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && ./scripts/health-check-with-ping.sh'"
echo ""
echo "To update in future:"
echo "  $0 $VPS_HOST"
echo ""
