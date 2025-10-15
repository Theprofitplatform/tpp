#!/usr/bin/env node

/**
 * n8n Workflow Validator
 * Advanced validation and analysis of n8n workflow JSON files
 */

import fs from 'fs';
import path from 'path';

class WorkflowValidator {
    constructor(workflowPath) {
        this.workflowPath = workflowPath;
        this.workflow = null;
        this.issues = {
            critical: [],
            warnings: [],
            suggestions: []
        };
        this.stats = {
            nodeCount: 0,
            connectionCount: 0,
            triggerType: null,
            credentialTypes: new Set(),
            externalApis: new Set()
        };
    }

    loadWorkflow() {
        try {
            const content = fs.readFileSync(this.workflowPath, 'utf8');
            this.workflow = JSON.parse(content);
            return true;
        } catch (error) {
            this.issues.critical.push(`Failed to parse JSON: ${error.message}`);
            return false;
        }
    }

    validateStructure() {
        const requiredFields = ['name', 'nodes'];

        for (const field of requiredFields) {
            if (!this.workflow[field]) {
                this.issues.critical.push(`Missing required field: ${field}`);
            }
        }

        // Validate nodes array
        if (Array.isArray(this.workflow.nodes)) {
            this.stats.nodeCount = this.workflow.nodes.length;

            if (this.stats.nodeCount === 0) {
                this.issues.critical.push('No nodes defined in workflow');
            }
        } else {
            this.issues.critical.push('Nodes field must be an array');
        }

        // Validate connections if present
        if (this.workflow.connections) {
            if (typeof this.workflow.connections !== 'object') {
                this.issues.critical.push('Connections must be an object');
            } else {
                this.stats.connectionCount = Object.keys(this.workflow.connections).length;
            }
        }
    }

    validateNodes() {
        const nodeIds = new Set();
        const nodeNames = new Set();

        this.workflow.nodes.forEach((node, index) => {
            // Check required fields
            if (!node.id) {
                this.issues.critical.push(`Node at index ${index} missing ID`);
            } else if (nodeIds.has(node.id)) {
                this.issues.critical.push(`Duplicate node ID: ${node.id}`);
            } else {
                nodeIds.add(node.id);
            }

            if (!node.name) {
                this.issues.warnings.push(`Node ${node.id} missing name`);
            } else if (nodeNames.has(node.name)) {
                this.issues.warnings.push(`Duplicate node name: ${node.name}`);
            } else {
                nodeNames.add(node.name);
            }

            if (!node.type) {
                this.issues.critical.push(`Node ${node.id} missing type`);
            }

            // Check for trigger nodes
            if (node.type.includes('Trigger')) {
                this.stats.triggerType = node.type;
            }

            // Check for credentials
            if (node.credentials) {
                Object.keys(node.credentials).forEach(credType => {
                    this.stats.credentialTypes.add(credType);
                });
            }

            // Check for external APIs
            if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.url) {
                const url = node.parameters.url;
                if (url.startsWith('http')) {
                    try {
                        const hostname = new URL(url).hostname;
                        if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
                            this.stats.externalApis.add(hostname);
                        }
                    } catch (error) {
                        this.issues.warnings.push(`Invalid URL in HTTP node ${node.name}: ${url}`);
                    }
                }
            }

            // Validate expressions
            this.validateNodeExpressions(node);

            // Check for common configuration issues
            this.validateNodeConfiguration(node);
        });
    }

    validateNodeExpressions(node) {
        const nodeJson = JSON.stringify(node);

        // Check for comma syntax errors
        if (nodeJson.includes('{{ $json,')) {
            this.issues.critical.push(
                `Node "${node.name}" has incorrect expression syntax: {{ $json,field }} should be {{ $json.field }}`
            );
        }

        // Check for old n8n syntax
        if (nodeJson.includes('{{ $node[')) {
            this.issues.warnings.push(
                `Node "${node.name}" may be using old n8n expression syntax`
            );
        }

        // Check for missing expression closing braces
        const openBraces = (nodeJson.match(/{{/g) || []).length;
        const closeBraces = (nodeJson.match(/}}/g) || []).length;
        if (openBraces !== closeBraces) {
            this.issues.critical.push(
                `Node "${node.name}" has mismatched expression braces (${openBraces} open, ${closeBraces} close)`
            );
        }
    }

    validateNodeConfiguration(node) {
        // HTTP Request node validation
        if (node.type === 'n8n-nodes-base.httpRequest') {
            if (!node.parameters?.url) {
                this.issues.critical.push(`HTTP Request node "${node.name}" missing URL`);
            }

            if (!node.parameters?.httpMethod) {
                this.issues.warnings.push(`HTTP Request node "${node.name}" missing HTTP method`);
            }
        }

        // If node validation
        if (node.type === 'n8n-nodes-base.if') {
            if (!node.parameters?.conditions) {
                this.issues.critical.push(`If node "${node.name}" missing conditions`);
            }
        }

        // Manual Trigger validation
        if (node.type === 'n8n-nodes-base.manualTrigger') {
            if (!this.workflow.connections?.[node.name]) {
                this.issues.warnings.push(`Manual Trigger "${node.name}" has no outgoing connections`);
            }
        }
    }

    validateConnections() {
        if (!this.workflow.connections) return;

        const nodeNames = new Set(this.workflow.nodes.map(n => n.name));

        Object.entries(this.workflow.connections).forEach(([sourceNode, connectionGroups]) => {
            // Check if source node exists
            if (!nodeNames.has(sourceNode)) {
                this.issues.critical.push(`Connection references non-existent source node: ${sourceNode}`);
                return;
            }

            // Check main connections
            if (connectionGroups.main) {
                connectionGroups.main.forEach(connectionGroup => {
                    connectionGroup.forEach(connection => {
                        if (!nodeNames.has(connection.node)) {
                            this.issues.critical.push(`Connection from ${sourceNode} to non-existent node: ${connection.node}`);
                        }
                    });
                });
            }
        });

        // Check for unreachable nodes
        this.findUnreachableNodes(nodeNames);
    }

    findUnreachableNodes(nodeNames) {
        const reachable = new Set();
        const triggerNodes = this.workflow.nodes.filter(n => n.type.includes('Trigger'));

        // Start from trigger nodes
        triggerNodes.forEach(trigger => {
            reachable.add(trigger.name);
            this.traverseConnections(trigger.name, reachable);
        });

        // Find unreachable nodes
        const unreachable = [...nodeNames].filter(name => !reachable.has(name));
        if (unreachable.length > 0) {
            this.issues.warnings.push(`Unreachable nodes: ${unreachable.join(', ')}`);
        }
    }

    traverseConnections(nodeName, visited) {
        const connections = this.workflow.connections?.[nodeName];
        if (!connections) return;

        if (connections.main) {
            connections.main.forEach(connectionGroup => {
                connectionGroup.forEach(connection => {
                    if (!visited.has(connection.node)) {
                        visited.add(connection.node);
                        this.traverseConnections(connection.node, visited);
                    }
                });
            });
        }
    }

    checkForBestPractices() {
        // Check for error handling
        const hasErrorHandlers = this.workflow.nodes.some(n =>
            n.type === 'n8n-nodes-base.noOp' &&
            n.name?.toLowerCase().includes('error')
        );

        if (!hasErrorHandlers) {
            this.issues.suggestions.push('Consider adding error handling nodes');
        }

        // Check for hardcoded secrets
        const workflowJson = JSON.stringify(this.workflow);
        const secretPatterns = [
            /"password"\s*:\s*"[^"]{8,}"/gi,
            /"api[_-]?key"\s*:\s*"[^"]{10,}"/gi,
            /"secret"\s*:\s*"[^"]{8,}"/gi,
            /"token"\s*:\s*"[^"]{10,}"/gi
        ];

        secretPatterns.forEach(pattern => {
            if (pattern.test(workflowJson)) {
                this.issues.warnings.push('Possible hardcoded secrets detected (use credentials instead)');
            }
        });

        // Check for reasonable timeouts
        this.workflow.nodes.forEach(node => {
            if (node.parameters?.timeout && node.parameters.timeout > 3600000) {
                this.issues.suggestions.push(`Node "${node.name}" has long timeout (${node.parameters.timeout}ms)`);
            }
        });
    }

    generateReport() {
        const report = {
            workflow: {
                name: this.workflow.name,
                path: this.workflowPath,
                nodeCount: this.stats.nodeCount,
                connectionCount: this.stats.connectionCount,
                triggerType: this.stats.triggerType,
                credentialTypes: [...this.stats.credentialTypes],
                externalApis: [...this.stats.externalApis]
            },
            issues: this.issues,
            summary: {
                status: this.issues.critical.length > 0 ? 'FAIL' :
                        this.issues.warnings.length > 0 ? 'WARN' : 'PASS',
                criticalCount: this.issues.critical.length,
                warningCount: this.issues.warnings.length,
                suggestionCount: this.issues.suggestions.length
            }
        };

        return report;
    }

    validate() {
        if (!this.loadWorkflow()) {
            return this.generateReport();
        }

        this.validateStructure();
        this.validateNodes();
        this.validateConnections();
        this.checkForBestPractices();

        return this.generateReport();
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node validate-workflow.js <workflow-file.json>');
        process.exit(1);
    }

    const workflowPath = args[0];

    if (!fs.existsSync(workflowPath)) {
        console.error(`Workflow file not found: ${workflowPath}`);
        process.exit(1);
    }

    const validator = new WorkflowValidator(workflowPath);
    const report = validator.validate();

    // Print report
    console.log(JSON.stringify(report, null, 2));

    // Exit with appropriate code
    process.exit(report.summary.status === 'FAIL' ? 1 : 0);
}

export default WorkflowValidator;