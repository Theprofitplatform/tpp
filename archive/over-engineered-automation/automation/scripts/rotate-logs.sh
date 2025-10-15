#!/bin/bash
# Log rotation script for Facebook automation

LOG_DIR="automation/logs"
DATE=$(date +%Y%m%d)

# Rotate scheduler logs
if [ -f "$LOG_DIR/scheduler.log" ]; then
    mv "$LOG_DIR/scheduler.log" "$LOG_DIR/scheduler_$DATE.log"
fi

# Rotate automation logs
if [ -f "$LOG_DIR/automation.log" ]; then
    mv "$LOG_DIR/automation.log" "$LOG_DIR/automation_$DATE.log"
fi

echo "Logs rotated for $DATE"
