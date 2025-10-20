#!/bin/bash

#############################################
# Automation System Restore Script
#
# Restores automation system from backup
# Usage: bash automation/scripts/restore-system.sh <backup-file.tar.gz>
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

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  📥 Automation System Restore${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if backup file provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  bash automation/scripts/restore-system.sh <backup-file.tar.gz>"
  echo ""
  echo -e "${YELLOW}Available backups:${NC}"
  ls -lh "$PROJECT_ROOT/automation/backups"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

  if [ $? -ne 0 ]; then
    echo -e "  ${YELLOW}No backups found${NC}"
  fi

  echo ""
  exit 1
fi

BACKUP_FILE="$1"

# If relative path, assume it's in backups directory
if [[ "$BACKUP_FILE" != /* ]]; then
  BACKUP_FILE="$PROJECT_ROOT/automation/backups/$BACKUP_FILE"
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
  echo ""
  exit 1
fi

echo -e "Backup file: ${GREEN}$BACKUP_FILE${NC}"
echo -e "Backup size: ${BLUE}$(du -h "$BACKUP_FILE" | cut -f1)${NC}"
echo ""

# Warning
echo -e "${YELLOW}${BOLD}⚠️  WARNING:${NC} ${YELLOW}This will overwrite existing automation data!${NC}"
echo ""
echo -e "The following will be restored:"
echo -e "  - automation/data/ (client data, status)"
echo -e "  - automation/config/ (configuration files)"
echo -e "  - automation/logs/ (log files)"
echo -e "  - automation/generated/ (generated content)"
echo -e "  - automation/reports/ (reports)"
echo -e "  - src/content/locations/ (suburb pages)"
echo ""

# Prompt for confirmation
read -p "$(echo -e ${YELLOW}"Continue with restore? (yes/no): "${NC})" -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
  echo -e "${YELLOW}Restore cancelled${NC}"
  exit 0
fi

# Create backup of current state before restoring
echo -e "${YELLOW}Creating safety backup of current state...${NC}"
SAFETY_BACKUP="$PROJECT_ROOT/automation/backups/pre-restore-backup-$(date +%Y-%m-%d_%H-%M-%S).tar.gz"
cd "$PROJECT_ROOT" || exit 1
tar -czf "$SAFETY_BACKUP" \
  automation/data/ \
  automation/config/ \
  automation/logs/ \
  automation/generated/ \
  automation/reports/ \
  src/content/locations/ \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP${NC}"
else
  echo -e "${YELLOW}⚠ Safety backup failed (continuing anyway)${NC}"
fi
echo ""

# Extract backup to temp directory
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Extracting backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR" 2>/dev/null

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to extract backup${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Find backup directory (it's the only directory in temp)
BACKUP_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -not -name "$(basename "$TEMP_DIR")" | head -1)

if [ -z "$BACKUP_DIR" ]; then
  echo -e "${RED}✗ Invalid backup structure${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Show backup info if available
if [ -f "$BACKUP_DIR/backup-info.txt" ]; then
  echo -e "${BLUE}Backup Information:${NC}"
  cat "$BACKUP_DIR/backup-info.txt" | grep "Backup Date:" | sed 's/^/  /'
  echo ""
fi

# Restore files
echo -e "${YELLOW}Restoring files...${NC}"
restored_count=0
failed_count=0

RESTORE_ITEMS=(
  "automation/data"
  "automation/config"
  "automation/logs"
  "automation/generated"
  "automation/reports"
  "src/content/locations"
)

for item in "${RESTORE_ITEMS[@]}"; do
  source_path="$BACKUP_DIR/$item"
  dest_path="$PROJECT_ROOT/$item"

  if [ -e "$source_path" ]; then
    # Create parent directory
    mkdir -p "$(dirname "$dest_path")"

    # Restore the item
    if [ -d "$source_path" ]; then
      # Directory - remove destination and copy
      rm -rf "$dest_path"
      cp -r "$source_path" "$dest_path" 2>/dev/null
    else
      # File - just copy
      cp "$source_path" "$dest_path" 2>/dev/null
    fi

    if [ $? -eq 0 ]; then
      echo -e "  ${GREEN}✓${NC} $item"
      restored_count=$((restored_count + 1))
    else
      echo -e "  ${RED}✗${NC} $item (failed)"
      failed_count=$((failed_count + 1))
    fi
  else
    echo -e "  ${YELLOW}⊘${NC} $item (not in backup)"
  fi
done

# Cleanup temp directory
rm -rf "$TEMP_DIR"

echo -e ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ $failed_count -eq 0 ]; then
  echo -e "${GREEN}${BOLD}  ✓ Restore Complete!${NC}"
else
  echo -e "${YELLOW}${BOLD}  ⚠ Restore Completed with Warnings${NC}"
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e ""
echo -e "  ${GREEN}Restored: $restored_count items${NC}"
if [ $failed_count -gt 0 ]; then
  echo -e "  ${YELLOW}Failed: $failed_count items${NC}"
fi
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Verify system: ${BLUE}npm run automation:test${NC}"
echo -e "  2. Check health: ${BLUE}npm run automation:monitor${NC}"
echo -e "  3. Review restored data in automation/data/"
echo ""

if [ -f "$SAFETY_BACKUP" ]; then
  echo -e "${YELLOW}Safety backup available at:${NC}"
  echo -e "  $SAFETY_BACKUP"
  echo -e "  (Delete manually if restore was successful)"
  echo ""
fi

exit 0
