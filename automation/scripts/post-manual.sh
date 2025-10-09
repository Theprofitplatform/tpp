#!/bin/bash
# Manual posting script for Facebook automation

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$PROJECT_DIR"

# Load VPS-specific environment
if [ -f ".env.vps" ]; then
    echo "📋 Loading VPS environment configuration..."
    export $(grep -v '^#' .env.vps | xargs)
fi

if [ $# -eq 0 ]; then
    echo "Usage: $0 <blog-slug>"
    echo "Example: $0 conversion-rate-optimization-9-quick-wins-for-sydney-service-businesses"
    exit 1
fi

BLOG_SLUG=$1

echo "📘 Generating Facebook post for: $BLOG_SLUG"

# Generate Facebook post and send Discord notifications
node automation/scripts/facebook-discord-notifier.js "$BLOG_SLUG"

echo "✅ Check Discord for the Facebook post and image prompt!"
