#!/bin/bash

###############################################################################
# Setup Automated Blog Generation via Cron
# Runs auto-blog-runner.sh on a schedule
###############################################################################

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNNER_SCRIPT="$PROJECT_DIR/automation/auto-blog-runner.sh"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ⏰ Cron Automation Setup              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check if runner exists
if [ ! -f "$RUNNER_SCRIPT" ]; then
    echo -e "${RED}❌ Runner script not found: $RUNNER_SCRIPT${NC}"
    exit 1
fi

# Make runner executable
chmod +x "$RUNNER_SCRIPT"

echo -e "${YELLOW}Choose automation schedule:${NC}"
echo ""
echo "1) Daily at 9 AM (Weekdays only)"
echo "2) Every 2 days at 10 AM"
echo "3) Monday, Wednesday, Friday at 2 PM"
echo "4) Custom schedule"
echo "5) Show current cron jobs"
echo "6) Remove automation"
echo ""
read -p "Select option (1-6): " OPTION

case $OPTION in
    1)
        CRON_SCHEDULE="0 9 * * 1-5"
        DESCRIPTION="Daily at 9 AM (Weekdays)"
        ;;
    2)
        CRON_SCHEDULE="0 10 */2 * *"
        DESCRIPTION="Every 2 days at 10 AM"
        ;;
    3)
        CRON_SCHEDULE="0 14 * * 1,3,5"
        DESCRIPTION="Mon/Wed/Fri at 2 PM"
        ;;
    4)
        echo ""
        echo -e "${YELLOW}Enter cron schedule (e.g., '0 9 * * *' for 9 AM daily):${NC}"
        read -p "Cron schedule: " CRON_SCHEDULE
        DESCRIPTION="Custom schedule: $CRON_SCHEDULE"
        ;;
    5)
        echo ""
        echo -e "${BLUE}Current cron jobs for blog automation:${NC}"
        crontab -l 2>/dev/null | grep "auto-blog-runner" || echo "No automation jobs found"
        echo ""
        exit 0
        ;;
    6)
        echo ""
        echo -e "${YELLOW}Removing automation...${NC}"
        crontab -l 2>/dev/null | grep -v "auto-blog-runner" | crontab - 2>/dev/null || true
        echo -e "${GREEN}✅ Automation removed${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

# Create cron entry
CRON_ENTRY="$CRON_SCHEDULE $RUNNER_SCRIPT >> $PROJECT_DIR/automation/logs/cron-output.log 2>&1"

echo ""
echo -e "${BLUE}Cron entry to be added:${NC}"
echo "$CRON_ENTRY"
echo ""
read -p "$(echo -e ${YELLOW}'Proceed with setup? (y/N): '${NC})" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remove existing entry
    (crontab -l 2>/dev/null | grep -v "auto-blog-runner"; echo "$CRON_ENTRY") | crontab -

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ Automation Setup Complete          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ Schedule: $DESCRIPTION${NC}"
    echo -e "${GREEN}✅ Script: $RUNNER_SCRIPT${NC}"
    echo -e "${GREEN}✅ Logs: $PROJECT_DIR/automation/logs/${NC}"
    echo ""
    echo -e "${BLUE}To view cron jobs: crontab -l${NC}"
    echo -e "${BLUE}To view logs: tail -f $PROJECT_DIR/automation/logs/cron-output.log${NC}"
    echo ""
else
    echo "Setup cancelled"
fi
