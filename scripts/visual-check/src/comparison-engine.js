/**
 * Comparison Engine
 *
 * Compares visual check results between runs
 * to track improvements or regressions.
 */

export class ComparisonEngine {
  /**
   * Compare two check results
   */
  async compare(previousResult, currentResult) {
    const prevIssues = this.countIssues(previousResult);
    const currIssues = this.countIssues(currentResult);

    const comparison = {
      previousIssues: prevIssues,
      currentIssues: currIssues,
      issuesDelta: currIssues - prevIssues,
      status: this.getStatus(prevIssues, currIssues),
      issueBreakdown: this.compareIssueTypes(previousResult, currentResult)
    };

    return comparison;
  }

  /**
   * Count total issues in a result
   */
  countIssues(result) {
    if (!result.viewportResults) return 0;

    return result.viewportResults.reduce((sum, vr) => {
      if (!vr.issues) return sum;
      return sum + Object.values(vr.issues).flat().length;
    }, 0);
  }

  /**
   * Determine status based on issue count change
   */
  getStatus(prevCount, currCount) {
    if (currCount < prevCount) return 'improved';
    if (currCount > prevCount) return 'degraded';
    return 'unchanged';
  }

  /**
   * Compare issue types between runs
   */
  compareIssueTypes(previousResult, currentResult) {
    const prevTypes = this.getIssueTypes(previousResult);
    const currTypes = this.getIssueTypes(currentResult);

    const breakdown = {};

    const allTypes = new Set([...Object.keys(prevTypes), ...Object.keys(currTypes)]);

    for (const type of allTypes) {
      const prev = prevTypes[type] || 0;
      const curr = currTypes[type] || 0;

      breakdown[type] = {
        previous: prev,
        current: curr,
        delta: curr - prev,
        status: curr < prev ? 'improved' : curr > prev ? 'degraded' : 'unchanged'
      };
    }

    return breakdown;
  }

  /**
   * Get issue type counts
   */
  getIssueTypes(result) {
    const types = {};

    if (!result.viewportResults) return types;

    for (const vr of result.viewportResults) {
      if (!vr.issues) continue;

      for (const [issueType, issues] of Object.entries(vr.issues)) {
        types[issueType] = (types[issueType] || 0) + issues.length;
      }
    }

    return types;
  }

  /**
   * Generate comparison summary text
   */
  getSummaryText(comparison) {
    const { status, issuesDelta, previousIssues, currentIssues } = comparison;

    if (status === 'improved') {
      return `✅ Improved: ${previousIssues} → ${currentIssues} issues (${Math.abs(issuesDelta)} fixed)`;
    } else if (status === 'degraded') {
      return `⚠️ Degraded: ${previousIssues} → ${currentIssues} issues (+${issuesDelta} new)`;
    } else {
      return `➡️ Unchanged: ${currentIssues} issues`;
    }
  }
}