
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
  Users,
  ArrowUp,
  Paperclip
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

const toolSuggestions = [
  {
    icon: Calendar,
    title: 'Sprint Planning',
    description: 'Look at Linear and create a sprint plan for the next 2 weeks',
    color: 'from-blue-500 to-purple-500'
  },
  {
    icon: FileText,
    title: 'Summarize Meetings',
    description: 'Summarize my key meetings this week from Google Calendar',
    color: 'from-green-500 to-blue-500'
  },
  {
    icon: Mail,
    title: 'Scan Emails',
    description: 'Check my emails and send out meetings to anyone needed',
    color: 'from-red-500 to-pink-500'
  }
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
      case 'document': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'email': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'calendar': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'slack': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-6 flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">+</span>
            <span className="text-sm text-gray-400">Add integration</span>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Summarize my key meetings this week from Google Calendar, create an agenda for each, and email it to me."
            className="pl-48 pr-16 h-20 text-lg bg-gray-800/50 border-2 border-gray-600 focus:border-purple-500 rounded-2xl shadow-2xl text-white placeholder:text-gray-400 backdrop-blur-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div className="absolute right-4">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 w-12 bg-white hover:bg-gray-100 rounded-full shadow-lg"
              size="icon"
            >
              <ArrowUp className="h-5 w-5 text-gray-900" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tool Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {toolSuggestions.map((tool, index) => (
          <Card 
            key={index}
            className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all cursor-pointer group"
            onClick={() => handleSuggestionClick(tool.description)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{tool.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Search Results ({results.length})
          </h2>
          
          {results.map((result) => (
            <Card key={result.id} className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${getTypeColor(result.type)} flex items-center gap-1`}>
                    {getTypeIcon(result.type)}
                    {result.source}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {result.metadata.date} • {result.metadata.author}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-2">
                {result.title}
              </h3>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                {result.preview}
              </p>
              
              {result.citations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-400">Related:</span>
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
