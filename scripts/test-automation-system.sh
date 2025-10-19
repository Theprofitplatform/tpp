#!/bin/bash
#
# TPP Automation System - Comprehensive Test Script
# Tests all automation components to ensure they work correctly
#
# Usage:
#   ./scripts/test-automation-system.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Test results
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNINGS=0

# ════════════════════════════════════════════════════════
# Helper Functions
# ════════════════════════════════════════════════════════

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo ""
}

print_test() {
  echo -e "${CYAN}[TEST]${NC} $1"
  TESTS_RUN=$((TESTS_RUN + 1))
}

print_pass() {
  echo -e "${GREEN}  ✓ PASS${NC} $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
  echo -e "${RED}  ✗ FAIL${NC} $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_warn() {
  echo -e "${YELLOW}  ⚠ WARN${NC} $1"
  TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
}

print_info() {
  echo -e "  ℹ INFO: $1"
}

# ════════════════════════════════════════════════════════
# Main
# ════════════════════════════════════════════════════════

print_header "TPP Automation System - Comprehensive Test"

echo "This script will test all components of your automation system."
echo "Tests include:"
echo "  • Scripts and executables"
echo "  • GitHub Actions workflows"
echo "  • NPM commands"
echo "  • Configuration files"
echo "  • Documentation completeness"
echo "  • Health check functionality"
echo ""

cd "$PROJECT_DIR"

# ════════════════════════════════════════════════════════
# Test 1: Scripts Exist and Are Executable
# ════════════════════════════════════════════════════════

print_header "Test Suite 1: Scripts"

print_test "Checking health check scripts exist"
REQUIRED_SCRIPTS=(
  "scripts/simple-health-check.sh"
  "scripts/health-check-with-ping.sh"
  "scripts/quick-setup.sh"
  "scripts/setup-health-monitoring.sh"
  "scripts/deploy-to-vps.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    if [ -x "$script" ]; then
      print_pass "$script exists and is executable"
    else
      print_fail "$script exists but is not executable"
    fi
  else
    print_fail "$script does not exist"
  fi
done

# ════════════════════════════════════════════════════════
# Test 2: GitHub Actions Workflows
# ════════════════════════════════════════════════════════

print_header "Test Suite 2: GitHub Actions Workflows"

print_test "Checking GitHub Actions workflows exist"
REQUIRED_WORKFLOWS=(
  ".github/workflows/health-check.yml"
  ".github/workflows/daily-blog-post.yml"
  ".github/workflows/deploy.yml"
  ".github/workflows/lighthouse.yml"
  ".github/workflows/pr-automation.yml"
)

for workflow in "${REQUIRED_WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    print_pass "$workflow exists"
  else
    print_fail "$workflow does not exist"
  fi
done

print_test "Validating workflow syntax"
for workflow in "${REQUIRED_WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    # Basic YAML validation
    if grep -q "^on:" "$workflow" && grep -q "^jobs:" "$workflow"; then
      print_pass "$(basename $workflow) has valid structure"
    else
      print_fail "$(basename $workflow) may have invalid YAML structure"
    fi
  fi
done

# ════════════════════════════════════════════════════════
# Test 3: NPM Commands
# ════════════════════════════════════════════════════════

print_header "Test Suite 3: NPM Commands"

print_test "Checking package.json for required scripts"
REQUIRED_NPM_SCRIPTS=(
  "health"
  "health:check"
  "health:setup"
  "health:quick-setup"
  "status"
  "topics:check"
  "topics:generate"
)

for script in "${REQUIRED_NPM_SCRIPTS[@]}"; do
  if grep -q "\"$script\":" package.json; then
    print_pass "npm run $script is defined"
  else
    print_fail "npm run $script is not defined in package.json"
  fi
done

# ════════════════════════════════════════════════════════
# Test 4: Documentation
# ════════════════════════════════════════════════════════

print_header "Test Suite 4: Documentation"

print_test "Checking documentation files exist"
REQUIRED_DOCS=(
  "AUTOMATED-SETUP.md"
  "AUTOMATION-COMPLETE.md"
  "AUTOMATION-MAP.md"
  "AUTOMATION-ARCHITECTURE.md"
  "README-AUTOMATION.md"
  "QUICK-REFERENCE.md"
  "HEALTH-CHECK-SETUP.md"
  "FINAL-DELIVERY.md"
  "IMPLEMENTATION-SUMMARY.md"
  "PLAN-CRITIQUE.md"
  "START-HERE.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    # Check if file is not empty
    if [ -s "$doc" ]; then
      print_pass "$doc exists and has content"
    else
      print_warn "$doc exists but is empty"
    fi
  else
    print_fail "$doc does not exist"
  fi
done

# ════════════════════════════════════════════════════════
# Test 5: Configuration Files
# ════════════════════════════════════════════════════════

print_header "Test Suite 5: Configuration"

print_test "Checking configuration files"

if [ -f ".env.health.example" ]; then
  print_pass ".env.health.example exists"
else
  print_warn ".env.health.example not found (create from template)"
fi

if [ -f "automation/topic-queue.json" ]; then
  print_pass "automation/topic-queue.json exists"

  # Validate JSON
  if jq empty automation/topic-queue.json 2>/dev/null; then
    print_pass "topic-queue.json is valid JSON"
  else
    print_fail "topic-queue.json is invalid JSON"
  fi
else
  print_fail "automation/topic-queue.json not found"
fi

# ════════════════════════════════════════════════════════
# Test 6: Dependencies
# ════════════════════════════════════════════════════════

print_header "Test Suite 6: Dependencies"

print_test "Checking required command-line tools"

# Check for jq
if command -v jq &> /dev/null; then
  print_pass "jq is installed"
else
  print_warn "jq is not installed (required for health check)"
  print_info "Install with: sudo apt-get install jq"
fi

# Check for curl
if command -v curl &> /dev/null; then
  print_pass "curl is installed"
else
  print_fail "curl is not installed (required)"
fi

# Check for gh (optional)
if command -v gh &> /dev/null; then
  print_pass "GitHub CLI (gh) is installed"
else
  print_warn "GitHub CLI (gh) not installed (optional, but recommended)"
  print_info "Install from: https://cli.github.com"
fi

# Check for git
if command -v git &> /dev/null; then
  print_pass "git is installed"
else
  print_fail "git is not installed (required)"
fi

# ════════════════════════════════════════════════════════
# Test 7: Health Check Functionality
# ════════════════════════════════════════════════════════

print_header "Test Suite 7: Health Check Functionality"

print_test "Running health check script"

if [ -f "scripts/simple-health-check.sh" ] && [ -x "scripts/simple-health-check.sh" ]; then
  # Run health check and capture output
  if ./scripts/simple-health-check.sh > /tmp/health-test-output.log 2>&1; then
    print_pass "Health check completed successfully"
  else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 1 ]; then
      print_warn "Health check completed with warnings (exit code 1)"
      print_info "This is normal if there are non-critical issues"
    else
      print_fail "Health check failed with exit code $EXIT_CODE"
    fi
  fi

  # Check output
  if grep -q "GitHub Actions" /tmp/health-test-output.log; then
    print_pass "Health check monitors GitHub Actions"
  fi

  if grep -q "Topic Queue" /tmp/health-test-output.log; then
    print_pass "Health check monitors Topic Queue"
  fi

  if grep -q "Website Status" /tmp/health-test-output.log; then
    print_pass "Health check monitors Website Status"
  fi
else
  print_fail "Cannot run health check (script not found or not executable)"
fi

# ════════════════════════════════════════════════════════
# Test 8: Git Repository Status
# ════════════════════════════════════════════════════════

print_header "Test Suite 8: Git Repository"

print_test "Checking git repository status"

if git rev-parse --git-dir > /dev/null 2>&1; then
  print_pass "Project is a git repository"

  # Check if .gitignore includes .env.health
  if grep -q ".env.health" .gitignore 2>/dev/null; then
    print_pass ".env.health is in .gitignore"
  else
    print_warn ".env.health should be added to .gitignore"
    print_info "Add this line to .gitignore: .env.health"
  fi

  # Check for remote
  if git remote -v | grep -q "origin"; then
    print_pass "Git remote 'origin' is configured"
  else
    print_warn "No git remote configured"
  fi
else
  print_fail "Not a git repository"
fi

# ════════════════════════════════════════════════════════
# Test 9: Automation Data
# ════════════════════════════════════════════════════════

print_header "Test Suite 9: Automation Data"

print_test "Checking automation data integrity"

if [ -f "automation/topic-queue.json" ]; then
  # Count topics
  PENDING_COUNT=$(jq '.queue | map(select(.status=="pending")) | length' automation/topic-queue.json 2>/dev/null || echo "0")

  if [ "$PENDING_COUNT" -ge 10 ]; then
    print_pass "Topic queue has $PENDING_COUNT pending topics (healthy)"
  elif [ "$PENDING_COUNT" -ge 5 ]; then
    print_warn "Topic queue has only $PENDING_COUNT pending topics (consider generating more)"
  else
    print_fail "Topic queue critically low: $PENDING_COUNT topics"
    print_info "Run: npm run topics:generate 30"
  fi
fi

# ════════════════════════════════════════════════════════
# Test 10: File Permissions
# ════════════════════════════════════════════════════════

print_header "Test Suite 10: File Permissions"

print_test "Checking file permissions"

# All .sh files should be executable
SH_FILES=$(find scripts -name "*.sh" -type f 2>/dev/null)
NON_EXECUTABLE=0

for file in $SH_FILES; do
  if [ ! -x "$file" ]; then
    print_warn "$file is not executable"
    NON_EXECUTABLE=$((NON_EXECUTABLE + 1))
  fi
done

if [ $NON_EXECUTABLE -eq 0 ]; then
  print_pass "All shell scripts are executable"
else
  print_info "Run: chmod +x scripts/*.sh"
fi

# ════════════════════════════════════════════════════════
# Test Summary
# ════════════════════════════════════════════════════════

print_header "Test Summary"

echo ""
echo -e "Tests Run:     ${CYAN}$TESTS_RUN${NC}"
echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo -e "Warnings:      ${YELLOW}$TESTS_WARNINGS${NC}"
echo ""

# Calculate pass rate
if [ $TESTS_RUN -gt 0 ]; then
  PASS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
  echo "Pass Rate: $PASS_RATE%"
  echo ""
fi

# Overall result
if [ $TESTS_FAILED -eq 0 ]; then
  if [ $TESTS_WARNINGS -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ ALL TESTS PASSED - System Ready!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Your automation system is fully functional!"
    echo ""
    echo "Next step:"
    echo "  npm run health:quick-setup"
    echo ""
    EXIT_CODE=0
  else
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  ⚠ TESTS PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "System is functional but has some warnings."
    echo "Review warnings above and address if needed."
    echo ""
    EXIT_CODE=0
  fi
else
  echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
  echo -e "${RED}  ✗ SOME TESTS FAILED${NC}"
  echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Please address the failed tests above before proceeding."
  echo ""
  EXIT_CODE=1
fi

# Save test results
echo "Test results saved to: /tmp/tpp-automation-test-results.log"
{
  echo "TPP Automation System Test Results"
  echo "==================================="
  echo "Date: $(date)"
  echo "Tests Run: $TESTS_RUN"
  echo "Tests Passed: $TESTS_PASSED"
  echo "Tests Failed: $TESTS_FAILED"
  echo "Warnings: $TESTS_WARNINGS"
  echo "Pass Rate: $PASS_RATE%"
} > /tmp/tpp-automation-test-results.log

exit $EXIT_CODE
