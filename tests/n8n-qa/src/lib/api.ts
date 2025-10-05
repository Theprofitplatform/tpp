/**
 * n8n API Client
 * Wrapper around n8n Public API for workflow and execution management
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from './config.js';

// ===== Types =====

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook';
  status: 'success' | 'error' | 'waiting' | 'running';
  startedAt: string;
  stoppedAt?: string;
  data: any;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
  staticData: any;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionListParams {
  workflowId?: string;
  status?: 'success' | 'error' | 'waiting' | 'running';
  limit?: number;
  startedAfter?: string;
  startedBefore?: string;
}

// ===== API Client =====

class N8nAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiToken: string) {
    this.client = axios.create({
      baseURL: baseURL.replace(/\/$/, ''), // Remove trailing slash
      headers: {
        'X-N8N-API-KEY': apiToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: config.test.timeout,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error(
            `[API Error] ${error.response.status}: ${JSON.stringify(error.response.data)}`
          );
        } else {
          console.error(`[API Error] ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== Workflow Methods =====

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await this.client.get<N8nWorkflow>(`/api/v1/workflows/${id}`);
    return response.data;
  }

  async listWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get<{ data: N8nWorkflow[] }>('/api/v1/workflows');
    return response.data.data;
  }

  async exportWorkflow(id: string): Promise<any> {
    const response = await this.client.get(`/api/v1/workflows/${id}/export`);
    return response.data;
  }

  async activateWorkflow(id: string): Promise<void> {
    await this.client.patch(`/api/v1/workflows/${id}`, { active: true });
  }

  async deactivateWorkflow(id: string): Promise<void> {
    await this.client.patch(`/api/v1/workflows/${id}`, { active: false });
  }

  // ===== Execution Methods =====

  async getExecution(id: string): Promise<N8nExecution> {
    const response = await this.client.get<N8nExecution>(`/api/v1/executions/${id}`);
    return response.data;
  }

  async listExecutions(params: ExecutionListParams = {}): Promise<N8nExecution[]> {
    const queryParams = new URLSearchParams();

    if (params.workflowId) queryParams.set('workflowId', params.workflowId);
    if (params.status) queryParams.set('status', params.status);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.startedAfter) queryParams.set('startedAfter', params.startedAfter);
    if (params.startedBefore) queryParams.set('startedBefore', params.startedBefore);

    const response = await this.client.get<{ data: N8nExecution[] }>(
      `/api/v1/executions?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async deleteExecution(id: string): Promise<void> {
    await this.client.delete(`/api/v1/executions/${id}`);
  }

  // ===== Webhook Methods =====

  async triggerWebhook(url: string, payload: any): Promise<AxiosResponse> {
    // Use a separate axios instance for webhook calls (no auth needed)
    return axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: config.test.timeout,
      validateStatus: () => true, // Accept all status codes
    });
  }

  // ===== Utility Methods =====

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/healthz');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// ===== Singleton Instance =====

export const n8nAPI = new N8nAPIClient(
  config.n8n.apiBase,
  config.n8n.apiToken
);

// ===== Exports =====

export default n8nAPI;
