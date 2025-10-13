#!/bin/bash

###############################################################################
# Auto Blog Runner - Automated Queue Processing
# Generates blog posts from topic-queue.json automatically
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$PROJECT_DIR/automation/scripts"
TOPIC_QUEUE="$PROJECT_DIR/automation/topic-queue.json"
LOG_DIR="$PROJECT_DIR/automation/logs"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/auto-runner-$DATE.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Banner
echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🤖 Auto Blog Runner Started       ║${NC}"
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo ""

# Check if queue exists
if [ ! -f "$TOPIC_QUEUE" ]; then
    log_error "Topic queue not found: $TOPIC_QUEUE"
    exit 1
fi

# Check queue status
log "Checking topic queue status..."
QUEUE_LENGTH=$(node -e "const data = require('$TOPIC_QUEUE'); console.log(data.queue.length);")
log "Topics in queue: $QUEUE_LENGTH"

if [ "$QUEUE_LENGTH" -eq 0 ]; then
    log_warning "No topics in queue. Nothing to generate."
    exit 0
fi

# Get next pending topic
log "Getting next pending topic..."
NEXT_TOPIC=$(node -e "
const data = require('$TOPIC_QUEUE');
const pending = data.queue.find(t => t.status === 'pending' && t.priority === 1);
if (pending) {
    console.log(JSON.stringify(pending));
} else {
    const anyPending = data.queue.find(t => t.status === 'pending');
    if (anyPending) {
        console.log(JSON.stringify(anyPending));
    }
}
")

if [ -z "$NEXT_TOPIC" ]; then
    log_warning "No pending topics found in queue"
    exit 0
fi

# Parse topic details
TOPIC_TITLE=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.title);")
TOPIC_KEYWORD=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.targetKeyword);")
TOPIC_CATEGORY=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.category);")
TOPIC_ID=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.id);")

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "📝 Next Topic to Generate:"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "ID:       $TOPIC_ID"
log "Title:    $TOPIC_TITLE"
log "Keyword:  $TOPIC_KEYWORD"
log "Category: $TOPIC_CATEGORY"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""

# Generate blog post
log "🚀 Generating blog post..."
cd "$PROJECT_DIR"

if node "$SCRIPT_DIR/generate-blog-post.js" \
    --title "$TOPIC_TITLE" \
    --keyword "$TOPIC_KEYWORD" \
    --category "$TOPIC_CATEGORY" \
    --wordcount 3000 \
    --all-features; then

    log_success "Blog post generated successfully!"

    # Update queue status
    log "Updating queue status..."
    node -e "
    const fs = require('fs');
    const data = require('$TOPIC_QUEUE');
    const topic = data.queue.find(t => t.id === $TOPIC_ID);
    if (topic) {
        topic.status = 'published';
        topic.publishedDate = '$(date +%Y-%m-%d)';
    }
    fs.writeFileSync('$TOPIC_QUEUE', JSON.stringify(data, null, 2));
    "

    log_success "Queue updated"

    # Build site
    log "Building site..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        log_success "Build completed"

        # Ask if user wants to deploy
        echo ""
        read -p "$(echo -e ${YELLOW}'Deploy to production? (y/N): '${NC})" -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Deploying to Cloudflare Pages..."
            if npm run deploy >> "$LOG_FILE" 2>&1; then
                log_success "Deployment successful!"
            else
                log_error "Deployment failed - check logs"
            fi
        else
            log "Skipping deployment"
        fi
    else
        log_error "Build failed - check logs"
    fi

else
    log_error "Blog post generation failed"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Auto Blog Runner Complete      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
log "Log file: $LOG_FILE"
log "Remaining topics: $((QUEUE_LENGTH - 1))"
echo ""
