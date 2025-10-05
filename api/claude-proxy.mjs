#!/usr/bin/env node
/**
 * Simplified Claude Code Proxy for n8n
 * Uses direct text responses instead of spawning processes
 */

import express from 'express';

const app = express();
const PORT = process.env.CLAUDE_API_PORT || 3100;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'claude-proxy' });
});

// Mock SEO analysis (returns structured data immediately)
app.post('/v1/seo/analyze', (req, res) => {
    const { title, content, keywords } = req.body;

    const wordCount = content?.split(/\s+/).length || 0;
    const titleLength = title?.length || 0;
    const keywordDensity = keywords?.length ? (keywords.length / wordCount * 100).toFixed(2) : 0;

    // Calculate title score
    let titleScore = 50;
    if (titleLength >= 50 && titleLength <= 70) titleScore = 90;
    else if (titleLength >= 40 && titleLength < 90) titleScore = 70;

    // Calculate readability (simple Flesch-Kincaid approximation)
    const avgWordLength = content ? content.length / wordCount : 0;
    const readabilityScore = Math.min(Math.max(100 - (avgWordLength * 5), 30), 100);

    res.json({
        response: {
            keyword_density: {
                primary_keywords: keywords || [],
                density_percentage: parseFloat(keywordDensity),
                recommendation: keywordDensity < 2 ? "Increase keyword usage" : "Good keyword density"
            },
            title_optimization: {
                current_title: title,
                score: titleScore,
                suggestions: titleScore < 80 ? ["Aim for 50-70 characters", "Include primary keyword"] : ["Title is well optimized"]
            },
            heading_structure: {
                h1_count: content?.match(/<h1>/gi)?.length || 0,
                h2_count: content?.match(/<h2>/gi)?.length || 0,
                hierarchy_valid: true
            },
            readability_score: Math.round(readabilityScore),
            meta_description: `${content?.substring(0, 150)}...` || ""
        }
    });
});

// Mock keyword research
app.post('/v1/seo/keywords', (req, res) => {
    const { title, current_keywords, target_location } = req.body;

    const isAustralian = target_location?.toLowerCase().includes('austral');

    res.json({
        response: {
            long_tail_keywords: [
                `best ${current_keywords?.[0]} services`,
                `affordable ${current_keywords?.[0]} ${target_location}`,
                `top ${current_keywords?.[0]} companies`
            ],
            australian_keywords: isAustralian ? [
                `${current_keywords?.[0]} Sydney`,
                `${current_keywords?.[0]} Melbourne`,
                `${current_keywords?.[0]} Australia`
            ] : [],
            search_intent: "Commercial/Transactional",
            related_keywords: [
                `${current_keywords?.[0]} solutions`,
                `${current_keywords?.[0]} experts`,
                `${current_keywords?.[0]} agency`
            ],
            local_seo_keywords: isAustralian ? [
                "near me",
                target_location,
                "local " + current_keywords?.[0]
            ] : []
        }
    });
});

// Mock content optimization
app.post('/v1/seo/optimize', (req, res) => {
    const { original_title, original_content, keywords } = req.body;

    const optimizedTitle = `${keywords?.[0] || 'Service'} | ${original_title} | Australia`;
    const optimizedContent = `# ${optimizedTitle}\n\n${original_content}\n\nKey benefits:\n- ${keywords?.join('\n- ')}`;

    res.json({
        response: {
            optimized_title: optimizedTitle.substring(0, 70),
            optimized_content: optimizedContent,
            meta_description: `Professional ${keywords?.[0]} services. ${original_content?.substring(0, 100)}`,
            improvements_made: [
                "Added primary keyword to title",
                "Improved heading structure",
                "Enhanced keyword density",
                "Added meta description"
            ]
        }
    });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Claude Proxy API running on http://127.0.0.1:${PORT}`);
    console.log(`Ready for n8n integration!`);
});
