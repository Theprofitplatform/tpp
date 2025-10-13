## BMad Method Integration for TPP

The Profit Platform has BMad Method agents configured for specialized tasks:

### Available Agents & Commands

1. **bmad-architect** (use `/bmad-review`)
   - Review system architecture
   - Design new features
   - Optimize existing systems
   - Assess scalability and performance

2. **bmad-dev** (use `/bmad-dev`)
   - Implement new features
   - Fix bugs
   - Refactor code
   - Maintain code quality

3. **bmad-qa** (use `/bmad-test`)
   - Test features and scripts
   - Validate blog content
   - Run production parity checks
   - Quality assurance

4. **bmad-infra-devops** (use `/bmad-deploy`)
   - Deploy to production
   - Manage infrastructure
   - Monitor systems
   - Handle incidents

5. **bmad-content-editor** (use `/bmad-content`)
   - Review blog posts
   - Optimize SEO
   - Improve readability
   - Ensure quality

### Quick Start Examples

```bash
# Review automation architecture
/bmad-review automation workflows

# Implement a new feature
/bmad-dev add image optimization to blog posts

# Test blog automation
/bmad-test blog generation workflow

# Deploy to production
/bmad-deploy

# Review a blog post
/bmad-content latest blog post
```

### Integration with Existing Tools

BMad agents work alongside existing project tools:
- n8n workflow agents (n8n-workflow-manager, n8n-direct-manager)
- Global agents (code-reviewer, security-scanner, test-runner)
- Automation scripts (all npm run scripts)

### When to Use Which Agent

- **Architecture questions?** → `/bmad-review`
- **Need code written?** → `/bmad-dev`
- **Need testing?** → `/bmad-test`
- **Deployment issues?** → `/bmad-deploy`
- **Content quality?** → `/bmad-content`

All agents are TPP-specific and understand the project structure, automation workflows, and best practices.
