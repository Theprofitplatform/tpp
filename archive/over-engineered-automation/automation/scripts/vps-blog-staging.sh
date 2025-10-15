#!/bin/bash

#############################################
# VPS Blog Automation - Staging Workflow
# Generates content for review before production
#############################################

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/automation/logs"
STAGING_DIR="$PROJECT_DIR/automation/staging"
BACKUP_DIR="$PROJECT_DIR/automation/backups/blog-posts"

DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/blog-staging-$DATE.log"

# ============================================
# CONFIGURATION
# ============================================
MIN_QUALITY_SCORE=75
MAX_RETRIES=2

# ============================================
# LOGGING
# ============================================
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

log_warning() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1" | tee -a "$LOG_FILE"
}

# ============================================
# NOTIFICATIONS
# ============================================
send_review_request() {
    local post_title="$1"
    local post_file="$2"
    local quality_score="$3"
    local word_count="$4"

    local webhook_url="${DISCORD_WEBHOOK_URL:-}"
    if [ -n "$webhook_url" ]; then
        local post_content=$(head -50 "$post_file")
        local payload=$(cat << EOF
{
  "content": "**📝 Blog Post Ready for Review**\n\n**Title**: $post_title\n**Quality Score**: $quality_score/100\n**Word Count**: $word_count\n**File**: $post_file\n\n**Preview**:\n\`\`\`\n$(echo "$post_content" | head -10)\n...\n\`\`\`\n\n**Commands**:\n- ✅ Approve: \`./automation/scripts/vps-blog-publish.sh $post_file\`\n- ❌ Reject: Delete the staging file\n- 🔄 Regenerate: Delete and run automation again"
}
EOF
        )
        curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$webhook_url" > /dev/null 2>&1 || true
    fi
}

# ============================================
# QUALITY SCORING
# ============================================
calculate_quality_score() {
    local post_file="$1"
    local score=0

    local word_count=$(wc -w < "$post_file")
    log "Word count: $word_count"

    if [ $word_count -ge 1500 ]; then
        score=$((score + 30))
    elif [ $word_count -ge 1000 ]; then
        score=$((score + 20))
    elif [ $word_count -ge 500 ]; then
        score=$((score + 10))
    fi

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
    log "🚀 Starting VPS Blog Staging Workflow"

    # Create necessary directories
    mkdir -p "$LOG_DIR" "$STAGING_DIR" "$BACKUP_DIR"

    # Check if we already generated today (use UTC date to match blog generation script)
    local utc_date=$(date -u +%Y-%m-%d)
    if ls "$STAGING_DIR/${utc_date}-"*.md 1> /dev/null 2>&1; then
        log "Already generated staging post today (UTC), skipping"
        exit 0
    fi

    # -----------------------------------------
    # 1. GENERATE BLOG POST TO STAGING
    # -----------------------------------------
    log "Step 1: Generating blog post to staging..."

    local retry_count=0
    local generation_success=false

    while [ $retry_count -lt $MAX_RETRIES ]; do
        # Generate to staging directory
        if node "$PROJECT_DIR/automation/scripts/generate-blog-post.js" --staging "$STAGING_DIR" >> "$LOG_FILE" 2>&1; then
            log_success "Blog post generated to staging"
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
        exit 1
    fi

    # Get the generated post filename (use UTC date to match blog generation script)
    local latest_post=$(ls -t "$STAGING_DIR/${utc_date}-"*.md 2>/dev/null | head -1)

    # If no post found with UTC date, try yesterday's date (timezone edge case)
    if [ -z "$latest_post" ]; then
        local yesterday_utc=$(date -u -d "yesterday" +%Y-%m-%d)
        latest_post=$(ls -t "$STAGING_DIR/${yesterday_utc}-"*.md 2>/dev/null | head -1)
    fi

    if [ -z "$latest_post" ]; then
        log_error "No staging post file found after generation"
        exit 1
    fi

    log "Generated to staging: $latest_post"

    # -----------------------------------------
    # 2. VALIDATION & QUALITY SCORE
    # -----------------------------------------
    log "Step 2: Running validation checks..."

    local quality_score=$(calculate_quality_score "$latest_post")
    local word_count=$(wc -w < "$latest_post")
    log "Quality score: $quality_score/100"

    if [ $quality_score -lt $MIN_QUALITY_SCORE ]; then
        log_error "Quality check failed (score: $quality_score, minimum: $MIN_QUALITY_SCORE)"
        # Still send for review but mark as low quality
    fi

    # -----------------------------------------
    # 3. SEND REVIEW REQUEST
    # -----------------------------------------
    log "Step 3: Sending review request..."

    local post_title=$(grep "^title:" "$latest_post" | head -1 | sed 's/title: *//' | tr -d '"')

    send_review_request "$post_title" "$latest_post" "$quality_score" "$word_count"

    # -----------------------------------------
    # COMPLETION
    # -----------------------------------------
    log "========================================="
    log "✅ Staging Workflow Completed"
    log "========================================="
    log "Post: $post_title"
    log "File: $latest_post"
    log "Quality: $quality_score/100"
    log "Words: $word_count"
    log "========================================="
    log "📝 Post ready for manual review"
    log "Use vps-blog-publish.sh to publish approved posts"
    log "========================================="
}

# ============================================
# ERROR HANDLING
# ============================================
handle_error() {
    local exit_code=$?
    log_error "Staging workflow failed with exit code: $exit_code"
    exit $exit_code
}

trap handle_error ERR

# Execute
main "$@"