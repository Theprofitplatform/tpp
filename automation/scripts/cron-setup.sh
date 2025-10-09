#!/bin/bash

# Cron Setup Script for Facebook Automation
# This script sets up automated cron jobs for Facebook posting

echo "⏰ Setting up cron jobs for Facebook Automation..."

PROJECT_DIR="/home/abhi/projects/atpp/tpp"
CRON_FILE="/tmp/facebook-cron"

# Create cron file
cat > $CRON_FILE << EOF
# Facebook Automation Cron Jobs
# Generated: $(date)

# Start Facebook scheduler on system reboot
@reboot $PROJECT_DIR/automation/scripts/start-facebook-automation.sh

# Rotate logs every Sunday at midnight
0 0 * * 0 $PROJECT_DIR/automation/scripts/rotate-logs.sh

# Health check every hour (optional)
0 * * * * $PROJECT_DIR/automation/scripts/check-status.sh >> $PROJECT_DIR/automation/logs/health-check.log 2>&1

# Force automated check (for testing) - runs every 5 minutes
# */5 * * * * cd $PROJECT_DIR && node automation/scripts/facebook-scheduler.js force >> $PROJECT_DIR/automation/logs/force-check.log 2>&1
EOF

echo "📄 Cron configuration created:"
echo ""
cat $CRON_FILE

echo ""
echo "📋 To install these cron jobs:"
echo "1. Copy the above configuration"
echo "2. Run: crontab -e"
echo "3. Paste the configuration"
echo "4. Save and exit"
echo ""
echo "💡 Alternatively, install automatically:"
echo "   crontab $CRON_FILE"
echo ""
echo "⚠️  Note: The automated posting will run according to the schedule in facebook-automation.js"
echo "    (Monday 09:30, Wednesday 14:00, Friday 11:00 AEST)"