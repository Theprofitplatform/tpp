#!/bin/bash

#############################################
# VPS Blog Automation - Fixed Version
# Enhanced error handling and debugging
#############################################

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes

# ============================================
# CONFIGURATION
# ============================================
PROJECT_DIR="/home/avi/projects/tpp"
LOG_DIR="$PROJECT_DIR/automation/logs"
BACKUP_DIR="/home/avi/backups/blog-posts"
LOCK_FILE="/tmp/tpp-blog-automation.lock"

DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/blog-automation-$DATE.log"

# Quality score threshold (0-100)
MIN_QUALITY_SCORE=75

# Maximum retries for transient failures
MAX_RETRIES=3

# API timeout in seconds
API_TIMEOUT=300

# ============================================
# LOGGING FUNCTIONS
# ============================================
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

log_success() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1" | tee -a "$LOG_FILE"
}

log_debug() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 🔍 $1" | tee -a "$LOG_FILE"
}

# ============================================
# NOTIFICATION FUNCTIONS
# ============================================
send_notification() {
    local status=$1
    local title=$2
    local details=${3:-""}

    export STATUS="$status"
    export POST_TITLE="$title"
    export POST_URL="$details"

    log "Sending Discord notification: $status - $title"
    node "$PROJECT_DIR/automation/scripts/send-notification.js" >> "$LOG_FILE" 2>&1 || {
        log_error "Failed to send Discord notification"
    }
}

# ============================================
# LOCK FILE MANAGEMENT
# ============================================
acquire_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local lock_age=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))

        # If lock is older than 2 hours, assume stale and remove
        if [ $lock_age -gt 7200 ]; then
            log "Removing stale lock file (age: ${lock_age}s)"
            rm -f "$LOCK_FILE"
        else
            log_error "Another instance is running (lock file exists, age: ${lock_age}s)"
            exit 1
        fi
    fi

    echo $$ > "$LOCK_FILE"
    log "Lock acquired (PID: $$)"
}

release_lock() {
    rm -f "$LOCK_FILE"
    log "Lock released"
}

# Ensure lock is released on exit
trap release_lock EXIT

# ============================================
# API HEALTH CHECKS
# ============================================
check_api_health() {
    log "Checking API health..."

    # Check Claude API
    if ! timeout 10 curl -s -f -I https://api.anthropic.com > /dev/null; then
        log_error "Claude API is unreachable"
        return 1
    fi

    # Check Perplexity API
    if ! timeout 10 curl -s -f -I https://api.perplexity.ai > /dev/null; then
        log_error "Perplexity API is unreachable"
        return 1
    fi

    log_success "All APIs are reachable"
    return 0
}

# ============================================
# ENVIRONMENT VALIDATION
# ============================================
validate_environment() {
    log "Validating environment..."

    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "Project directory not found: $PROJECT_DIR"
        return 1
    fi

    # Check if .env.local exists
    if [ ! -f "$PROJECT_DIR/.env.local" ]; then
        log_error ".env.local file not found"
        return 1
    fi

    # Check if API keys are set
    if ! grep -q "ANTHROPIC_API_KEY" "$PROJECT_DIR/.env.local"; then
        log_error "ANTHROPIC_API_KEY not found in .env.local"
        return 1
    fi

    if ! grep -q "PERPLEXITY_API_KEY" "$PROJECT_DIR/.env.local"; then
        log_error "PERPLEXITY_API_KEY not found in .env.local"
        return 1
    fi

    log_success "Environment validation passed"
    return 0
}

# ============================================
# MAIN WORKFLOW
# ============================================
main() {
    mkdir -p "$LOG_DIR" "$BACKUP_DIR"

    log "========================================="
    log "TPP Blog Automation Starting (Fixed Version)"
    log "========================================="

    acquire_lock

    cd "$PROJECT_DIR"

    # Validate environment first
    if ! validate_environment; then
        send_notification "failed" "Environment Validation Failed" "Check .env.local and project directory"
        exit 1
    fi

    # Check API health
    if ! check_api_health; then
        send_notification "failed" "API Connectivity Failed" "Check network and API endpoints"
        exit 1
    fi

    # -----------------------------------------
    # 1. GIT SYNC
    # -----------------------------------------
    log "Step 1: Syncing with GitHub..."

    git fetch origin

    # Check if remote has changes we don't have
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse origin/main)

    if [ "$LOCAL" != "$REMOTE" ]; then
        log "Remote has new changes, pulling..."

        # Check if we have uncommitted changes
        if [[ -n $(git status -s) ]]; then
            log_error "Local changes detected, cannot pull safely"
            send_notification "failed" "Git Sync Failed" "Uncommitted local changes"
            exit 1
        fi

        git pull origin main >> "$LOG_FILE" 2>&1
        log_success "Pulled latest changes"

        # Reinstall dependencies if package.json changed
        if git diff --name-only HEAD@{1} | grep -q package.json; then
            log "package.json changed, reinstalling dependencies..."
            npm install --legacy-peer-deps >> "$LOG_FILE" 2>&1
            log_success "Dependencies updated"
        fi
    else
        log "Repository is up to date"
    fi

    # -----------------------------------------
    # 2. CHECK TOPIC QUEUE
    # -----------------------------------------
    log "Step 2: Checking topic queue..."

    PENDING_TOPICS=$(node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('automation/topic-queue.json', 'utf-8'));
        const pending = data.queue.filter(t => t.status === 'pending');
        console.log(pending.length);
    ")

    log "Pending topics: $PENDING_TOPICS"

    if [ "$PENDING_TOPICS" -eq 0 ]; then
        log "No pending topics in queue, exiting"
        send_notification "info" "No Topics" "Topic queue is empty"
        exit 0
    fi

    # Check if we already generated today
    TODAY=$(date +%Y-%m-%d)
    if ls src/content/blog/${TODAY}-*.md 1> /dev/null 2>&1; then
        log "Already generated post today, skipping"
        exit 0
    fi

    # -----------------------------------------
    # 2.5. UPDATE INTERNAL LINK MAP
    # -----------------------------------------
    log "Step 2.5: Updating internal link map..."

    if node automation/scripts/update-link-map.js >> "$LOG_FILE" 2>&1; then
        log_success "Link map updated"
    else
        log "⚠️  Link map update failed, continuing anyway"
    fi

    # -----------------------------------------
    # 3. GENERATE BLOG POST (WITH TIMEOUT)
    # -----------------------------------------
    log "Step 3: Generating blog post..."

    RETRY_COUNT=0
    GENERATION_SUCCESS=false

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        log "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES"

        # Use timeout to prevent hanging
        if timeout $API_TIMEOUT node automation/scripts/generate-blog-post.js >> "$LOG_FILE" 2>&1; then
            log_success "Blog post generated"
            GENERATION_SUCCESS=true
            break
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            EXIT_CODE=$?

            if [ $EXIT_CODE -eq 124 ]; then
                log_error "Generation timed out after $API_TIMEOUT seconds"
            else
                log_error "Generation failed with exit code: $EXIT_CODE"
            fi

            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                log "Waiting 2 minutes before retry..."
                sleep 120
            fi
        fi
    done

    if [ "$GENERATION_SUCCESS" = false ]; then
        log_error "Blog generation failed after $MAX_RETRIES attempts"
        send_notification "failed" "Blog Generation Failed" "All retries exhausted - Check logs"
        exit 1
    fi

    # Get the generated post filename
    LATEST_POST=$(ls -t src/content/blog/${TODAY}-*.md 2>/dev/null | head -1)

    if [ -z "$LATEST_POST" ]; then
        log_error "No post file found after generation"
        send_notification "failed" "Post File Missing" "Generation reported success but file not found"
        exit 1
    fi

    log "Generated: $LATEST_POST"

    # Backup the generated post
    cp "$LATEST_POST" "$BACKUP_DIR/" || true

    # -----------------------------------------
    # 4. VALIDATION & QUALITY SCORE
    # -----------------------------------------
    log "Step 4: Running validation checks..."

    # Calculate quality score
    WORD_COUNT=$(wc -w < "$LATEST_POST")
    log "Word count: $WORD_COUNT"

    # Simple quality scoring
    QUALITY_SCORE=0

    if [ $WORD_COUNT -ge 1500 ]; then
        QUALITY_SCORE=$((QUALITY_SCORE + 30))
    elif [ $WORD_COUNT -ge 1000 ]; then
        QUALITY_SCORE=$((QUALITY_SCORE + 20))
    fi

    # Check for internal links
    if grep -q "](/blog/" "$LATEST_POST"; then
        QUALITY_SCORE=$((QUALITY_SCORE + 20))
    fi

    # Check for images
    if grep -q "coverImage:" "$LATEST_POST"; then
        QUALITY_SCORE=$((QUALITY_SCORE + 15))
    fi

    # Check for meta description
    if grep -q "description:" "$LATEST_POST"; then
        QUALITY_SCORE=$((QUALITY_SCORE + 15))
    fi

    # Check for schema
    if grep -q "schema:" "$LATEST_POST" || grep -q '"@type"' "$LATEST_POST"; then
        QUALITY_SCORE=$((QUALITY_SCORE + 20))
    fi

    log "Quality score: $QUALITY_SCORE/100"

    if [ $QUALITY_SCORE -lt $MIN_QUALITY_SCORE ]; then
        log_error "Quality check failed (score: $QUALITY_SCORE, minimum: $MIN_QUALITY_SCORE)"
        POST_TITLE=$(grep "^title:" "$LATEST_POST" | head -1 | sed 's/title: *//' | tr -d '"')
        send_notification "warning" "Low Quality Post: $POST_TITLE" "Score: $QUALITY_SCORE/100 - Manual review needed"
        log "Post saved but not published. Manual review required."
        exit 0
    fi

    log_success "Quality check passed"

    # -----------------------------------------
    # 5. GIT COMMIT & PUSH
    # -----------------------------------------
    log "Step 5: Committing to git..."

    POST_TITLE=$(grep "^title:" "$LATEST_POST" | head -1 | sed 's/title: *//' | tr -d '"')
    POST_SLUG=$(basename "$LATEST_POST" .md)

    git add src/content/blog/ automation/topic-queue.json public/images/ || true

    # Check if there are changes to commit
    if git diff --cached --quiet; then
        log "No changes to commit"
        exit 0
    fi

    # Commit
    COMMIT_MSG="🤖 Auto-publish blog post: $POST_TITLE

Generated: $(date +'%Y-%m-%d %H:%M %Z')
Quality Score: $QUALITY_SCORE/100
Word Count: $WORD_COUNT words
Slug: $POST_SLUG

Via VPS automation system (Fixed Version)"

    git commit -m "$COMMIT_MSG" >> "$LOG_FILE" 2>&1
    log_success "Committed to local git"

    # Push to GitHub
    PUSH_RETRY=0
    PUSH_SUCCESS=false

    while [ $PUSH_RETRY -lt 3 ]; do
        if git push origin main >> "$LOG_FILE" 2>&1; then
            log_success "Pushed to GitHub"
            PUSH_SUCCESS=true
            break
        else
            PUSH_RETRY=$((PUSH_RETRY + 1))
            log "Push failed, retry $PUSH_RETRY/3"
            sleep 10
        fi
    done

    if [ "$PUSH_SUCCESS" = false ]; then
        log_error "Failed to push to GitHub after 3 attempts"
        send_notification "failed" "Git Push Failed: $POST_TITLE" "Check git logs"
        exit 1
    fi

    # -----------------------------------------
    # 6. SUCCESS NOTIFICATION
    # -----------------------------------------
    log "Step 6: Sending notifications..."

    POST_URL="https://theprofitplatform.com.au/blog/${POST_SLUG#????-??-??-}"

    send_notification "success" "$POST_TITLE" "$POST_URL"

    # -----------------------------------------
    # COMPLETION
    # -----------------------------------------
    log "========================================="
    log "✅ Blog Automation Completed Successfully"
    log "========================================="
    log "Post: $POST_TITLE"
    log "URL: $POST_URL"
    log "Quality: $QUALITY_SCORE/100"
    log "Words: $WORD_COUNT"
    log "========================================="

    # Clean up old logs (keep last 30 days)
    find "$LOG_DIR" -name "blog-automation-*.log" -mtime +30 -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.md" -mtime +90 -delete 2>/dev/null || true
}

# ============================================
# ERROR HANDLING
# ============================================
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: $exit_code"
    send_notification "failed" "Automation Script Error" "Exit code: $exit_code - Check logs"
    exit $exit_code
}

trap handle_error ERR

# ============================================
# EXECUTE
# ============================================
main "$@"