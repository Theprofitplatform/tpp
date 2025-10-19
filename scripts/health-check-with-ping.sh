#!/bin/bash
#
# TPP Health Check with Healthchecks.io Integration
#
# This script runs the health check and pings Healthchecks.io
# to enable dead-man switch monitoring
#
# Setup:
#   1. Create account at https://healthchecks.io
#   2. Create a new check named "TPP Health Monitor"
#   3. Set the ping URL below or via HEALTHCHECK_PING_URL env var
#   4. Add to crontab for automated monitoring
#
# Usage:
#   ./scripts/health-check-with-ping.sh
#
# Crontab example (Monday at 9 AM):
#   0 9 * * 1 /path/to/tpp/scripts/health-check-with-ping.sh
#

set -e

# ════════════════════════════════════════════════════════
# Configuration
# ════════════════════════════════════════════════════════

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Healthchecks.io ping URL (set via env var or edit here)
HEALTHCHECK_URL="${HEALTHCHECK_PING_URL:-}"

# If not set, look for it in .env.health file
if [ -z "$HEALTHCHECK_URL" ] && [ -f "$PROJECT_DIR/.env.health" ]; then
  source "$PROJECT_DIR/.env.health"
  HEALTHCHECK_URL="${HEALTHCHECK_PING_URL:-}"
fi

# Log file (optional)
LOG_FILE="${LOG_FILE:-/tmp/tpp-health-check.log}"

# ════════════════════════════════════════════════════════
# Functions
# ════════════════════════════════════════════════════════

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

ping_healthcheck() {
  local endpoint="$1"
  if [ -n "$HEALTHCHECK_URL" ]; then
    curl -fsS --retry 3 --max-time 10 "${HEALTHCHECK_URL}${endpoint}" > /dev/null 2>&1 || {
      log "Warning: Failed to ping Healthchecks.io"
    }
  fi
}

# ════════════════════════════════════════════════════════
# Main
# ════════════════════════════════════════════════════════

log "Starting TPP health check"

# Ping start (lets Healthchecks.io know we're running)
ping_healthcheck "/start"

# Change to project directory
cd "$PROJECT_DIR"

# Run health check and capture output and exit code
set +e
OUTPUT=$("$PROJECT_DIR/scripts/simple-health-check.sh" 2>&1)
EXIT_CODE=$?
set -e

# Log output
echo "$OUTPUT" >> "$LOG_FILE"

# Display output (for email/cron)
echo "$OUTPUT"

# Determine status
if [ $EXIT_CODE -eq 0 ]; then
  STATUS="success"
  log "Health check completed successfully"
  ping_healthcheck ""  # Ping success
else
  STATUS="failure"
  log "Health check detected errors (exit code: $EXIT_CODE)"
  ping_healthcheck "/fail"  # Ping failure
fi

# Optional: Keep only last 100 lines of log
if [ -f "$LOG_FILE" ]; then
  tail -100 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

log "Health check finished with status: $STATUS"

exit $EXIT_CODE
