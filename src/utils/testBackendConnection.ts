/**
 * Utility to test the connection to the Test-Agents backend
 */

import { testAgentsService } from '@/services/testAgentsService';

export interface BackendConnectionTest {
  isAvailable: boolean;
  status?: any;
  capabilities?: any;
  error?: string;
}

/**
 * Test the connection to the Test-Agents backend
 */
export async function testBackendConnection(): Promise<BackendConnectionTest> {
  try {
    console.log('Testing Test-Agents backend connection...');

    // Check if backend is available
    const isAvailable = await testAgentsService.isAvailable();
    
    if (!isAvailable) {
      return {
        isAvailable: false,
        error: 'Test-Agents backend is not available. Make sure the server is running on http://localhost:3000'
      };
    }

    // Get backend status
    const status = await testAgentsService.getStatus();
    
    // Get capabilities
    const capabilities = await testAgentsService.getCapabilities();

    console.log('✅ Test-Agents backend connection successful:', {
      status: status.status,
      agents: Object.keys(status.agents || {}),
      authorization: status.authorization
    });

    return {
      isAvailable: true,
      status,
      capabilities
    };

  } catch (error) {
    console.error('❌ Test-Agents backend connection failed:', error);
    
    return {
      isAvailable: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
}

/**
 * Test a specific action execution
 */
export async function testActionExecution(action: string, agent: 'gmail' | 'calendar' | 'orchestrator' = 'orchestrator') {
  try {
    console.log(`Testing action execution: "${action}" with ${agent} agent`);

    const response = await testAgentsService.executeAction({
      query: action,
      agent,
      parameters: {}
    });

    console.log('✅ Action execution test successful:', response);
    return response;

  } catch (error) {
    console.error('❌ Action execution test failed:', error);
    throw error;
  }
}

/**
 * Test quick actions
 */
export async function testQuickAction(action: 'read-emails' | 'todays-events' | 'daily-briefing' | 'find-time' | 'compose-email') {
  try {
    console.log(`Testing quick action: ${action}`);

    const response = await testAgentsService.executeQuickAction({
      action,
      parameters: {}
    });

    console.log('✅ Quick action test successful:', response);
    return response;

  } catch (error) {
    console.error('❌ Quick action test failed:', error);
    throw error;
  }
}

/**
 * Run all backend tests
 */
export async function runAllBackendTests() {
  console.log('🧪 Running all Test-Agents backend tests...');

  const results = {
    connection: await testBackendConnection(),
    actionTests: [] as any[],
    quickActionTests: [] as any[]
  };

  if (results.connection.isAvailable) {
    // Test some actions
    const testActions = [
      { action: 'Send a test email', agent: 'gmail' as const },
      { action: 'Check today\'s calendar', agent: 'calendar' as const },
      { action: 'Get daily briefing', agent: 'orchestrator' as const }
    ];

    for (const test of testActions) {
      try {
        const result = await testActionExecution(test.action, test.agent);
        results.actionTests.push({ ...test, success: true, result });
      } catch (error) {
        results.actionTests.push({ ...test, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Test quick actions
    const quickActions: ('read-emails' | 'todays-events' | 'daily-briefing')[] = ['read-emails', 'todays-events', 'daily-briefing'];

    for (const action of quickActions) {
      try {
        const result = await testQuickAction(action);
        results.quickActionTests.push({ action, success: true, result });
      } catch (error) {
        results.quickActionTests.push({ action, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  }

  console.log('🧪 Backend tests completed:', results);
  return results;
}
