#!/usr/bin/env node

/**
 * n8n Workflow Reviewer
 * Complete workflow analysis and reporting tool
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class WorkflowReviewer {
    constructor(workflowPath) {
        this.workflowPath = workflowPath;
        this.workflow = null;
        this.report = {
            workflow: {},
            validation: {},
            testing: {},
            recommendations: [],
            summary: {}
        };
    }

    loadWorkflow() {
        try {
            const content = fs.readFileSync(this.workflowPath, 'utf8');
            this.workflow = JSON.parse(content);
            return true;
        } catch (error) {
            console.error(`❌ Failed to load workflow: ${error.message}`);
            return false;
        }
    }

    analyzeWorkflow() {
        if (!this.workflow) return;

        // Basic workflow info
        this.report.workflow = {
            name: this.workflow.name,
            path: this.workflowPath,
            nodeCount: this.workflow.nodes?.length || 0,
            triggerType: this.findTriggerType(),
            credentialCount: this.countCredentials(),
            externalApis: this.findExternalApis(),
            hasErrorHandling: this.hasErrorHandling(),
            hasSuccessHandling: this.hasSuccessHandling()
        };

        // Node analysis
        this.report.nodes = this.analyzeNodes();

        // Connection analysis
        this.report.connections = this.analyzeConnections();

        // Performance analysis
        this.report.performance = this.analyzePerformance();
    }

    findTriggerType() {
        const triggerNode = this.workflow.nodes?.find(n =>
            n.type.includes('Trigger') || n.type.includes('Webhook')
        );
        return triggerNode?.type || 'Unknown';
    }

    countCredentials() {
        let count = 0;
        this.workflow.nodes?.forEach(node => {
            if (node.credentials) {
                count += Object.keys(node.credentials).length;
            }
        });
        return count;
    }

    findExternalApis() {
        const apis = new Set();
        this.workflow.nodes?.forEach(node => {
            if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.url) {
                try {
                    const url = new URL(node.parameters.url);
                    if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
                        apis.add(url.hostname);
                    }
                } catch (error) {
                    // Invalid URL, skip
                }
            }
        });
        return [...apis];
    }

    hasErrorHandling() {
        return this.workflow.nodes?.some(n =>
            n.name?.toLowerCase().includes('error') ||
            n.type === 'n8n-nodes-base.noOp'
        ) || false;
    }

    hasSuccessHandling() {
        return this.workflow.nodes?.some(n =>
            n.name?.toLowerCase().includes('success') ||
            n.name?.toLowerCase().includes('notification')
        ) || false;
    }

    analyzeNodes() {
        const analysis = {
            byType: {},
            issues: [],
            suggestions: []
        };

        this.workflow.nodes?.forEach(node => {
            // Count by type
            const type = node.type || 'unknown';
            analysis.byType[type] = (analysis.byType[type] || 0) + 1;

            // Check for common issues
            if (!node.name) {
                analysis.issues.push(`Node ${node.id} missing name`);
            }

            if (node.type === 'n8n-nodes-base.httpRequest' && !node.credentials) {
                analysis.suggestions.push(`HTTP Request node "${node.name}" not using credentials`);
            }

            if (node.parameters?.timeout && node.parameters.timeout > 300000) {
                analysis.suggestions.push(`Node "${node.name}" has long timeout (${node.parameters.timeout}ms)`);
            }
        });

        return analysis;
    }

    analyzeConnections() {
        const analysis = {
            totalConnections: 0,
            reachableNodes: 0,
            unreachableNodes: 0,
            issues: []
        };

        if (!this.workflow.connections) {
            analysis.issues.push('No connections defined');
            return analysis;
        }

        // Count connections
        Object.values(this.workflow.connections).forEach(connectionGroup => {
            if (connectionGroup.main) {
                connectionGroup.main.forEach(group => {
                    analysis.totalConnections += group.length;
                });
            }
        });

        // Find reachable nodes
        const reachable = new Set();
        const triggerNodes = this.workflow.nodes?.filter(n => n.type.includes('Trigger')) || [];

        triggerNodes.forEach(trigger => {
            reachable.add(trigger.name);
            this.traverseConnections(trigger.name, reachable);
        });

        analysis.reachableNodes = reachable.size;
        analysis.unreachableNodes = this.workflow.nodes.length - reachable.size;

        if (analysis.unreachableNodes > 0) {
            analysis.issues.push(`${analysis.unreachableNodes} unreachable nodes detected`);
        }

        return analysis;
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

    analyzePerformance() {
        const analysis = {
            estimatedExecutionTime: 0,
            apiCalls: 0,
            potentialBottlenecks: []
        };

        this.workflow.nodes?.forEach(node => {
            // Estimate execution time based on node type
            let nodeTime = 100; // Base time in ms

            if (node.type === 'n8n-nodes-base.httpRequest') {
                nodeTime = 500; // API calls take longer
                analysis.apiCalls++;
            } else if (node.type === 'n8n-nodes-base.code') {
                nodeTime = 200; // Code execution
            } else if (node.type === 'n8n-nodes-base.if') {
                nodeTime = 50; // Condition checks
            }

            analysis.estimatedExecutionTime += nodeTime;

            // Check for potential bottlenecks
            if (node.type === 'n8n-nodes-base.httpRequest' && !node.parameters?.timeout) {
                analysis.potentialBottlenecks.push(`HTTP Request node "${node.name}" missing timeout`);
            }
        });

        return analysis;
    }

    runValidation() {
        try {
            const validatorPath = new URL('validate-workflow.js', import.meta.url).pathname;
            const result = execSync(`node "${validatorPath}" "${this.workflowPath}"`, {
                encoding: 'utf8'
            });
            this.report.validation = JSON.parse(result);
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            this.report.validation = { error: error.message };
        }
    }

    runTests() {
        try {
            const testScriptPath = new URL('test-n8n-workflow.sh', import.meta.url).pathname;
            const result = execSync(`bash "${testScriptPath}" "${this.workflowPath}"`, {
                encoding: 'utf8'
            });
            this.report.testing = { output: result, success: true };
        } catch (error) {
            console.error('❌ Testing failed:', error.message);
            this.report.testing = { error: error.message, success: false };
        }
    }

    generateRecommendations() {
        const recommendations = [];

        // Based on validation results
        if (this.report.validation?.issues?.critical?.length > 0) {
            recommendations.push('Fix critical validation issues before deployment');
        }

        if (this.report.validation?.issues?.warnings?.length > 0) {
            recommendations.push('Address validation warnings to improve workflow reliability');
        }

        // Based on workflow analysis
        if (!this.report.workflow.hasErrorHandling) {
            recommendations.push('Add error handling nodes to handle failures gracefully');
        }

        if (this.report.connections.unreachableNodes > 0) {
            recommendations.push('Fix unreachable nodes to ensure complete workflow execution');
        }

        if (this.report.performance.apiCalls > 5) {
            recommendations.push('Consider batching API calls or adding retry logic');
        }

        if (this.report.workflow.credentialCount === 0) {
            recommendations.push('Use credentials instead of hardcoded API keys for better security');
        }

        this.report.recommendations = recommendations;
    }

    generateSummary() {
        const validationStatus = this.report.validation?.summary?.status || 'UNKNOWN';
        const testStatus = this.report.testing?.success ? 'PASS' : 'FAIL';

        let overallStatus = 'PASS';
        if (validationStatus === 'FAIL' || testStatus === 'FAIL') {
            overallStatus = 'FAIL';
        } else if (validationStatus === 'WARN') {
            overallStatus = 'WARN';
        }

        this.report.summary = {
            overallStatus,
            validationStatus,
            testStatus,
            nodeCount: this.report.workflow.nodeCount,
            criticalIssues: this.report.validation?.issues?.critical?.length || 0,
            warnings: this.report.validation?.issues?.warnings?.length || 0,
            recommendations: this.report.recommendations?.length || 0
        };
    }

    generateMarkdownReport() {
        const statusEmoji = {
            'PASS': '✅',
            'WARN': '⚠️',
            'FAIL': '❌',
            'UNKNOWN': '❓'
        };

        let report = `# n8n Workflow Review Report\n\n`;

        // Header
        report += `**Workflow**: ${this.report.workflow.name || 'Unnamed'}\n`;
        report += `**File**: ${this.report.workflow.path}\n`;
        report += `**Date**: ${new Date().toISOString()}\n`;
        report += `**Status**: ${statusEmoji[this.report.summary.overallStatus]} ${this.report.summary.overallStatus}\n\n`;

        report += `---\n\n`;

        // Summary
        report += `## Summary\n\n`;
        report += `- **Total Nodes**: ${this.report.summary.nodeCount}\n`;
        report += `- **Trigger Type**: ${this.report.workflow.triggerType}\n`;
        report += `- **Credentials Used**: ${this.report.workflow.credentialCount}\n`;
        report += `- **External APIs**: ${this.report.workflow.externalApis.length}\n`;
        report += `- **Critical Issues**: ${this.report.summary.criticalIssues}\n`;
        report += `- **Warnings**: ${this.report.summary.warnings}\n`;
        report += `- **Recommendations**: ${this.report.summary.recommendations}\n\n`;

        // Critical Issues
        if (this.report.validation?.issues?.critical?.length > 0) {
            report += `## Critical Issues ❌\n\n`;
            this.report.validation.issues.critical.forEach(issue => {
                report += `- ${issue}\n`;
            });
            report += `\n`;
        }

        // Warnings
        if (this.report.validation?.issues?.warnings?.length > 0) {
            report += `## Warnings ⚠️\n\n`;
            this.report.validation.issues.warnings.forEach(warning => {
                report += `- ${warning}\n`;
            });
            report += `\n`;
        }

        // Recommendations
        if (this.report.recommendations?.length > 0) {
            report += `## Recommendations 💡\n\n`;
            this.report.recommendations.forEach(rec => {
                report += `- ${rec}\n`;
            });
            report += `\n`;
        }

        // Test Results
        report += `## Test Results\n\n`;
        report += `### Validation Test\n`;
        report += `- Status: ${statusEmoji[this.report.summary.validationStatus]} ${this.report.summary.validationStatus}\n`;
        report += `### Execution Test\n`;
        report += `- Status: ${statusEmoji[this.report.summary.testStatus]} ${this.report.summary.testStatus}\n\n`;

        // Detailed Analysis
        report += `## Detailed Analysis\n\n`;

        // Node Types
        if (this.report.nodes?.byType) {
            report += `### Node Types\n\n`;
            Object.entries(this.report.nodes.byType).forEach(([type, count]) => {
                report += `- **${type}**: ${count}\n`;
            });
            report += `\n`;
        }

        // Performance
        if (this.report.performance) {
            report += `### Performance Analysis\n\n`;
            report += `- **Estimated Execution Time**: ${this.report.performance.estimatedExecutionTime}ms\n`;
            report += `- **API Calls**: ${this.report.performance.apiCalls}\n`;
            if (this.report.performance.potentialBottlenecks.length > 0) {
                report += `- **Potential Bottlenecks**:\n`;
                this.report.performance.potentialBottlenecks.forEach(bottleneck => {
                    report += `  - ${bottleneck}\n`;
                });
            }
            report += `\n`;
        }

        // Next Steps
        report += `## Next Steps\n\n`;
        if (this.report.summary.overallStatus === 'FAIL') {
            report += `1. Fix critical issues\n`;
        }
        if (this.report.summary.warnings > 0) {
            report += `2. Address warnings\n`;
        }
        if (this.report.recommendations?.length > 0) {
            report += `3. Implement recommendations\n`;
        }
        report += `4. Re-test workflow\n`;
        report += `5. Deploy to production\n\n`;

        report += `---\n\n`;
        report += `*Generated by n8n Workflow Reviewer*\n`;

        return report;
    }

    review() {
        console.log('🔍 Starting n8n workflow review...\n');

        if (!this.loadWorkflow()) {
            return;
        }

        console.log('📊 Analyzing workflow structure...');
        this.analyzeWorkflow();

        console.log('✅ Running validation...');
        this.runValidation();

        console.log('🧪 Running tests...');
        this.runTests();

        console.log('💡 Generating recommendations...');
        this.generateRecommendations();

        console.log('📋 Generating summary...');
        this.generateSummary();

        const report = this.generateMarkdownReport();
        console.log('\n' + report);

        // Save report to file
        const reportPath = this.workflowPath.replace('.json', '-review.md');
        fs.writeFileSync(reportPath, report);
        console.log(`\n📄 Report saved to: ${reportPath}`);

        return this.report;
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node workflow-reviewer.js <workflow-file.json>');
        process.exit(1);
    }

    const workflowPath = args[0];

    if (!fs.existsSync(workflowPath)) {
        console.error(`Workflow file not found: ${workflowPath}`);
        process.exit(1);
    }

    const reviewer = new WorkflowReviewer(workflowPath);
    const result = reviewer.review();

    // Exit with appropriate code
    process.exit(result?.summary?.overallStatus === 'FAIL' ? 1 : 0);
}

export default WorkflowReviewer;