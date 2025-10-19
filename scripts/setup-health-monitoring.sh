#!/bin/bash
#
# TPP Automation - Health Monitoring Setup
# Automatically configures health monitoring based on your environment
#
# This script will:
# 1. Detect your environment (local/VPS)
# 2. Set up health check automation
# 3. Configure notifications (Healthchecks.io/Slack)
# 4. Enable GitHub Actions workflow
# 5. Test everything works
#
# Usage:
#   ./scripts/setup-health-monitoring.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ════════════════════════════════════════════════════════
# Helper Functions
# ════════════════════════════════════════════════════════

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}▶${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

ask_yes_no() {
  local prompt="$1"
  local default="${2:-n}"

  if [ "$default" = "y" ]; then
    prompt="$prompt [Y/n]: "
  else
    prompt="$prompt [y/N]: "
  fi

  read -p "$prompt" response
  response=${response:-$default}

  [[ "$response" =~ ^[Yy]$ ]]
}

# ════════════════════════════════════════════════════════
# Main Setup
# ════════════════════════════════════════════════════════

print_header "TPP Health Monitoring - Automated Setup"

echo "This script will automatically set up health monitoring for your"
echo "TPP automation system. It will configure:"
echo ""
echo "  • Health check scripts"
echo "  • GitHub Actions workflow"
echo "  • Healthchecks.io integration (optional)"
echo "  • Slack notifications (optional)"
echo "  • VPS cron jobs (optional)"
echo ""

if ! ask_yes_no "Continue with setup?" "y"; then
  echo "Setup cancelled."
  exit 0
fi

# ════════════════════════════════════════════════════════
# Step 1: Verify Prerequisites
# ════════════════════════════════════════════════════════

print_header "Step 1: Checking Prerequisites"

cd "$PROJECT_DIR"

# Check if scripts exist
print_step "Checking health check scripts..."
if [ -f "scripts/simple-health-check.sh" ]; then
  print_success "Health check script found"
  chmod +x scripts/simple-health-check.sh
else
  print_error "Health check script not found!"
  exit 1
fi

if [ -f "scripts/health-check-with-ping.sh" ]; then
  print_success "Ping script found"
  chmod +x scripts/health-check-with-ping.sh
else
  print_warning "Ping script not found (optional)"
fi

# Check for required commands
print_step "Checking required commands..."

MISSING_DEPS=()

if ! command -v jq &> /dev/null; then
  MISSING_DEPS+=("jq")
fi

if ! command -v curl &> /dev/null; then
  MISSING_DEPS+=("curl")
fi

if ! command -v gh &> /dev/null; then
  print_warning "GitHub CLI not installed (optional, but recommended)"
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  print_error "Missing required dependencies: ${MISSING_DEPS[*]}"
  echo ""
  echo "Install with:"
  echo "  sudo apt-get install ${MISSING_DEPS[*]}"
  echo ""

  if ask_yes_no "Try to install automatically?" "y"; then
    print_step "Installing dependencies..."
    sudo apt-get update
    sudo apt-get install -y "${MISSING_DEPS[@]}"
    print_success "Dependencies installed"
  else
    exit 1
  fi
fi

print_success "All prerequisites met"

# ════════════════════════════════════════════════════════
# Step 2: Test Health Check
# ════════════════════════════════════════════════════════

print_header "Step 2: Testing Health Check"

print_step "Running health check..."
if ./scripts/simple-health-check.sh > /tmp/health-test.log 2>&1; then
  print_success "Health check passed!"
else
  print_warning "Health check detected some warnings (normal)"
fi

echo ""
echo "Health check output:"
echo "────────────────────────────────────────────────────────"
cat /tmp/health-test.log
echo "────────────────────────────────────────────────────────"
echo ""

# ════════════════════════════════════════════════════════
# Step 3: Configure Healthchecks.io (Optional)
# ════════════════════════════════════════════════════════

print_header "Step 3: Configure Healthchecks.io (Optional)"

echo "Healthchecks.io provides free monitoring with:"
echo "  • Email notifications"
echo "  • Detects if checks stop running"
echo "  • 30-day history"
echo "  • Free for up to 20 checks"
echo ""

if ask_yes_no "Set up Healthchecks.io integration?" "y"; then
  echo ""
  echo "Setup instructions:"
  echo "  1. Go to: https://healthchecks.io"
  echo "  2. Create a free account (or log in)"
  echo "  3. Click 'Add Check'"
  echo "  4. Name it: TPP Health Monitor"
  echo "  5. Set schedule: Weekly (or every 7 days)"
  echo "  6. Copy your ping URL"
  echo ""

  read -p "Enter your Healthchecks.io ping URL: " HEALTHCHECK_URL

  if [ -n "$HEALTHCHECK_URL" ]; then
    # Save to .env.health
    if [ ! -f ".env.health" ]; then
      cp .env.health.example .env.health 2>/dev/null || touch .env.health
    fi

    # Update or add HEALTHCHECK_PING_URL
    if grep -q "HEALTHCHECK_PING_URL=" .env.health; then
      sed -i "s|HEALTHCHECK_PING_URL=.*|HEALTHCHECK_PING_URL=$HEALTHCHECK_URL|" .env.health
    else
      echo "HEALTHCHECK_PING_URL=$HEALTHCHECK_URL" >> .env.health
    fi

    # Also export for current session
    export HEALTHCHECK_PING_URL="$HEALTHCHECK_URL"

    print_success "Healthchecks.io configured"

    # Test ping
    print_step "Testing Healthchecks.io ping..."
    if curl -fsS --retry 3 "$HEALTHCHECK_URL" > /dev/null 2>&1; then
      print_success "Ping successful! Check your Healthchecks.io dashboard"
    else
      print_warning "Ping failed. Check your URL"
    fi
  fi
else
  print_step "Skipping Healthchecks.io setup"
fi

# ════════════════════════════════════════════════════════
# Step 4: Configure Slack (Optional)
# ════════════════════════════════════════════════════════

print_header "Step 4: Configure Slack Notifications (Optional)"

if ask_yes_no "Set up Slack notifications?" "n"; then
  echo ""
  echo "Setup instructions:"
  echo "  1. Go to: https://api.slack.com/apps"
  echo "  2. Create new app (or use existing)"
  echo "  3. Enable 'Incoming Webhooks'"
  echo "  4. Create webhook for your channel"
  echo "  5. Copy webhook URL"
  echo ""

  read -p "Enter your Slack webhook URL: " SLACK_URL

  if [ -n "$SLACK_URL" ]; then
    if [ ! -f ".env.health" ]; then
      touch .env.health
    fi

    if grep -q "SLACK_WEBHOOK_URL=" .env.health; then
      sed -i "s|SLACK_WEBHOOK_URL=.*|SLACK_WEBHOOK_URL=$SLACK_URL|" .env.health
    else
      echo "SLACK_WEBHOOK_URL=$SLACK_URL" >> .env.health
    fi

    export SLACK_WEBHOOK_URL="$SLACK_URL"

    print_success "Slack configured"

    # Test Slack
    print_step "Testing Slack notification..."
    if curl -X POST "$SLACK_URL" \
         -H 'Content-Type: application/json' \
         -d '{"text":"✓ TPP Health Monitoring setup complete!"}' \
         > /dev/null 2>&1; then
      print_success "Slack test message sent! Check your channel"
    else
      print_warning "Slack test failed. Check your webhook URL"
    fi
  fi
else
  print_step "Skipping Slack setup"
fi

# ════════════════════════════════════════════════════════
# Step 5: Set Up Automation
# ════════════════════════════════════════════════════════

print_header "Step 5: Choose Automation Method"

echo "How would you like to run health checks?"
echo ""
echo "  1. GitHub Actions (runs in cloud, weekly)"
echo "  2. Local cron job (runs on this machine)"
echo "  3. VPS cron job (runs on VPS)"
echo "  4. Manual only (run 'npm run health' when needed)"
echo ""

read -p "Enter your choice [1-4]: " AUTOMATION_CHOICE

case $AUTOMATION_CHOICE in
  1)
    print_header "Configuring GitHub Actions"

    print_step "GitHub Actions workflow already created at:"
    echo "  .github/workflows/health-check.yml"
    echo ""

    if command -v gh &> /dev/null; then
      print_step "Setting up GitHub secrets..."

      if [ -n "$HEALTHCHECK_URL" ]; then
        if ask_yes_no "Add HEALTHCHECK_PING_URL to GitHub secrets?" "y"; then
          gh secret set HEALTHCHECK_PING_URL -b "$HEALTHCHECK_URL" 2>/dev/null && \
            print_success "Secret added" || \
            print_warning "Failed to add secret (may need manual setup)"
        fi
      fi

      if [ -n "$SLACK_URL" ]; then
        if ask_yes_no "Add SLACK_WEBHOOK_URL to GitHub secrets?" "y"; then
          gh secret set SLACK_WEBHOOK_URL -b "$SLACK_URL" 2>/dev/null && \
            print_success "Secret added" || \
            print_warning "Failed to add secret (may need manual setup)"
        fi
      fi

      print_success "GitHub Actions configured"
      echo ""
      echo "To trigger manually:"
      echo "  gh workflow run health-check.yml"
      echo ""
      echo "Or visit:"
      echo "  https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"

    else
      print_warning "GitHub CLI not installed"
      echo ""
      echo "Manual setup required:"
      echo "  1. Go to GitHub → Settings → Secrets → Actions"
      echo "  2. Add these secrets:"
      if [ -n "$HEALTHCHECK_URL" ]; then
        echo "     - HEALTHCHECK_PING_URL = $HEALTHCHECK_URL"
      fi
      if [ -n "$SLACK_URL" ]; then
        echo "     - SLACK_WEBHOOK_URL = $SLACK_URL"
      fi
      echo "  3. Go to Actions tab and enable workflows"
    fi
    ;;

  2)
    print_header "Configuring Local Cron Job"

    CRON_SCRIPT="$PROJECT_DIR/scripts/health-check-with-ping.sh"

    # Create cron entry
    CRON_LINE="0 9 * * 1 cd $PROJECT_DIR && $CRON_SCRIPT >> /tmp/tpp-health.log 2>&1"

    print_step "Proposed cron entry (Monday 9 AM):"
    echo "  $CRON_LINE"
    echo ""

    if ask_yes_no "Add to crontab?" "y"; then
      # Check if entry already exists
      if crontab -l 2>/dev/null | grep -q "health-check"; then
        print_warning "Cron entry may already exist"
      else
        (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
        print_success "Cron job added"
      fi

      echo ""
      echo "To view cron jobs:"
      echo "  crontab -l"
      echo ""
      echo "To remove:"
      echo "  crontab -e (then delete the line)"
    fi
    ;;

  3)
    print_header "Configuring VPS Cron Job"

    read -p "Enter VPS hostname or IP: " VPS_HOST
    read -p "Enter VPS username [avi]: " VPS_USER
    VPS_USER=${VPS_USER:-avi}

    read -p "Enter project path on VPS [/home/avi/projects/tpp]: " VPS_PATH
    VPS_PATH=${VPS_PATH:-/home/avi/projects/tpp}

    # Save VPS config
    if [ ! -f ".env.health" ]; then
      touch .env.health
    fi

    echo "VPS_HOST=$VPS_HOST" >> .env.health
    echo "VPS_USER=$VPS_USER" >> .env.health
    echo "VPS_PROJECT_PATH=$VPS_PATH" >> .env.health

    print_step "Testing VPS connection..."
    if ssh -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" 'echo ok' &>/dev/null; then
      print_success "VPS reachable"

      if ask_yes_no "Add cron job to VPS?" "y"; then
        CRON_LINE="0 9 * * 1 cd $VPS_PATH && ./scripts/health-check-with-ping.sh >> /tmp/tpp-health.log 2>&1"

        ssh "$VPS_USER@$VPS_HOST" "(crontab -l 2>/dev/null; echo '$CRON_LINE') | crontab -"
        print_success "VPS cron job added"
      fi
    else
      print_error "Cannot connect to VPS"
      echo "Make sure SSH key authentication is set up:"
      echo "  ssh-copy-id $VPS_USER@$VPS_HOST"
    fi
    ;;

  4)
    print_step "Manual mode selected"
    echo ""
    echo "To run health check manually:"
    echo "  npm run health"
    echo ""
    echo "Or with Healthchecks.io ping:"
    echo "  ./scripts/health-check-with-ping.sh"
    ;;

  *)
    print_warning "Invalid choice, defaulting to manual mode"
    ;;
esac

# ════════════════════════════════════════════════════════
# Step 6: Add to package.json scripts (already done)
# ════════════════════════════════════════════════════════

print_header "Step 6: NPM Scripts"

print_success "NPM scripts already configured:"
echo "  npm run health        - Run health check"
echo "  npm run status        - Same as health"
echo "  npm run health:check  - Same as health"

# ════════════════════════════════════════════════════════
# Step 7: Final Test
# ════════════════════════════════════════════════════════

print_header "Step 7: Final Test"

print_step "Running final health check with all integrations..."
echo ""

if [ -f ".env.health" ]; then
  source .env.health
fi

if [ -f "scripts/health-check-with-ping.sh" ]; then
  ./scripts/health-check-with-ping.sh
else
  ./scripts/simple-health-check.sh
fi

# ════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════

print_header "Setup Complete! 🎉"

echo -e "${GREEN}✓ Health monitoring is now configured!${NC}"
echo ""
echo "What was set up:"
echo "  ✓ Health check scripts"

if [ -n "$HEALTHCHECK_URL" ]; then
  echo "  ✓ Healthchecks.io integration"
fi

if [ -n "$SLACK_URL" ]; then
  echo "  ✓ Slack notifications"
fi

if [ "$AUTOMATION_CHOICE" = "1" ]; then
  echo "  ✓ GitHub Actions (weekly)"
elif [ "$AUTOMATION_CHOICE" = "2" ]; then
  echo "  ✓ Local cron job (weekly)"
elif [ "$AUTOMATION_CHOICE" = "3" ]; then
  echo "  ✓ VPS cron job (weekly)"
fi

echo ""
echo "Quick commands:"
echo "  npm run health              - Run health check now"
echo "  npm run status              - Same as above"

if [ "$AUTOMATION_CHOICE" = "1" ] && command -v gh &> /dev/null; then
  echo "  gh workflow run health-check - Trigger GitHub Action"
fi

if [ "$AUTOMATION_CHOICE" = "2" ] || [ "$AUTOMATION_CHOICE" = "3" ]; then
  echo "  crontab -l                  - View cron jobs"
fi

echo ""
echo "Dashboard URLs:"

if [ -n "$HEALTHCHECK_URL" ]; then
  echo "  Healthchecks.io: https://healthchecks.io/checks/"
fi

if [ "$AUTOMATION_CHOICE" = "1" ] && command -v gh &> /dev/null; then
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
  if [ -n "$REPO" ]; then
    echo "  GitHub Actions: https://github.com/$REPO/actions"
  fi
fi

echo ""
echo "Configuration saved to: .env.health"
echo ""
echo "Next steps:"
echo "  1. Check your email/Slack for test notifications"

if [ -n "$HEALTHCHECK_URL" ]; then
  echo "  2. Visit Healthchecks.io dashboard to verify"
fi

echo "  3. Wait for next scheduled run (or trigger manually)"
echo "  4. Review results after 1 week"
echo ""

print_success "All done! Your automations are now being monitored."
