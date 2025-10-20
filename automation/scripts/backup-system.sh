#!/bin/bash

#############################################
# Automation System Backup Script
#
# Backs up critical automation system files
# Usage: npm run automation:backup
# Or: bash automation/scripts/backup-system.sh
#############################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Backup settings
BACKUP_DIR="$PROJECT_ROOT/automation/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="automation-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Files to backup
BACKUP_ITEMS=(
  "automation/data/"
  "automation/config/"
  "automation/logs/"
  "automation/generated/"
  "automation/reports/"
  "src/content/locations/"
)

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  📦 Automation System Backup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}Creating backup...${NC}"
echo -e "Backup location: ${GREEN}$BACKUP_PATH.tar.gz${NC}"
echo ""

# Create temporary directory for organizing backup
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/$BACKUP_NAME"

# Copy files to temp directory
echo -e "${YELLOW}Collecting files...${NC}"
total_items=${#BACKUP_ITEMS[@]}
current_item=0

for item in "${BACKUP_ITEMS[@]}"; do
  current_item=$((current_item + 1))
  item_path="$PROJECT_ROOT/$item"

  if [ -e "$item_path" ]; then
    # Create parent directory structure
    parent_dir=$(dirname "$item")
    mkdir -p "$TEMP_DIR/$BACKUP_NAME/$parent_dir"

    # Copy the item
    echo -e "  [$current_item/$total_items] ${GREEN}✓${NC} $item"
    cp -r "$item_path" "$TEMP_DIR/$BACKUP_NAME/$parent_dir/" 2>/dev/null || echo -e "  ${YELLOW}⚠${NC}  $item (skipped, doesn't exist)"
  else
    echo -e "  [$current_item/$total_items] ${YELLOW}⚠${NC}  $item (not found)"
  fi
done

# Add metadata file
echo -e "${YELLOW}Adding metadata...${NC}"
cat > "$TEMP_DIR/$BACKUP_NAME/backup-info.txt" <<EOF
Automation System Backup
========================

Backup Date: $(date)
Backup Name: $BACKUP_NAME
System: $(uname -a)
Node Version: $(node --version)
Project Root: $PROJECT_ROOT

Files Included:
$(for item in "${BACKUP_ITEMS[@]}"; do echo "  - $item"; done)

Restore Instructions:
====================

1. Extract this backup:
   tar -xzf $BACKUP_NAME.tar.gz

2. Restore specific directories:
   cp -r $BACKUP_NAME/automation/data/* automation/data/
   cp -r $BACKUP_NAME/automation/config/* automation/config/

3. Or use the restore script:
   bash automation/scripts/restore-system.sh $BACKUP_NAME.tar.gz

EOF

# Create tarball
echo -e ""
echo -e "${YELLOW}Compressing backup...${NC}"
cd "$TEMP_DIR" || exit 1
tar -czf "$BACKUP_PATH.tar.gz" "$BACKUP_NAME" 2>/dev/null

if [ $? -eq 0 ]; then
  # Get backup size
  backup_size=$(du -h "$BACKUP_PATH.tar.gz" | cut -f1)

  # Cleanup temp directory
  rm -rf "$TEMP_DIR"

  echo -e ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}${BOLD}  ✓ Backup Complete!${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e ""
  echo -e "  📁 Location: ${GREEN}$BACKUP_PATH.tar.gz${NC}"
  echo -e "  📊 Size: ${BLUE}$backup_size${NC}"
  echo -e "  📅 Created: ${BLUE}$TIMESTAMP${NC}"
  echo -e ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo -e "  1. Copy backup to safe location"
  echo -e "  2. Test restore on different system"
  echo -e "  3. Set up automated backups (cron)"
  echo -e ""
  echo -e "${YELLOW}Restore with:${NC}"
  echo -e "  ${BLUE}bash automation/scripts/restore-system.sh $BACKUP_NAME.tar.gz${NC}"
  echo -e ""

  # List all backups
  echo -e "${YELLOW}Available backups:${NC}"
  ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
  echo -e ""

  # Cleanup old backups (keep last 10)
  backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
  if [ "$backup_count" -gt 10 ]; then
    echo -e "${YELLOW}Cleaning up old backups (keeping last 10)...${NC}"
    ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +11 | xargs rm -f
    echo -e "${GREEN}✓ Old backups removed${NC}"
    echo -e ""
  fi

  exit 0
else
  echo -e ""
  echo -e "${RED}✗ Backup failed${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi
