import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Zap
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
    title: "Sales Research before Meetings",
    description: "Research all my meetings for today and email me notes to prep",
    icons: [Mail, Calendar],
    category: "Productivity"
  },
  {
    title: "Sprint Planning",
    description: "Use linear to make a brief sprint plan doc for next 2 weeks",
    icons: [Calendar, FileText],
    category: "Planning"
  },
  {
    title: "Find Contact Info from LinkedIn",
    description: "Given a LinkedIn profile, find the contact info",
    icons: [Globe, Users],
    category: "Research"
  },
  {
    title: "Overnight Updates",
    description: "Update me on overnight slack/email messages",
    icons: [Slack, Mail],
    category: "Updates"
  },
  {
    title: "Follow-Up Email Automation",
    description: "Automatically send follow-up emails to leads",
    icons: [Mail, Zap],
    category: "Automation"
  },
  {
    title: "Inbound Lead Qualification",
    description: "Qualify inbound leads automatically",
    icons: [Users, BarChart],
    category: "Sales"
  },
  {
    title: "Content Calendar",
    description: "From a campaign document generate a full content calendar",
    icons: [Calendar, FileText],
    category: "Marketing"
  },
  {
    title: "Expense Analysis",
    description: "Analyze my expenses and generate a report",
    icons: [BarChart, FileText],
    category: "Finance"
  }
];

const connectedTools: ConnectedTool[] = [
  { name: "Gmail", icon: Mail, color: "text-red-500", connected: true },
  { name: "Calendar", icon: Calendar, color: "text-blue-500", connected: true },
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
  const searchRef = useRef<HTMLDivElement>(null);

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
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleActionClick = (action: typeof suggestedActions[0]) => {
    setQuery(action.description);
    setShowSuggestions(false);
  };

  const toggleConnectedTools = () => {
    setShowConnectedTools(!showConnectedTools);
    setShowSuggestions(false);
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
    <div className="max-w-4xl mx-auto space-y-8" ref={searchRef}>
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleConnectedTools}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Paperclip className="h-4 w-4 text-gray-500" />
              <Plus className="h-3 w-3 text-gray-500" />
            </Button>
            <span className="text-sm text-gray-500">Add integration</span>
          </div>
          
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Summarize my key meetings this week from Google Calendar, create an agenda for each, and email it to me."
            className="pl-48 pr-16 h-16 text-base bg-background/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-2xl shadow-lg text-foreground placeholder:text-muted-foreground transition-all duration-200"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={handleFocus}
          />
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="h-10 w-10 bg-foreground hover:bg-foreground/90 rounded-full shadow-lg"
              size="icon"
            >
              <ArrowUp className="h-4 w-4 text-background" />
            </Button>
          </div>
        </div>

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
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {suggestedActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer group transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1">
                          {action.icons.map((Icon, iconIndex) => (
                            <Icon key={iconIndex} className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {action.description}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {action.category}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

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
    </div>
  );
};
