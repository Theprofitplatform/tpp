#!/bin/bash

#############################################
# VPS Automation Monitor & Health Check
# Monitors automation systems and alerts on issues
#############################################

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"

# ============================================
# CONFIGURATION
# ============================================
HEALTH_LOG="$LOG_DIR/health-check.log"
MAX_LOG_AGE_DAYS=7

# Alert thresholds
MAX_FAILED_ATTEMPTS=3
MIN_FREE_DISK_PERCENT=20
MIN_FREE_MEMORY_PERCENT=10

# ============================================
# LOGGING
# ============================================
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$HEALTH_LOG"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$HEALTH_LOG" >&2
}

log_warning() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1" | tee -a "$HEALTH_LOG"
}

send_alert() {
    local severity=$1
    local title=$2
    local message=$3

    # Discord webhook alert
    local webhook_url="${DISCORD_WEBHOOK_URL:-}"
    if [ -n "$webhook_url" ]; then
        local payload=$(cat << EOF
{
  "content": "**$severity**: $title\\n$message"
}
EOF
        )
        curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$webhook_url" > /dev/null 2>&1 || true
    fi

    log "Alert sent: $title"
}

# ============================================
# HEALTH CHECKS
# ============================================
check_disk_space() {
    local usage=$(df "$PROJECT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    local free=$((100 - usage))

    if [ $free -lt $MIN_FREE_DISK_PERCENT ]; then
        log_error "Low disk space: ${free}% free (threshold: ${MIN_FREE_DISK_PERCENT}%)"
        send_alert "CRITICAL" "Low Disk Space" "Only ${free}% disk space remaining on VPS"
        return 1
    else
        log "Disk space OK: ${free}% free"
        return 0
    fi
}

check_memory() {
    local total_mem=$(free | awk 'NR==2 {print $2}')
    local available_mem=$(free | awk 'NR==2 {print $7}')
    local available_percent=$((available_mem * 100 / total_mem))

    if [ $available_percent -lt $MIN_FREE_MEMORY_PERCENT ]; then
        log_error "Low memory: ${available_percent}% available (threshold: ${MIN_FREE_MEMORY_PERCENT}%)"
        send_alert "WARNING" "Low Memory" "Only ${available_percent}% memory available on VPS"
        return 1
    else
        log "Memory OK: ${available_percent}% available"
        return 0
    fi
}

check_processes() {
    local processes=(
        "facebook-scheduler"
    )

    local critical_failures=false

    # Check for on-demand services (warnings only, not failures)
    for process in "${processes[@]}"; do
        if ! pgrep -f "$process" > /dev/null; then
            log_warning "Process not running: $process (expected for on-demand services)"
            # Don't send alerts for on-demand services that don't need to run continuously
            # send_alert "INFO" "Process Not Running" "$process is not currently running (on-demand service)"
        else
            log "Process running: $process"
        fi
    done

    # Check for critical system services that should always be running
    local critical_services=(
        "cron"
    )

    for service in "${critical_services[@]}"; do
        if ! pgrep "$service" > /dev/null; then
            log_error "Critical service not running: $service"
            send_alert "CRITICAL" "Critical Service Down" "$service is not running on VPS"
            critical_failures=true
        else
            log "Critical service running: $service"
        fi
    done

    if [ "$critical_failures" = "true" ]; then
        return 1
    fi
    return 0
}

check_recent_failures() {
    local log_files=("$LOG_DIR/blog-automation-"*.log)
    local recent_failures=0

    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            # Check if log is from last 24 hours
            if find "$log_file" -mtime -1 > /dev/null 2>&1; then
                if grep -q "ERROR\|failed\|Failed" "$log_file"; then
                    recent_failures=$((recent_failures + 1))
                fi
            fi
        fi
    done

    if [ $recent_failures -ge $MAX_FAILED_ATTEMPTS ]; then
        log_error "Multiple recent failures detected: $recent_failures"
        send_alert "WARNING" "Multiple Failures" "$recent_failures automation failures in last 24 hours"
        return 1
    elif [ $recent_failures -gt 0 ]; then
        log "Recent failures: $recent_failures (within threshold)"
    else
        log "No recent failures detected"
    fi

    return 0
}

check_api_health() {
    # Check if API keys are configured
    if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
        log_error "Claude API key not configured"
        send_alert "CRITICAL" "API Key Missing" "ANTHROPIC_API_KEY not set in environment"
        return 1
    fi

    if [ -z "${UNSPLASH_ACCESS_KEY:-}" ]; then
        log_warning "Unsplash API key not configured"
    fi

    log "API configuration OK"
    return 0
}

check_git_status() {
    cd "$PROJECT_DIR"

    # Check if we're on main branch
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        log_error "Not on main branch: $current_branch"
        send_alert "WARNING" "Wrong Git Branch" "Currently on $current_branch branch, should be main"
        return 1
    fi

    # Check for uncommitted changes
    if ! git diff --quiet; then
        log_warning "Uncommitted changes detected"
        # Don't alert for this - it's normal during development
    fi

    # Check if we're behind remote
    git fetch origin
    local behind_count=$(git rev-list HEAD..origin/main --count)
    if [ $behind_count -gt 0 ]; then
        log_warning "Behind remote by $behind_count commits"
        send_alert "INFO" "Git Sync Needed" "VPS is $behind_count commits behind remote"
    fi

    log "Git status OK"
    return 0
}

# ============================================
# MAINTENANCE
# ============================================
cleanup_old_logs() {
    log "Cleaning up old logs..."

    # Remove logs older than MAX_LOG_AGE_DAYS
    find "$LOG_DIR" -name "*.log" -mtime +$MAX_LOG_AGE_DAYS -delete 2>/dev/null || true

    # Clean up old backup files
    find "$PROJECT_DIR/automation/backups" -name "*.md" -mtime +30 -delete 2>/dev/null || true

    log "Cleanup completed"
}

# ============================================
# MAIN EXECUTION
# ============================================
main() {
    log "🔍 Starting VPS Automation Health Check"

    local checks_passed=0
    local checks_failed=0

    # Run health checks
    if check_disk_space; then ((checks_passed++)); else ((checks_failed++)); fi
    if check_memory; then ((checks_passed++)); else ((checks_failed++)); fi
    if check_processes; then ((checks_passed++)); else ((checks_failed++)); fi
    if check_recent_failures; then ((checks_passed++)); else ((checks_failed++)); fi
    if check_api_health; then ((checks_passed++)); else ((checks_failed++)); fi
    if check_git_status; then ((checks_passed++)); else ((checks_failed++)); fi

    # Run maintenance
    cleanup_old_logs

    # Summary
    log "========================================="
    log "Health Check Summary:"
    log "✅ Passed: $checks_passed"
    log "❌ Failed: $checks_failed"
    log "========================================="

    if [ $checks_failed -eq 0 ]; then
        log "✅ All systems operational"
        exit 0
    else
        log_error "❌ $checks_failed health check(s) failed"
        send_alert "SUMMARY" "Health Check Failed" "$checks_failed of $((checks_passed + checks_failed)) checks failed"
        exit 1
    fi
}

# Execute
main "$@"