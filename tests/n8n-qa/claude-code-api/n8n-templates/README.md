# n8n Templates for Claude Code Integration

These templates show how to use the FREE local Claude Code API in your n8n workflows.

## Templates Included

### 1. General AI Request (`claude-http-request.json`)
Basic HTTP Request node configured for Claude Code API.

**Usage in n8n**:
1. Add **HTTP Request** node
2. Configure:
   - Method: `POST`
   - URL: `http://localhost:3000/api/claude`
   - Body (JSON):
     ```json
     {
       "prompt": "{{ $json.userMessage }}",
       "context": "{{ $json.additionalInfo }}"
     }
     ```

**Response**:
```json
{
  "success": true,
  "response": "AI response here...",
  "model": "claude-sonnet-4.5",
  "timestamp": "2025-10-04T..."
}
```

### 2. Code Analysis
Analyze code with AI feedback.

**HTTP Request Configuration**:
```
URL: http://localhost:3000/api/claude/analyze
Method: POST

Body:
{
  "code": "{{ $json.codeToAnalyze }}",
  "language": "javascript",
  "task": "review"
}
```

**Tasks**: `review`, `fix`, `optimize`, `explain`, `test`

### 3. Content Generation
Generate SEO-optimized content.

**HTTP Request Configuration**:
```
URL: http://localhost:3000/api/claude/generate
Method: POST

Body:
{
  "type": "blog post",
  "topic": "{{ $json.topic }}",
  "keywords": ["automation", "workflow"],
  "tone": "professional",
  "length": "medium"
}
```

### 4. SEO Analysis
Analyze content for SEO improvements.

**HTTP Request Configuration**:
```
URL: http://localhost:3000/api/claude/seo
Method: POST

Body:
{
  "content": "{{ $json.pageContent }}",
  "keywords": ["seo", "optimization"],
  "url": "{{ $json.pageUrl }}"
}
```

### 5. Data Analysis
Analyze data and get insights.

**HTTP Request Configuration**:
```
URL: http://localhost:3000/api/claude/analyze-data
Method: POST

Body:
{
  "data": {{ $json.analyticsData }},
  "question": "What are the key trends?"
}
```

## Example Workflows

### Example 1: AI-Powered Content Pipeline

```
[Trigger: Webhook]
    ↓
[Set: Extract topic and keywords]
    ↓
[HTTP Request: Claude Code - Generate Content]
    URL: http://localhost:3000/api/claude/generate
    Body: {
      "type": "blog post",
      "topic": "{{ $json.topic }}",
      "keywords": {{ $json.keywords }},
      "length": "long"
    }
    ↓
[Set: Extract generated content]
    ↓
[HTTP Request: Publish to CMS]
    ↓
[Respond to Webhook]
```

### Example 2: Automated Code Review

```
[Trigger: GitHub Webhook - PR Created]
    ↓
[GitHub: Get PR Files]
    ↓
[Loop: For each file]
    ↓
[HTTP Request: Claude Code - Analyze]
    URL: http://localhost:3000/api/claude/analyze
    Body: {
      "code": "{{ $json.fileContent }}",
      "language": "{{ $json.fileExtension }}",
      "task": "review"
    }
    ↓
[Set: Format review comments]
    ↓
[GitHub: Post review comment]
```

### Example 3: SEO Optimization Workflow

```
[Trigger: Schedule - Daily]
    ↓
[HTTP Request: Fetch website pages]
    ↓
[Loop: For each page]
    ↓
[HTTP Request: Claude Code - SEO Analysis]
    URL: http://localhost:3000/api/claude/seo
    Body: {
      "url": "{{ $json.pageUrl }}",
      "content": "{{ $json.pageContent }}",
      "keywords": ["target", "keywords"]
    }
    ↓
[Set: Extract recommendations]
    ↓
[IF: Score < 80]
    ↓
[Email: Send SEO improvement report]
```

### Example 4: Competitive Analysis

```
[Trigger: Schedule - Weekly]
    ↓
[HTTP Request: Scrape competitor data]
    ↓
[HTTP Request: Claude Code - Data Analysis]
    URL: http://localhost:3000/api/claude/analyze-data
    Body: {
      "data": {{ $json.competitorData }},
      "question": "Analyze competitive landscape and suggest strategies"
    }
    ↓
[Set: Extract insights]
    ↓
[Notion: Create strategic report]
    ↓
[Slack: Notify team]
```

### Example 5: Smart Customer Support

```
[Trigger: Webhook - New support ticket]
    ↓
[HTTP Request: Claude Code - Classify]
    URL: http://localhost:3000/api/claude
    Body: {
      "prompt": "Classify this support ticket: {{ $json.message }}",
      "context": "Categories: technical, billing, general"
    }
    ↓
[Switch: Route by category]
    ├─ Technical → Engineering team
    ├─ Billing → Finance team
    └─ General → Support team
    ↓
[HTTP Request: Claude Code - Generate response]
    URL: http://localhost:3000/api/claude
    Body: {
      "prompt": "Draft professional response to: {{ $json.message }}",
      "context": "Company tone: friendly but professional"
    }
    ↓
[Email: Send suggested response to agent]
```

## Quick Setup in n8n

### Step 1: Add HTTP Request Node

1. In n8n workflow editor, click **+** to add node
2. Search for "HTTP Request"
3. Add **HTTP Request** node

### Step 2: Configure Node

**Basic Settings**:
- **Authentication**: None
- **Request Method**: POST
- **URL**: `http://localhost:3000/api/claude`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "prompt": "{{ $json.prompt }}",
  "context": "{{ $json.context }}"
}
```

### Step 3: Use Response

The response will be in `$json`:
```javascript
// Access AI response
{{ $json.response }}

// Access metadata
{{ $json.model }}      // "claude-sonnet-4.5"
{{ $json.timestamp }}  // ISO date
{{ $json.success }}    // true/false
```

### Step 4: Error Handling

Add **IF** node after HTTP Request:

```
Expression: {{ $json.success === true }}

True → Process response
False → Handle error (log, notify, retry)
```

## Testing

### Test with Postman/cURL

```bash
# Test general endpoint
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a haiku about automation"
  }'

# Test content generation
curl -X POST http://localhost:3000/api/claude/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blog post",
    "topic": "Benefits of n8n",
    "length": "short"
  }'
```

### Test in n8n

1. Create simple workflow:
   - **Manual Trigger**
   - **Set** node with test data
   - **HTTP Request** to Claude API
   - **View** response

2. Execute workflow
3. Check output in execution log

## Tips & Best Practices

### 1. Use Timeouts
Set appropriate timeout (120s for long requests):
```
Options → Timeout: 120000
```

### 2. Handle Errors Gracefully
Always add error handling:
```
IF → {{ $json.success }}
  True → Continue
  False → Log error & notify
```

### 3. Cache Responses
For repeated requests, cache in n8n memory or database

### 4. Rate Limiting
Although free, be mindful of concurrent requests:
- Use **Split In Batches** node
- Add delays between requests

### 5. Monitor Performance
Track response times and adjust timeout if needed

### 6. Version Control
Export workflows regularly for backup

## Troubleshooting

### API Not Responding

```bash
# Check if service is running
ssh root@n8n.theprofitplatform.com.au 'systemctl status claude-code-api'

# Check logs
ssh root@n8n.theprofitplatform.com.au 'tail -f /opt/claude-code-api/logs/output.log'

# Restart service
ssh root@n8n.theprofitplatform.com.au 'sudo systemctl restart claude-code-api'
```

### n8n Connection Error

1. Verify n8n and API are on same server
2. Check firewall rules (should allow localhost)
3. Test with curl from n8n server

### Slow Responses

1. Increase timeout in HTTP Request node
2. Simplify prompt
3. Check server resources

## Support

- **Documentation**: See CLAUDE-CODE-N8N-INTEGRATION.md
- **API Server**: /opt/claude-code-api/ on VPS
- **Logs**: /opt/claude-code-api/logs/

---

**Ready to use FREE AI in your n8n workflows!** 🚀
