#!/bin/bash

# n8n Workflow Testing Script
# Automated testing and validation of n8n workflows

set -e

WORKFLOW_FILE=$1
N8N_MANAGER="$(dirname "$0")/n8n-manager.sh"
TEMP_DIR="/tmp/n8n-test-$$"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Statistics
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Create temp directory
mkdir -p "$TEMP_DIR"

# Cleanup function
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Print header
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   n8n Workflow Test Suite${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Test result functions
test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Check if workflow file exists
check_file_exists() {
    echo -e "\n${YELLOW}[Test 1/10] Checking file existence...${NC}"
    if [ ! -f "$WORKFLOW_FILE" ]; then
        test_fail "Workflow file not found: $WORKFLOW_FILE"
        exit 1
    fi
    test_pass "Workflow file exists"
}

# Validate JSON syntax
validate_json_syntax() {
    echo -e "\n${YELLOW}[Test 2/10] Validating JSON syntax...${NC}"
    if jq empty "$WORKFLOW_FILE" 2>/dev/null; then
        test_pass "JSON syntax is valid"
    else
        test_fail "Invalid JSON syntax"
        jq empty "$WORKFLOW_FILE" 2>&1
        exit 1
    fi
}

# Check required fields
check_required_fields() {
    echo -e "\n${YELLOW}[Test 3/10] Checking required fields...${NC}"

    # Check for name
    if jq -e '.name' "$WORKFLOW_FILE" > /dev/null 2>&1; then
        WORKFLOW_NAME=$(jq -r '.name' "$WORKFLOW_FILE")
        test_pass "Workflow name: $WORKFLOW_NAME"
    else
        test_fail "Missing workflow name"
    fi

    # Check for nodes
    if jq -e '.nodes | length > 0' "$WORKFLOW_FILE" > /dev/null 2>&1; then
        NODE_COUNT=$(jq '.nodes | length' "$WORKFLOW_FILE")
        test_pass "Nodes found: $NODE_COUNT"
    else
        test_fail "No nodes defined"
        exit 1
    fi

    # Check for connections
    if jq -e '.connections' "$WORKFLOW_FILE" > /dev/null 2>&1; then
        test_pass "Connections object exists"
    else
        test_warn "No connections defined (single-node workflow?)"
    fi
}

# Validate node structure
validate_nodes() {
    echo -e "\n${YELLOW}[Test 4/10] Validating node configurations...${NC}"

    # Check each node has required fields
    jq -c '.nodes[]' "$WORKFLOW_FILE" | while read -r node; do
        NODE_NAME=$(echo "$node" | jq -r '.name // "unnamed"')
        NODE_TYPE=$(echo "$node" | jq -r '.type // "unknown"')
        NODE_ID=$(echo "$node" | jq -r '.id // "no-id"')

        # Check for required fields
        if echo "$node" | jq -e '.name and .type and .id' > /dev/null 2>&1; then
            test_pass "Node '$NODE_NAME' ($NODE_TYPE) is properly configured"
        else
            test_fail "Node '$NODE_NAME' missing required fields"
        fi

        # Check for parameters
        if echo "$node" | jq -e '.parameters' > /dev/null 2>&1; then
            test_pass "Node '$NODE_NAME' has parameters configured"
        else
            test_warn "Node '$NODE_NAME' has no parameters (may be intentional)"
        fi
    done
}

# Check for expressions
check_expressions() {
    echo -e "\n${YELLOW}[Test 5/10] Checking expressions...${NC}"

    # Look for common expression errors
    if grep -q '{{ \$json,' "$WORKFLOW_FILE"; then
        test_fail "Found incorrect expression syntax: {{ \$json,field }} should be {{ \$json.field }}"
    else
        test_pass "No comma syntax errors in expressions"
    fi

    # Count expressions
    EXPR_COUNT=$(grep -o '{{' "$WORKFLOW_FILE" | wc -l)
    if [ "$EXPR_COUNT" -gt 0 ]; then
        test_pass "Found $EXPR_COUNT expressions"
    fi
}

# Check for credentials
check_credentials() {
    echo -e "\n${YELLOW}[Test 6/10] Checking credentials...${NC}"

    # Look for credential references
    if jq -e '.nodes[] | select(.credentials)' "$WORKFLOW_FILE" > /dev/null 2>&1; then
        CRED_NODES=$(jq '[.nodes[] | select(.credentials)] | length' "$WORKFLOW_FILE")
        test_pass "Found $CRED_NODES nodes using credentials"

        # List credential types
        jq -r '.nodes[] | select(.credentials) | .credentials | to_entries[] | "\(.key): \(.value.name // "unnamed")"' "$WORKFLOW_FILE" | while read -r cred; do
            echo "    - $cred"
        done
    else
        test_warn "No credentials configured (may use API keys directly)"
    fi
}

# Check for hardcoded secrets
check_hardcoded_secrets() {
    echo -e "\n${YELLOW}[Test 7/10] Checking for hardcoded secrets...${NC}"

    # Common patterns for secrets
    if grep -iE '(password|secret|api_key|apikey|token).*:.*["\047][^"\047]{10,}' "$WORKFLOW_FILE" > /dev/null 2>&1; then
        test_warn "Possible hardcoded secrets found (review manually)"
    else
        test_pass "No obvious hardcoded secrets detected"
    fi
}

# Validate connections
validate_connections() {
    echo -e "\n${YELLOW}[Test 8/10] Validating connections...${NC}"

    # Check if all referenced nodes exist in connections
    CONNECTION_COUNT=$(jq '.connections | to_entries | length' "$WORKFLOW_FILE" 2>/dev/null || echo "0")

    if [ "$CONNECTION_COUNT" -gt 0 ]; then
        test_pass "Found $CONNECTION_COUNT connection groups"

        # Validate connection targets exist
        jq -r '.connections | to_entries[] | .value.main[][]?.node // empty' "$WORKFLOW_FILE" | sort -u | while read -r target_node; do
            if jq -e ".nodes[] | select(.name == \"$target_node\")" "$WORKFLOW_FILE" > /dev/null 2>&1; then
                test_pass "Connection target '$target_node' exists"
            else
                test_fail "Connection target '$target_node' not found in nodes"
            fi
        done
    else
        test_warn "No connections defined"
    fi
}

# Test API import (if n8n-manager is available)
test_api_import() {
    echo -e "\n${YELLOW}[Test 9/10] Testing API import...${NC}"

    if [ ! -f "$N8N_MANAGER" ]; then
        test_warn "n8n-manager.sh not found, skipping API tests"
        return
    fi

    # Check if n8n API is accessible
    if bash "$N8N_MANAGER" list > /dev/null 2>&1; then
        test_pass "n8n API is accessible"

        # Try to import workflow
        echo "Attempting to import workflow..."
        WORKFLOW_JSON=$(cat "$WORKFLOW_FILE")
        IMPORT_RESULT=$(bash "$N8N_MANAGER" create "$WORKFLOW_JSON" 2>&1 || echo "FAILED")

        if echo "$IMPORT_RESULT" | grep -q "FAILED"; then
            test_fail "Failed to import workflow to n8n"
            echo "$IMPORT_RESULT"
        else
            WORKFLOW_ID=$(echo "$IMPORT_RESULT" | jq -r '.data.id // empty' 2>/dev/null)
            if [ -n "$WORKFLOW_ID" ]; then
                test_pass "Workflow imported successfully (ID: $WORKFLOW_ID)"

                # Store for cleanup
                echo "$WORKFLOW_ID" > "$TEMP_DIR/workflow_id"
            else
                test_warn "Workflow import status unclear"
            fi
        fi
    else
        test_warn "n8n API not accessible, skipping import test"
    fi
}

# Test execution (if workflow was imported)
test_execution() {
    echo -e "\n${YELLOW}[Test 10/10] Testing workflow execution...${NC}"

    if [ ! -f "$TEMP_DIR/workflow_id" ]; then
        test_warn "No workflow ID available, skipping execution test"
        return
    fi

    WORKFLOW_ID=$(cat "$TEMP_DIR/workflow_id")

    # Activate workflow
    echo "Activating workflow..."
    if bash "$N8N_MANAGER" activate "$WORKFLOW_ID" > /dev/null 2>&1; then
        test_pass "Workflow activated"

        # Execute workflow
        echo "Executing workflow..."
        EXEC_RESULT=$(bash "$N8N_MANAGER" execute "$WORKFLOW_ID" 2>&1 || echo "FAILED")

        if echo "$EXEC_RESULT" | grep -q "FAILED"; then
            test_fail "Workflow execution failed"
            echo "$EXEC_RESULT"
        elif echo "$EXEC_RESULT" | jq -e '.data.finished == true' > /dev/null 2>&1; then
            test_pass "Workflow executed successfully"

            # Show execution time if available
            EXEC_TIME=$(echo "$EXEC_RESULT" | jq -r '.data.executionTime // "unknown"' 2>/dev/null)
            if [ "$EXEC_TIME" != "unknown" ]; then
                echo "    Execution time: ${EXEC_TIME}ms"
            fi
        else
            test_warn "Workflow execution completed with unknown status"
        fi

        # Deactivate workflow
        echo "Deactivating workflow..."
        bash "$N8N_MANAGER" deactivate "$WORKFLOW_ID" > /dev/null 2>&1

        # Clean up (optionally delete test workflow)
        read -p "Delete test workflow from n8n? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            bash "$N8N_MANAGER" delete "$WORKFLOW_ID" > /dev/null 2>&1
            echo "Test workflow deleted"
        fi
    else
        test_fail "Failed to activate workflow"
    fi
}

# Print summary
print_summary() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   Test Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Passed:  $TESTS_PASSED${NC}"
    echo -e "${RED}Failed:  $TESTS_FAILED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        exit 1
    fi
}

# Main execution
main() {
    if [ -z "$WORKFLOW_FILE" ]; then
        echo "Usage: $0 <workflow-file.json>"
        exit 1
    fi

    print_header
    check_file_exists
    validate_json_syntax
    check_required_fields
    validate_nodes
    check_expressions
    check_credentials
    check_hardcoded_secrets
    validate_connections
    test_api_import
    test_execution
    print_summary
}

main
