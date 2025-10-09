#!/bin/bash

# ============================================
# Cron Status Check Script
# ============================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"

# ============================================
# FUNCTIONS
# ============================================
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_cron_service() {
    echo "=== Cron Service Status ==="
    if pgrep cron > /dev/null; then
        echo "✅ Cron service: RUNNING"
    else
        echo "❌ Cron service: NOT RUNNING"
        return 1
    fi
    echo ""
}

check_cron_jobs() {
    echo "=== Installed Cron Jobs ==="
    local job_count=$(crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | wc -l)

    if [ "$job_count" -eq 0 ]; then
        echo "❌ No cron jobs installed"
        return 1
    else
        echo "✅ $job_count cron job(s) installed"
        echo ""
        echo "Current cron jobs:"
        crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | while read -r line; do
            echo "  • $line"
        done
    fi
    echo ""
}

check_recent_logs() {
    echo "=== Recent Activity (Last 24h) ==="

    local log_files=(
        "cron-staging.log"
        "cron-monitor.log"
        "cron-git.log"
        "health-check.log"
    )

    for log_file in "${log_files[@]}"; do
        local full_path="$LOG_DIR/$log_file"
        if [ -f "$full_path" ]; then
            local last_modified=$(stat -c %Y "$full_path" 2>/dev/null || echo 0)
            local now=$(date +%s)
            local age=$((now - last_modified))

            if [ $age -lt 86400 ]; then  # 24 hours
                local last_line=$(tail -1 "$full_path" 2>/dev/null || echo "No content")
                echo "📄 $log_file: Active (last: ${last_line:0:50}...)"
            else
                echo "📄 $log_file: No recent activity"
            fi
        else
            echo "📄 $log_file: File not found"
        fi
    done
    echo ""
}

check_log_sizes() {
    echo "=== Log File Sizes ==="
    if [ -d "$LOG_DIR" ]; then
        find "$LOG_DIR" -name "*.log" -type f -exec ls -lh {} \; 2>/dev/null | \
        while read -r line; do
            echo "  $line"
        done
    else
        echo "  Log directory not found: $LOG_DIR"
    fi
    echo ""
}

check_system_resources() {
    echo "=== System Resources ==="

    # Disk space
    local disk_usage=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    local disk_free=$((100 - disk_usage))
    echo "💾 Disk: ${disk_free}% free (${disk_usage}% used)"

    # Memory
    local mem_info=$(free -h | awk 'NR==2 {print $3 "/" $2}')
    echo "🧠 Memory: $mem_info used"

    # Load average
    local load=$(cat /proc/loadavg | cut -d' ' -f1-3)
    echo "⚡ Load: $load"
    echo ""
}

check_failed_jobs() {
    echo "=== Failed Job Detection ==="

    local failed_count=0

    # Check for recent errors in logs
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            local error_count=$(grep -c -i "error\|failed\|timeout" "$log_file" 2>/dev/null || echo 0)
            if [ "$error_count" -gt 0 ]; then
                local filename=$(basename "$log_file")
                echo "⚠️  $filename: $error_count error(s)"
                failed_count=$((failed_count + 1))
            fi
        fi
    done

    if [ "$failed_count" -eq 0 ]; then
        echo "✅ No recent errors detected"
    fi
    echo ""
}

# ============================================
# MAIN EXECUTION
# ============================================
main() {
    echo ""
    echo "=========================================="
    echo "📊 VPS Automation Cron Status Report"
    echo "=========================================="
    echo ""

    check_cron_service
    check_cron_jobs
    check_recent_logs
    check_log_sizes
    check_system_resources
    check_failed_jobs

    echo "=========================================="
    echo "✅ Cron Status Check Complete"
    echo "=========================================="
    echo ""
}

# Execute
main "$@"