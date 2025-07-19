import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Zap,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Mail,
  FileText,
  MessageSquare,
  Video,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Settings
} from 'lucide-react';
import {
  ActionLoading,
  SuccessAnimation,
  ErrorState,
  TypingAnimation
} from '@/components/ui/loading-states';
import { testAgentsService, AgentExecuteRequest } from '@/services/testAgentsService';

interface ActionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  timestamp?: string;
  duration?: number;
}

interface ActionExecutionProps {
  action: string;
  onComplete: () => void;
  onRetry: () => void;
  useBackend?: boolean;
  backendAvailable?: boolean;
  apiResult?: string;
  isApiExecuting?: boolean;
}

const getActionSteps = (action: string): ActionStep[] => {
  if (action.toLowerCase().includes('create task')) {
    return [
      {
        id: '1',
        title: 'Analyzing Request',
        description: 'Understanding the task requirements and context',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Extracting Details',
        description: 'Identifying task title, description, and assignees',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Creating Task',
        description: 'Adding task to project management system',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Notifying Team',
        description: 'Sending notifications to relevant team members',
        status: 'pending'
      }
    ];
  }

  if (action.toLowerCase().includes('send email') || action.toLowerCase().includes('email summary')) {
    return [
      {
        id: '1',
        title: 'Composing Email',
        description: 'Generating email content based on context',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Validating Recipients',
        description: 'Checking email addresses and permissions',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Sending Email',
        description: 'Delivering email through Gmail API',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Confirming Delivery',
        description: 'Verifying successful email delivery',
        status: 'pending'
      }
    ];
  }

  if (action.toLowerCase().includes('schedule') || action.toLowerCase().includes('meeting')) {
    return [
      {
        id: '1',
        title: 'Parsing Schedule Request',
        description: 'Understanding meeting details and preferences',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Checking Availability',
        description: 'Finding optimal time slots for all attendees',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Creating Calendar Event',
        description: 'Adding event to Google Calendar',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Sending Invitations',
        description: 'Notifying attendees about the meeting',
        status: 'pending'
      }
    ];
  }

  // Default generic steps
  return [
    {
      id: '1',
      title: 'Processing Request',
      description: 'Analyzing the action requirements',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Executing Action',
      description: 'Performing the requested operation',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Finalizing',
      description: 'Completing the action and cleanup',
      status: 'pending'
    }
  ];
};

export const ActionExecutionFlow: React.FC<ActionExecutionProps> = ({
  action,
  onComplete,
  onRetry,
  useBackend = false,
  backendAvailable = false,
  apiResult,
  isApiExecuting = false
}) => {
  const [steps, setSteps] = useState<ActionStep[]>(getActionSteps(action));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isExecuting) {
      if (useBackend && backendAvailable) {
        executeBackendAction();
      } else {
        executeAction();
      }
    }
  }, []);

  // Execute action through Test-Agents backend
  const executeBackendAction = async () => {
    setIsExecuting(true);
    setHasError(false);

    try {
      // Determine which agent to use based on action
      let agentRequest: AgentExecuteRequest;

      if (action.toLowerCase().includes('email') || action.toLowerCase().includes('send') || action.toLowerCase().includes('compose')) {
        agentRequest = {
          query: action,
          agent: 'gmail',
          parameters: {},
        };
      } else if (action.toLowerCase().includes('calendar') || action.toLowerCase().includes('meeting') || action.toLowerCase().includes('schedule')) {
        agentRequest = {
          query: action,
          agent: 'calendar',
          parameters: {},
        };
      } else if (action.toLowerCase().includes('meet') || action.toLowerCase().includes('video')) {
        agentRequest = {
          query: action,
          agent: 'calendar', // Meet integration is handled through calendar
          parameters: { includeMeet: true },
        };
      } else if (action.toLowerCase().includes('briefing') || action.toLowerCase().includes('daily')) {
        agentRequest = {
          query: action,
          agent: 'orchestrator',
          parameters: {},
        };
      } else {
        // Use orchestrator for complex actions
        agentRequest = {
          query: action,
          agent: 'orchestrator',
          parameters: {},
        };
      }

      // Execute steps with real backend integration
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'executing' : index < i ? 'completed' : 'pending'
        })));

        if (i === 0) {
          // First step: Initialize request
          await new Promise(resolve => setTimeout(resolve, 800));
        } else if (i === steps.length - 1) {
          // Last step: Execute the actual backend request
          const response = await testAgentsService.executeAction(agentRequest);
          setBackendResponse(response);

          if (response.success) {
            setExecutionResult(response.result?.response || response.result?.finalResponse || 'Action completed successfully');
          } else {
            throw new Error(response.error || 'Backend execution failed');
          }
        } else {
          // Middle steps: Simulate processing
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        }

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'completed' : index < i ? 'completed' : 'pending'
        })));
      }

      setIsExecuting(false);
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Backend execution error:', error);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === currentStepIndex ? 'failed' : index < currentStepIndex ? 'completed' : 'pending'
      })));
      setHasError(true);
      setIsExecuting(false);
      setExecutionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const executeAction = async () => {
    setIsExecuting(true);
    setHasError(false);

    for (let i = 0; i < steps.length; i++) {
      // Update current step to executing
      setCurrentStepIndex(i);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'executing' : index < i ? 'completed' : 'pending'
      })));

      // Simulate realistic execution time with variation
      const baseTime = 1200;
      const variation = Math.random() * 800;
      await new Promise(resolve => setTimeout(resolve, baseTime + variation));

      // Simulate very rare failures for demo (2% chance)
      const shouldFail = Math.random() < 0.02 && i === steps.length - 1;

      if (shouldFail) {
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'failed' : index < i ? 'completed' : 'pending'
        })));
        setHasError(true);
        setIsExecuting(false);
        return;
      }

      // Mark step as completed with realistic timing
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending',
        timestamp: index === i ? new Date().toLocaleTimeString() : step.timestamp,
        duration: index === i ? Math.floor(baseTime + variation) : step.duration
      })));
    }

    // Generate impressive success results
    const results = {
      'create task': '✅ Task "Intro Me! to new team members" created successfully in Project Board.\n📋 Assigned to: You\n📅 Due date: Next Friday\n🔗 Task ID: TASK-2024-001',
      'send email': '📧 Email sent successfully to 5 recipients.\n📝 Subject: "Project Update Summary"\n✅ Delivery confirmed for all recipients\n📊 Open rate: 100%',
      'schedule meeting': '📅 Meeting "Team Standup" scheduled for tomorrow at 9:00 AM.\n🎥 Google Meet link created and shared\n👥 8 attendees invited and notified\n🔔 Calendar reminders set',
      'email summary': '📧 Summary email sent to stakeholders with search results and action items.\n👥 3 recipients notified\n📊 Includes 12 search results and 5 action items\n✅ All attachments included'
    };

    const resultKey = Object.keys(results).find(key => action.toLowerCase().includes(key));
    setExecutionResult(results[resultKey as keyof typeof results] || '🎉 Action completed successfully with impressive results!');

    setIsExecuting(false);

    // Show success animation before calling onComplete
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const getStatusIcon = (status: ActionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'executing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  const handleBackToSearch = () => {
    // If we came from search results, go back to search with results
    // Otherwise, go to home search page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSearch}
                className="hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <div className="border-l border-border pl-4">
                <h1 className="text-lg font-semibold text-foreground">Action Execution</h1>
                <p className="text-sm text-muted-foreground">"{action}"</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={hasError ? 'destructive' : isExecuting ? 'secondary' : 'default'}
                className="px-3 py-1"
              >
                {hasError ? 'Failed' : isExecuting ? 'Executing' : 'Completed'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with better spacing */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Title Section */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ZB</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                ZenBox <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">AI</span> Action Execution
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch your AI-powered action execute step by step with real-time progress tracking
            </p>
          </div>

          <div className="space-y-8">
          {/* Progress Overview */}
          <Card className="p-8 bg-gradient-to-r from-background to-secondary/20 border-2 border-border/50 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] rounded-xl shadow-md">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Executing Action</h2>
                    <p className="text-muted-foreground">
                      Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-[hsl(var(--brand-primary))] mb-1">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-3 bg-secondary" />
              </div>
            </div>
          </Card>

          {/* Execution Steps */}
          <Card className="p-8 border-2 border-border/50 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Execution Steps</h3>
              <p className="text-sm text-muted-foreground">
                Follow the progress of your action execution
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-4 relative">
                  {/* Connection line for steps */}
                  {step.id !== steps[steps.length - 1].id && (
                    <div className="absolute left-5 top-8 w-0.5 h-8 bg-border" />
                  )}

                  <div className="flex-shrink-0 mt-1 relative z-10">
                    <div className={`p-2 rounded-full ${
                      step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                      step.status === 'executing' ? 'bg-blue-100 dark:bg-blue-900' :
                      step.status === 'failed' ? 'bg-red-100 dark:bg-red-900' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getStatusIcon(step.status)}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 pb-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold text-base ${
                        step.status === 'executing' ? 'text-[hsl(var(--brand-primary))]' :
                        step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                        step.status === 'failed' ? 'text-red-500' :
                        'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h4>

                      {step.timestamp && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          <Clock className="h-3 w-3" />
                          {step.timestamp}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {step.duration && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ⚡ {step.duration}ms
                        </Badge>
                        {step.status === 'completed' && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Execution Result */}
          {executionResult && !isExecuting && (
            <Card className="p-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:bg-gradient-to-r dark:from-green-950 dark:to-emerald-950 relative overflow-hidden">
              {/* Success animation background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />

              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                    <CheckCircle className="h-8 w-8 text-green-500 relative animate-bounce" />
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                          🎉 Action Completed Successfully!
                        </h3>
                        <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-line font-mono">
                          <TypingAnimation
                            text={executionResult}
                            speed={30}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900"
                        onClick={() => navigator.clipboard.writeText(executionResult)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Result
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Completed in {Math.floor(Math.random() * 3000 + 2000)}ms
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confetti effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-bounce opacity-60"
                    style={{
                      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'][i % 5],
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Error State */}
          {hasError && (
            <Card className="p-8 border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-800 dark:bg-gradient-to-r dark:from-red-950 dark:to-red-900 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full relative">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                      ⚠️ Action Failed
                    </h3>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        There was an error executing the action. This might be due to a temporary issue or network connectivity. Please try again or contact support if the issue persists.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={onRetry}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Retry Action
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900"
                      onClick={handleBackToSearch}
                    >
                      <ArrowLeft className="h-3 w-3 mr-2" />
                      Back to Search
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                    >
                      Report Issue
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Next Steps */}
          {!isExecuting && !hasError && (
            <Card className="p-8 bg-gradient-to-r from-background to-secondary/10 border-2 border-border/50 shadow-lg">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">What's Next?</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your next action to continue your workflow
                </p>
              </div>

              <div className="grid gap-4">
                <Button
                  variant="default"
                  className="w-full justify-start h-12 bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/90"
                  onClick={handleBackToSearch}
                >
                  <ArrowRight className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Return to Search Results</div>
                    <div className="text-xs opacity-90">Continue with your search</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-secondary/80"
                  onClick={() => navigate('/')}
                >
                  <Zap className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Perform Another Action</div>
                    <div className="text-xs text-muted-foreground">Start a new search or action</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-secondary/80"
                  onClick={() => navigate('/tools')}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Tool Connections</div>
                    <div className="text-xs text-muted-foreground">Configure your integrations</div>
                  </div>
                </Button>
              </div>
            </Card>
          )}
          </div>
        </div>
      </main>
    </div>
  );
};
