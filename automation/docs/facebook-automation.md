# Facebook Automation System

Complete automation system for Facebook posting with scheduling, monitoring, and analytics.

## Overview

The Facebook automation system provides three levels of automation:

1. **Manual Posting** - Generate optimized Facebook content for copy/paste
2. **API Posting** - Direct posting via Facebook Graph API
3. **Full Automation** - Scheduled posting with monitoring and analytics

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Automation    │    │     Scheduler    │    │    Analytics    │
│   Orchestrator  │◄──►│                  │◄──►│                 │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Content Generator│    │  Facebook API    │    │ Performance Data│
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. Facebook Automation Orchestrator (`facebook-automation.js`)

**Purpose**: Main coordination system that manages the entire automation workflow.

**Features**:
- Content generation and optimization
- State management (posting limits, schedule tracking)
- Error handling and retry logic
- Integration with all other components

**Usage**:
```bash
# Generate and post specific blog
node automation/scripts/facebook-automation.js <blog-slug>

# Run automated check
node automation/scripts/facebook-automation.js --auto

# Show automation status
node automation/scripts/facebook-automation.js --status
```

### 2. Facebook Scheduler (`facebook-scheduler.js`)

**Purpose**: Automated scheduling system that runs in the background.

**Features**:
- 5-minute interval checks
- Automated posting at optimal times
- Discord notifications
- Graceful shutdown handling

**Usage**:
```bash
# Start the scheduler
node automation/scripts/facebook-scheduler.js start

# Stop the scheduler
node automation/scripts/facebook-scheduler.js stop

# Force immediate check
node automation/scripts/facebook-scheduler.js force

# Show scheduler status
node automation/scripts/facebook-scheduler.js status
```

### 3. Facebook Analytics (`facebook-analytics.js`)

**Purpose**: Performance tracking and analytics system.

**Features**:
- Engagement metrics tracking
- Weekly performance reports
- Best-performing content analysis
- Audience growth monitoring

**Usage**:
```bash
# Generate weekly report
node automation/scripts/facebook-analytics.js report

# Get performance insights
node automation/scripts/facebook-analytics.js insights

# Show best performing posts
node automation/scripts/facebook-analytics.js best

# Show analytics status
node automation/scripts/facebook-analytics.js status
```

### 4. Facebook Generator (`facebook-generator.js`)

**Purpose**: Content generation optimized for Facebook algorithm.

**Features**:
- 80-150 word optimal length
- Strategic hashtag placement
- Engagement questions
- Visual element suggestions
- Sydney-specific localization

### 5. Facebook Poster (`facebook-poster.js`)

**Purpose**: Direct Facebook API integration for automated posting.

**Features**:
- Manual copy/paste method
- API posting method
- Error handling and retry logic
- Comprehensive setup instructions

## Configuration

### Posting Schedule
- **Monday**: 09:30 AEST
- **Wednesday**: 14:00 AEST
- **Friday**: 11:00 AEST

### Content Limits
- **Max Posts Per Week**: 3
- **Min Days Between Posts**: 2
- **Preferred Categories**: SEO, Marketing, Business, Technology

### API Settings
- **Max Retries**: 3
- **Retry Delay**: 5 seconds
- **Timeout**: 30 seconds

## Setup Instructions

### 1. Manual Posting (Recommended for Start)

No setup required. The system will generate optimized Facebook posts that you can copy/paste manually.

```bash
# Generate Facebook post for manual posting
node automation/scripts/facebook-automation.js <blog-slug>
```

### 2. API Posting (Advanced)

#### Step 1: Create Facebook App
1. Go to https://developers.facebook.com/apps/
2. Create a new Business App
3. Add your Facebook Page to the app

#### Step 2: Configure Permissions
Required permissions:
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`

#### Step 3: Get Access Token
1. Go to https://developers.facebook.com/tools/explorer/
2. Select your app and page
3. Generate a long-lived Page Access Token

#### Step 4: Add to Environment
Add to `.env.local`:
```
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_access_token_here
```

#### Step 5: Test API Posting
```bash
# Test API posting
node automation/scripts/facebook-automation.js <blog-slug> --api
```

### 3. Full Automation

#### Step 1: Start Scheduler
```bash
node automation/scripts/facebook-scheduler.js start
```

#### Step 2: Configure Notifications (Optional)
Add Discord webhook URL to `.env.local`:
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## Content Optimization

### Facebook Algorithm Best Practices

1. **Length**: 80-150 words (optimal for Facebook reach)
2. **Structure**:
   - Opening: Shocking statistic or relatable problem
   - Story: Real Sydney business case study
   - Solution: Clear benefit of the tools
   - Visual Note: Mention adding relevant images
   - Engagement: Question at the end
   - CTA: Clear call-to-action

3. **Hashtag Strategy**:
   - Location: `#SydneySmallBusiness`, `#SydneyBusiness`
   - Benefit: `#FreeSEOTools`, `#GoogleRanking`
   - Niche: `#LocalSEO`, `#DigitalMarketingSydney`

4. **Engagement Optimization**:
   - Posts with questions get 2x more engagement
   - Posts with images get 2.3x more engagement
   - Local references increase relevance by 47%
   - Question at end drives 3x more comments

## Error Handling

### Common Issues

1. **API Credentials Missing**
   - Check `.env.local` for `FACEBOOK_PAGE_ID` and `FACEBOOK_ACCESS_TOKEN`
   - Verify token permissions and expiration

2. **Rate Limiting**
   - System automatically retries up to 3 times
   - 5-second delay between retries

3. **Content Generation Failures**
   - Fallback to manual posting method
   - Error logged with detailed information

### Monitoring

- Scheduler runs every 5 minutes
- Discord notifications for success/error
- Analytics tracking for all posts
- Weekly performance reports

## Data Storage

### State Files
- `automation/data/facebook-state.json` - Automation state and limits
- `automation/data/facebook-analytics.json` - Performance data

### Content Files
- `automation/content-variants/<blog-slug>/facebook.txt` - Generated posts
- `automation/content-variants/<blog-slug>/metadata.json` - Post metadata

## Integration with Blog System

The Facebook automation system integrates seamlessly with the existing blog automation:

1. **Content Discovery**: Automatically finds new blog posts
2. **Variant Generation**: Creates Facebook-optimized content
3. **Scheduling**: Posts at optimal times for Sydney audience
4. **Analytics**: Tracks performance and engagement

## Security Considerations

- API tokens stored in `.env.local` (not committed to git)
- Rate limiting to prevent API abuse
- Error handling prevents infinite loops
- Graceful shutdown for scheduler

## Performance Metrics

### Tracked Metrics
- Engagement rate (likes, comments, shares)
- Reach and impressions
- Click-through rates
- Audience growth
- Best-performing content categories

### Reporting
- Weekly performance reports
- Best performing posts analysis
- Audience growth trends
- Content optimization insights

## Troubleshooting

### Scheduler Not Running
- Check if scheduler is started: `node facebook-scheduler.js status`
- Verify no errors in console output
- Check Discord notifications (if configured)

### Posts Not Generating
- Verify blog slug exists in `src/content/blog/`
- Check Claude API key in `.env.local`
- Review error messages in console

### API Posting Failing
- Verify Facebook credentials in `.env.local`
- Check token permissions and expiration
- Review Facebook API error messages

## Support

For issues with the Facebook automation system:

1. Check the console output for error messages
2. Verify all environment variables are set
3. Test manual posting first
4. Review Facebook Developer documentation for API issues

## Future Enhancements

- Image upload support
- Advanced analytics with Facebook Insights API
- A/B testing for content optimization
- Multi-page management
- Advanced scheduling options