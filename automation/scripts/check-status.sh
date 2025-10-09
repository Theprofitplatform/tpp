#!/bin/bash
# Status check script for Facebook automation

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"
PID_FILE="$LOG_DIR/scheduler.pid"

cd "$PROJECT_DIR"

echo "=== Facebook Automation Status ==="

# Check if scheduler is running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null; then
        echo "✅ Scheduler: RUNNING (PID: $PID)"
    else
        echo "❌ Scheduler: NOT RUNNING (stale PID file)"
        rm "$PID_FILE"
    fi
else
    echo "❌ Scheduler: NOT RUNNING"
fi

# Check automation status
echo ""
echo "=== Automation Status ==="
node automation/scripts/facebook-automation.js --status

echo ""
echo "=== Recent Logs ==="
tail -5 "$LOG_DIR/scheduler.log" 2>/dev/null || echo "No logs found"
