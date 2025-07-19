import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGoogleIntegration, useGoogleServices } from '@/contexts/GoogleIntegrationContext';
import { useGoogleIntegrationNotifications } from '@/contexts/NotificationContext';
import {
  Search,
  Mic,
  Sparkles,
  FileText,
  Calendar,
  Mail,
  Slack,
  Database,
  ExternalLink,
  Download,
  Share,
  Plus,
  TrendingUp,
  Clock,
  Users,
  ArrowUp,
  Paperclip,
  Globe,
  ChevronRight,
  Play,
  MessageSquare,
  BarChart,
  Settings,
  Zap,
  Video,
  Send,
  Bot,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  type: 'document' | 'email' | 'calendar' | 'slack' | 'notion';
  preview: string;
  metadata: {
    date: string;
    author: string;
    fileType?: string;
  };
  citations: string[];
}

interface ConnectedTool {
  name: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Q3 Marketing Strategy Document',
    content: 'Comprehensive marketing strategy for Q3 focusing on digital transformation...',
    source: 'Google Drive',
    type: 'document',
    preview: 'This document outlines our marketing approach for Q3, including budget allocation and key campaigns.',
    metadata: {
      date: '2024-01-15',
      author: 'Sarah Johnson',
      fileType: 'PDF'
    },
    citations: ['Marketing Budget 2024.xlsx', 'Customer Survey Results.pdf']
  }
];

const trendingSearches = [
  { query: "Summarize team meeting notes", count: 245 },
  { query: "Create project timeline", count: 189 },
  { query: "Schedule follow-up emails", count: 167 },
  { query: "Generate weekly report", count: 143 },
  { query: "Find customer feedback", count: 128 },
];

const suggestedActions = [
  {
    title: "Send Email",
    description: "Send a follow-up email to the team about project updates",
    icons: [Mail],
    category: "Gmail",
    color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
  },
  {
    title: "Schedule Meeting",
    description: "Schedule a team standup for tomorrow at 10 AM",
    icons: [Calendar],
    category: "Calendar",
    color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
  },
  {
    title: "Create Google Meet",
    description: "Create a Google Meet link for the upcoming presentation",
    icons: [Video],
    category: "Meet",
    color: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
  },
  {
    title: "Sales Research before Meetings",
    description: "Research all my meetings for today and email me notes to prep",
    icons: [Mail, Calendar],
    category: "Productivity",
    color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
  },
  {
    title: "Sprint Planning",
    description: "Use linear to make a brief sprint plan doc for next 2 weeks",
    icons: [Calendar, FileText],
    category: "Planning",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
  },
  {
    title: "AI Assistant",
    description: "Ask AI to help with complex tasks and automation",
    icons: [Bot, Sparkles],
    category: "AI",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
  },
  {
    title: "Follow-Up Email Automation",
    description: "Automatically send follow-up emails to leads",
    icons: [Mail, Zap],
    category: "Automation",
    color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
  },
  {
    title: "Content Calendar",
    description: "From a campaign document generate a full content calendar",
    icons: [Calendar, FileText],
    category: "Marketing",
    color: "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
  }
];

const connectedTools: ConnectedTool[] = [
  { name: "Gmail", icon: Mail, color: "text-red-500", connected: true },
  { name: "Calendar", icon: Calendar, color: "text-blue-500", connected: true },
  { name: "Google Meet", icon: Video, color: "text-green-500", connected: true },
  { name: "Google Drive", icon: FileText, color: "text-yellow-600", connected: true },
  { name: "Slack", icon: MessageSquare, color: "text-purple-500", connected: true },
  { name: "Notion", icon: FileText, color: "text-gray-700", connected: false },
  { name: "Linear", icon: Settings, color: "text-indigo-500", connected: false },
  { name: "LinkedIn", icon: Globe, color: "text-blue-600", connected: false },
];

export const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConnectedTools, setShowConnectedTools] = useState(false);
  const [actionResults, setActionResults] = useState<any>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, authenticate, status, error: googleError, isLoading, isDemoMode, setDemoMode } = useGoogleIntegration();
  const googleServices = useGoogleServices();
  const notifications = useGoogleIntegrationNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowConnectedTools(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    setShowConnectedTools(false);
    setActionResults(null);

    try {
      // Process natural language query with AI
      const aiAction = await processNaturalLanguageQuery(query);

      if (aiAction && googleServices.isReady) {
        setIsProcessingAction(true);
        const response = await executeAIAction(aiAction);
        setActionResults(response);
      } else if (aiAction && !isAuthenticated) {
        notifications.notifyAuthenticationRequired();
        // Fallback to regular search
        setTimeout(() => {
          setResults(mockResults);
        }, 1000);
      } else {
        // Fallback to regular search
        setTimeout(() => {
          setResults(mockResults);
        }, 1000);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock results
      setTimeout(() => {
        setResults(mockResults);
      }, 1000);
    } finally {
      setIsSearching(false);
      setIsProcessingAction(false);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleActionClick = async (action: typeof suggestedActions[0]) => {
    setQuery(action.description);
    setShowSuggestions(false);

    // Auto-execute the action if Google services are ready
    if (googleServices.isReady) {
      await handleSearch();
    }
  };

  // Process natural language query to determine AI action
  const processNaturalLanguageQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Email actions
    if (lowerQuery.includes('send email') || lowerQuery.includes('email')) {
      return {
        type: 'email' as const,
        action: 'send',
        parameters: extractEmailParameters(query),
      };
    }

    // Calendar actions
    if (lowerQuery.includes('schedule') || lowerQuery.includes('meeting') || lowerQuery.includes('calendar')) {
      if (lowerQuery.includes('google meet') || lowerQuery.includes('video call')) {
        return {
          type: 'meet' as const,
          action: 'create',
          parameters: extractMeetingParameters(query),
        };
      }
      return {
        type: 'calendar' as const,
        action: 'create',
        parameters: extractEventParameters(query),
      };
    }

    // Meet actions
    if (lowerQuery.includes('create meet') || lowerQuery.includes('google meet') || lowerQuery.includes('instant meeting')) {
      if (lowerQuery.includes('instant') || lowerQuery.includes('now')) {
        return {
          type: 'meet' as const,
          action: 'instant',
          parameters: extractInstantMeetingParameters(query),
        };
      }
      return {
        type: 'meet' as const,
        action: 'create',
        parameters: extractMeetingParameters(query),
      };
    }

    // Search actions
    if (lowerQuery.includes('search') || lowerQuery.includes('find')) {
      return {
        type: 'search' as const,
        action: 'search',
        parameters: { query: query.replace(/search|find/gi, '').trim() },
      };
    }

    return null;
  };

  // Execute AI action using Google services
  const executeAIAction = async (aiAction: any) => {
    try {
      notifications.notifyActionProcessing(aiAction.type);

      switch (aiAction.type) {
        case 'email':
          if (aiAction.action === 'send') {
            const result = await googleServices.sendEmail(
              aiAction.parameters.to || ['example@email.com'],
              aiAction.parameters.subject || 'Email from AI Assistant',
              aiAction.parameters.body || query
            );

            if (result.success) {
              notifications.notifyEmailSent(
                aiAction.parameters.to || ['example@email.com'],
                aiAction.parameters.subject || 'Email from AI Assistant'
              );
            }

            return result;
          }
          break;

        case 'calendar':
          if (aiAction.action === 'create') {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

            const result = await googleServices.createEvent(
              aiAction.parameters.title || 'Meeting',
              aiAction.parameters.startDateTime || now.toISOString(),
              aiAction.parameters.endDateTime || oneHourLater.toISOString(),
              {
                description: aiAction.parameters.description,
                attendees: aiAction.parameters.attendees,
                createMeetLink: true,
              }
            );

            if (result.success) {
              notifications.notifyEventCreated(
                aiAction.parameters.title || 'Meeting',
                aiAction.parameters.startDateTime || now.toISOString()
              );
            }

            return result;
          }
          break;

        case 'meet':
          if (aiAction.action === 'instant') {
            const result = await googleServices.createInstantMeeting(
              aiAction.parameters.title || 'Instant Meeting',
              aiAction.parameters.duration || 60,
              aiAction.parameters.attendees
            );

            if (result.success && result.data?.meeting?.meetLink) {
              notifications.notifyMeetingCreated(
                aiAction.parameters.title || 'Instant Meeting',
                result.data.meeting.meetLink
              );
            }

            return result;
          } else if (aiAction.action === 'create') {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

            const result = await googleServices.createMeeting(
              aiAction.parameters.title || 'Google Meet',
              aiAction.parameters.startDateTime || now.toISOString(),
              aiAction.parameters.endDateTime || oneHourLater.toISOString(),
              {
                description: aiAction.parameters.description,
                attendees: aiAction.parameters.attendees,
              }
            );

            if (result.success && result.data?.meeting?.meetLink) {
              notifications.notifyMeetingCreated(
                aiAction.parameters.title || 'Google Meet',
                result.data.meeting.meetLink
              );
            }

            return result;
          }
          break;

        case 'search':
          const searchResult = await googleServices.searchAll(aiAction.parameters.query);

          if (searchResult.success) {
            const totalResults = (searchResult.data?.emails?.length || 0) +
                               (searchResult.data?.events?.length || 0) +
                               (searchResult.data?.meetings?.length || 0);
            notifications.notifySearchCompleted(totalResults);
          }

          return searchResult;

        default:
          return null;
      }
    } catch (error) {
      console.error('Error executing AI action:', error);
      notifications.notifyIntegrationError('Google Services', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to execute action',
      };
    }
  };

  const toggleConnectedTools = () => {
    setShowConnectedTools(!showConnectedTools);
    setShowSuggestions(false);
  };

  // Helper functions to extract parameters from natural language
  const extractEmailParameters = (query: string) => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = query.match(emailRegex) || [];

    return {
      to: emails,
      subject: extractSubject(query),
      body: query,
    };
  };

  const extractEventParameters = (query: string) => {
    return {
      title: extractTitle(query) || 'Meeting',
      description: query,
      startDateTime: extractDateTime(query) || new Date().toISOString(),
      endDateTime: extractEndDateTime(query) || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      attendees: extractEmails(query),
    };
  };

  const extractMeetingParameters = (query: string) => {
    return {
      title: extractTitle(query) || 'Google Meet',
      description: query,
      startDateTime: extractDateTime(query) || new Date().toISOString(),
      endDateTime: extractEndDateTime(query) || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      attendees: extractEmails(query),
    };
  };

  const extractInstantMeetingParameters = (query: string) => {
    return {
      title: extractTitle(query) || 'Instant Meeting',
      duration: extractDuration(query) || 60,
      attendees: extractEmails(query),
    };
  };

  const extractSubject = (query: string): string => {
    const subjectMatch = query.match(/subject[:\s]+([^,\n]+)/i);
    return subjectMatch ? subjectMatch[1].trim() : 'Email from AI Assistant';
  };

  const extractTitle = (query: string): string | null => {
    const titlePatterns = [
      /(?:meeting|call|event)\s+(?:about|for|on)\s+([^,\n]+)/i,
      /(?:schedule|create)\s+([^,\n]+?)(?:\s+meeting|\s+call|\s+event)/i,
      /"([^"]+)"/,
    ];

    for (const pattern of titlePatterns) {
      const match = query.match(pattern);
      if (match) return match[1].trim();
    }

    return null;
  };

  const extractDateTime = (query: string): string | null => {
    const now = new Date();

    // Simple time extraction - in a real app, you'd use a more sophisticated NLP library
    if (query.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString();
    }

    if (query.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString();
    }

    return null;
  };

  const extractEndDateTime = (query: string): string | null => {
    const startTime = extractDateTime(query);
    if (startTime) {
      const start = new Date(startTime);
      const duration = extractDuration(query);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      return end.toISOString();
    }
    return null;
  };

  const extractDuration = (query: string): number => {
    const durationMatch = query.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[0].toLowerCase();
      return unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
    }
    return 60; // Default 1 hour
  };

  const extractEmails = (query: string): string[] => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return query.match(emailRegex) || [];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'slack': return <Slack className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'email': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'calendar': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'slack': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8" ref={searchRef}>
      {/* Enhanced Search Bar with Gradient Background */}
      <div className="relative group mb-8">
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative">
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center gap-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleConnectedTools}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
              <Plus className="h-4 w-4 text-gray-500" />
            </Button>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-500 font-medium">Ask AI</span>
          </div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything: 'Send email to john@example.com', 'Schedule meeting tomorrow 2PM', 'Create Google Meet for team standup'..."
            className="pl-56 pr-24 h-20 text-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-2xl shadow-2xl text-foreground placeholder:text-muted-foreground/70 transition-all duration-300 focus:shadow-purple-500/20 focus:scale-[1.01] hover:shadow-xl"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={handleFocus}
          />

          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Mic className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="h-14 w-14 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 rounded-full shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              size="icon"
            >
              {isSearching ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <ArrowUp className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Google Authentication Status */}
        {!isAuthenticated && (
          <Card className="absolute top-full left-0 right-0 mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-2xl z-40 rounded-2xl">
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center justify-center gap-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isDemoMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDemoMode(true)}
                    className="text-xs"
                  >
                    Demo
                  </Button>
                  <Button
                    variant={!isDemoMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDemoMode(false)}
                    className="text-xs"
                  >
                    Real API
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Connect Google Services {isDemoMode ? "(Demo Mode)" : "(Real API)"}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      {isDemoMode
                        ? "Demo mode with mock Gmail, Calendar, and Meet functionality"
                        : "Real Google API integration with your actual account"
                      }
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Mail className="h-3 w-3" />
                      <span>{isDemoMode ? "Mock emails" : "Real emails"}</span>
                      <Calendar className="h-3 w-3 ml-2" />
                      <span>{isDemoMode ? "Mock events" : "Real events"}</span>
                      <Video className="h-3 w-3 ml-2" />
                      <span>{isDemoMode ? "Mock Meet links" : "Real Meet links"}</span>
                    </div>
                    {isDemoMode && (
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 italic">
                        Perfect for testing UI and functionality
                      </p>
                    )}
                    {!isDemoMode && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 italic">
                        You've been added as a test user - should work now!
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={authenticate}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Connect {isDemoMode ? "(Demo)" : "(Real)"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Connected Status */}
        {isAuthenticated && (
          <Card className="absolute top-full left-0 right-0 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 shadow-xl z-40 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                    Google Services Connected {isDemoMode ? "(Demo Mode)" : "(Real API)"}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {isDemoMode
                      ? "Ready to demo email sending, event creation, and Meet link generation"
                      : "Connected to your real Google account - ready for actual API calls"
                    }
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 italic">
                    {isDemoMode ? "Using mock data for development testing" : "Using real Google APIs"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isDemoMode ? "secondary" : "default"} className="text-xs">
                  {isDemoMode ? "Demo" : "Real"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDemoMode(!isDemoMode)}
                  className="text-xs"
                >
                  Switch to {isDemoMode ? "Real" : "Demo"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Google Error Display */}
        {googleError && (
          <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg z-40">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Google Integration Error
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {googleError}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Connected Tools Dropdown */}
        {showConnectedTools && (
          <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-background/95 backdrop-blur-sm border shadow-xl z-50">
            <h3 className="text-sm font-semibold text-foreground mb-3">Connected Tools</h3>
            <div className="grid grid-cols-3 gap-3">
              {connectedTools.map((tool, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                    tool.connected 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tool.icon className={`h-4 w-4 ${tool.color}`} />
                  <span className="text-xs font-medium text-foreground">{tool.name}</span>
                  {tool.connected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && !showConnectedTools && (
          <Card className="absolute top-full left-0 right-0 mt-2 p-6 bg-background/95 backdrop-blur-sm border shadow-xl z-50">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Trending Searches */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Searches
                </h3>
                <div className="space-y-2">
                  {trendingSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(search.query)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-colors"
                    >
                      <span className="text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {search.query}
                      </span>
                      <span className="text-xs text-muted-foreground">{search.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Actions */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Suggested Actions
                </h3>
                <div className="grid gap-3 max-h-80 overflow-y-auto">
                  {suggestedActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className={`p-4 rounded-xl border-2 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${action.color || 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          {action.icons.map((Icon, iconIndex) => (
                            <Icon key={iconIndex} className="h-5 w-5" />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold mb-1 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-xs opacity-80 line-clamp-2 mb-2">
                            {action.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {action.category}
                            </Badge>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Examples */}
      {!query && !isSearching && !showSuggestions && (
        <div className="space-y-6 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What can I help you with?
            </h2>
            <p className="text-muted-foreground">
              Try these example commands or type your own natural language request
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Send an email",
                example: "Send an email to john@example.com with subject 'Meeting Tomorrow' and body 'Hi John, let's meet tomorrow at 2 PM'",
                icon: Mail,
                color: "from-red-500 to-pink-500"
              },
              {
                title: "Schedule a meeting",
                example: "Schedule a team meeting tomorrow at 2 PM with Google Meet link",
                icon: Calendar,
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Create Google Meet",
                example: "Create an instant Google Meet for team standup",
                icon: Video,
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Search emails",
                example: "Search for emails from manager about project update",
                icon: Search,
                color: "from-purple-500 to-violet-500"
              }
            ].map((item, index) => (
              <Card
                key={index}
                className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-purple-300 dark:hover:border-purple-600 group"
                onClick={() => setQuery(item.example)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.example}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Search Results ({results.length})
          </h2>
          
          {results.map((result) => (
            <Card key={result.id} className="p-6 bg-background/50 backdrop-blur-sm border hover:bg-background/70 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${getTypeColor(result.type)} flex items-center gap-1`}>
                    {getTypeIcon(result.type)}
                    {result.source}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {result.metadata.date} • {result.metadata.author}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-foreground mb-2">
                {result.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {result.preview}
              </p>
              
              {result.citations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Related:</span>
                  {result.citations.map((citation, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                      {citation}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* AI Action Results */}
      {actionResults && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              Action Results
            </h2>
            {isProcessingAction && (
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            )}
          </div>

          <Card className={`p-6 border-2 ${
            actionResults.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {actionResults.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
              )}

              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  actionResults.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {actionResults.success ? 'Success!' : 'Error'}
                </h3>

                <p className={`mb-4 ${
                  actionResults.success
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {actionResults.message}
                </p>

                {/* Display specific action data */}
                {actionResults.success && actionResults.data && (
                  <div className="space-y-3">
                    {/* Email results */}
                    {actionResults.data.messageId && (
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email sent successfully
                        </p>
                        <p className="text-xs text-gray-500">
                          Message ID: {actionResults.data.messageId}
                        </p>
                      </div>
                    )}

                    {/* Meeting results */}
                    {actionResults.data.meeting && (
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meeting: {actionResults.data.meeting.title}
                        </p>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <p>Start: {new Date(actionResults.data.meeting.startDateTime).toLocaleString()}</p>
                          <p>End: {new Date(actionResults.data.meeting.endDateTime).toLocaleString()}</p>
                          {actionResults.data.meeting.meetLink && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                onClick={() => window.open(actionResults.data.meeting.meetLink, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join Meeting
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Event results */}
                    {actionResults.data.event && (
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Event: {actionResults.data.event.summary}
                        </p>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <p>Start: {new Date(actionResults.data.event.start.dateTime || actionResults.data.event.start.date).toLocaleString()}</p>
                          <p>End: {new Date(actionResults.data.event.end.dateTime || actionResults.data.event.end.date).toLocaleString()}</p>
                          {actionResults.data.event.location && (
                            <p>Location: {actionResults.data.event.location}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Search results */}
                    {actionResults.data.emails && actionResults.data.emails.length > 0 && (
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Found {actionResults.data.emails.length} emails
                        </p>
                        <div className="space-y-2">
                          {actionResults.data.emails.slice(0, 3).map((email: any, index: number) => (
                            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 pl-2">
                              <p className="font-medium">{email.subject}</p>
                              <p>From: {email.from}</p>
                              <p>{new Date(email.date).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {actionResults.error && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Error: {actionResults.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
