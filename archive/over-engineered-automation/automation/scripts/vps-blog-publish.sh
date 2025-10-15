#!/bin/bash

#############################################
# VPS Blog Publishing Script
# Publishes approved staging content to production
#############################################

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"
STAGING_DIR="$PROJECT_DIR/automation/staging"
BACKUP_DIR="$PROJECT_DIR/automation/backups/blog-posts"

DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/blog-publish-$DATE.log"

# ============================================
# LOGGING
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

# ============================================
# NOTIFICATIONS
# ============================================
send_publish_notification() {
    local status=$1
    local title=$2
    local details=${3:-""}

    local webhook_url="${DISCORD_WEBHOOK_URL:-}"
    if [ -n "$webhook_url" ]; then
        local payload=$(cat << EOF
{
  "content": "**Blog Publishing**: $status - $title\n$details"
}
EOF
        )
        curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$webhook_url" > /dev/null 2>&1 || true
    fi
}

# ============================================
# GIT SAFETY CHECKS
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
        git stash push -m "Auto-stash by blog publishing"
    fi

    # Pull latest changes
    if ! git pull origin main; then
        log_error "Failed to pull latest changes"
        return 1
    fi

    return 0
}

# ============================================
# MAIN EXECUTION
# ============================================
main() {
    local staging_file="$1"

    if [ -z "$staging_file" ]; then
        echo "Usage: $0 <staging-file>"
        echo "Example: $0 automation/staging/2025-10-09-example-post.md"
        exit 1
    fi

    if [ ! -f "$staging_file" ]; then
        log_error "Staging file not found: $staging_file"
        exit 1
    fi

    log "🚀 Starting VPS Blog Publishing"
    log "Staging file: $staging_file"

    # -----------------------------------------
    # 1. GIT SAFETY CHECKS
    # -----------------------------------------
    log "Step 1: Running git safety checks..."

    if ! check_git_safety; then
        log_error "Git safety check failed"
        send_publish_notification "error" "Git Safety Failed" "Check git status and branch"
        exit 1
    fi

    # -----------------------------------------
    # 2. MOVE TO PRODUCTION
    # -----------------------------------------
    log "Step 2: Moving to production..."

    local filename=$(basename "$staging_file")
    local dest_file="$PROJECT_DIR/src/content/blog/$filename"

    if [ -f "$dest_file" ]; then
        log_error "Target file already exists: $dest_file"
        send_publish_notification "error" "File Conflict" "Target file already exists in production"
        exit 1
    fi

    # Move file to production
    if ! mv "$staging_file" "$dest_file"; then
        log_error "Failed to move file to production"
        send_publish_notification "error" "File Move Failed" "Failed to move $filename to production"
        exit 1
    fi

    log_success "Moved to production: $dest_file"

    # Backup the published post
    cp "$dest_file" "$BACKUP_DIR/" || log_warning "Backup failed"

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
    # 4. GIT COMMIT & PUSH
    # -----------------------------------------
    log "Step 4: Committing to git..."

    local post_title=$(grep "^title:" "$dest_file" | head -1 | sed 's/title: *//' | tr -d '"')
    local post_slug=$(basename "$dest_file" .md)
    local word_count=$(wc -w < "$dest_file")

    git add "src/content/blog/" "automation/topic-queue.json" "public/images/" || true

    # Check if there are changes to commit
    if git diff --cached --quiet; then
        log "No changes to commit"
    else
        # Commit
        local commit_msg=$(cat << EOF
🤖 Publish approved blog post: $post_title

Approved: $(date +'%Y-%m-%d %H:%M %Z')
Word Count: $word_count words
Slug: $post_slug

Via VPS publishing workflow
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
            send_publish_notification "failed" "Git Push Failed: $post_title" "Check git logs"
            # Don't exit - post is still committed locally
        fi
    fi

    # -----------------------------------------
    # 5. DEPLOY TO CLOUDFLARE PAGES
    # -----------------------------------------
    log "Step 5: Deploying to Cloudflare Pages..."

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
        send_publish_notification "warning" "Deploy Failed: $post_title" "Blog post pushed but deploy failed - Manual deploy needed"
    fi

    # -----------------------------------------
    # 6. SUCCESS NOTIFICATION
    # -----------------------------------------
    log "Step 6: Sending success notification..."

    local post_url="https://theprofitplatform.com.au/blog/${post_slug#????-??-??-}"

    send_publish_notification "success" "$post_title" "$post_url\nWords: $word_count\n✅ Published successfully"

    # -----------------------------------------
    # COMPLETION
    # -----------------------------------------
    log "========================================="
    log "✅ Blog Publishing Completed Successfully"
    log "========================================="
    log "Post: $post_title"
    log "URL: $post_url"
    log "Words: $word_count"
    log "========================================="

    # Clean up staging directory (keep last 7 days)
    find "$STAGING_DIR" -name "*.md" -mtime +7 -delete 2>/dev/null || true
}

# ============================================
# ERROR HANDLING
# ============================================
handle_error() {
    local exit_code=$?
    log_error "Publishing failed with exit code: $exit_code"
    send_publish_notification "failed" "Publishing Error" "Exit code: $exit_code - Check logs"
    exit $exit_code
}

trap handle_error ERR

# Execute
main "$@"