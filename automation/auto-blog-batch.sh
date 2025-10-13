#!/bin/bash

###############################################################################
# Auto Blog Batch Runner - Generate Multiple Posts
# Processes multiple topics from queue in one session
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$PROJECT_DIR/automation/scripts"
TOPIC_QUEUE="$PROJECT_DIR/automation/topic-queue.json"
LOG_DIR="$PROJECT_DIR/automation/logs"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/batch-runner-$DATE.log"

# Default batch size
BATCH_SIZE=${1:-3}  # Generate 3 posts by default

mkdir -p "$LOG_DIR"

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Batch Blog Generator                ║${NC}"
echo -e "${BLUE}║   Generating $BATCH_SIZE posts from queue         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_DIR"

SUCCESS_COUNT=0
FAIL_COUNT=0

for i in $(seq 1 $BATCH_SIZE); do
    echo ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "📝 Generating post $i of $BATCH_SIZE"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Get next pending topic
    NEXT_TOPIC=$(node -e "
    const data = require('$TOPIC_QUEUE');
    const pending = data.queue.find(t => t.status === 'pending');
    if (pending) {
        console.log(JSON.stringify(pending));
    }
    ")

    if [ -z "$NEXT_TOPIC" ]; then
        log "⚠️  No more pending topics in queue"
        break
    fi

    # Parse topic
    TOPIC_TITLE=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.title);")
    TOPIC_KEYWORD=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.targetKeyword);")
    TOPIC_CATEGORY=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.category);")
    TOPIC_ID=$(echo "$NEXT_TOPIC" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(data.id);")

    log "Title: $TOPIC_TITLE"
    log "Keyword: $TOPIC_KEYWORD"

    # Generate post
    if node "$SCRIPT_DIR/generate-blog-post.js" \
        --title "$TOPIC_TITLE" \
        --keyword "$TOPIC_KEYWORD" \
        --category "$TOPIC_CATEGORY" \
        --wordcount 3000 \
        --all-features >> "$LOG_FILE" 2>&1; then

        log_success "Post generated successfully"

        # Update queue
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

        ((SUCCESS_COUNT++))
    else
        log "❌ Generation failed"
        ((FAIL_COUNT++))
    fi

    # Rate limiting - wait between posts
    if [ $i -lt $BATCH_SIZE ]; then
        log "⏳ Waiting 10 seconds before next post..."
        sleep 10
    fi
done

# Build and deploy
echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "📦 Building site..."
if npm run build >> "$LOG_FILE" 2>&1; then
    log_success "Build completed"

    echo ""
    read -p "$(echo -e ${YELLOW}'Deploy all posts to production? (y/N): '${NC})" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "🚀 Deploying to Cloudflare..."
        if npm run deploy >> "$LOG_FILE" 2>&1; then
            log_success "Deployment successful!"
        else
            log "❌ Deployment failed"
        fi
    else
        log "⏭️  Skipping deployment"
    fi
else
    log "❌ Build failed"
fi

# Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   📊 Batch Generation Complete           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
log "✅ Successful: $SUCCESS_COUNT posts"
log "❌ Failed: $FAIL_COUNT posts"
log "📄 Log file: $LOG_FILE"
echo ""
