/**
 * Service to communicate with the Test-Agents backend
 * Handles email, calendar, and meet actions through the Express server
 */

export interface AgentExecuteRequest {
  query: string;
  agent: 'gmail' | 'calendar' | 'orchestrator';
  parameters?: Record<string, any>;
  config?: Record<string, any>;
}

export interface AgentExecuteResponse {
  success: boolean;
  agent: string;
  query: string;
  result: any;
  timestamp: string;
  error?: string;
}

export interface QuickActionRequest {
  action: 'read-emails' | 'todays-events' | 'daily-briefing' | 'find-time' | 'compose-email';
  parameters?: Record<string, any>;
}

export interface QuickActionResponse {
  success: boolean;
  action: string;
  result: any;
  timestamp: string;
  error?: string;
}

export interface AgentCapabilities {
  orchestrator: {
    name: string;
    description: string;
    capabilities: string[];
    examples: string[];
  };
  gmail: {
    name: string;
    description: string;
    capabilities: string[];
    examples: string[];
  };
  calendar: {
    name: string;
    description: string;
    capabilities: string[];
    examples: string[];
  };
}

export interface AgentStatus {
  status: string;
  agents: Record<string, any>;
  llm: {
    available: boolean;
    models: string[];
  };
  authorization: {
    gmail: boolean;
    calendar: boolean;
  };
  timestamp: string;
}

export class TestAgentsService {
  private baseUrl: string;
  private userId: string;

  constructor(baseUrl: string = 'http://localhost:3000', userId: string = 'default') {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  /**
   * Execute an action through the Test-Agents backend
   */
  async executeAction(request: AgentExecuteRequest): Promise<AgentExecuteResponse> {
    try {
      console.log('Executing action through Test-Agents:', request);

      const response = await fetch(`${this.baseUrl}/api/agents/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': this.userId,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Action executed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error executing action:', error);
      throw new Error(`Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a quick action
   */
  async executeQuickAction(request: QuickActionRequest): Promise<QuickActionResponse> {
    try {
      console.log('Executing quick action:', request);

      const response = await fetch(`${this.baseUrl}/api/agents/quick/${request.action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': this.userId,
        },
        body: JSON.stringify({ parameters: request.parameters }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Quick action executed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error executing quick action:', error);
      throw new Error(`Failed to execute quick action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get agent capabilities
   */
  async getCapabilities(): Promise<AgentCapabilities> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/capabilities`, {
        method: 'GET',
        headers: {
          'user-id': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting capabilities:', error);
      throw new Error(`Failed to get capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get agent status and health
   */
  async getStatus(): Promise<AgentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/status`, {
        method: 'GET',
        headers: {
          'user-id': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting status:', error);
      throw new Error(`Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a natural language chat message
   */
  async chat(message: string, context?: Record<string, any>): Promise<any> {
    try {
      console.log('Sending chat message:', message);

      const response = await fetch(`${this.baseUrl}/api/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': this.userId,
        },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Chat response received:', result);
      return result;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error(`Failed to send chat message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if the Test-Agents backend is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.warn('Test-Agents backend not available:', error);
      return false;
    }
  }

  /**
   * Get available LLM models
   */
  async getAvailableModels(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/models`, {
        method: 'GET',
        headers: {
          'user-id': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting models:', error);
      throw new Error(`Failed to get models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create a singleton instance
export const testAgentsService = new TestAgentsService();
