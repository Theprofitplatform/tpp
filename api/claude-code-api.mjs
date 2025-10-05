#!/usr/bin/env node
/**
 * Claude Code Local API Server
 * Exposes Claude Code CLI as HTTP API for n8n integration
 */

import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.CLAUDE_API_PORT || 3100;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'claude-code-api' });
});

// Claude Code completion endpoint
app.post('/v1/complete', async (req, res) => {
    const { prompt, model, temperature = 0.7, max_tokens = 2000 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    try {
        // Use Claude Code CLI via stdio
        const claude = spawn('claude', ['--prompt', prompt, '--format', 'json'], {
            env: {
                ...process.env,
                CLAUDE_MODEL: model || 'claude-sonnet-4-5-20250929',
                CLAUDE_TEMPERATURE: temperature.toString(),
                CLAUDE_MAX_TOKENS: max_tokens.toString()
            }
        });

        let output = '';
        let errorOutput = '';

        claude.stdout.on('data', (data) => {
            output += data.toString();
        });

        claude.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        claude.on('close', (code) => {
            if (code !== 0) {
                console.error('Claude Code error:', errorOutput);
                return res.status(500).json({
                    error: 'Claude Code execution failed',
                    details: errorOutput
                });
            }

            try {
                // Try to parse JSON response
                const jsonMatch = output.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    res.json({
                        response: parsed,
                        raw: output,
                        model: model || 'claude-sonnet-4-5'
                    });
                } else {
                    // Return raw text if no JSON found
                    res.json({
                        response: output.trim(),
                        model: model || 'claude-sonnet-4-5'
                    });
                }
            } catch (parseError) {
                // If JSON parsing fails, return raw output
                res.json({
                    response: output.trim(),
                    model: model || 'claude-sonnet-4-5'
                });
            }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            claude.kill();
            res.status(504).json({ error: 'Request timeout' });
        }, 30000);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alternative: Use file-based approach
app.post('/v1/analyze', async (req, res) => {
    const { task, content, instructions } = req.body;

    if (!task) {
        return res.status(400).json({ error: 'task is required' });
    }

    const prompt = `
Task: ${task}

${content ? `Content:\n${content}\n` : ''}

${instructions || 'Respond with valid JSON only.'}
`.trim();

    try {
        const claude = spawn('claude', ['--', prompt]);

        let output = '';
        let errorOutput = '';

        claude.stdout.on('data', (data) => {
            output += data.toString();
        });

        claude.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        claude.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({
                    error: 'Analysis failed',
                    details: errorOutput
                });
            }

            res.json({
                result: output.trim(),
                task,
                timestamp: new Date().toISOString()
            });
        });

        setTimeout(() => {
            claude.kill();
            res.status(504).json({ error: 'Analysis timeout' });
        }, 45000);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SEO-specific endpoint
app.post('/v1/seo/analyze', async (req, res) => {
    const { title, content, keywords, target_location } = req.body;

    const prompt = `Analyze the following content for SEO optimization:

Title: ${title}
Content: ${content}
Keywords: ${keywords?.join(', ')}
Target Location: ${target_location || 'Australia'}

Provide detailed analysis including:
1. Keyword density and distribution
2. Title optimization score (0-100)
3. Heading structure recommendations
4. Meta description suggestions
5. Content readability score

Respond ONLY with valid JSON in this format:
{
  "keyword_density": {"primary_keywords": [], "density_percentage": 0, "recommendation": ""},
  "title_optimization": {"current_title": "", "score": 0, "suggestions": []},
  "heading_structure": {"h1_count": 0, "h2_count": 0, "hierarchy_valid": true},
  "readability_score": 0,
  "meta_description": ""
}`;

    try {
        const claude = spawn('claude', ['--', prompt]);

        let output = '';

        claude.stdout.on('data', (data) => {
            output += data.toString();
        });

        claude.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'SEO analysis failed' });
            }

            try {
                const jsonMatch = output.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    res.json({ response: result });
                } else {
                    res.json({ response: output.trim() });
                }
            } catch (e) {
                res.json({ response: output.trim() });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Keyword research endpoint
app.post('/v1/seo/keywords', async (req, res) => {
    const { title, content, current_keywords, target_location } = req.body;

    const prompt = `Generate advanced keyword research for:

Title: ${title}
Content: ${content}
Current Keywords: ${current_keywords?.join(', ')}
Target Location: ${target_location || 'Australia'}

Provide:
1. Long-tail keyword suggestions
2. Australian-specific keyword opportunities
3. Search intent analysis
4. Related keyword suggestions
5. Local SEO optimization keywords

Respond ONLY with valid JSON in this format:
{
  "long_tail_keywords": [],
  "australian_keywords": [],
  "search_intent": "",
  "related_keywords": [],
  "local_seo_keywords": []
}`;

    try {
        const claude = spawn('claude', ['--', prompt]);

        let output = '';

        claude.stdout.on('data', (data) => {
            output += data.toString();
        });

        claude.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Keyword research failed' });
            }

            try {
                const jsonMatch = output.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    res.json({ response: result });
                } else {
                    res.json({ response: output.trim() });
                }
            } catch (e) {
                res.json({ response: output.trim() });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Content optimization endpoint
app.post('/v1/seo/optimize', async (req, res) => {
    const { original_title, original_content, keywords, analysis, recommendations } = req.body;

    const prompt = `Rewrite and optimize the following content to achieve an SEO score above 80:

Original Title: ${original_title}
Original Content: ${original_content}
Target Keywords: ${keywords?.join(', ')}

SEO Analysis:
${JSON.stringify(analysis, null, 2)}

Recommendations:
${recommendations?.join('\n')}

Provide optimized content with:
1. Improved title (60-70 characters)
2. Enhanced content with better keyword density
3. Proper heading structure (H1, H2, H3)
4. Meta description (150-160 characters)
5. Australian market relevance (if applicable)

Respond ONLY with valid JSON in this format:
{
  "optimized_title": "",
  "optimized_content": "",
  "meta_description": "",
  "improvements_made": []
}`;

    try {
        const claude = spawn('claude', ['--', prompt]);

        let output = '';

        claude.stdout.on('data', (data) => {
            output += data.toString();
        });

        claude.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Content optimization failed' });
            }

            try {
                const jsonMatch = output.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    res.json({ response: result });
                } else {
                    res.json({ response: output.trim() });
                }
            } catch (e) {
                res.json({ response: output.trim() });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Claude Code API running on http://127.0.0.1:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  /health`);
    console.log(`  POST /v1/complete`);
    console.log(`  POST /v1/analyze`);
    console.log(`  POST /v1/seo/analyze`);
    console.log(`  POST /v1/seo/keywords`);
    console.log(`  POST /v1/seo/optimize`);
    console.log(`\nReady for n8n integration!`);
});
