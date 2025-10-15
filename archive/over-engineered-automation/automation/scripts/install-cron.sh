#!/bin/bash

# ============================================
# Cron Installation Script for VPS Automation
# ============================================

set -e  # Exit on any error
set -u  # Exit on undefined variable

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CRON_FILE="$PROJECT_DIR/automation/crontab-production.conf"
BACKUP_DIR="$PROJECT_DIR/automation/backups"

# ============================================
# FUNCTIONS
# ============================================
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

log_success() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1"
}

backup_current_cron() {
    log "Creating backup of current crontab..."
    mkdir -p "$BACKUP_DIR"
    local backup_file="$BACKUP_DIR/crontab-backup-$(date +%Y-%m-%d_%H-%M-%S).txt"
    crontab -l > "$backup_file" 2>/dev/null || {
        log "No existing crontab to backup"
        return 0
    }
    log_success "Backup created: $backup_file"
}

verify_cron_file() {
    log "Verifying cron configuration file..."

    if [ ! -f "$CRON_FILE" ]; then
        log_error "Cron file not found: $CRON_FILE"
        return 1
    fi

    # Check for required variables
    if ! grep -q "PROJECT_DIR=" "$CRON_FILE"; then
        log_error "PROJECT_DIR variable not found in cron file"
        return 1
    fi

    # Check for valid cron syntax
    local temp_cron="/tmp/tpp-cron-check"
    grep -v "^#" "$CRON_FILE" | grep -v "^$" > "$temp_cron" || true

    if [ -s "$temp_cron" ]; then
        if ! crontab "$temp_cron" 2>/dev/null; then
            log_error "Invalid cron syntax detected"
            rm -f "$temp_cron"
            return 1
        fi
        crontab -r 2>/dev/null || true  # Remove test crontab
    fi

    rm -f "$temp_cron"
    log_success "Cron file syntax verified"
}

install_cron_jobs() {
    log "Installing cron jobs..."

    # Create logs directory if it doesn't exist
    mkdir -p "$PROJECT_DIR/automation/logs"

    # Install the cron jobs
    if crontab "$CRON_FILE"; then
        log_success "Cron jobs installed successfully"
    else
        log_error "Failed to install cron jobs"
        return 1
    fi
}

verify_installation() {
    log "Verifying cron installation..."

    local installed_count=$(crontab -l | grep -c "$PROJECT_DIR" || true)
    local expected_count=$(grep -v "^#" "$CRON_FILE" | grep -v "^$" | grep -c "$PROJECT_DIR" || true)

    if [ "$installed_count" -eq "$expected_count" ]; then
        log_success "All $expected_count cron jobs installed successfully"
    else
        log_error "Installation verification failed: $installed_count/$expected_count jobs installed"
        return 1
    fi
}

show_cron_status() {
    log "Current cron jobs:"
    echo ""
    crontab -l | grep -v "^#" | grep -v "^$" || {
        echo "No cron jobs found"
    }
    echo ""
}

# ============================================
# MAIN EXECUTION
# ============================================
main() {
    echo ""
    echo "=========================================="
    echo "🔧 VPS Automation Cron Installation"
    echo "=========================================="
    echo ""

    # Check if running as correct user
    if [ "$(whoami)" != "abhi" ] && [ "$(whoami)" != "avi" ]; then
        log_warning "Running as $(whoami) - ensure this user has cron access"
    fi

    # Show current cron status
    show_cron_status

    # Backup current cron
    backup_current_cron

    # Verify cron file
    if ! verify_cron_file; then
        log_error "Cron file verification failed"
        exit 1
    fi

    # Install cron jobs
    if ! install_cron_jobs; then
        log_error "Cron installation failed"
        exit 1
    fi

    # Verify installation
    if ! verify_installation; then
        log_error "Installation verification failed"
        exit 1
    fi

    # Show final status
    echo ""
    log_success "Cron installation completed successfully!"
    echo ""
    echo "📋 Installed Jobs:"
    echo "================="
    crontab -l | grep -v "^#" | grep -v "^$" | while read -r line; do
        echo "  • $line"
    done
    echo ""
    echo "📁 Log Directory: $PROJECT_DIR/automation/logs"
    echo "📄 Cron Config: $CRON_FILE"
    echo ""
    echo "💡 Next Steps:"
    echo "  - Monitor logs in automation/logs/"
    echo "  - Check cron status with: crontab -l"
    echo "  - View cron logs with: tail -f automation/logs/cron-*.log"
    echo ""
}

# ============================================
# ERROR HANDLING
# ============================================
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: $exit_code"
    exit $exit_code
}

trap handle_error ERR

# Execute
main "$@"