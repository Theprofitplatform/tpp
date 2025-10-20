# 👥 Team Onboarding Guide

**Get your team up to speed with the automation system in 3 weeks**

---

## 📋 Overview

This guide provides a structured 3-week onboarding plan for new team members to master the SEO automation system.

**Time Investment:**
- Week 1: 4 hours (setup + basics)
- Week 2: 3 hours (advanced features)
- Week 3: 2 hours (independence)
- **Total: 9 hours to full productivity**

---

## 🎯 Week 1: Foundations

### Day 1: Environment Setup (1 hour)

**Objective:** Get the system installed and running

**Tasks:**
1. **System Access** (15 min)
   ```bash
   # Get repository access
   git clone [repo-url]
   cd tpp

   # Check Node.js version
   node --version  # Should be v18+
   ```

2. **Installation** (15 min)
   ```bash
   # Install dependencies
   npm install

   # Verify installation
   npm run automation:verify-env
   ```

3. **API Key Setup** (15 min)
   ```bash
   # Get API key from team lead or create at:
   # https://console.anthropic.com/

   # Set API key
   export ANTHROPIC_API_KEY=sk-ant-your-key-here

   # Make permanent
   echo 'export ANTHROPIC_API_KEY=sk-ant-your-key' >> ~/.bashrc
   source ~/.bashrc

   # Verify
   npm run automation:test
   ```

4. **First Run** (15 min)
   ```bash
   # Generate your first content
   npm run automation:gbp-posts

   # View results
   cat automation/generated/gbp-posts/gbp-posts-*.md | head -50

   # Check status
   npm run automation:status:quick
   ```

**Success Criteria:**
- ✅ All tests passing (10/10)
- ✅ API key configured
- ✅ First automation run successful
- ✅ Can navigate documentation

**Homework:**
- Read: `🚀-START-AUTOMATION.md`
- Read: `automation/QUICK-REFERENCE.md`

---

### Day 2: Understanding Automations (1 hour)

**Objective:** Learn what each automation does

**Tasks:**
1. **Run All Automations** (30 min)
   ```bash
   # Suburb pages (takes 45 sec)
   npm run automation:suburb-pages

   # GBP posts (takes 30 sec)
   npm run automation:gbp-posts

   # Review requests (takes 10 sec)
   npm run automation:reviews

   # Rank tracking (if GSC configured)
   npm run automation:rank-track
   ```

2. **Review Outputs** (20 min)
   ```bash
   # Check suburb pages
   ls -la src/content/locations/
   cat src/content/locations/bondi.md

   # Check GBP posts
   cat automation/generated/gbp-posts/gbp-posts-*.md

   # Check review emails
   cat automation/generated/review-emails/review-requests-*.md
   ```

3. **Quality Check** (10 min)
   ```bash
   # Analyze content quality
   npm run automation:analyze-content

   # Review quality scores
   # Note which files scored highest/lowest
   ```

**Success Criteria:**
- ✅ Understand purpose of each automation
- ✅ Can locate generated files
- ✅ Understand quality metrics

**Homework:**
- Read: `automation/EXAMPLES.md`
- Document: Write down 3 questions about the automations

---

### Day 3: Daily Workflows (1 hour)

**Objective:** Learn the daily monitoring routine

**Tasks:**
1. **Morning Health Check** (15 min)
   ```bash
   # Quick status (3 seconds)
   npm run automation:status:quick

   # Check alerts
   cat automation/logs/alerts.log | tail -10

   # Full health check if needed
   npm run automation:monitor
   ```

2. **Understanding Health Scores** (20 min)
   ```bash
   # Generate full dashboard
   npm run automation:health

   # Open dashboard
   open automation/reports/health-dashboard.html

   # Understand each metric:
   # - Disk usage (target: < 80%)
   # - Memory usage (target: < 85%)
   # - API key status
   # - Last run time
   # - Success rate
   ```

3. **Interpreting Logs** (25 min)
   ```bash
   # View health logs
   cat automation/logs/health-check.log

   # View alerts
   cat automation/logs/alerts.log

   # Practice: Identify what each log entry means
   ```

**Success Criteria:**
- ✅ Can run daily health check
- ✅ Understand health dashboard
- ✅ Can interpret log files

**Homework:**
- Read: `automation/WORKFLOW-GUIDE.md`
- Practice: Run health check each morning this week

---

### Day 4: Quality & Analysis (1 hour)

**Objective:** Learn to assess and improve content quality

**Tasks:**
1. **Content Quality Analysis** (30 min)
   ```bash
   # Analyze all content
   npm run automation:analyze-content

   # Analyze specific file
   npm run automation:analyze-content src/content/locations/bondi.md

   # Review 8 quality metrics:
   # 1. Word count
   # 2. Keyword density
   # 3. Readability
   # 4. Repetition
   # 5. Structure
   # 6. AI fingerprints
   # 7. Call-to-action
   # 8. Local content
   ```

2. **Improving Low-Quality Content** (20 min)
   ```bash
   # Identify lowest-scoring file
   # Open in editor
   nano src/content/locations/low-score-suburb.md

   # Make improvements:
   # - Add more local context
   # - Improve readability
   # - Add clear headings
   # - Include call-to-action

   # Re-analyze
   npm run automation:analyze-content src/content/locations/low-score-suburb.md
   ```

3. **Cost Tracking** (10 min)
   ```bash
   # Calculate costs
   npm run automation:cost-estimate

   # Select: Monthly cost estimate
   # Enter typical usage
   # Review ROI analysis
   ```

**Success Criteria:**
- ✅ Can analyze content quality
- ✅ Understand 8 quality metrics
- ✅ Can improve low-scoring content
- ✅ Understand API costs

**Homework:**
- Read: `automation/PERFORMANCE-BENCHMARKS.md`
- Practice: Analyze and improve 2 pieces of content

---

### Day 5: Troubleshooting Basics (30 min)

**Objective:** Handle common issues independently

**Tasks:**
1. **Diagnostic Tools** (15 min)
   ```bash
   # Environment verification
   npm run automation:verify-env

   # Review any warnings/failures
   # Note fix recommendations

   # Test suite
   npm run automation:test

   # Check which tests pass/fail
   ```

2. **Common Issues Practice** (15 min)
   - Simulate: API key not set (unset, then re-set)
   - Simulate: Low disk space (review cleanup commands)
   - Review: `automation/TROUBLESHOOTING-FLOWCHART.md`
   - Find: Where to look for specific error types

**Success Criteria:**
- ✅ Can run diagnostic tools
- ✅ Know where to find troubleshooting guide
- ✅ Can handle 3 common issues

**Week 1 Assessment:**
- Run through this checklist:
  - [ ] Can set up system from scratch
  - [ ] Can run all automations
  - [ ] Understand daily workflows
  - [ ] Can check health and quality
  - [ ] Know basic troubleshooting

---

## 🚀 Week 2: Advanced Features

### Day 1: Customization (1 hour)

**Objective:** Customize automations for specific needs

**Tasks:**
1. **Industry Templates** (30 min)
   ```bash
   # Read customization guide
   cat automation/CUSTOMIZATION-TEMPLATES.md | head -200

   # Choose your industry:
   # - Restaurant
   # - Law Firm
   # - Real Estate
   # - Healthcare
   # - Trades

   # Review industry-specific prompt
   # Note differences from default
   ```

2. **Brand Voice** (20 min)
   - Review 3 brand voice presets:
     - Professional & Corporate
     - Friendly & Conversational
     - Bold & Direct

   - Identify which matches your brand
   - Note prompt modifications needed

3. **Test Customization** (10 min)
   ```bash
   # Make a copy of a generation script
   cp automation/scripts/generate-suburb-pages.mjs automation/scripts/test-custom.mjs

   # Edit prompt to use your brand voice
   # (Don't modify original yet - just practice)

   # Review changes with team lead before implementing
   ```

**Success Criteria:**
- ✅ Understand industry templates
- ✅ Identified brand voice
- ✅ Can customize prompts

**Homework:**
- Document: Proposed customizations for your brand
- Prepare: Questions for team lead review

---

### Day 2: Backup & Recovery (45 min)

**Objective:** Protect data and recover from failures

**Tasks:**
1. **Creating Backups** (15 min)
   ```bash
   # Create backup
   npm run automation:backup

   # Review backup location
   ls -lh automation/backups/

   # Inspect backup contents
   tar -tzf automation/backups/automation-backup-*.tar.gz | head -20
   ```

2. **Restore Practice** (20 min)
   ```bash
   # Create test backup
   npm run automation:backup

   # Note backup filename
   # backup-YYYY-MM-DD_HH-MM-SS.tar.gz

   # Practice restore (in safe environment)
   # bash automation/scripts/restore-system.sh [backup-file]

   # Review what gets restored
   # Understand safety backup creation
   ```

3. **Backup Schedule** (10 min)
   - Learn: Recommended backup frequency
     - Daily: Important client data changes
     - Weekly: Normal operations
     - Before: Major changes/updates

   - Plan: Backup schedule for your workflow

**Success Criteria:**
- ✅ Can create backups
- ✅ Understand restore process
- ✅ Have backup schedule

**Homework:**
- Create: Weekly backup reminder
- Document: Backup/restore procedures for team

---

### Day 3: Orchestration & Scheduling (1 hour)

**Objective:** Automate the automations with cron

**Tasks:**
1. **Understanding Orchestrator** (20 min)
   ```bash
   # Review orchestrator
   cat automation/scripts/automation-orchestrator.mjs | head -100

   # Understand schedules:
   # - Daily: Review requests (M-F, 9 AM)
   # - Weekly: GBP posts (Mon, 7 AM)
   # - Monthly: Suburb pages (1st, 9 AM)

   # Run manually
   npm run automation:scheduled
   ```

2. **Cron Setup** (30 min)
   ```bash
   # View current crontab
   crontab -l

   # Edit crontab (with team lead supervision)
   crontab -e

   # Add recommended schedules:
   # Daily automation (6 AM)
   0 6 * * * cd /path/to/tpp && npm run automation:scheduled

   # Health monitoring (every 6 hours)
   0 */6 * * * cd /path/to/tpp && npm run automation:monitor

   # Weekly dashboard (Monday 9 AM)
   0 9 * * 1 cd /path/to/tpp && npm run automation:health
   ```

3. **Monitoring Cron** (10 min)
   ```bash
   # Check cron logs
   cat automation/logs/cron.log

   # Verify cron runs
   # Wait for next scheduled run
   # Check logs again
   ```

**Success Criteria:**
- ✅ Understand orchestrator
- ✅ Can configure cron
- ✅ Can monitor cron execution

**Homework:**
- Document: Cron schedule for your team
- Test: Verify cron runs successfully

---

### Day 4: Integration & Workflows (45 min)

**Objective:** Connect automations to other tools

**Tasks:**
1. **Review Integration Options** (20 min)
   ```bash
   # Read integration templates
   cat automation/CUSTOMIZATION-TEMPLATES.md | grep -A 50 "Integration Templates"

   # Available integrations:
   # - SendGrid (email automation)
   # - Slack (notifications)
   # - Webhooks (custom)
   ```

2. **Slack Notifications** (15 min)
   - Review: Slack webhook setup
   - Understand: When to send notifications
     - Automation failures
     - Health warnings
     - Daily summaries

   - Plan: Which notifications your team needs

3. **Workflow Design** (10 min)
   - Design: Your team's ideal workflow
   - Example:
     ```
     Monday AM:
     1. Cron runs automations
     2. Slack notification sent
     3. Team lead reviews quality
     4. Content scheduled for week
     5. Dashboard reviewed in standup
     ```

**Success Criteria:**
- ✅ Understand integration options
- ✅ Designed team workflow
- ✅ Know when to use integrations

---

### Day 5: Performance & Optimization (30 min)

**Objective:** Optimize for speed and cost

**Tasks:**
1. **Performance Review** (15 min)
   ```bash
   # Read benchmarks
   cat automation/PERFORMANCE-BENCHMARKS.md | head -200

   # Compare your results to benchmarks:
   # - Suburb pages: ~45 sec (target)
   # - GBP posts: ~30 sec (target)
   # - Your actual times: ?

   # Identify any performance issues
   ```

2. **Cost Optimization** (15 min)
   ```bash
   # Calculate current costs
   npm run automation:cost-estimate

   # Review monthly usage
   npm run automation:status

   # Identify optimization opportunities:
   # - Reduce frequency?
   # - Lower max_tokens?
   # - Skip optional generations?
   ```

**Success Criteria:**
- ✅ Understand performance targets
- ✅ Can optimize costs
- ✅ Know ROI metrics

**Week 2 Assessment:**
- Run through this checklist:
  - [ ] Can customize automations
  - [ ] Can manage backups
  - [ ] Understand cron scheduling
  - [ ] Know integration options
  - [ ] Can optimize performance

---

## 🎓 Week 3: Independence & Mastery

### Day 1: Solo Operations (1 hour)

**Objective:** Handle complete workflow independently

**Tasks:**
1. **Morning Routine** (20 min)
   ```bash
   # Without guidance, complete:
   # 1. Health check
   # 2. Review alerts
   # 3. Check automation status
   # 4. Review generated content
   # 5. Analyze quality
   ```

2. **Content Generation** (20 min)
   ```bash
   # Generate content independently:
   # 1. Run suburb pages
   # 2. Analyze quality
   # 3. Identify improvements
   # 4. Make edits
   # 5. Create backup
   ```

3. **Problem Solving** (20 min)
   - Scenario: Health score drops to 75%
   - Task: Diagnose and fix without help
   - Use: Troubleshooting flowchart
   - Document: Your solution

**Success Criteria:**
- ✅ Complete workflow without supervision
- ✅ Solve problem independently
- ✅ Confident in daily tasks

---

### Day 2: Advanced Troubleshooting (45 min)

**Objective:** Handle complex issues

**Tasks:**
1. **Complex Scenarios** (30 min)
   - Scenario 1: Automation fails partway through
     - Diagnose: Check logs
     - Fix: Identify root cause
     - Prevent: Document prevention

   - Scenario 2: Quality suddenly drops
     - Analyze: Run quality checks
     - Compare: Historical data
     - Fix: Adjust prompts

   - Scenario 3: System migration needed
     - Review: Migration guide
     - Plan: Steps to migrate
     - Document: Migration checklist

2. **Emergency Procedures** (15 min)
   - Review: Emergency recovery procedures
   - Practice: System restore from backup
   - Document: Emergency contacts

**Success Criteria:**
- ✅ Handle complex issues
- ✅ Know emergency procedures
- ✅ Can migrate system

---

### Day 3: Team Training (30 min)

**Objective:** Train another team member

**Tasks:**
1. **Prepare Training** (10 min)
   - Choose: One automation to teach
   - Prepare: Demo script
   - Practice: Explanation

2. **Deliver Training** (15 min)
   - Teach: Another team member
   - Demonstrate: How to run automation
   - Supervise: Their first run
   - Answer: Questions

3. **Documentation** (5 min)
   - Document: Training given
   - Note: Questions asked
   - Improve: Training materials

**Success Criteria:**
- ✅ Successfully train someone
- ✅ Can explain clearly
- ✅ Build confidence teaching

---

### Day 4: Optimization Projects (30 min)

**Objective:** Improve the system

**Tasks:**
1. **Identify Improvements** (15 min)
   - Review: 2 weeks of usage
   - Identify: Pain points
   - Propose: Improvements
   - Example improvements:
     - Better prompt for your industry
     - Additional quality checks
     - Custom reporting format
     - New integration

2. **Implement Improvement** (15 min)
   - Choose: One small improvement
   - Implement: With team lead approval
   - Test: Verify improvement
   - Document: Changes made

**Success Criteria:**
- ✅ Identify improvement opportunities
- ✅ Implement one improvement
- ✅ Document changes

---

### Day 5: Final Assessment (30 min)

**Objective:** Demonstrate full competency

**Complete Workflow Test:**
```bash
# 1. Environment check
npm run automation:verify-env

# 2. Generate content
npm run automation:suburb-pages

# 3. Quality analysis
npm run automation:analyze-content

# 4. Edit low-quality content
# (Choose lowest scoring, improve it)

# 5. Re-analyze
npm run automation:analyze-content [edited-file]

# 6. Create backup
npm run automation:backup

# 7. Health check
npm run automation:health

# 8. Review dashboard
open automation/reports/health-dashboard.html

# 9. Calculate costs
npm run automation:cost-estimate

# 10. Document completion
```

**Final Certification Checklist:**
- [ ] Can set up system independently
- [ ] Understand all 20 npm commands
- [ ] Can run daily workflows
- [ ] Can analyze and improve quality
- [ ] Can troubleshoot common issues
- [ ] Can create/restore backups
- [ ] Understand cron scheduling
- [ ] Can customize for brand
- [ ] Can optimize performance
- [ ] Can train others

---

## 📚 Reference Materials

### Essential Reading (Required)
1. `🚀-START-AUTOMATION.md` - 3-step quick start
2. `automation/QUICK-REFERENCE.md` - Daily commands
3. `automation/WORKFLOW-GUIDE.md` - Complete workflows
4. `automation/TROUBLESHOOTING-FLOWCHART.md` - Problem solving

### Advanced Reading (Recommended)
5. `automation/PERFORMANCE-BENCHMARKS.md` - Performance data
6. `automation/CUSTOMIZATION-TEMPLATES.md` - Customization
7. `automation/MAINTENANCE-GUIDE.md` - Long-term maintenance
8. `automation/SYSTEM-OVERVIEW.md` - Complete reference

### Quick References (Print These)
9. `automation/QUICK-REFERENCE.md` - Keep at desk
10. Command cheat sheet (create your own)

---

## 🎯 Competency Levels

### Level 1: Beginner (End of Week 1)
- ✅ Can run automations
- ✅ Understand basic workflows
- ✅ Know where to find help
- **Can handle:** 40% of tasks independently

### Level 2: Intermediate (End of Week 2)
- ✅ Can customize automations
- ✅ Understand all features
- ✅ Handle common issues
- **Can handle:** 80% of tasks independently

### Level 3: Advanced (End of Week 3)
- ✅ Complete independence
- ✅ Optimize performance
- ✅ Train others
- **Can handle:** 95%+ of tasks independently

### Level 4: Expert (After 3 months)
- ✅ Deep system knowledge
- ✅ Create improvements
- ✅ Strategic planning
- **Can handle:** 100% + innovations

---

## 👥 Team Roles & Responsibilities

### Team Lead
- Oversees all automations
- Reviews quality before publishing
- Manages API keys and access
- Approves customizations
- Handles escalations

### Automation Specialist (You)
- Runs daily workflows
- Monitors health
- Analyzes quality
- Creates backups
- First-line troubleshooting

### Content Editor
- Reviews AI-generated content
- Improves low-quality pieces
- Adds brand voice
- Publishes final content

### Developer (Optional)
- Customizes scripts
- Creates integrations
- Optimizes performance
- Implements new features

---

## 📞 Support Channels

### Level 1: Self-Service
```bash
# Quick diagnostics
npm run automation:verify-env
npm run automation:test
npm run automation:status:quick

# Documentation
cat automation/TROUBLESHOOTING-FLOWCHART.md
cat automation/QUICK-REFERENCE.md
```

### Level 2: Team Lead
- Common issues you can't solve
- Customization approvals
- Access/permissions issues
- Strategic questions

### Level 3: Developer
- System failures
- Custom development
- Integration issues
- Performance problems

---

## 🎓 Continuing Education

### Monthly (30 min)
- Review new features/updates
- Read changelog
- Try new capabilities
- Share learnings with team

### Quarterly (2 hours)
- Deep dive on one advanced topic
- Propose system improvements
- Update team documentation
- Performance optimization

### Annually (1 day)
- Complete system audit
- Major optimization project
- Team training refresh
- Strategic planning

---

## ✅ Onboarding Completion

Congratulations! By completing this 3-week program, you are now:

✅ **Fully Operational** - Can handle 95%+ of tasks independently
✅ **Quality Focused** - Understand and improve content quality
✅ **Self-Sufficient** - Can troubleshoot most issues
✅ **Team Ready** - Can train and support others
✅ **Optimization Minded** - Can improve system performance

**Next Steps:**
1. Schedule: Monthly check-in with team lead
2. Document: Your first month learnings
3. Improve: Propose one system enhancement
4. Teach: Onboard the next team member

---

**🎉 Welcome to the team! You're now ready to dominate local SEO with automation.**

**Last Updated:** January 19, 2025
**Version:** 2.1.0
