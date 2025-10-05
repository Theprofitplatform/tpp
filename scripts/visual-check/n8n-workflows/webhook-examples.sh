#!/bin/bash

###############################################################################
# n8n Visual Agent - Webhook Integration Examples
#
# This script demonstrates various ways to trigger the visual monitoring
# agent via webhooks for integration with other systems.
###############################################################################

# Configuration
WEBHOOK_URL="https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# Example 1: Basic Manual Trigger
###############################################################################
trigger_basic() {
  echo -e "${YELLOW}[1] Basic Manual Trigger${NC}"
  echo "Triggering visual agent via webhook..."

  response=$(curl -s -X POST "$WEBHOOK_URL")

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    echo -e "${RED}✗ Failed${NC}"
  fi
  echo ""
}

###############################################################################
# Example 2: Trigger with Timeout and Retry
###############################################################################
trigger_with_retry() {
  echo -e "${YELLOW}[2] Trigger with Timeout and Retry${NC}"

  max_retries=3
  timeout=30

  for i in $(seq 1 $max_retries); do
    echo "Attempt $i/$max_retries..."

    response=$(curl -s -X POST --max-time $timeout "$WEBHOOK_URL")
    status=$?

    if [ $status -eq 0 ]; then
      echo -e "${GREEN}✓ Success on attempt $i${NC}"
      echo "$response" | jq '.' 2>/dev/null || echo "$response"
      return 0
    else
      echo -e "${RED}✗ Failed (exit code: $status)${NC}"
      [ $i -lt $max_retries ] && echo "Retrying in 5 seconds..." && sleep 5
    fi
  done

  echo -e "${RED}✗ All retries exhausted${NC}"
  echo ""
}

###############################################################################
# Example 3: Trigger from Cron Job
###############################################################################
trigger_from_cron() {
  echo -e "${YELLOW}[3] Cron Job Integration${NC}"
  echo "Example crontab entry:"
  echo ""
  echo "# Run visual agent every 15 minutes"
  echo "*/15 * * * * curl -X POST $WEBHOOK_URL >> /var/log/visual-agent-webhook.log 2>&1"
  echo ""
  echo "# Run visual agent daily at 9 AM"
  echo "0 9 * * * curl -X POST $WEBHOOK_URL >> /var/log/visual-agent-webhook.log 2>&1"
  echo ""
}

###############################################################################
# Example 4: Trigger from Git Post-Receive Hook
###############################################################################
trigger_from_git() {
  echo -e "${YELLOW}[4] Git Post-Receive Hook${NC}"
  echo "Add to .git/hooks/post-receive:"
  echo ""
  cat <<'EOF'
#!/bin/bash
# Trigger visual agent after git push

echo "Triggering visual quality check..."
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook

echo "Visual agent triggered. Check email for results."
EOF
  echo ""
}

###############################################################################
# Example 5: Trigger from GitHub Actions
###############################################################################
trigger_from_github_actions() {
  echo -e "${YELLOW}[5] GitHub Actions Integration${NC}"
  echo "Add to .github/workflows/visual-check.yml:"
  echo ""
  cat <<'EOF'
name: Visual Quality Check
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes

jobs:
  visual-check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger n8n Visual Agent
        run: |
          response=$(curl -s -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook)
          echo "Response: $response"

      - name: Check Result
        run: |
          # Parse response and fail if tests failed
          if echo "$response" | jq -e '.stats.failed > 0'; then
            echo "Visual tests failed!"
            exit 1
          fi
EOF
  echo ""
}

###############################################################################
# Example 6: Trigger with Slack Notification
###############################################################################
trigger_with_slack() {
  echo -e "${YELLOW}[6] Trigger with Slack Notification${NC}"

  SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL"

  echo "Triggering visual agent..."
  response=$(curl -s -X POST "$WEBHOOK_URL")

  # Extract stats from response
  total=$(echo "$response" | jq -r '.stats.total')
  passed=$(echo "$response" | jq -r '.stats.passed')
  failed=$(echo "$response" | jq -r '.stats.failed')

  # Send to Slack
  slack_message='{
    "text": "Visual Quality Check Complete",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Visual Quality Check Results*\n• Total Tests: '"$total"'\n• Passed: '"$passed"'\n• Failed: '"$failed"'"
        }
      }
    ]
  }'

  echo "Sending to Slack..."
  curl -X POST -H 'Content-type: application/json' \
    --data "$slack_message" \
    "$SLACK_WEBHOOK"
  echo ""
}

###############################################################################
# Example 7: Trigger and Wait for Completion
###############################################################################
trigger_and_wait() {
  echo -e "${YELLOW}[7] Trigger and Wait for Completion${NC}"

  echo "Triggering visual agent (this may take 30-60 seconds)..."

  start_time=$(date +%s)
  response=$(curl -s -X POST "$WEBHOOK_URL")
  end_time=$(date +%s)

  duration=$((end_time - start_time))

  echo -e "${GREEN}✓ Completed in ${duration}s${NC}"
  echo ""
  echo "Results:"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"
  echo ""
}

###############################################################################
# Example 8: Scheduled Trigger with Email Summary
###############################################################################
trigger_scheduled_summary() {
  echo -e "${YELLOW}[8] Scheduled Trigger with Summary${NC}"

  echo "Running visual check..."
  response=$(curl -s -X POST "$WEBHOOK_URL")

  # Parse response
  timestamp=$(echo "$response" | jq -r '.timestamp')
  total=$(echo "$response" | jq -r '.stats.total')
  passed=$(echo "$response" | jq -r '.stats.passed')
  failed=$(echo "$response" | jq -r '.stats.failed')

  # Generate summary email
  email_body="Visual Quality Check Summary

Timestamp: $timestamp
Total Tests: $total
Passed: $passed
Failed: $failed

Status: $([ $failed -eq 0 ] && echo 'ALL TESTS PASSED ✓' || echo 'SOME TESTS FAILED ✗')

Full report has been sent to abhishekmaharjan3737@gmail.com
"

  echo "$email_body"

  # Could send this summary via mail command
  # echo "$email_body" | mail -s "Visual Check Summary" user@example.com
  echo ""
}

###############################################################################
# Example 9: Parallel Execution with Multiple Sites
###############################################################################
trigger_parallel() {
  echo -e "${YELLOW}[9] Parallel Execution (Multiple Environments)${NC}"

  # If you have multiple environments (staging, production, etc.)
  webhooks=(
    "https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook"
    # "https://n8n.theprofitplatform.com.au/webhook/visual-agent-staging"
  )

  echo "Triggering all environments in parallel..."

  for webhook in "${webhooks[@]}"; do
    (
      echo "Triggering: $webhook"
      curl -s -X POST "$webhook" > /dev/null 2>&1 &
    ) &
  done

  wait
  echo -e "${GREEN}✓ All environments triggered${NC}"
  echo ""
}

###############################################################################
# Example 10: Integration with Monitoring Tools (Prometheus/Grafana)
###############################################################################
trigger_with_metrics() {
  echo -e "${YELLOW}[10] Integration with Metrics Export${NC}"

  echo "Triggering visual agent..."
  response=$(curl -s -X POST "$WEBHOOK_URL")

  # Extract metrics
  total=$(echo "$response" | jq -r '.stats.total')
  passed=$(echo "$response" | jq -r '.stats.passed')
  failed=$(echo "$response" | jq -r '.stats.failed')

  # Export to Prometheus format
  metrics_file="/var/lib/node_exporter/textfile_collector/visual_agent.prom"

  cat > "$metrics_file" <<EOF
# HELP visual_agent_tests_total Total number of visual tests
# TYPE visual_agent_tests_total gauge
visual_agent_tests_total $total

# HELP visual_agent_tests_passed Number of passed tests
# TYPE visual_agent_tests_passed gauge
visual_agent_tests_passed $passed

# HELP visual_agent_tests_failed Number of failed tests
# TYPE visual_agent_tests_failed gauge
visual_agent_tests_failed $failed
EOF

  echo "Metrics exported to: $metrics_file"
  echo ""
}

###############################################################################
# Main Menu
###############################################################################
main() {
  echo "========================================"
  echo "n8n Visual Agent - Webhook Examples"
  echo "========================================"
  echo ""

  PS3='Select an example (or 0 to exit): '
  options=(
    "Basic Manual Trigger"
    "Trigger with Timeout and Retry"
    "Cron Job Integration"
    "Git Post-Receive Hook"
    "GitHub Actions Integration"
    "Trigger with Slack Notification"
    "Trigger and Wait for Completion"
    "Scheduled Trigger with Email Summary"
    "Parallel Execution"
    "Integration with Metrics Export"
    "Run All Examples"
  )

  select opt in "${options[@]}"; do
    case $REPLY in
      1) trigger_basic; break ;;
      2) trigger_with_retry; break ;;
      3) trigger_from_cron; break ;;
      4) trigger_from_git; break ;;
      5) trigger_from_github_actions; break ;;
      6) trigger_with_slack; break ;;
      7) trigger_and_wait; break ;;
      8) trigger_scheduled_summary; break ;;
      9) trigger_parallel; break ;;
      10) trigger_with_metrics; break ;;
      11)
        for i in {1..10}; do
          case $i in
            1) trigger_basic ;;
            2) trigger_with_retry ;;
            3) trigger_from_cron ;;
            4) trigger_from_git ;;
            5) trigger_from_github_actions ;;
            6) trigger_with_slack ;;
            7) trigger_and_wait ;;
            8) trigger_scheduled_summary ;;
            9) trigger_parallel ;;
            10) trigger_with_metrics ;;
          esac
        done
        break
        ;;
      0) echo "Exiting..."; exit 0 ;;
      *) echo "Invalid option $REPLY"; break ;;
    esac
  done
}

# Run main menu if script is executed directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
  main
fi
