import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Plus,
  Mail,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Code,
  Database,
  BarChart3,
  Users,
  Briefcase,
  Cloud,
  Zap,
  GitBranch,
  Trello,
  Slack
} from 'lucide-react';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'communication' | 'productivity' | 'development' | 'analytics' | 'storage';
  connected: boolean;
  features: string[];
  status: 'connected' | 'disconnected' | 'error' | 'pending';
}

const enterpriseTools: Tool[] = [
  // Google Workspace
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email management and communication',
    icon: Mail,
    color: 'text-red-500',
    category: 'communication',
    connected: true,
    features: ['Send emails', 'Search inbox', 'Manage labels'],
    status: 'connected'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule meetings and manage events',
    icon: Calendar,
    color: 'text-blue-500',
    category: 'productivity',
    connected: true,
    features: ['Create events', 'Schedule meetings', 'Manage calendar'],
    status: 'connected'
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Video conferencing and collaboration',
    icon: Video,
    color: 'text-green-500',
    category: 'communication',
    connected: true,
    features: ['Create meetings', 'Generate links', 'Schedule calls'],
    status: 'connected'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Cloud storage and document management',
    icon: Cloud,
    color: 'text-yellow-500',
    category: 'storage',
    connected: true,
    features: ['File storage', 'Document sharing', 'Collaboration'],
    status: 'connected'
  },

  // Communication Tools
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration',
    icon: MessageSquare,
    color: 'text-purple-500',
    category: 'communication',
    connected: false,
    features: ['Send messages', 'Search channels', 'File sharing'],
    status: 'disconnected'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Enterprise communication platform',
    icon: Users,
    color: 'text-blue-600',
    category: 'communication',
    connected: false,
    features: ['Team chat', 'Video calls', 'File collaboration'],
    status: 'disconnected'
  },

  // Development Tools
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and version control',
    icon: GitBranch,
    color: 'text-gray-800 dark:text-gray-200',
    category: 'development',
    connected: false,
    features: ['Repository access', 'Issue tracking', 'Pull requests'],
    status: 'disconnected'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform and CI/CD',
    icon: Code,
    color: 'text-orange-500',
    category: 'development',
    connected: false,
    features: ['Code management', 'CI/CD pipelines', 'Issue tracking'],
    status: 'disconnected'
  },

  // Project Management
  {
    id: 'jira',
    name: 'Jira',
    description: 'Issue tracking and project management',
    icon: Briefcase,
    color: 'text-blue-700',
    category: 'productivity',
    connected: false,
    features: ['Issue tracking', 'Sprint planning', 'Reporting'],
    status: 'disconnected'
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Visual project management boards',
    icon: Trello,
    color: 'text-blue-500',
    category: 'productivity',
    connected: false,
    features: ['Board management', 'Card tracking', 'Team collaboration'],
    status: 'disconnected'
  },

  // Analytics & Data
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Web analytics and insights',
    icon: BarChart3,
    color: 'text-orange-500',
    category: 'analytics',
    connected: false,
    features: ['Traffic analysis', 'User insights', 'Custom reports'],
    status: 'disconnected'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes and docs',
    icon: FileText,
    color: 'text-gray-700',
    category: 'productivity',
    connected: false,
    features: ['Note taking', 'Database management', 'Team wikis'],
    status: 'disconnected'
  }
];

export const ToolIntegrations: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { isAuthenticated, isDemoMode } = useGoogleIntegration();

  const categories = [
    { id: 'all', label: 'All Tools', count: enterpriseTools.length },
    { id: 'communication', label: 'Communication', count: enterpriseTools.filter(t => t.category === 'communication').length },
    { id: 'productivity', label: 'Productivity', count: enterpriseTools.filter(t => t.category === 'productivity').length },
    { id: 'development', label: 'Development', count: enterpriseTools.filter(t => t.category === 'development').length },
    { id: 'analytics', label: 'Analytics', count: enterpriseTools.filter(t => t.category === 'analytics').length },
    { id: 'storage', label: 'Storage', count: enterpriseTools.filter(t => t.category === 'storage').length },
  ];

  const filteredTools = selectedCategory === 'all' 
    ? enterpriseTools 
    : enterpriseTools.filter(tool => tool.category === selectedCategory);

  const connectedCount = enterpriseTools.filter(tool => tool.connected).length;

  const getStatusIcon = (status: Tool['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Connecting</Badge>;
      default: return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-700 dark:text-green-300">{connectedCount}</div>
          <div className="text-xs text-green-600 dark:text-green-400">Connected</div>
        </div>
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{enterpriseTools.length}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Total Tools</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">Categories</div>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                ${selectedCategory === category.id
                  ? 'bg-[hsl(var(--brand-primary))] text-white'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{category.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">
            {selectedCategory === 'all' ? 'All Tools' : categories.find(c => c.id === selectedCategory)?.label}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Tool
          </Button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          {filteredTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card key={tool.id} className="p-3 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${tool.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {tool.name}
                      </h3>
                      {getStatusIcon(tool.status)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {getStatusBadge(tool.status)}
                      
                      {tool.connected ? (
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          <Settings className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add New Integration */}
      <Card className="p-4 border-dashed border-2 hover:border-[hsl(var(--brand-primary))] transition-colors cursor-pointer">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto bg-[hsl(var(--brand-primary))] rounded-full flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm font-medium text-foreground">Add New Integration</div>
          <div className="text-xs text-muted-foreground">
            Connect more tools to expand your search capabilities
          </div>
        </div>
      </Card>
    </div>
  );
};
