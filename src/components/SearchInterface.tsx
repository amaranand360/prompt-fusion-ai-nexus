
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
  Plus
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

export const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
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
            placeholder="Ask anything or search across all your connected apps..."
            className="pl-12 pr-20 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-lg">
              <Mic className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {[
          'Create presentation',
          'Schedule meeting',
          'Send email update',
          'Generate report',
          'Find documents'
        ].map((action) => (
          <Button key={action} variant="outline" size="sm" className="rounded-full">
            <Plus className="h-3 w-3 mr-1" />
            {action}
          </Button>
        ))}
      </div>

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
