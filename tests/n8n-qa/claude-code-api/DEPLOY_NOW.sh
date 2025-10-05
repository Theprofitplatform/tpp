#!/bin/bash
# Claude Code API - One-Command VPS Deployment
# Run this script on your VPS: bash DEPLOY_NOW.sh

set -e

echo "🚀 Deploying Claude Code API to VPS..."
echo "========================================"

# Step 1: Create directory
echo "📁 Creating directory..."
mkdir -p /opt/claude-code-api/{logs,systemd}
cd /opt/claude-code-api

# Step 2: Create server.js
echo "📝 Creating server.js..."
cat > server.js << 'ENDOFFILE'
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 1. General Claude endpoint
app.post('/api/claude', async (req, res) => {
  const { prompt, context, mode = 'default' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    console.log(`[Claude] Processing request: ${prompt.substring(0, 50)}...`);
    let fullPrompt = context ? `Context: ${context}\n\n${prompt}` : prompt;
    const { stdout } = await execAsync(`echo "${fullPrompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      response: stdout.trim(),
      model: 'claude-sonnet-4.5',
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Streaming endpoint
app.post('/api/claude/stream', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const child = exec(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`);

    child.stdout.on('data', (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk: chunk.toString() })}\n\n`);
    });

    child.on('close', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// 3. Code analysis endpoint
app.post('/api/claude/analyze', async (req, res) => {
  const { code, language, task = 'review' } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });

  try {
    const prompt = `Task: ${task}\nLanguage: ${language}\n\nAnalyze this code:\n\n${code}`;
    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      analysis: stdout.trim(),
      task,
      language,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Content generation endpoint
app.post('/api/claude/generate', async (req, res) => {
  const { type = 'content', topic, keywords = [], tone = 'professional', length = 'medium' } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic required' });

  try {
    const keywordList = keywords.length ? `Keywords: ${keywords.join(', ')}` : '';
    const prompt = `Generate a ${length} ${type} about: ${topic}\nTone: ${tone}\n${keywordList}`;

    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      content: stdout.trim(),
      metadata: { type, topic, keywords, tone, length, format: 'markdown' },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. SEO analysis endpoint
app.post('/api/claude/seo', async (req, res) => {
  const { content, keywords = [], url } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  try {
    const keywordList = keywords.length ? `Target keywords: ${keywords.join(', ')}` : '';
    const urlInfo = url ? `URL: ${url}` : '';
    const prompt = `SEO Analysis:\n${urlInfo}\n${keywordList}\n\nAnalyze this content for SEO:\n\n${content}`;

    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      analysis: stdout.trim(),
      keywords,
      url,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Data analysis endpoint
app.post('/api/claude/analyze-data', async (req, res) => {
  const { data, question } = req.body;
  if (!data) return res.status(400).json({ error: 'Data required' });

  try {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const prompt = question
      ? `${question}\n\nData:\n${dataStr}`
      : `Analyze this data:\n${dataStr}`;

    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      insights: stdout.trim(),
      question,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'claude-code-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 8. Status endpoint
app.get('/status', async (req, res) => {
  try {
    const { stdout: claudePath } = await execAsync('which claude');
    const { stdout: claudeVersion } = await execAsync('claude --version');

    res.json({
      claude: {
        available: true,
        path: claudePath.trim(),
        version: claudeVersion.trim(),
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      }
    });
  } catch (error) {
    res.json({
      claude: { available: false, error: error.message },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      }
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
  console.log('============================================================');
  console.log('🚀 Claude Code API Server');
  console.log('============================================================');
  console.log(`📡 Running on: http://localhost:${PORT}`);
  console.log('🤖 Model: Claude Sonnet 4.5');
  console.log('💰 Cost: FREE (local)');
  console.log('🔒 Access: Local only (secure)');
  console.log('============================================================');
  console.log('');
  console.log('Endpoints:');
  console.log('  POST /api/claude           - General AI requests');
  console.log('  POST /api/claude/stream    - Streaming responses');
  console.log('  POST /api/claude/analyze   - Code analysis');
  console.log('  POST /api/claude/generate  - Content generation');
  console.log('  POST /api/claude/seo       - SEO analysis');
  console.log('  POST /api/claude/analyze-data - Data analysis');
  console.log('  GET  /health               - Health check');
  console.log('  GET  /status               - Service status');
  console.log('============================================================');
});
ENDOFFILE

# Step 3: Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "claude-code-api",
  "version": "1.0.0",
  "type": "module",
  "description": "FREE Claude Code API for n8n workflows",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "NODE_ENV=development node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Step 4: Install dependencies
echo "⬇️  Installing dependencies..."
npm install

# Step 5: Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/claude-code-api.service << 'EOF'
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

[Install]
WantedBy=multi-user.target
EOF

# Step 6: Enable and start service
echo "🔧 Enabling and starting service..."
systemctl daemon-reload
systemctl enable claude-code-api
systemctl start claude-code-api

# Step 7: Wait and verify
echo "⏳ Waiting for service to start..."
sleep 3

# Step 8: Check status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
systemctl status claude-code-api --no-pager | head -10

echo ""
echo "🧪 Testing API..."
curl -s http://localhost:3000/health | jq '.' || curl -s http://localhost:3000/health

echo ""
echo ""
echo "============================================================"
echo "✅ Claude Code API is now running!"
echo "============================================================"
echo "📡 Endpoint: http://localhost:3000"
echo "🔍 View logs: tail -f /opt/claude-code-api/logs/output.log"
echo "🔄 Restart: systemctl restart claude-code-api"
echo "📊 Status: systemctl status claude-code-api"
echo "============================================================"
echo ""
echo "🎯 Next step: Use in n8n workflows!"
echo "   Add HTTP Request node → http://localhost:3000/api/claude"
echo "============================================================"
