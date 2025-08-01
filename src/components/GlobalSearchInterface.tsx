import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Mic,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  Mail,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Users,
  Settings,
  Command,
  BarChart3,
  Bug,
  Hash
} from 'lucide-react';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';
import { BackendStatus } from '@/components/BackendStatus';
import { ActionPreview } from '@/components/ActionPreview';
import { MicrophoneButton, VoiceRecordingIndicator } from '@/components/MicrophoneButton';
import { openaiService } from '@/services/openaiService';

interface TrendingSearch {
  id: string;
  text: string;
  icon: React.ComponentType<any>;
  category: string;
}

interface SuggestedAction {
  id: string;
  text: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface TrendingTask {
  id: string;
  text: string;
  icon: React.ComponentType<any>;
  category: string;
  priority: 'high' | 'medium' | 'low';
  agent: 'gmail' | 'calendar' | 'orchestrator' | 'jira' | 'slack';
}

const trendingSearches: TrendingSearch[] = [
  { id: '1', text: 'Send project update email to team', icon: Mail, category: 'gmail' },
  { id: '2', text: 'Schedule weekly team standup with Google Meet', icon: Calendar, category: 'calendar' },
  { id: '3', text: 'Create Jira task for new feature development', icon: Bug, category: 'jira' },
  { id: '4', text: 'Create Jira issue for bug report', icon: Bug, category: 'jira' },
  { id: '5', text: 'Create Slack channel for project discussion', icon: Hash, category: 'slack' },
  { id: '6', text: 'Send message to team Slack channel', icon: MessageSquare, category: 'slack' }
];

const suggestedActions: SuggestedAction[] = [
  { id: '1', text: 'Send project update email', icon: Mail, description: 'Compose and send emails via Gmail' },
  { id: '2', text: 'Schedule team meeting', icon: Calendar, description: 'Create calendar events with Google Calendar' },
  { id: '3', text: 'Create Jira task', icon: Bug, description: 'Create tasks and issues in Jira' },
  { id: '4', text: 'Create Jira issue', icon: Bug, description: 'Report bugs and issues in Jira' },
  { id: '5', text: 'Create Slack channel', icon: Hash, description: 'Create new Slack channels and send messages' },
  { id: '6', text: 'Send Slack message', icon: MessageSquare, description: 'Send messages to Slack channels' }
];

const trendingTasks: TrendingTask[] = [
  { id: '1', text: 'Send project status email to stakeholders', icon: Mail, category: 'urgent', priority: 'high', agent: 'gmail' },
  { id: '2', text: 'Schedule weekly team standup with Google Meet', icon: Calendar, category: 'recurring', priority: 'medium', agent: 'calendar' },
  { id: '3', text: 'Create Jira task for API integration feature', icon: Bug, category: 'development', priority: 'high', agent: 'jira' },
  { id: '4', text: 'Create Jira issue for login bug fix', icon: Bug, category: 'bug', priority: 'high', agent: 'jira' },
  { id: '5', text: 'Create Slack channel for new project team', icon: Hash, category: 'communication', priority: 'medium', agent: 'slack' },
  { id: '6', text: 'Send update message to development Slack channel', icon: MessageSquare, category: 'communication', priority: 'low', agent: 'slack' }
];

const connectedTools = [
  { name: 'Google', icon: '🔍', color: 'bg-blue-500' },
  { name: 'Gmail', icon: '📧', color: 'bg-red-500' },
  { name: 'Calendar', icon: '📅', color: 'bg-green-500' },
  { name: 'Slack', icon: '💬', color: 'bg-purple-500' },
  { name: 'Jira', icon: '🐛', color: 'bg-blue-600' },
  { name: 'More', icon: '⋯', color: 'bg-gray-500' }
];

interface GlobalSearchInterfaceProps {
  onSearch: (query: string) => void;
  onAction: (action: string) => void;
  previewData?: any;
  onPreviewProceed?: (data: any) => void;
  onPreviewProceedDirect?: (data: any) => void;
  onPreviewCancel?: () => void;
  isGeneratingPreview?: boolean;
  showPreview?: boolean;
}

export const GlobalSearchInterface: React.FC<GlobalSearchInterfaceProps> = ({
  onSearch,
  onAction,
  previewData,
  onPreviewProceed,
  onPreviewProceedDirect,
  onPreviewCancel,
  isGeneratingPreview = false,
  showPreview = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPreviewHighlighted, setIsPreviewHighlighted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isDemoMode } = useGoogleIntegration();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll and highlight preview when it appears
  useEffect(() => {
    if (previewData && previewRef.current) {
      // Scroll to preview section
      previewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Highlight the preview section
      setIsPreviewHighlighted(true);

      // Remove highlight after animation
      const timer = setTimeout(() => {
        setIsPreviewHighlighted(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [previewData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleTrendingClick = (search: TrendingSearch) => {
    setQuery(search.text);
    // Instead of searching, show preview for trending searches too
    onAction(search.text);
  };

  const handleActionClick = (action: SuggestedAction) => {
    setQuery(action.text);
    onAction(action.text);
  };

  const handleTrendingTaskClick = (task: TrendingTask) => {
    setQuery(task.text);
    onAction(task.text);
  };

  // Voice recording handlers
  const handleVoiceTranscript = (transcript: string) => {
    setVoiceTranscript(transcript);
    setQuery(transcript);
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
    setVoiceError(null);
    setVoiceTranscript('');
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
    // Auto-execute if we have a transcript
    if (voiceTranscript.trim()) {
      setTimeout(() => {
        onAction(voiceTranscript.trim());
      }, 500); // Small delay to show the final transcript
    }
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">ZB</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">ZenBox <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">AI</span></h1>
                  {openaiService.isConfigured() && (
                    <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full border border-green-200 dark:border-green-800">
                      AI Ready
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Your AI-powered productivity companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <BackendStatus />
              {isAuthenticated && (
                <Badge variant="default" className="bg-[hsl(var(--success))] text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  {isDemoMode ? 'Demo Mode' : 'Live Mode'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tools')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Tools
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Search Interface */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Bar */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Search or Ask</h2>
              <p className="text-muted-foreground">
                Find anything across your workspace or execute actions with natural language
              </p>
            </div>

            <Card className="p-2 bg-card border-2 hover:border-[hsl(var(--brand-primary))]/50 transition-all duration-200">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">Search</span>
                  <div className="flex items-center gap-1">
                    {connectedTools.map((tool, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 ${tool.color} rounded-full flex items-center justify-center text-white text-xs`}
                        title={tool.name}
                      >
                        {tool.icon}
                      </div>
                    ))}
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder="Ask anything or search across all your tools..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg py-3"
                />

                <div className="flex items-center gap-2 flex-shrink-0">
                  <MicrophoneButton
                    onTranscript={handleVoiceTranscript}
                    onStart={handleVoiceStart}
                    onStop={handleVoiceStop}
                    onError={handleVoiceError}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  />

                  <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    ⌘K
                  </div>
                </div>
              </form>
            </Card>

            {/* Voice Recording Indicator */}
            <VoiceRecordingIndicator
              isRecording={isRecording}
              transcript={voiceTranscript}
              className="max-w-4xl mx-auto"
            />

            {/* Voice Error Display */}
            {voiceError && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {voiceError}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Preview Generation */}
          {isGeneratingPreview && (
            <div
              ref={previewRef}
              className="space-y-4 animate-pulse"
            >
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-dashed border-purple-300 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-purple-300 to-blue-300 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-300 rounded w-48 animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    🤖 AI is generating your action preview...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Preview */}
          {previewData && onPreviewProceed && onPreviewProceedDirect && onPreviewCancel && (
            <div
              ref={!isGeneratingPreview ? previewRef : undefined}
              className={`space-y-4 transition-all duration-1000 ${
                showPreview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${
                isPreviewHighlighted
                  ? 'ring-4 ring-[hsl(var(--brand-primary))]/30 ring-offset-4 ring-offset-background rounded-lg'
                  : ''
              }`}
            >
              <ActionPreview
                previewData={previewData}
                onProceed={onPreviewProceed}
                onProceedDirect={onPreviewProceedDirect}
                onCancel={onPreviewCancel}
                showContent={showPreview}
              />
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              <h3 className="text-lg font-semibold text-foreground">Trending Searches</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingSearches.map((search) => {
                const IconComponent = search.icon;
                return (
                  <Card
                    key={search.id}
                    className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-[hsl(var(--brand-primary))]/50"
                    onClick={() => handleTrendingClick(search)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg group-hover:bg-[hsl(var(--brand-primary))]/10 transition-colors">
                        <IconComponent className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--brand-primary))] transition-colors">
                          {search.text}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {search.category}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {suggestedActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Card
                    key={action.id}
                    className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-[hsl(var(--brand-primary))]/50"
                    onClick={() => handleActionClick(action)}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto group-hover:bg-[hsl(var(--brand-primary))]/10 transition-colors">
                        <IconComponent className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-[hsl(var(--brand-primary))] transition-colors">
                          {action.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Trending Tasks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              <h3 className="text-lg font-semibold text-foreground">Trending Tasks</h3>
              <Badge variant="outline" className="text-xs">AI Suggested</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingTasks.map((task) => {
                const IconComponent = task.icon;
                const priorityColor = task.priority === 'high' ? 'bg-red-100 text-red-600 border-red-200' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                    'bg-green-100 text-green-600 border-green-200';

                return (
                  <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-[hsl(var(--brand-primary))]/50"
                    onClick={() => handleTrendingTaskClick(task)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary rounded-lg group-hover:bg-[hsl(var(--brand-primary))]/10 transition-colors">
                        <IconComponent className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--brand-primary))] transition-colors line-clamp-2">
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${priorityColor}`}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.agent}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            </div>
            
            <Card className="p-4">
              <div className="space-y-3">
                {[
                  { action: 'Searched for "Q4 planning documents"', time: '2 minutes ago', type: 'search' },
                  { action: 'Created meeting "Team Standup"', time: '15 minutes ago', type: 'action' },
                  { action: 'Sent email to project team', time: '1 hour ago', type: 'action' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${item.type === 'search' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
