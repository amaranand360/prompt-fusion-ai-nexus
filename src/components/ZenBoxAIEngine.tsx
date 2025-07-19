import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MessageSquare, 
  Settings, 
  Zap,
  Building2,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  Command
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { ToolIntegrations } from './ToolIntegrations';
import { SearchResults } from './SearchResults';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';

interface ZenBoxAIEngineProps {
  className?: string;
}

export const ZenBoxAIEngine: React.FC<ZenBoxAIEngineProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const { isAuthenticated, isDemoMode } = useGoogleIntegration();

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">ZB</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    ZenBox <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">AI</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Your AI-powered productivity companion
                  </p>
                </div>
              </div>
            </div>

            {/* Status and Controls */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <Badge variant="default" className="bg-[hsl(var(--success))] text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Connected ({isDemoMode ? 'Demo' : 'Live'})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2" />
                    Disconnected
                  </Badge>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar - Tool Integrations */}
          <div className="lg:col-span-1">
            <Card className="h-full p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                  <h2 className="font-semibold text-foreground">Connected Tools</h2>
                </div>
                <ToolIntegrations />
              </div>
            </Card>
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b px-4 py-3">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat Assistant</span>
                    </TabsTrigger>
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Search Results</span>
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Quick Actions</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="chat" className="h-full m-0">
                    <ChatInterface />
                  </TabsContent>

                  <TabsContent value="search" className="h-full m-0 p-4">
                    <SearchResults />
                  </TabsContent>

                  <TabsContent value="actions" className="h-full m-0 p-4">
                    <QuickActions />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 ZenBox AI</span>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>AI-Powered Security</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>50+ Tool Integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const quickActions = [
    {
      title: 'Send Email',
      description: 'Compose and send emails through Gmail',
      icon: '📧',
      action: 'Send an email to team@company.com with subject "Weekly Update"',
      category: 'Communication'
    },
    {
      title: 'Schedule Meeting',
      description: 'Create calendar events and invite attendees',
      icon: '📅',
      action: 'Schedule a team meeting tomorrow at 2 PM with Google Meet',
      category: 'Calendar'
    },
    {
      title: 'Create Document',
      description: 'Generate new documents in Google Drive',
      icon: '📄',
      action: 'Create a new document for project planning',
      category: 'Documents'
    },
    {
      title: 'Search Slack',
      description: 'Find messages and files in Slack channels',
      icon: '💬',
      action: 'Search Slack for messages about project deadline',
      category: 'Communication'
    },
    {
      title: 'Update Jira',
      description: 'Create and update Jira tickets',
      icon: '🎫',
      action: 'Create a new Jira ticket for bug fix',
      category: 'Project Management'
    },
    {
      title: 'GitHub Actions',
      description: 'Trigger deployments and check CI/CD status',
      icon: '🚀',
      action: 'Check the status of latest deployment',
      category: 'Development'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <Badge variant="secondary">6 Available</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{action.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground group-hover:text-[hsl(var(--brand-primary))] transition-colors">
                    {action.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {action.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {action.description}
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Try Action
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
