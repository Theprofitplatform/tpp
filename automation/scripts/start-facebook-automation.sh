#!/bin/bash
# Startup script for Facebook automation on VPS

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"

cd "$PROJECT_DIR"

# Load VPS-specific environment
if [ -f ".env.vps" ]; then
    echo "📋 Loading VPS environment configuration..."
    export $(grep -v '^#' .env.vps | xargs)
fi

# Start the Facebook scheduler
echo "Starting Facebook scheduler..."
nohup node automation/scripts/facebook-scheduler.js start >> "$LOG_DIR/scheduler.log" 2>&1 &

# Save the PID
echo $! > "$LOG_DIR/scheduler.pid"

echo "Facebook automation started with PID: $(cat $LOG_DIR/scheduler.pid)"
echo "Logs: $LOG_DIR/scheduler.log"
