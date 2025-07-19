import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Clock,
  User,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Code,
  ExternalLink,
  Star,
  MoreHorizontal,
  ChevronDown,
  Zap,
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';
import { demoToolsService, DemoSearchResult } from '@/services/demoToolsService';
import { SearchLoading, SearchResultSkeleton } from '@/components/ui/loading-states';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: {
    name: string;
    icon: React.ComponentType<any>;
    color: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'email' | 'document' | 'message' | 'calendar' | 'code' | 'task';
  relevanceScore: number;
  tags: string[];
  url?: string;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Q4 Planning Meeting Notes',
    content: 'Discussed quarterly objectives, budget allocation, and team restructuring. Key decisions made regarding product roadmap and resource allocation...',
    source: { name: 'Google Docs', icon: FileText, color: 'text-blue-500' },
    author: { name: 'Sarah Johnson' },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'document',
    relevanceScore: 95,
    tags: ['planning', 'quarterly', 'meeting'],
    url: 'https://docs.google.com/document/d/example'
  },
  {
    id: '2',
    title: 'Re: Project Timeline Update',
    content: 'Thanks for the update on the project timeline. I have a few concerns about the delivery date. Can we schedule a call to discuss?',
    source: { name: 'Gmail', icon: Mail, color: 'text-red-500' },
    author: { name: 'Mike Chen' },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'email',
    relevanceScore: 88,
    tags: ['project', 'timeline', 'urgent'],
  },
  {
    id: '3',
    title: 'Team Standup - Daily',
    content: 'Daily standup meeting with the development team. Discuss progress, blockers, and plan for the day.',
    source: { name: 'Google Calendar', icon: Calendar, color: 'text-green-500' },
    author: { name: 'System' },
    timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
    type: 'calendar',
    relevanceScore: 82,
    tags: ['standup', 'daily', 'team'],
  },
  {
    id: '4',
    title: 'API Documentation Updates',
    content: 'Updated the REST API documentation with new endpoints and authentication methods. Please review and provide feedback.',
    source: { name: 'Slack', icon: MessageSquare, color: 'text-purple-500' },
    author: { name: 'Alex Rivera' },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'message',
    relevanceScore: 79,
    tags: ['api', 'documentation', 'review'],
  },
  {
    id: '5',
    title: 'Feature Implementation: User Dashboard',
    content: 'Implemented the new user dashboard with real-time analytics and improved navigation. Ready for code review.',
    source: { name: 'GitHub', icon: Code, color: 'text-gray-700' },
    author: { name: 'Emma Wilson' },
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'code',
    relevanceScore: 75,
    tags: ['feature', 'dashboard', 'analytics'],
    url: 'https://github.com/company/repo/pull/123'
  }
];

interface ActionResult {
  id: string;
  action: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  description: string;
  result?: string;
  timestamp: string;
}

interface SearchResultsProps {
  query?: string;
  actions?: ActionResult[];
  onActionExecute?: (action: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query = '',
  actions = [],
  onActionExecute = () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [demoResults, setDemoResults] = useState<DemoSearchResult[]>([]);
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated, isDemoMode } = useGoogleIntegration();

  // Perform search when component mounts or query changes
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Search demo tools
      const demoSearchResults = await demoToolsService.searchAcrossTools(searchQuery);
      setDemoResults(demoSearchResults);

      // TODO: Add Google search integration here
      // For now, we'll use mock Google results
      setGoogleResults([]);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Combine all results
  const allResults = [
    ...mockResults.map(r => ({ ...r, source: { name: r.source.name, icon: r.source.icon, color: r.source.color } })),
    ...demoResults.map(r => ({
      ...r,
      content: r.content,
      source: { name: r.source.name, icon: () => <span>{r.source.icon}</span>, color: r.source.color }
    }))
  ];

  const filters = [
    { id: 'all', label: 'All Results', count: allResults.length },
    { id: 'email', label: 'Emails', count: allResults.filter(r => r.type === 'email').length },
    { id: 'document', label: 'Documents', count: allResults.filter(r => r.type === 'document').length },
    { id: 'message', label: 'Messages', count: allResults.filter(r => r.type === 'message').length },
    { id: 'calendar', label: 'Calendar', count: allResults.filter(r => r.type === 'calendar').length },
    { id: 'code', label: 'Code', count: allResults.filter(r => r.type === 'code').length },
    { id: 'task', label: 'Tasks', count: allResults.filter(r => r.type === 'task').length },
    { id: 'page', label: 'Pages', count: allResults.filter(r => r.type === 'page').length },
  ];

  const filteredResults = selectedFilter === 'all'
    ? allResults
    : allResults.filter(result => result.type === selectedFilter);

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'relevance': return b.relevanceScore - a.relevanceScore;
      case 'date': return b.timestamp.getTime() - a.timestamp.getTime();
      case 'source': return a.source.name.localeCompare(b.source.name);
      default: return 0;
    }
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'email': return Mail;
      case 'document': return FileText;
      case 'message': return MessageSquare;
      case 'calendar': return Calendar;
      case 'code': return Code;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  performSearch(searchQuery);
                }
              }}
              placeholder="Search across all your tools and documents..."
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching across all tools...
                </div>
              ) : (
                <>
                  {query && `Results for "${query}" - `}
                  Found <span className="font-medium text-foreground">{filteredResults.length}</span> results
                  across <span className="font-medium text-foreground">{filters.filter(f => f.count > 0).length}</span> tools
                </>
              )}
            </div>
            {!isSearching && filteredResults.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Ranked
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-background border border-border rounded px-2 py-1"
              disabled={isSearching}
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="source">Source</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        {query && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick actions:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActionExecute('Create task from these results')}
            >
              <Zap className="h-3 w-3 mr-1" />
              Create Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActionExecute('Send summary email')}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email Summary
            </Button>
          </div>
        )}
      </div>

      {/* Action Results */}
      {actions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recent Actions
          </h3>
          <div className="grid gap-3">
            {actions.slice(0, 3).map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {action.status === 'completed' && <div className="h-2 w-2 bg-green-500 rounded-full" />}
                  {action.status === 'failed' && <div className="h-2 w-2 bg-red-500 rounded-full" />}
                  {action.status === 'executing' && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
                  {action.status === 'pending' && <div className="h-2 w-2 bg-gray-400 rounded-full" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm">{action.action}</p>
                    <Badge variant={action.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {action.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                  {action.result && (
                    <div className="mt-2 p-2 bg-background rounded border text-xs">
                      <p className="text-foreground">{action.result}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{action.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${selectedFilter === filter.id
                ? 'bg-[hsl(var(--brand-primary))] text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <span>{filter.label}</span>
            <Badge variant="secondary" className="text-xs">
              {filter.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <SearchLoading query={query} />
      ) : (
        <div className="space-y-4">
          {sortedResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or connecting more tools
              </p>
            </div>
          ) : (
            sortedResults.map((result) => {
              const SourceIcon = result.source.icon;
              const TypeIcon = getTypeIcon(result.type);

              return (
                <Card key={result.id} className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-[hsl(var(--brand-primary))]/20">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${result.source.color} group-hover:scale-105 transition-transform`}>
                          <SourceIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground group-hover:text-[hsl(var(--brand-primary))] transition-colors line-clamp-1">
                            {result.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{result.source.name}</span>
                            <span>•</span>
                            <User className="h-3 w-3" />
                            <span>{result.author.name}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(result.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {result.relevanceScore}% match
                        </Badge>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pl-11">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {result.content}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs hover:bg-[hsl(var(--brand-primary))]/10 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-7 hover:bg-[hsl(var(--brand-primary))]/10">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        {result.url && (
                          <Button size="sm" variant="ghost" className="text-xs h-7">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Source
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-xs h-7">
                          <Star className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7"
                          onClick={() => onActionExecute(`Quick action on ${result.title}`)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Quick Action
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          <ChevronDown className="h-4 w-4 mr-2" />
          Load More Results
        </Button>
      </div>
    </div>
  );
};
