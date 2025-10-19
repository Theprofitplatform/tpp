#!/bin/bash
#
# TPP Health Monitoring - One-Line Quick Setup
# For users who want the fastest setup possible
#
# Usage:
#   ./scripts/quick-setup.sh
#
# This script chooses sensible defaults:
# - Healthchecks.io for monitoring (you provide URL)
# - GitHub Actions for automation
# - Slack optional
#

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TPP Health Monitoring - Quick Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "This is the FASTEST setup. It will:"
echo "  1. Set up Healthchecks.io (free monitoring)"
echo "  2. Enable GitHub Actions (automatic weekly checks)"
echo "  3. Test everything works"
echo ""
echo "Time required: 2 minutes"
echo ""

# Step 1: Healthchecks.io
echo "Step 1: Healthchecks.io Setup"
echo "────────────────────────────────────────────────────────"
echo ""
echo "Quick instructions:"
echo "  1. Open: https://healthchecks.io (in new tab)"
echo "  2. Sign up/login (takes 30 seconds)"
echo "  3. Click 'Add Check'"
echo "  4. Name: TPP Health Monitor"
echo "  5. Schedule: Weekly"
echo "  6. Copy the ping URL (looks like: https://hc-ping.com/xxx-xxx-xxx)"
echo ""
read -p "Paste your Healthchecks.io ping URL (or press Enter to skip): " HEALTHCHECK_URL
echo ""

if [ -n "$HEALTHCHECK_URL" ]; then
  # Save to .env.health
  echo "HEALTHCHECK_PING_URL=$HEALTHCHECK_URL" > .env.health
  echo -e "${GREEN}✓${NC} Healthchecks.io configured"

  # Test ping
  if curl -fsS "$HEALTHCHECK_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Ping successful! Check your Healthchecks.io dashboard"
  fi
else
  echo "Skipped Healthchecks.io (you can add it later)"
fi

echo ""

# Step 2: GitHub Actions
echo "Step 2: GitHub Actions Setup"
echo "────────────────────────────────────────────────────────"
echo ""

if command -v gh &> /dev/null; then
  if [ -n "$HEALTHCHECK_URL" ]; then
    echo "Adding secrets to GitHub..."
    gh secret set HEALTHCHECK_PING_URL -b "$HEALTHCHECK_URL" 2>/dev/null && \
      echo -e "${GREEN}✓${NC} GitHub secret added" || \
      echo "Note: Secret may need manual setup in GitHub Settings"
  fi

  echo -e "${GREEN}✓${NC} GitHub Actions workflow ready"
  echo ""
  echo "The workflow is at: .github/workflows/health-check.yml"
  echo "It will run every Monday at 9 AM UTC"
  echo ""
else
  echo "GitHub CLI not installed. Manual setup:"
  echo "  1. Go to GitHub → Your Repo → Settings → Secrets"
  echo "  2. Add secret: HEALTHCHECK_PING_URL = $HEALTHCHECK_URL"
  echo "  3. Go to Actions tab and enable workflows"
  echo ""
fi

# Step 3: Test
echo "Step 3: Testing"
echo "────────────────────────────────────────────────────────"
echo ""

chmod +x scripts/simple-health-check.sh
chmod +x scripts/health-check-with-ping.sh

echo "Running health check..."
npm run health

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete! 🎉${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "What's monitoring now:"
if [ -n "$HEALTHCHECK_URL" ]; then
  echo "  ✓ Healthchecks.io (check dashboard)"
fi
echo "  ✓ GitHub Actions (runs weekly)"
echo "  ✓ Manual check: npm run health"
echo ""
echo "Next steps:"
echo "  1. Check Healthchecks.io dashboard for green checkmark"
echo "  2. Check GitHub Actions tab to enable workflow"
echo "  3. You're done! ✨"
echo ""
