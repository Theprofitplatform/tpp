#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not set in environment');
  console.log('Set it with: export GEMINI_API_KEY="your-api-key"');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  '.git',
  'dist',
  '.astro',
  '.cache',
  '.claude-flow',
  'playwright-report',
  'test-results',
  'screenshots',
  'archive'
];

// File extensions to analyze
const ANALYZE_EXTENSIONS = [
  '.js', '.mjs', '.cjs', '.ts', '.tsx',
  '.astro', '.jsx',
  '.json', '.md',
  '.css', '.scss'
];

function shouldSkip(path) {
  return SKIP_DIRS.some(dir => path.includes(`/${dir}/`) || path.endsWith(`/${dir}`));
}

function getFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);

    if (shouldSkip(filePath)) {
      return;
    }

    if (statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      const ext = extname(file);
      if (ANALYZE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

async function analyzeCodebase() {
  console.log('🔍 Scanning codebase...\n');

  const rootDir = process.cwd();
  const files = getFiles(rootDir);

  console.log(`📁 Found ${files.length} files to analyze\n`);

  // Build context from key files
  const codebaseContext = files.slice(0, 50).map(filePath => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(rootDir, filePath);
      return `\n--- ${relativePath} ---\n${content.slice(0, 2000)}`;
    } catch (err) {
      return '';
    }
  }).join('\n');

  const prompt = `Analyze this Astro.js project codebase and provide:

1. **Project Overview**: What is this project about?
2. **Architecture**: Key components, structure, and technologies used
3. **Main Features**: What does the application do?
4. **Dependencies**: Important packages and their purposes
5. **Current State**: What's working, what needs attention
6. **Backend Status**: Is there a backend? What's its purpose?
7. **Deployment**: How is it deployed?
8. **Recommendations**: Top 3 things to improve or fix

Here's the codebase context:

${codebaseContext}

Provide a clear, structured analysis.`;

  console.log('🤖 Analyzing with Gemini AI...\n');

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CODEBASE ANALYSIS REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(text);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error analyzing codebase:', error.message);
    process.exit(1);
  }
}

analyzeCodebase();
