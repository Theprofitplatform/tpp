/**
 * Claude Code API Server for n8n Integration
 *
 * Provides a local HTTP API to use Claude Code in n8n workflows
 * NO PAID APIS - completely free and local
 */

import express from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const app = express();

app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===== MAIN CLAUDE CODE ENDPOINT =====
app.post('/api/claude', async (req, res) => {
  const { prompt, context, mode = 'default', files = [] } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  try {
    console.log(`[Claude] Processing request: ${prompt.substring(0, 100)}...`);

    // Build command with context if provided
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = `Context: ${context}\n\nTask: ${prompt}`;
    }

    // Create temp directory for this request
    const tempDir = `/tmp/claude-${Date.now()}`;
    await fs.mkdir(tempDir, { recursive: true });

    // Write prompt to file
    const promptFile = path.join(tempDir, 'prompt.txt');
    await fs.writeFile(promptFile, fullPrompt);

    // Write any additional files
    for (const file of files) {
      const filePath = path.join(tempDir, file.name);
      await fs.writeFile(filePath, file.content);
    }

    // Execute Claude Code
    const command = `cd ${tempDir} && echo "${fullPrompt.replace(/"/g, '\\"')}" | claude code`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minutes
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd: tempDir,
    });

    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true });

    res.json({
      success: true,
      response: stdout.trim(),
      model: 'claude-sonnet-4.5',
      mode: mode,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Claude] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr || null,
    });
  }
});

// ===== STREAMING ENDPOINT =====
app.post('/api/claude/stream', async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullPrompt = prompt;
  if (context) {
    fullPrompt = `Context: ${context}\n\n${prompt}`;
  }

  const claude = spawn('claude', ['code', '-p', fullPrompt]);

  claude.stdout.on('data', (data) => {
    res.write(`data: ${JSON.stringify({ chunk: data.toString() })}\n\n`);
  });

  claude.stderr.on('data', (data) => {
    res.write(`data: ${JSON.stringify({ error: data.toString() })}\n\n`);
  });

  claude.on('close', (code) => {
    res.write(`data: ${JSON.stringify({ done: true, exitCode: code })}\n\n`);
    res.end();
  });
});

// ===== CODE ANALYSIS ENDPOINT =====
app.post('/api/claude/analyze', async (req, res) => {
  const { code, language = 'javascript', task = 'review' } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const tasks = {
    review: 'Review this code and suggest improvements',
    fix: 'Find and fix bugs in this code',
    optimize: 'Optimize this code for performance',
    explain: 'Explain what this code does',
    test: 'Generate test cases for this code',
  };

  const prompt = `${tasks[task] || tasks.review}:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024,
    });

    res.json({
      success: true,
      analysis: stdout.trim(),
      task: task,
      language: language,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== CONTENT GENERATION ENDPOINT =====
app.post('/api/claude/generate', async (req, res) => {
  const {
    type = 'content',
    topic,
    keywords = [],
    tone = 'professional',
    length = 'medium',
    format = 'markdown'
  } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const lengthMap = {
    short: '200-300 words',
    medium: '500-800 words',
    long: '1000-1500 words',
  };

  const prompt = `Generate ${type} about: ${topic}

Requirements:
- Length: ${lengthMap[length] || lengthMap.medium}
- Tone: ${tone}
- Format: ${format}
- Include keywords: ${keywords.join(', ')}
- SEO optimized
- Engaging and informative

Generate the content now:`;

  try {
    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({
      success: true,
      content: stdout.trim(),
      metadata: {
        type,
        topic,
        keywords,
        tone,
        length,
        format,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== SEO ANALYSIS ENDPOINT =====
app.post('/api/claude/seo', async (req, res) => {
  const { url, content, keywords = [] } = req.body;

  if (!content && !url) {
    return res.status(400).json({ error: 'Content or URL required' });
  }

  const prompt = `Analyze this content for SEO and provide specific improvements:

${url ? `URL: ${url}` : ''}
Target Keywords: ${keywords.join(', ')}

Content:
${content}

Provide:
1. SEO score (0-100)
2. Title tag suggestions
3. Meta description suggestions
4. Header optimization
5. Keyword density analysis
6. Internal linking suggestions
7. Content improvements`;

  try {
    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024,
    });

    res.json({
      success: true,
      analysis: stdout.trim(),
      url: url,
      keywords: keywords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== DATA ANALYSIS ENDPOINT =====
app.post('/api/claude/analyze-data', async (req, res) => {
  const { data, question, format = 'json' } = req.body;

  if (!data || !question) {
    return res.status(400).json({ error: 'Data and question are required' });
  }

  const prompt = `Analyze this data and answer the question:

Data (${format}):
${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}

Question: ${question}

Provide insights, trends, and actionable recommendations.`;

  try {
    const { stdout } = await execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | claude code`, {
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024,
    });

    res.json({
      success: true,
      insights: stdout.trim(),
      question: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'claude-code-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ===== STATUS ENDPOINT =====
app.get('/status', async (req, res) => {
  try {
    // Check if Claude is available
    const { stdout } = await execAsync('which claude');
    const claudePath = stdout.trim();

    // Get version
    let version = 'unknown';
    try {
      const { stdout: versionOutput } = await execAsync('claude --version');
      version = versionOutput.trim();
    } catch (e) {
      // Version command might not exist
    }

    res.json({
      claude: {
        available: !!claudePath,
        path: claudePath,
        version: version,
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    res.status(500).json({
      claude: {
        available: false,
        error: error.message,
      },
    });
  }
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log('🚀 Claude Code API Server');
  console.log('='.repeat(60));
  console.log(`📡 Running on: http://${HOST}:${PORT}`);
  console.log(`🤖 Model: Claude Sonnet 4.5`);
  console.log(`💰 Cost: FREE (local)`);
  console.log(`🔒 Access: Local only (secure)`);
  console.log('='.repeat(60));
  console.log('\nEndpoints:');
  console.log('  POST /api/claude           - General AI requests');
  console.log('  POST /api/claude/stream    - Streaming responses');
  console.log('  POST /api/claude/analyze   - Code analysis');
  console.log('  POST /api/claude/generate  - Content generation');
  console.log('  POST /api/claude/seo       - SEO analysis');
  console.log('  POST /api/claude/analyze-data - Data analysis');
  console.log('  GET  /health               - Health check');
  console.log('  GET  /status               - Service status');
  console.log('='.repeat(60));
});

export default app;
