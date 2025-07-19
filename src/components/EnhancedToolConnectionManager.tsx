import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';
import { OAuthService, OAuthConnection } from '@/services/oauthService';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  ExternalLink,
  Shield,
  Zap,
  Users,
  Calendar,
  Mail,
  MessageSquare,
  Target
} from 'lucide-react';

interface ToolConnection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  isConnected: boolean;
  isConnecting: boolean;
  lastSync?: Date;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  features: string[];
  error?: string;
  requiresOAuth: boolean;
}

export const EnhancedToolConnectionManager: React.FC = () => {
  const { isAuthenticated: googleAuthenticated, isDemoMode, authenticate: authenticateGoogle, disconnect: disconnectGoogle } = useGoogleIntegration();
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [oauthConnections, setOAuthConnections] = useState<Map<string, OAuthConnection>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'google', 'communication', 'productivity', 'project-management'];

  useEffect(() => {
    initializeConnections();
    loadOAuthConnections();
  }, [googleAuthenticated]);

  const initializeConnections = () => {
    const toolConnections: ToolConnection[] = [
      // Google Services
      {
        id: 'google-gmail',
        name: 'Gmail',
        description: 'Send and manage emails',
        icon: <Mail className="h-5 w-5" />,
        color: 'text-red-500',
        category: 'google',
        isConnected: googleAuthenticated,
        isConnecting: false,
        features: ['Send emails', 'Read emails', 'Search messages', 'Manage labels'],
        requiresOAuth: true
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Schedule and manage events',
        icon: <Calendar className="h-5 w-5" />,
        color: 'text-blue-500',
        category: 'google',
        isConnected: googleAuthenticated,
        isConnecting: false,
        features: ['Create events', 'View calendar', 'Manage meetings', 'Set reminders'],
        requiresOAuth: true
      },
      {
        id: 'google-meet',
        name: 'Google Meet',
        description: 'Create and join video meetings',
        icon: <Users className="h-5 w-5" />,
        color: 'text-green-500',
        category: 'google',
        isConnected: googleAuthenticated,
        isConnecting: false,
        features: ['Create meetings', 'Join calls', 'Schedule video calls', 'Share screen'],
        requiresOAuth: true
      },
      // Communication Tools
      {
        id: 'slack',
        name: 'Slack',
        description: 'Team communication and collaboration',
        icon: <MessageSquare className="h-5 w-5" />,
        color: 'text-purple-500',
        category: 'communication',
        isConnected: false,
        isConnecting: false,
        features: ['Send messages', 'Search channels', 'File sharing', 'Team collaboration'],
        requiresOAuth: true
      },
      // Project Management
      {
        id: 'jira',
        name: 'Jira',
        description: 'Issue tracking and project management',
        icon: <Target className="h-5 w-5" />,
        color: 'text-blue-600',
        category: 'project-management',
        isConnected: false,
        isConnecting: false,
        features: ['Track issues', 'Manage projects', 'Sprint planning', 'Workflow automation'],
        requiresOAuth: true
      }
    ];

    setConnections(toolConnections);
    setIsLoading(false);
  };

  const loadOAuthConnections = () => {
    const connections = OAuthService.getAllConnections();
    setOAuthConnections(connections);
    
    // Update connection status based on OAuth connections
    setConnections(prev => prev.map(conn => {
      const oauthConn = connections.get(conn.id);
      if (oauthConn) {
        return {
          ...conn,
          isConnected: oauthConn.isConnected,
          lastSync: oauthConn.lastSync,
          userInfo: oauthConn.userInfo,
          error: oauthConn.error
        };
      }
      return conn;
    }));
  };

  const handleGoogleConnect = async () => {
    if (googleAuthenticated) {
      disconnectGoogle();
    } else {
      try {
        await authenticateGoogle();
      } catch (error) {
        console.error('Google authentication failed:', error);
      }
    }
  };

  const handleOAuthConnect = async (toolId: string) => {
    const connection = connections.find(c => c.id === toolId);
    if (!connection) return;

    // Update connecting state
    setConnections(prev => prev.map(c => 
      c.id === toolId ? { ...c, isConnecting: true } : c
    ));

    try {
      // Map tool IDs to OAuth provider IDs
      const providerMap: Record<string, string> = {
        'slack': 'slack',
        'jira': 'jira'
      };

      const providerId = providerMap[toolId];
      if (!providerId) {
        throw new Error(`No OAuth provider configured for ${toolId}`);
      }

      await OAuthService.startOAuthFlow(providerId);
    } catch (error) {
      console.error(`Failed to connect ${toolId}:`, error);
      
      // Update error state
      setConnections(prev => prev.map(c => 
        c.id === toolId ? { 
          ...c, 
          isConnecting: false, 
          error: error instanceof Error ? error.message : 'Connection failed' 
        } : c
      ));
    }
  };

  const handleDisconnect = (toolId: string) => {
    if (toolId.startsWith('google-')) {
      disconnectGoogle();
    } else {
      // Map tool IDs to OAuth provider IDs
      const providerMap: Record<string, string> = {
        'slack': 'slack',
        'jira': 'jira'
      };

      const providerId = providerMap[toolId];
      if (providerId) {
        OAuthService.disconnect(providerId);
        loadOAuthConnections();
      }
    }
  };

  const getConnectionStats = () => {
    const total = connections.length;
    const connected = connections.filter(c => c.isConnected).length;
    const percentage = total > 0 ? (connected / total) * 100 : 0;
    
    return { total, connected, percentage };
  };

  const filteredConnections = connections.filter(conn => 
    selectedCategory === 'all' || conn.category === selectedCategory
  );

  const stats = getConnectionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tool Connections</h2>
          <p className="text-muted-foreground">
            Connect your favorite tools to unlock ZenBox AI's full potential
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium">OAuth Secured</span>
        </div>
      </div>

      {/* Stats Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Connection Overview</h3>
          <Badge variant={stats.connected > 0 ? "default" : "secondary"}>
            {stats.connected}/{stats.total} Connected
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(stats.percentage)}%</span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
        </div>

        {stats.connected > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Great! You have {stats.connected} tool{stats.connected !== 1 ? 's' : ''} connected</span>
          </div>
        )}
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Tools' : category.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Connections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredConnections.map((connection) => (
          <Card key={connection.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary ${connection.color}`}>
                  {connection.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {connection.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {connection.isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : connection.error ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Connection Status */}
            <div className="mb-4">
              {connection.isConnected ? (
                <div className="space-y-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                  {connection.userInfo && (
                    <p className="text-xs text-muted-foreground">
                      Connected as {connection.userInfo.name}
                    </p>
                  )}
                  {connection.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {connection.lastSync.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : connection.error ? (
                <div className="space-y-2">
                  <Badge variant="destructive">Error</Badge>
                  <p className="text-xs text-red-600">{connection.error}</p>
                </div>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </div>

            {/* Features */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Features:</p>
              <div className="flex flex-wrap gap-1">
                {connection.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {connection.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{connection.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-2">
              {connection.isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(connection.id)}
                  className="flex-1"
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    if (connection.id.startsWith('google-')) {
                      handleGoogleConnect();
                    } else {
                      handleOAuthConnect(connection.id);
                    }
                  }}
                  disabled={connection.isConnecting}
                  className="flex-1"
                >
                  {connection.isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Demo Mode Active</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Currently running in demo mode. Real OAuth connections will be used when backend is available.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
