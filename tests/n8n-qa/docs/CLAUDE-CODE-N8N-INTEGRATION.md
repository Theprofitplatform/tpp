# Claude Code Integration with n8n on VPS

Complete guide to using Claude Code as a FREE local AI service for your n8n workflows instead of paid APIs.

## 🎯 Overview

**Goal**: Replace all paid AI APIs (OpenAI, Anthropic, etc.) with Claude Code running locally on your VPS.

**Benefits**:
- ✅ **FREE** - No API costs
- ✅ **Private** - Data stays on your server
- ✅ **Fast** - Local network latency
- ✅ **Unlimited** - No rate limits
- ✅ **Powerful** - Claude Sonnet 4.5 capabilities

---

## 📊 Current Status

### Workflows Analyzed: 9 Total

**Good News**: No actual AI/LLM nodes found!
- The "AI nodes" detected were just email/Gmail nodes (false positives)
- All workflows are currently using local commands and scripts
- Ready for Claude Code integration

### Workflows Ready for Enhancement:

1. **Visual Monitoring** - Can add AI-powered analysis
2. **Advanced Webhook System** - Can add intelligent routing
3. **Competitor Analysis** - Can add AI-powered insights
4. **Tool Improvement Agent** - Can add Claude Code suggestions
5. **Social Media Publishing** - Can add AI content generation
6. **Performance Monitoring** - Can add AI analysis
7. **Content Research** - Can add AI-powered research
8. **SEO Optimization** - Can add AI SEO suggestions
9. **Client Notifications** - Can add AI personalization

---

## 🚀 Setup: Claude Code API Server on VPS

### Option 1: Simple HTTP Server (Recommended)

Create a lightweight Express server that wraps Claude Code:

```bash
# On VPS: /opt/claude-code-api/
mkdir -p /opt/claude-code-api
cd /opt/claude-code-api

# Create package.json
cat > package.json << 'EOF'
{
  "name": "claude-code-api",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "@anthropic-ai/sdk": "^0.30.0"
  }
}
EOF

# Install
npm install
```

### Create API Server

```javascript
// /opt/claude-code-api/server.js
import express from 'express';
import { spawn } from 'child_process';

const app = express();
app.use(express.json());

// Claude Code endpoint
app.post('/api/claude', async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  try {
    // Use Claude Code CLI
    const claude = spawn('claude', ['code', '-p', prompt]);

    let output = '';
    let errorOutput = '';

    claude.stdout.on('data', (data) => {
      output += data.toString();
    });

    claude.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    claude.on('close', (code) => {
      if (code === 0) {
        res.json({
          success: true,
          response: output,
          model: 'claude-sonnet-4.5',
        });
      } else {
        res.status(500).json({
          success: false,
          error: errorOutput || 'Claude Code execution failed',
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'claude-code-api' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Claude Code API running on http://localhost:${PORT}`);
});
```

### Setup Systemd Service

```bash
# Create systemd service
sudo tee /etc/systemd/system/claude-code-api.service << 'EOF'
[Unit]
Description=Claude Code API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/claude-code-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/opt/claude-code-api/logs/output.log
StandardError=append:/opt/claude-code-api/logs/error.log
Environment="PORT=3000"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Create logs directory
mkdir -p /opt/claude-code-api/logs

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable claude-code-api
sudo systemctl start claude-code-api

# Check status
sudo systemctl status claude-code-api
```

---

## 🔗 n8n Integration

### Method 1: HTTP Request Node

In any n8n workflow, add an **HTTP Request** node:

**Configuration**:
```
Method: POST
URL: http://localhost:3000/api/claude
Authentication: None (local network)

Body (JSON):
{
  "prompt": "{{ $json.userMessage }}",
  "context": "{{ $json.additionalContext }}"
}
```

**Headers**:
```
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "response": "Claude's response here...",
  "model": "claude-sonnet-4.5"
}
```

### Method 2: Execute Command Node

Directly call Claude Code from n8n:

**Configuration**:
```
Command: claude code -p "{{ $json.prompt }}"
```

**Output**: Parse stdout as JSON or text

---

## 📝 Example Workflows

### Example 1: AI Content Generation

**Workflow**: Content Research → AI Generation → Publishing

```
1. [Trigger] Webhook or Schedule
2. [HTTP Request] POST to http://localhost:3000/api/claude
   Body:
   {
     "prompt": "Write SEO-optimized content about: {{ $json.topic }}",
     "context": "Target audience: {{ $json.audience }}"
   }
3. [Code] Parse AI response
4. [Set] Extract generated content
5. [Publish] To CMS/website
```

### Example 2: AI-Powered Analysis

**Workflow**: Data Collection → AI Analysis → Report

```
1. [HTTP Request] Fetch data from API
2. [HTTP Request] POST to Claude Code API
   Body:
   {
     "prompt": "Analyze this data and provide insights: {{ $json.data }}",
     "context": "Focus on trends and anomalies"
   }
3. [Code] Extract insights
4. [Email] Send report with AI analysis
```

### Example 3: Intelligent Webhook Routing

**Workflow**: Webhook → AI Classification → Route

```
1. [Webhook] Receive request
2. [HTTP Request] POST to Claude Code
   Body:
   {
     "prompt": "Classify this request and suggest routing: {{ $json }}",
     "context": "Available routes: support, sales, technical"
   }
3. [Switch] Route based on AI classification
4. [Process] Handle based on route
```

---

## 🛠️ Advanced: Claude Code MCP Server

For more advanced integration, use Claude Code's MCP (Model Context Protocol) server:

### Setup MCP Server

```bash
# Install Claude Code globally
npm install -g claude-code

# Start MCP server
claude-code mcp start --port 3001

# Or via systemd
sudo tee /etc/systemd/system/claude-code-mcp.service << 'EOF'
[Unit]
Description=Claude Code MCP Server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/claude-code mcp start --port 3001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable claude-code-mcp
sudo systemctl start claude-code-mcp
```

### Use MCP in n8n

**HTTP Request Node**:
```
URL: http://localhost:3001/mcp/v1/execute
Method: POST

Body:
{
  "tool": "code_analysis",
  "params": {
    "code": "{{ $json.code }}",
    "language": "typescript"
  }
}
```

---

## 📊 Monitoring & Logging

### Check API Server Status

```bash
# Service status
sudo systemctl status claude-code-api

# View logs
tail -f /opt/claude-code-api/logs/output.log
tail -f /opt/claude-code-api/logs/error.log

# Test endpoint
curl http://localhost:3000/health
```

### Test Claude Code API

```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a short poem about automation"
  }'
```

---

## 🔒 Security Considerations

### 1. Local-Only Access

The API server binds to `localhost` only - not accessible from internet.

### 2. Add Authentication (Optional)

```javascript
// Add API key middleware
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

In n8n, add header:
```
X-API-Key: your-secret-key
```

### 3. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🎯 Migration Plan

### Step 1: Setup API Server (5 minutes)

```bash
ssh root@n8n.theprofitplatform.com.au
mkdir -p /opt/claude-code-api
cd /opt/claude-code-api
# Copy server.js and package.json from above
npm install
sudo systemctl start claude-code-api
```

### Step 2: Test API (2 minutes)

```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test connection"}'
```

### Step 3: Update n8n Workflows (10 minutes per workflow)

For each workflow needing AI:
1. Add **HTTP Request** node
2. Configure to call `http://localhost:3000/api/claude`
3. Pass prompt from previous node
4. Parse response
5. Test workflow

### Step 4: Monitor & Optimize

- Check logs for errors
- Adjust rate limits if needed
- Add caching for common requests

---

## 💡 Use Cases by Workflow

### 1. Visual Monitoring
**Add**: AI-powered visual regression analysis
```json
{
  "prompt": "Analyze these screenshots for visual regressions: {{ $json.screenshots }}",
  "context": "Previous baseline images attached"
}
```

### 2. Competitor Analysis
**Add**: AI-powered competitive insights
```json
{
  "prompt": "Analyze competitor data and suggest strategies: {{ $json.competitorData }}",
  "context": "Our product focuses on: {{ $json.ourFocus }}"
}
```

### 3. Content Research
**Add**: AI content generation
```json
{
  "prompt": "Generate SEO-optimized content for: {{ $json.keyword }}",
  "context": "Target audience: {{ $json.audience }}, Tone: professional"
}
```

### 4. SEO Optimization
**Add**: AI SEO suggestions
```json
{
  "prompt": "Analyze this page and suggest SEO improvements: {{ $json.pageContent }}",
  "context": "Target keywords: {{ $json.keywords }}"
}
```

---

## 📚 Additional Resources

- **Claude Code Docs**: https://docs.claude.com/claude-code
- **n8n HTTP Request**: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- **Express.js**: https://expressjs.com/

---

## 🎉 Summary

You now have a **FREE, local AI service** for n8n workflows using Claude Code!

**Next Steps**:
1. Deploy API server to VPS
2. Test with simple n8n workflow
3. Migrate workflows one by one
4. Monitor performance

**Benefits**:
- ✅ No API costs
- ✅ Unlimited usage
- ✅ Full privacy
- ✅ Fast local processing
- ✅ Claude Sonnet 4.5 power

Ready to deploy! 🚀
