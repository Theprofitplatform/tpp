/**
 * DeepSeek API Client
 * Uses OpenAI-compatible API format
 */

import { retryWithBackoff, RateLimiter } from './api-helpers.mjs';

/**
 * DeepSeek API Client
 */
export class DeepSeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';

    // Rate limiter: 10 requests per minute
    this.rateLimiter = new RateLimiter(10, 10 / 60);
  }

  /**
   * Make API request to DeepSeek
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(messages, options = {}) {
    const {
      model = 'deepseek-chat',
      max_tokens = 4000,
      temperature = 0.7,
      ...otherOptions
    } = options;

    return await this.rateLimiter.execute(() =>
      retryWithBackoff(
        async () => {
          return await this.makeRequest('/chat/completions', {
            body: JSON.stringify({
              model,
              messages,
              max_tokens,
              temperature,
              ...otherOptions,
            }),
          });
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
          maxDelay: 30000,
          backoffMultiplier: 2,
          timeout: 120000, // 2 minute timeout
        }
      )
    );
  }

  /**
   * Generate content with system prompt and user message
   */
  async generateContent(systemPrompt, userPrompt, options = {}) {
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const response = await this.createChatCompletion(messages, options);

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from DeepSeek API');
    }

    return response.choices[0].message.content;
  }

  /**
   * Get available models
   */
  async listModels() {
    return await this.rateLimiter.execute(() =>
      retryWithBackoff(
        async () => {
          const response = await fetch(`${this.baseURL}/models`, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status}`);
          }

          return response.json();
        },
        {
          maxRetries: 2,
          initialDelay: 1000,
          timeout: 30000,
        }
      )
    );
  }
}

/**
 * Create DeepSeek client instance
 */
export function createDeepSeekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY_HERE') {
    throw new Error('DeepSeek API key not configured. Please set DEEPSEEK_API_KEY in .env.local');
  }

  return new DeepSeekClient(apiKey);
}

export default {
  DeepSeekClient,
  createDeepSeekClient,
};