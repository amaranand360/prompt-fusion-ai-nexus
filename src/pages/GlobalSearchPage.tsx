import React, { useState, useEffect } from 'react';
import { GlobalSearchInterface } from '@/components/GlobalSearchInterface';
import { SearchResults } from '@/components/SearchResults';
import { ActionExecutionFlow } from '@/components/ActionExecutionFlow';
import { ActionPreviewData } from '@/components/ActionPreview';
import { testAgentsService, AgentExecuteRequest } from '@/services/testAgentsService';

type SearchView = 'home' | 'results' | 'action';

interface ActionResult {
  id: string;
  action: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  description: string;
  result?: string;
  timestamp: string;
}

export const GlobalSearchPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SearchView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [previewData, setPreviewData] = useState<ActionPreviewData | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [currentExecutionResult, setCurrentExecutionResult] = useState<string | null>(null);

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await testAgentsService.isAvailable();
        setIsBackendAvailable(available);

        if (available) {
          const status = await testAgentsService.getStatus();
          setBackendStatus(status);
          console.log('Test-Agents backend is available:', status);
        } else {
          console.log('Test-Agents backend is not available, using demo mode');
        }
      } catch (error) {
        console.warn('Failed to check backend availability:', error);
        setIsBackendAvailable(false);
      }
    };

    checkBackend();
  }, []);

  // Helper function to generate preview data from action
  const generatePreviewData = (action: string): ActionPreviewData => {
    const actionLower = action.toLowerCase();

    if (actionLower.includes('email') || actionLower.includes('send') || actionLower.includes('compose')) {
      return {
        type: 'email',
        action,
        data: {
          recipients: [''],
          subject: actionLower.includes('project update') ? 'Project Update Summary' :
                   actionLower.includes('follow-up') ? 'Follow-up on Previous Discussion' :
                   actionLower.includes('thank') ? 'Thank You' : 'New Message',
          body: actionLower.includes('project update') ?
                'Hi team,\n\nI wanted to provide you with an update on our current project status...' :
                actionLower.includes('follow-up') ?
                'Hi,\n\nI wanted to follow up on our previous discussion...' :
                actionLower.includes('thank') ?
                'Hi team,\n\nI wanted to thank you for your excellent work on...' :
                'Hi,\n\nI hope this email finds you well...'
        }
      };
    }

    if (actionLower.includes('meeting') || actionLower.includes('schedule') || actionLower.includes('calendar')) {
      const isMeetAction = actionLower.includes('meet') || actionLower.includes('video');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return {
        type: isMeetAction ? 'meeting' : 'calendar',
        action,
        data: {
          title: actionLower.includes('standup') ? 'Team Standup' :
                 actionLower.includes('client') ? 'Client Presentation' :
                 actionLower.includes('team') ? 'Team Meeting' : 'New Meeting',
          date: tomorrow.toISOString().split('T')[0],
          time: actionLower.includes('standup') ? '09:00' : '14:00',
          duration: actionLower.includes('standup') ? 30 : 60,
          attendees: [''],
          location: isMeetAction ? 'Google Meet' : '',
          description: actionLower.includes('standup') ?
                      'Daily team standup to discuss progress and blockers' :
                      actionLower.includes('client') ?
                      'Presentation of project progress to client' :
                      'Team meeting to discuss upcoming tasks',
          includeMeet: isMeetAction
        }
      };
    }

    return {
      type: 'other',
      action,
      data: {}
    };
  };

  // Helper function to update action result
  const updateActionResult = (actionId: string, status: ActionResult['status'], result?: string) => {
    setActionResults(prev =>
      prev.map(action =>
        action.id === actionId
          ? {
              ...action,
              status,
              result,
              timestamp: new Date().toLocaleTimeString()
            }
          : action
      )
    );
  };

  // Helper function to execute real actions through Test-Agents backend
  const executeRealAction = async (action: string, actionId: string, previewData?: ActionPreviewData) => {
    try {
      let agentRequest: AgentExecuteRequest;
      let parameters: any = {};

      // Extract parameters from preview data
      if (previewData?.data) {
        if (previewData.type === 'email') {
          parameters = {
            recipients: previewData.data.recipients,
            subject: previewData.data.subject,
            body: previewData.data.body,
          };
        } else if (previewData.type === 'calendar' || previewData.type === 'meeting') {
          parameters = {
            title: previewData.data.title,
            date: previewData.data.date,
            time: previewData.data.time,
            duration: previewData.data.duration,
            attendees: previewData.data.attendees,
            location: previewData.data.location,
            description: previewData.data.description,
            includeMeet: previewData.data.includeMeet,
          };
        }
      }

      // Determine which agent to use based on action
      if (action.toLowerCase().includes('email') || action.toLowerCase().includes('send') || action.toLowerCase().includes('compose')) {
        agentRequest = {
          query: action,
          agent: 'gmail',
          parameters,
        };
      } else if (action.toLowerCase().includes('calendar') || action.toLowerCase().includes('meeting') || action.toLowerCase().includes('schedule')) {
        agentRequest = {
          query: action,
          agent: 'calendar',
          parameters,
        };
      } else if (action.toLowerCase().includes('meet') || action.toLowerCase().includes('video')) {
        agentRequest = {
          query: action,
          agent: 'calendar', // Meet integration is handled through calendar
          parameters: { ...parameters, includeMeet: true },
        };
      } else if (action.toLowerCase().includes('briefing') || action.toLowerCase().includes('daily')) {
        agentRequest = {
          query: action,
          agent: 'orchestrator',
          parameters,
        };
      } else {
        // Use orchestrator for complex actions
        agentRequest = {
          query: action,
          agent: 'orchestrator',
          parameters,
        };
      }

      console.log('🚀 Executing API call with parameters:', agentRequest);
      setIsExecutingAction(true);
      updateActionResult(actionId, 'executing');

      const response = await testAgentsService.executeAction(agentRequest);

      if (response.success) {
        console.log('✅ API call successful:', response);
        const result = response.result?.response || response.result?.finalResponse || 'Action completed successfully';
        setCurrentExecutionResult(result);
        updateActionResult(actionId, 'completed', result);
      } else {
        console.log('❌ API call failed:', response);
        const error = response.error || 'Action failed';
        setCurrentExecutionResult(error);
        updateActionResult(actionId, 'failed', error);
      }

      setIsExecutingAction(false);
    } catch (error) {
      console.error('Error executing real action:', error);
      updateActionResult(actionId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('results');
  };

  const handleAction = async (action: string) => {
    console.log('🎯 Action clicked:', action);
    setCurrentAction(action);

    // Generate preview data for the action
    const preview = generatePreviewData(action);
    console.log('📋 Generated preview data:', preview);
    setPreviewData(preview);
    // Stay on home view but show preview inline
  };

  const handlePreviewProceed = async (updatedPreviewData: ActionPreviewData) => {
    console.log('✅ Proceeding with action:', updatedPreviewData);
    setPreviewData(null); // Clear preview
    setCurrentView('action');

    // Add action to results
    const newAction: ActionResult = {
      id: Date.now().toString(),
      action: updatedPreviewData.action,
      status: 'pending',
      description: `Executing: ${updatedPreviewData.action}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setActionResults(prev => [newAction, ...prev]);

    // If backend is available, execute real action
    if (isBackendAvailable) {
      try {
        await executeRealAction(updatedPreviewData.action, newAction.id, updatedPreviewData);
      } catch (error) {
        console.error('Failed to execute real action:', error);
        // Fall back to demo mode for this action
        updateActionResult(newAction.id, 'failed', `Failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handlePreviewCancel = () => {
    console.log('❌ Action preview cancelled');
    setPreviewData(null);
    // Stay on current view, just hide preview
  };

  const handleActionComplete = () => {
    // Update the action status to completed
    setActionResults(prev =>
      prev.map(action =>
        action.action === currentAction
          ? {
              ...action,
              status: 'completed' as const,
              result: getActionResult(currentAction),
              timestamp: new Date().toLocaleTimeString()
            }
          : action
      )
    );

    // Return to search results if we have a query, otherwise go to home
    if (searchQuery) {
      setCurrentView('results');
    } else {
      setCurrentView('home');
    }
  };

  const handleActionRetry = () => {
    // Update the action status to pending and retry
    setActionResults(prev => 
      prev.map(action => 
        action.action === currentAction 
          ? { 
              ...action, 
              status: 'pending' as const,
              timestamp: new Date().toLocaleTimeString()
            }
          : action
      )
    );
    
    setCurrentView('action');
  };

  const getActionResult = (action: string): string => {
    if (action.toLowerCase().includes('create task')) {
      return 'Task "Intro Me! to new team members" created successfully in Project Board. Assigned to: You. Due date: Next Friday.';
    }
    if (action.toLowerCase().includes('send email') || action.toLowerCase().includes('email summary')) {
      return 'Email sent successfully to 5 recipients. Subject: "Project Update Summary". Delivery confirmed.';
    }
    if (action.toLowerCase().includes('schedule') || action.toLowerCase().includes('meeting')) {
      return 'Meeting "Team Standup" scheduled for tomorrow at 9:00 AM. Google Meet link created. 8 attendees invited.';
    }
    return 'Action completed successfully!';
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <GlobalSearchInterface
            onSearch={handleSearch}
            onAction={handleAction}
            previewData={previewData}
            onPreviewProceed={handlePreviewProceed}
            onPreviewCancel={handlePreviewCancel}
          />
        );
      case 'results':
        return (
          <SearchResults
            query={searchQuery}
            actions={actionResults}
            onActionExecute={handleAction}
          />
        );
      case 'action':
        return (
          <ActionExecutionFlow
            action={currentAction}
            onComplete={handleActionComplete}
            onRetry={handleActionRetry}
            useBackend={isBackendAvailable}
            backendAvailable={isBackendAvailable}
          />
        );
      default:
        return (
          <GlobalSearchInterface
            onSearch={handleSearch}
            onAction={handleAction}
            previewData={previewData}
            onPreviewProceed={handlePreviewProceed}
            onPreviewCancel={handlePreviewCancel}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentView()}
    </div>
  );
};
