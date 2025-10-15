#!/bin/bash
# Shutdown script for Facebook automation on VPS

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"
PID_FILE="$LOG_DIR/scheduler.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null; then
        echo "Stopping Facebook scheduler (PID: $PID)..."
        kill $PID
        rm "$PID_FILE"
        echo "Facebook automation stopped"
    else
        echo "Facebook scheduler not running"
        rm "$PID_FILE"
    fi
else
    echo "No PID file found - scheduler may not be running"
fi
