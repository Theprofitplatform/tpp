#!/bin/bash

#############################################
# VPS Blog Automation - Consolidated & Fixed
# Complete blog automation with safety features
#############################################

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes

# ============================================
# CONFIGURATION
# ============================================
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"
BACKUP_DIR="$PROJECT_DIR/automation/backups/blog-posts"
LOCK_FILE="/tmp/tpp-blog-automation.lock"
TOPIC_QUEUE="$PROJECT_DIR/automation/topic-queue.json"

DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/blog-automation-$DATE.log"

# Quality score threshold (0-100)
MIN_QUALITY_SCORE=75

# Maximum retries for transient failures
MAX_RETRIES=2

# Extended timeout for full features
API_TIMEOUT=600  # 10 minutes

# Feature flags
ENABLE_GIT_COMMIT=true
ENABLE_DEPLOYMENT=true
ENABLE_NOTIFICATIONS=true

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

log_warning() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1" | tee -a "$LOG_FILE"
}

# ============================================
# NOTIFICATION FUNCTIONS
# ============================================
send_notification() {
    local status=$1
    local title=$2
    local details=${3:-""}

    if [ "$ENABLE_NOTIFICATIONS" = "true" ]; then
        # Discord webhook notification
        local webhook_url="${DISCORD_WEBHOOK_URL:-}"
        if [ -n "$webhook_url" ]; then
            local payload=$(cat << EOF
{
  "content": "**Blog Automation**: $status - $title\n$details"
}
EOF
            )
            curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$webhook_url" > /dev/null 2>&1 || true
        fi
    fi
}

# ============================================
# SAFETY CHECKS
# ============================================
check_git_safety() {
    log "Checking git safety..."

    # Check if we're on main branch
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        log_error "Not on main branch (currently on: $current_branch)"
        return 1
    fi

    # Check for uncommitted changes
    if ! git diff --quiet; then
        log_warning "Uncommitted changes detected - stashing them"
        git stash push -m "Auto-stash by blog automation"
    fi

    # Pull latest changes
    if ! git pull origin main; then
        log_error "Failed to pull latest changes"
        return 1
    fi

    return 0
}

check_api_limits() {
    log "Checking API usage..."
    # TODO: Implement API usage tracking
    return 0
}

# ============================================
# QUALITY SCORING
# ============================================
calculate_quality_score() {
    local post_file="$1"
    local score=0

    # Word count scoring
    local word_count=$(wc -w < "$post_file")
    log "Word count: $word_count"

    if [ $word_count -ge 1500 ]; then
        score=$((score + 30))
    elif [ $word_count -ge 1000 ]; then
        score=$((score + 20))
    elif [ $word_count -ge 500 ]; then
        score=$((score + 10))
    fi

    # Content quality checks
    if grep -q "](/blog/" "$post_file"; then
        score=$((score + 20))
    fi

    if grep -q "coverImage:" "$post_file"; then
        score=$((score + 15))
    fi

    if grep -q "description:" "$post_file"; then
        score=$((score + 15))
    fi

    if grep -q "schema:" "$post_file" || grep -q '"@type"' "$post_file"; then
        score=$((score + 20))
    fi

    echo $score
}

# ============================================
# MAIN EXECUTION
# ============================================
main() {
    log "🚀 Starting VPS Blog Automation"
    log "Project: $PROJECT_DIR"
    log "Log file: $LOG_FILE"

    # Create necessary directories
    mkdir -p "$LOG_DIR" "$BACKUP_DIR"

    # Check for lock file
    if [ -f "$LOCK_FILE" ]; then
        log_error "Another automation is running (lock file exists)"
        send_notification "error" "Automation Locked" "Another process is running"
        exit 1
    fi

    # Create lock file
    echo "$$" > "$LOCK_FILE"

    # Set up cleanup trap
    trap 'rm -f "$LOCK_FILE"; log "Cleanup completed"' EXIT

    # -----------------------------------------
    # 1. SAFETY CHECKS
    # -----------------------------------------
    log "Step 1: Running safety checks..."

    if ! check_git_safety; then
        log_error "Git safety check failed"
        send_notification "error" "Git Safety Failed" "Check git status and branch"
        exit 1
    fi

    if ! check_api_limits; then
        log_warning "API limit check unavailable"
    fi

    # Check if we already generated today
    local today=$(date +%Y-%m-%d)
    if ls "$PROJECT_DIR/src/content/blog/${today}-"*.md 1> /dev/null 2>&1; then
        log "Already generated post today, skipping"
        send_notification "info" "Already Generated" "Blog post already exists for today"
        exit 0
    fi

    # -----------------------------------------
    # 2. TOPIC SELECTION
    # -----------------------------------------
    log "Step 2: Selecting topic from queue..."

    if [ ! -f "$TOPIC_QUEUE" ]; then
        log_error "Topic queue not found: $TOPIC_QUEUE"
        send_notification "error" "Topic Queue Missing" "Create topic-queue.json file"
        exit 1
    fi

    # Count pending topics
    local pending_topics=$(jq -r '.queue[] | select(.status == "pending") | .id' "$TOPIC_QUEUE" | wc -l)

    if [ "$pending_topics" -eq 0 ]; then
        log "No pending topics in queue, exiting"
        send_notification "info" "No Topics" "Topic queue is empty"
        exit 0
    fi

    log "Pending topics: $pending_topics"

    # -----------------------------------------
    # 3. UPDATE INTERNAL LINK MAP
    # -----------------------------------------
    log "Step 3: Updating internal link map..."

    if node "$PROJECT_DIR/automation/scripts/update-link-map.js" >> "$LOG_FILE" 2>&1; then
        log_success "Link map updated"
    else
        log_warning "Link map update failed, continuing anyway"
    fi

    # -----------------------------------------
    # 4. GENERATE BLOG POST
    # -----------------------------------------
    log "Step 4: Generating blog post..."

    local retry_count=0
    local generation_success=false

    while [ $retry_count -lt $MAX_RETRIES ]; do
        if node "$PROJECT_DIR/automation/scripts/generate-blog-post.js" >> "$LOG_FILE" 2>&1; then
            log_success "Blog post generated"
            generation_success=true
            break
        else
            retry_count=$((retry_count + 1))
            log "Generation failed, retry $retry_count/$MAX_RETRIES"

            if [ $retry_count -lt $MAX_RETRIES ]; then
                log "Waiting 2 minutes before retry..."
                sleep 120
            fi
        fi
    done

    if [ "$generation_success" = false ]; then
        log_error "Blog generation failed after $MAX_RETRIES attempts"
        send_notification "failed" "Blog Generation Failed" "All retries exhausted"
        exit 1
    fi

    # Get the generated post filename
    local latest_post=$(ls -t "$PROJECT_DIR/src/content/blog/${today}-"*.md 2>/dev/null | head -1)

    if [ -z "$latest_post" ]; then
        log_error "No post file found after generation"
        send_notification "failed" "Post File Missing" "Generation reported success but file not found"
        exit 1
    fi

    log "Generated: $latest_post"

    # Backup the generated post
    cp "$latest_post" "$BACKUP_DIR/" || log_warning "Backup failed"

    # -----------------------------------------
    # 5. VALIDATION & QUALITY SCORE
    # -----------------------------------------
    log "Step 5: Running validation checks..."

    local quality_score=$(calculate_quality_score "$latest_post")
    log "Quality score: $quality_score/100"

    if [ $quality_score -lt $MIN_QUALITY_SCORE ]; then
        log_error "Quality check failed (score: $quality_score, minimum: $MIN_QUALITY_SCORE)"
        local post_title=$(grep "^title:" "$latest_post" | head -1 | sed 's/title: *//' | tr -d '"')
        send_notification "warning" "Low Quality Post: $post_title" "Score: $quality_score/100 - Manual review needed"
        log "Post saved but not published. Manual review required."
        exit 0
    fi

    log_success "Quality check passed"

    # -----------------------------------------
    # 6. GIT COMMIT & PUSH (OPTIONAL)
    # -----------------------------------------
    if [ "$ENABLE_GIT_COMMIT" = "true" ]; then
        log "Step 6: Committing to git..."

        local post_title=$(grep "^title:" "$latest_post" | head -1 | sed 's/title: *//' | tr -d '"')
        local post_slug=$(basename "$latest_post" .md)

        git add "src/content/blog/" "automation/topic-queue.json" "public/images/" || true

        # Check if there are changes to commit
        if git diff --cached --quiet; then
            log "No changes to commit"
        else
            # Commit
            local commit_msg=$(cat << EOF
🤖 Auto-publish blog post: $post_title

Generated: $(date +'%Y-%m-%d %H:%M %Z')
Quality Score: $quality_score/100
Word Count: $word_count words
Slug: $post_slug

Via VPS automation system
EOF
            )

            git commit -m "$commit_msg" >> "$LOG_FILE" 2>&1
            log_success "Committed to local git"

            # Push to GitHub
            local push_retry=0
            local push_success=false

            while [ $push_retry -lt 3 ]; do
                if git push origin main >> "$LOG_FILE" 2>&1; then
                    log_success "Pushed to GitHub"
                    push_success=true
                    break
                else
                    push_retry=$((push_retry + 1))
                    log "Push failed, retry $push_retry/3"
                    sleep 10
                fi
            done

            if [ "$push_success" = false ]; then
                log_error "Failed to push to GitHub after 3 attempts"
                send_notification "failed" "Git Push Failed: $post_title" "Check git logs"
                # Don't exit - post is still committed locally
            fi
        fi
    else
        log "Git commit disabled - post saved locally only"
    fi

    # -----------------------------------------
    # 7. DEPLOY TO CLOUDFLARE PAGES (OPTIONAL)
    # -----------------------------------------
    if [ "$ENABLE_DEPLOYMENT" = "true" ]; then
        log "Step 7: Deploying to Cloudflare Pages..."

        local deploy_retry=0
        local deploy_success=false

        while [ $deploy_retry -lt 3 ]; do
            if npm run deploy >> "$LOG_FILE" 2>&1; then
                log_success "Deployed to Cloudflare Pages"
                deploy_success=true
                break
            else
                deploy_retry=$((deploy_retry + 1))
                log "Deploy failed, retry $deploy_retry/3"
                sleep 30
            fi
        done

        if [ "$deploy_success" = false ]; then
            log_error "Failed to deploy after 3 attempts"
            send_notification "warning" "Deploy Failed: $post_title" "Blog post pushed but deploy failed - Manual deploy needed"
            # Don't exit here - post is still published to GitHub
        fi
    else
        log "Deployment disabled - manual deployment required"
    fi

    # -----------------------------------------
    # 8. SUCCESS NOTIFICATION
    # -----------------------------------------
    log "Step 8: Sending notifications..."

    local post_url="https://theprofitplatform.com.au/blog/${post_slug#????-??-??-}"

    send_notification "success" "$post_title" "$post_url\nQuality: $quality_score/100\nWords: $word_count"

    # -----------------------------------------
    # COMPLETION
    # -----------------------------------------
    log "========================================="
    log "✅ Blog Automation Completed Successfully"
    log "========================================="
    log "Post: $post_title"
    log "URL: $post_url"
    log "Quality: $quality_score/100"
    log "Words: $word_count"
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
    rm -f "$LOCK_FILE"
    exit $exit_code
}

trap handle_error ERR

# ============================================
# EXECUTE
# ============================================
main "$@"