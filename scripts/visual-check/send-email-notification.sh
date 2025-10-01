#!/bin/bash

# Simple email notification script using mailutils
# Usage: ./send-email-notification.sh <to> <subject> <body-file>

TO="$1"
SUBJECT="$2"
BODY_FILE="$3"

if [ -z "$TO" ] || [ -z "$SUBJECT" ]; then
    echo "Usage: $0 <to> <subject> [body-file]"
    exit 1
fi

if [ -n "$BODY_FILE" ] && [ -f "$BODY_FILE" ]; then
    mail -s "$SUBJECT" "$TO" < "$BODY_FILE"
else
    echo "No content" | mail -s "$SUBJECT" "$TO"
fi
