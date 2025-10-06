# Pull Request - Swarm Configuration

## 📋 Description

Brief description of changes and purpose.

## 🤖 Swarm Configuration

- **Topology**: `[mesh/hierarchical/ring/star]`
- **Max Agents**: `[1-10]`
- **Auto-spawn**: `[yes/no]`
- **Priority**: `[high/medium/low]`
- **Estimated Complexity**: `[small/medium/large]`

## 🎯 Tasks for Swarm

- [ ] Code review and quality analysis
- [ ] Security vulnerability scanning
- [ ] Performance optimization review
- [ ] Accessibility compliance check
- [ ] Mobile responsiveness validation
- [ ] SEO optimization review
- [ ] Cross-browser compatibility testing
- [ ] Documentation updates

## 🏷️ Swarm Agent Labels

Add labels to auto-assign specialized agents:

- `bug` → debugger, tester
- `feature` → architect, coder, tester
- `refactor` → analyst, coder
- `docs` → researcher, writer
- `performance` → analyst, optimizer
- `security` → security-reviewer
- `ui/ux` → design-reviewer
- `accessibility` → a11y-specialist

## 🧪 Testing Requirements

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Performance benchmarks met
- [ ] Accessibility tests pass

## 📚 Documentation

- [ ] Code comments updated
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Changelog entry added

## ✅ Pre-merge Checklist

- [ ] All swarm tasks completed
- [ ] Required reviews approved
- [ ] CI/CD pipeline passes
- [ ] No merge conflicts
- [ ] Branch up to date with main

---

### Swarm Commands

Use these commands in comments to manage the swarm:

- `/swarm init [topology] [max-agents]` - Initialize swarm
- `/swarm spawn [agent-type] "[task]"` - Spawn specific agent
- `/swarm status` - Get current swarm status
- `/swarm progress` - Get detailed progress report
- `/swarm review` - Request swarm code review
- `/swarm fix [issue]` - Auto-fix specific issues
- `/swarm optimize` - Run performance optimization
- `/swarm deploy` - Prepare for deployment

**Example:**

```
/swarm init mesh 5
/swarm spawn security "Review authentication implementation"
/swarm spawn performance "Analyze page load times"
```
