#!/bin/bash

###############################################################################
# VPS Automation Monitoring Script
# Monitors automation health, system resources, and automation status
# Run via cron for continuous monitoring
###############################################################################

# Configuration
PROJECT_ROOT="/mnt/c/Users/abhis/projects/atpp/tpp"
LOG_DIR="$PROJECT_ROOT/automation/logs"
STATUS_FILE="$PROJECT_ROOT/automation/data/automation-status.json"
HEALTH_LOG="$LOG_DIR/health-check.log"
ALERT_LOG="$LOG_DIR/alerts.log"

# Thresholds
DISK_WARNING_THRESHOLD=80  # Warn if disk usage > 80%
MEMORY_WARNING_THRESHOLD=85  # Warn if memory usage > 85%
MAX_DAYS_SINCE_LAST_RUN=2  # Alert if no automation ran in X days

# Colors for terminal output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if needed
mkdir -p "$LOG_DIR"

# Start monitoring
echo "========================================" >> "$HEALTH_LOG"
echo "Health Check: $(date)" >> "$HEALTH_LOG"
echo "========================================" >> "$HEALTH_LOG"

###############################################################################
# Function: Check disk space
###############################################################################
check_disk_space() {
    echo -e "${BLUE}Checking disk space...${NC}"

    # Get disk usage percentage (remove % symbol)
    disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')

    echo "Disk Usage: $disk_usage%" >> "$HEALTH_LOG"

    if [ "$disk_usage" -gt "$DISK_WARNING_THRESHOLD" ]; then
        echo -e "${RED}⚠️  WARNING: Disk usage is ${disk_usage}% (threshold: ${DISK_WARNING_THRESHOLD}%)${NC}"
        echo "[$(date)] ALERT: High disk usage - ${disk_usage}%" >> "$ALERT_LOG"
        return 1
    else
        echo -e "${GREEN}✓ Disk space OK (${disk_usage}%)${NC}"
        return 0
    fi
}

###############################################################################
# Function: Check memory usage
###############################################################################
check_memory() {
    echo -e "${BLUE}Checking memory usage...${NC}"

    # Get memory usage percentage
    memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

    echo "Memory Usage: $memory_usage%" >> "$HEALTH_LOG"

    if [ "$memory_usage" -gt "$MEMORY_WARNING_THRESHOLD" ]; then
        echo -e "${RED}⚠️  WARNING: Memory usage is ${memory_usage}% (threshold: ${MEMORY_WARNING_THRESHOLD}%)${NC}"
        echo "[$(date)] ALERT: High memory usage - ${memory_usage}%" >> "$ALERT_LOG"
        return 1
    else
        echo -e "${GREEN}✓ Memory OK (${memory_usage}%)${NC}"
        return 0
    fi
}

###############################################################################
# Function: Check API key configuration
###############################################################################
check_api_keys() {
    echo -e "${BLUE}Checking API configuration...${NC}"

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo -e "${RED}✗ ANTHROPIC_API_KEY not set${NC}"
        echo "[$(date)] ALERT: ANTHROPIC_API_KEY missing" >> "$ALERT_LOG"
        echo "API Key: MISSING" >> "$HEALTH_LOG"
        return 1
    else
        echo -e "${GREEN}✓ API key configured${NC}"
        echo "API Key: OK" >> "$HEALTH_LOG"
        return 0
    fi
}

###############################################################################
# Function: Check automation status
###############################################################################
check_automation_status() {
    echo -e "${BLUE}Checking automation status...${NC}"

    if [ ! -f "$STATUS_FILE" ]; then
        echo -e "${YELLOW}⚠️  No automation runs recorded yet${NC}"
        echo "Automation Status: No runs yet" >> "$HEALTH_LOG"
        return 0
    fi

    # Check last run date
    last_run_date=$(node -e "
        const fs = require('fs');
        try {
            const status = JSON.parse(fs.readFileSync('$STATUS_FILE', 'utf-8'));
            const dates = Object.keys(status).sort().reverse();
            console.log(dates[0] || 'never');
        } catch (e) {
            console.log('error');
        }
    ")

    if [ "$last_run_date" == "never" ] || [ "$last_run_date" == "error" ]; then
        echo -e "${YELLOW}⚠️  No successful automation runs found${NC}"
        echo "Last Run: NEVER" >> "$HEALTH_LOG"
        return 1
    fi

    # Calculate days since last run
    if command -v date &> /dev/null; then
        current_date=$(date +%s)
        last_run_timestamp=$(date -d "$last_run_date" +%s 2>/dev/null || echo "0")

        if [ "$last_run_timestamp" != "0" ]; then
            days_since=$((($current_date - $last_run_timestamp) / 86400))

            echo "Last Run: $last_run_date ($days_since days ago)" >> "$HEALTH_LOG"

            if [ "$days_since" -gt "$MAX_DAYS_SINCE_LAST_RUN" ]; then
                echo -e "${RED}⚠️  WARNING: Last automation run was ${days_since} days ago${NC}"
                echo "[$(date)] ALERT: No automation runs in ${days_since} days" >> "$ALERT_LOG"
                return 1
            else
                echo -e "${GREEN}✓ Automation running regularly (last run: ${days_since} days ago)${NC}"
                return 0
            fi
        fi
    fi

    echo -e "${GREEN}✓ Automation status OK (last run: ${last_run_date})${NC}"
    echo "Last Run: $last_run_date" >> "$HEALTH_LOG"
    return 0
}

###############################################################################
# Function: Check required directories
###############################################################################
check_directories() {
    echo -e "${BLUE}Checking required directories...${NC}"

    required_dirs=(
        "$PROJECT_ROOT/automation/scripts"
        "$PROJECT_ROOT/automation/config"
        "$PROJECT_ROOT/automation/data"
        "$PROJECT_ROOT/automation/generated"
        "$PROJECT_ROOT/automation/reports"
        "$PROJECT_ROOT/automation/logs"
    )

    missing_dirs=0

    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            echo -e "${RED}✗ Missing directory: $dir${NC}"
            echo "Missing Directory: $dir" >> "$HEALTH_LOG"
            missing_dirs=$((missing_dirs + 1))
        fi
    done

    if [ $missing_dirs -gt 0 ]; then
        echo "[$(date)] ALERT: $missing_dirs directories missing" >> "$ALERT_LOG"
        return 1
    else
        echo -e "${GREEN}✓ All required directories present${NC}"
        echo "Directories: OK" >> "$HEALTH_LOG"
        return 0
    fi
}

###############################################################################
# Function: Check automation failures
###############################################################################
check_failures() {
    echo -e "${BLUE}Checking for automation failures...${NC}"

    if [ ! -f "$STATUS_FILE" ]; then
        echo "No failures (no runs yet)" >> "$HEALTH_LOG"
        return 0
    fi

    # Count failures in last 7 days
    failures=$(node -e "
        const fs = require('fs');
        try {
            const status = JSON.parse(fs.readFileSync('$STATUS_FILE', 'utf-8'));
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            let failureCount = 0;
            for (const [date, runs] of Object.entries(status)) {
                if (new Date(date) >= sevenDaysAgo) {
                    failureCount += runs.filter(r => r.status === 'failed').length;
                }
            }
            console.log(failureCount);
        } catch (e) {
            console.log(0);
        }
    ")

    if [ "$failures" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${failures} automation failure(s) in last 7 days${NC}"
        echo "Recent Failures: $failures" >> "$HEALTH_LOG"
        echo "[$(date)] WARNING: $failures automation failures in last 7 days" >> "$ALERT_LOG"
        return 1
    else
        echo -e "${GREEN}✓ No failures in last 7 days${NC}"
        echo "Recent Failures: 0" >> "$HEALTH_LOG"
        return 0
    fi
}

###############################################################################
# Function: Generate health score
###############################################################################
calculate_health_score() {
    local passed=$1
    local total=$2
    local percentage=$((passed * 100 / total))

    echo "" >> "$HEALTH_LOG"
    echo "Health Score: $passed/$total checks passed (${percentage}%)" >> "$HEALTH_LOG"
    echo "========================================" >> "$HEALTH_LOG"
    echo "" >> "$HEALTH_LOG"

    if [ $percentage -ge 90 ]; then
        echo -e "\n${GREEN}✓ Overall Health: EXCELLENT (${percentage}%)${NC}\n"
    elif [ $percentage -ge 70 ]; then
        echo -e "\n${YELLOW}⚠️  Overall Health: GOOD (${percentage}%)${NC}\n"
    elif [ $percentage -ge 50 ]; then
        echo -e "\n${YELLOW}⚠️  Overall Health: FAIR (${percentage}%)${NC}\n"
    else
        echo -e "\n${RED}✗ Overall Health: POOR (${percentage}%)${NC}\n"
    fi
}

###############################################################################
# Main execution
###############################################################################

echo ""
echo "========================================="
echo "  SEO Automation Health Monitor"
echo "========================================="
echo ""

# Run all checks
total_checks=6
passed_checks=0

check_disk_space && passed_checks=$((passed_checks + 1))
check_memory && passed_checks=$((passed_checks + 1))
check_api_keys && passed_checks=$((passed_checks + 1))
check_directories && passed_checks=$((passed_checks + 1))
check_automation_status && passed_checks=$((passed_checks + 1))
check_failures && passed_checks=$((passed_checks + 1))

# Calculate and display health score
calculate_health_score $passed_checks $total_checks

echo "Full logs: $HEALTH_LOG"
echo "Alerts: $ALERT_LOG"
echo ""

# Exit with appropriate code
if [ $passed_checks -eq $total_checks ]; then
    exit 0
else
    exit 1
fi
