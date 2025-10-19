#!/bin/bash
#
# TPP Simple Health Check
# Run this weekly to check all automations
# Time: ~30 seconds | Maintenance: Zero
#
# Usage:
#   ./scripts/simple-health-check.sh
#
# Add to crontab for weekly email:
#   0 9 * * 1 /path/to/simple-health-check.sh | mail -s "TPP Health Check" you@email.com
#

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "════════════════════════════════════════════════════════"
echo "  TPP Automation Health Check"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════"
echo ""

# Function to print status
print_status() {
  if [ "$1" == "ok" ]; then
    echo -e "${GREEN}✓${NC} $2"
  elif [ "$1" == "warn" ]; then
    echo -e "${YELLOW}⚠${NC} $2"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${RED}✗${NC} $2"
    ERRORS=$((ERRORS + 1))
  fi
}

# ════════════════════════════════════════════════════════
# 1. GitHub Actions
# ════════════════════════════════════════════════════════
echo "GitHub Actions"
echo "────────────────────────────────────────────────────────"

if command -v gh &> /dev/null; then
  # Check recent workflow runs
  RECENT_FAILURES=$(gh run list --limit 20 --json conclusion --jq '[.[] | select(.conclusion=="failure")] | length' 2>/dev/null || echo "0")

  if [ "$RECENT_FAILURES" -eq 0 ]; then
    print_status "ok" "No failures in last 20 runs"
  elif [ "$RECENT_FAILURES" -lt 3 ]; then
    print_status "warn" "$RECENT_FAILURES failures in last 20 runs (acceptable)"
  else
    print_status "error" "$RECENT_FAILURES failures in last 20 runs (investigate!)"
  fi

  # List workflows
  echo ""
  echo "Active workflows:"
  gh workflow list 2>/dev/null | head -5 || echo "  (Could not fetch workflows)"
else
  print_status "warn" "GitHub CLI not installed (install with: brew install gh)"
fi

echo ""

# ════════════════════════════════════════════════════════
# 2. Topic Queue
# ════════════════════════════════════════════════════════
echo "Topic Queue"
echo "────────────────────────────────────────────────────────"

if [ -f "automation/topic-queue.json" ]; then
  if command -v jq &> /dev/null; then
    PENDING=$(jq '.queue | map(select(.status=="pending")) | length' automation/topic-queue.json 2>/dev/null || echo "0")
    PUBLISHED=$(jq '.queue | map(select(.status=="completed")) | length' automation/topic-queue.json 2>/dev/null || echo "0")

    if [ "$PENDING" -ge 15 ]; then
      print_status "ok" "$PENDING topics pending (healthy)"
    elif [ "$PENDING" -ge 10 ]; then
      print_status "ok" "$PENDING topics pending (ok)"
    elif [ "$PENDING" -ge 5 ]; then
      print_status "warn" "$PENDING topics pending (running low)"
    else
      print_status "error" "$PENDING topics pending (CRITICAL - generate more!)"
    fi

    echo "  Published posts: $PUBLISHED"

    # Show next 3 topics
    echo ""
    echo "Next topics:"
    jq -r '.queue | map(select(.status=="pending")) | .[0:3] | .[] | "  • \(.title)"' automation/topic-queue.json 2>/dev/null || echo "  (Could not parse topics)"
  else
    print_status "warn" "jq not installed (install with: brew install jq)"
  fi
else
  print_status "error" "Topic queue file not found"
fi

echo ""

# ════════════════════════════════════════════════════════
# 3. Website Status
# ════════════════════════════════════════════════════════
echo "Website Status"
echo "────────────────────────────────────────────────────────"

if command -v curl &> /dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://theprofitplatform.com.au)
  RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://theprofitplatform.com.au)

  if [ "$HTTP_CODE" == "200" ]; then
    print_status "ok" "Website responding (HTTP $HTTP_CODE)"
    echo "  Response time: ${RESPONSE_TIME}s"
  else
    print_status "error" "Website returned HTTP $HTTP_CODE"
  fi

  # Check if site is deployed
  CLOUDFLARE_CHECK=$(curl -s -I https://theprofitplatform.com.au | grep -i "server: cloudflare" || echo "")
  if [ -n "$CLOUDFLARE_CHECK" ]; then
    print_status "ok" "Cloudflare CDN active"
  else
    print_status "warn" "Not served by Cloudflare?"
  fi
else
  print_status "error" "curl not installed"
fi

echo ""

# ════════════════════════════════════════════════════════
# 4. VPS Status (Optional)
# ════════════════════════════════════════════════════════
echo "VPS Status"
echo "────────────────────────────────────────────────────────"

# Only check if VPS_HOST is set
if [ -n "$VPS_HOST" ]; then
  VPS_USER="${VPS_USER:-avi}"

  if ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" 'echo ok' &>/dev/null; then
    print_status "ok" "VPS reachable ($VPS_HOST)"

    # Check cron service
    CRON_STATUS=$(ssh "$VPS_USER@$VPS_HOST" 'systemctl is-active cron' 2>/dev/null || echo "unknown")
    if [ "$CRON_STATUS" == "active" ]; then
      print_status "ok" "Cron service running"
    else
      print_status "error" "Cron service status: $CRON_STATUS"
    fi

    # Check disk space
    DISK_USAGE=$(ssh "$VPS_USER@$VPS_HOST" "df -h / | tail -1 | awk '{print \$5}' | sed 's/%//'" 2>/dev/null || echo "0")
    if [ "$DISK_USAGE" -lt 80 ]; then
      print_status "ok" "Disk usage: ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -lt 90 ]; then
      print_status "warn" "Disk usage: ${DISK_USAGE}% (cleanup soon)"
    else
      print_status "error" "Disk usage: ${DISK_USAGE}% (CRITICAL)"
    fi
  else
    print_status "warn" "VPS not reachable (set VPS_HOST env var to enable check)"
  fi
else
  echo "  (Skipped - set VPS_HOST env var to enable)"
fi

echo ""

# ════════════════════════════════════════════════════════
# 5. Recent Blog Posts
# ════════════════════════════════════════════════════════
echo "Recent Blog Posts"
echo "────────────────────────────────────────────────────────"

if [ -d "src/content/blog" ]; then
  RECENT_POSTS=$(ls -t src/content/blog/*.md 2>/dev/null | head -3)

  if [ -n "$RECENT_POSTS" ]; then
    echo "$RECENT_POSTS" | while read -r post; do
      FILENAME=$(basename "$post")
      # Try macOS stat first, fallback to Linux stat
      if stat -f "%Sm" -t "%Y-%m-%d" "$post" &>/dev/null; then
        MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d" "$post")
      else
        MODIFIED=$(stat -c "%y" "$post" 2>/dev/null | cut -d' ' -f1)
      fi
      echo "  • $FILENAME (modified: $MODIFIED)"
    done

    # Check if last post is recent
    LAST_POST=$(ls -t src/content/blog/*.md 2>/dev/null | head -1)
    if [ -n "$LAST_POST" ]; then
      # Try macOS stat first, fallback to Linux stat
      if stat -f "%Sm" -t "%s" "$LAST_POST" &>/dev/null; then
        LAST_POST_DATE=$(stat -f "%Sm" -t "%s" "$LAST_POST")
      else
        LAST_POST_DATE=$(stat -c "%Y" "$LAST_POST" 2>/dev/null || echo "0")
      fi
      NOW=$(date +%s)
      if [ "$LAST_POST_DATE" -gt 0 ]; then
        DAYS_AGO=$(( (NOW - LAST_POST_DATE) / 86400 ))
      else
        DAYS_AGO=999
      fi
    else
      DAYS_AGO=999
    fi

    if [ "$DAYS_AGO" -le 7 ]; then
      print_status "ok" "Last post was $DAYS_AGO days ago"
    elif [ "$DAYS_AGO" -le 14 ]; then
      print_status "warn" "Last post was $DAYS_AGO days ago"
    else
      print_status "error" "Last post was $DAYS_AGO days ago (check automation!)"
    fi
  else
    print_status "warn" "No blog posts found"
  fi
else
  print_status "warn" "Blog directory not found"
fi

echo ""

# ════════════════════════════════════════════════════════
# 6. Git Status
# ════════════════════════════════════════════════════════
echo "Git Status"
echo "────────────────────────────────────────────────────────"

if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current)
  UNCOMMITTED=$(git status --porcelain | wc -l | xargs)

  echo "  Current branch: $BRANCH"

  if [ "$UNCOMMITTED" -eq 0 ]; then
    print_status "ok" "Working tree clean"
  else
    print_status "warn" "$UNCOMMITTED uncommitted changes"
  fi

  # Check if main is ahead of origin
  if [ "$BRANCH" == "main" ]; then
    AHEAD=$(git rev-list --count origin/main..main 2>/dev/null || echo "0")
    if [ "$AHEAD" -gt 0 ]; then
      print_status "warn" "$AHEAD commits ahead of origin (push needed)"
    else
      print_status "ok" "In sync with origin"
    fi
  fi
else
  print_status "error" "Not a git repository"
fi

echo ""

# ════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════
echo "════════════════════════════════════════════════════════"
echo "  Summary"
echo "════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✓ All systems healthy${NC}"
  EXIT_CODE=0
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠ $WARNINGS warnings (review recommended)${NC}"
  EXIT_CODE=0
else
  echo -e "${RED}✗ $ERRORS errors, $WARNINGS warnings (action required!)${NC}"
  EXIT_CODE=1
fi

echo ""
echo "Next check: $(date -v+1w '+%Y-%m-%d' 2>/dev/null || date -d '+1 week' '+%Y-%m-%d' 2>/dev/null || echo 'in 1 week')"
echo ""

# Optional: Send to Slack if webhook is set
if [ -n "$SLACK_WEBHOOK_URL" ] && [ "$ERRORS" -gt 0 ]; then
  MESSAGE="TPP Health Check: $ERRORS errors, $WARNINGS warnings"
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"$MESSAGE\"}" \
    &>/dev/null
  echo "Slack notification sent"
fi

exit $EXIT_CODE
