/**
 * Standalone Backend Server for TPP Tools
 * Serves keyword-gap and competitor-analysis endpoints
 */

import express from 'express';
import cors from 'cors';
import { analyzeKeywordGap } from '../backend/keyword-gap-analyzer.js';
import { analyzeCompetitors } from '../backend/competitor-analysis.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Keyword Gap Analyzer endpoint
app.post('/api/keyword-gap', async (req, res) => {
  try {
    const { yourDomain, competitorDomain, email } = req.body;

    if (!yourDomain || !competitorDomain) {
      return res.status(400).json({
        error: 'Both yourDomain and competitorDomain are required'
      });
    }

    console.log(`📊 Keyword Gap Request: ${yourDomain} vs ${competitorDomain}`);

    const serpApiKey = process.env.SERPAPI_KEY || null;
    const result = await analyzeKeywordGap(yourDomain, competitorDomain, serpApiKey);

    const response = {
      success: true,
      yourDomain: result.yourDomain,
      competitorDomain: result.competitorDomain,
      yourDA: result.yourDA,
      competitorDA: result.competitorDA,
      totalGaps: result.totalGaps,
      easyWins: result.easyWins,
      totalMonthlyValue: result.totalMonthlyValue,
      industry: result.industry,
      servicesFound: result.servicesFound,
      opportunities: email ? result.full10 : result.top3,
      requiresEmail: !email,
      usingMockData: !serpApiKey
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Keyword gap error:', error);
    res.status(500).json({
      error: 'Failed to analyze keyword gap',
      details: error.message
    });
  }
});

// Competitor Analysis endpoint (existing tool)
app.post('/api/competitor-analysis', async (req, res) => {
  try {
    const { yourDomain, competitorDomain } = req.body;

    if (!yourDomain || !competitorDomain) {
      return res.status(400).json({
        error: 'Both yourDomain and competitorDomain are required'
      });
    }

    console.log(`🔍 Competitor Analysis: ${yourDomain} vs ${competitorDomain}`);

    const result = await analyzeCompetitors(yourDomain, competitorDomain);
    res.json(result);

  } catch (error) {
    console.error('❌ Competitor analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze competitor',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🔗 Health: http://localhost:${PORT}/health
🔗 Keyword Gap: POST http://localhost:${PORT}/api/keyword-gap
🔗 Competitor Analysis: POST http://localhost:${PORT}/api/competitor-analysis
🔑 SerpApi: ${process.env.SERPAPI_KEY ? 'Configured ✅' : 'Not configured (using mock data)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
