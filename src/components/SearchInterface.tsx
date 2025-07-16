
import React, { useState } from 'react';
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
  Users
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
  },
  {
    id: '2',
    title: 'Team Standup - Project Alpha',
    content: 'Daily standup discussing progress on Project Alpha development...',
    source: 'Slack',
    type: 'slack',
    preview: 'Discussion about sprint progress, blockers, and next steps for the alpha release.',
    metadata: {
      date: '2024-01-14',
      author: 'Dev Team'
    },
    citations: ['Sprint Planning Board', 'Technical Requirements Doc']
  }
];

const trendingSearches = [
  { query: 'Q4 budget planning', count: 145, icon: TrendingUp },
  { query: 'Team performance metrics', count: 89, icon: Users },
  { query: 'Product roadmap 2024', count: 73, icon: Calendar },
  { query: 'Marketing campaign analysis', count: 62, icon: FileText }
];

const suggestedActions = [
  'Create presentation from last meeting notes',
  'Schedule weekly team sync',
  'Generate expense report',
  'Find similar documents to current project',
  'Summarize email thread from yesterday'
];

export const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowSuggestions(false);
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
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
      case 'document': return 'bg-blue-100 text-blue-700';
      case 'email': return 'bg-green-100 text-green-700';
      case 'calendar': return 'bg-purple-100 text-purple-700';
      case 'slack': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all your apps or ask Kroolo to help you with any task..."
            className="pl-12 pr-20 h-16 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl shadow-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-12 w-12 rounded-xl">
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-6"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <Card className="absolute top-full left-0 right-0 mt-2 p-4 shadow-2xl border-2 z-50 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <h3 className="font-medium text-gray-900">Trending</h3>
                </div>
                <div className="space-y-2">
                  {trendingSearches.map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(trend.query)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <div className="flex items-center gap-2">
                        <trend.icon className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{trend.query}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {trend.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium text-gray-900">Suggested Actions</h3>
                </div>
                <div className="space-y-2">
                  {suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(action)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <Plus className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {!showSuggestions && (
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            'Create presentation',
            'Schedule meeting',
            'Send email update',
            'Generate report',
            'Find documents'
          ].map((action) => (
            <Button 
              key={action} 
              variant="outline" 
              size="sm" 
              className="rounded-full hover:bg-blue-50 hover:border-blue-300"
              onClick={() => handleSuggestionClick(action)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {action}
            </Button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results ({results.length})
          </h2>
          
          {results.map((result) => (
            <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${getTypeColor(result.type)} flex items-center gap-1`}>
                    {getTypeIcon(result.type)}
                    {result.source}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {result.metadata.date} • {result.metadata.author}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {result.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {result.preview}
              </p>
              
              {result.citations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Related:</span>
                  {result.citations.map((citation, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
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
