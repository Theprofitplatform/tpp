# Claude Code API - VPS Deployment Guide

## Quick Deploy (Manual Steps)

### Step 1: SSH to VPS

```bash
ssh root@n8n.theprofitplatform.com.au
```

### Step 2: Create Directory

```bash
mkdir -p /opt/claude-code-api/{logs,systemd}
cd /opt/claude-code-api
```

### Step 3: Create server.js

```bash
cat > server.js << 'ENDOFFILE'
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/claude', async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    let fullPrompt = context ? `Context: ${context}\n\n${prompt}` : prompt;
    const { stdout } = await execAsync(`echo "${fullPrompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      response: stdout.trim(),
      model: 'claude-sonnet-4.5',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'claude-code-api' });
});

const PORT = 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Claude Code API on http://localhost:${PORT}`);
});
ENDOFFILE
```

### Step 4: Create package.json

```bash
cat > package.json << 'EOF'
{
  "name": "claude-code-api",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Create Systemd Service

```bash
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
```

### Step 7: Start Service

```bash
systemctl daemon-reload
systemctl enable claude-code-api
systemctl start claude-code-api
```

### Step 8: Verify

```bash
# Check status
systemctl status claude-code-api

# Test API
curl http://localhost:3000/health
```

## Use in n8n

### Add HTTP Request Node

**Configuration**:
- URL: `http://localhost:3000/api/claude`
- Method: `POST`
- Body (JSON):
  ```json
  {
    "prompt": "Your AI prompt here"
  }
  ```

**Response**:
```json
{
  "success": true,
  "response": "AI response...",
  "model": "claude-sonnet-4.5"
}
```

## Troubleshooting

```bash
# View logs
tail -f /opt/claude-code-api/logs/output.log

# Restart service
systemctl restart claude-code-api

# Check if Claude is installed
which claude
```

---

**That's it! FREE AI for n8n workflows!** 🎉
