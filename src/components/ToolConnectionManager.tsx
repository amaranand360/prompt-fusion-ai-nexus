import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Zap,
  Clock,
  Users,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';
import { demoToolsService, DemoTool } from '@/services/demoToolsService';

interface ConnectionStats {
  totalTools: number;
  connectedTools: number;
  lastSync: Date | null;
  syncInProgress: boolean;
}

export const ToolConnectionManager: React.FC = () => {
  const { isAuthenticated, isDemoMode, authenticate, disconnect } = useGoogleIntegration();
  const [demoTools, setDemoTools] = useState<DemoTool[]>([]);
  const [stats, setStats] = useState<ConnectionStats>({
    totalTools: 0,
    connectedTools: 0,
    lastSync: null,
    syncInProgress: false
  });
  const [connectingTools, setConnectingTools] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadDemoTools();
    loadCategories();
  }, []);

  const loadDemoTools = async () => {
    const tools = await demoToolsService.getTools();
    setDemoTools(tools);
    updateStats(tools);
  };

  const loadCategories = async () => {
    const cats = await demoToolsService.getToolCategories();
    setCategories(['all', ...cats]);
  };

  const updateStats = (tools: DemoTool[]) => {
    const connected = tools.filter(t => t.isConnected);
    const lastSyncTimes = connected
      .map(t => t.lastSync)
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime());

    setStats({
      totalTools: tools.length + 1, // +1 for Google
      connectedTools: connected.length + (isAuthenticated ? 1 : 0),
      lastSync: lastSyncTimes[0] || null,
      syncInProgress: false
    });
  };

  const handleGoogleToggle = async () => {
    if (isAuthenticated) {
      disconnect();
    } else {
      try {
        await authenticate();
      } catch (error) {
        console.error('Google authentication failed:', error);
      }
    }
  };

  const handleDemoToolToggle = async (toolId: string) => {
    const tool = demoTools.find(t => t.id === toolId);
    if (!tool) return;

    setConnectingTools(prev => new Set(prev).add(toolId));

    try {
      if (tool.isConnected) {
        await demoToolsService.disconnectTool(toolId);
      } else {
        await demoToolsService.connectTool(toolId);
      }
      
      await loadDemoTools();
    } catch (error) {
      console.error(`Failed to toggle ${toolId}:`, error);
    } finally {
      setConnectingTools(prev => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        return newSet;
      });
    }
  };

  const handleSyncAll = async () => {
    setStats(prev => ({ ...prev, syncInProgress: true }));
    
    const connectedTools = demoTools.filter(t => t.isConnected);
    
    // Sync all connected tools
    await Promise.all(
      connectedTools.map(tool => demoToolsService.syncTool(tool.id))
    );
    
    await loadDemoTools();
    setStats(prev => ({ ...prev, syncInProgress: false }));
  };

  const getConnectionStatusIcon = (status: DemoTool['connectionStatus'], isConnecting: boolean) => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DemoTool['connectionStatus']) => {
    const variants = {
      connected: 'default',
      connecting: 'secondary',
      error: 'destructive',
      disconnected: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    );
  };

  const filteredTools = selectedCategory === 'all' 
    ? demoTools 
    : demoTools.filter(tool => tool.category === selectedCategory);

  const connectionProgress = (stats.connectedTools / stats.totalTools) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tools</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalTools}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Wifi className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-2xl font-bold text-foreground">{stats.connectedTools}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection Rate</p>
              <p className="text-2xl font-bold text-foreground">{Math.round(connectionProgress)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium text-foreground">
                {stats.lastSync ? stats.lastSync.toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connection Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Connection Overview</h3>
              <p className="text-sm text-muted-foreground">
                {stats.connectedTools} of {stats.totalTools} tools connected
              </p>
            </div>
            <Button 
              onClick={handleSyncAll}
              disabled={stats.syncInProgress}
              variant="outline"
              size="sm"
            >
              {stats.syncInProgress ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync All
            </Button>
          </div>
          
          <Progress value={connectionProgress} className="h-2" />
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${selectedCategory === category
                ? 'bg-[hsl(var(--brand-primary))] text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Google Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Google Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Gmail, Calendar, Drive, Meet
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getConnectionStatusIcon(isAuthenticated ? 'connected' : 'disconnected', false)}
                <Badge variant={isAuthenticated ? 'default' : 'outline'} className="text-xs">
                  {isDemoMode ? 'Demo Mode' : isAuthenticated ? 'Live Mode' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={isAuthenticated}
              onCheckedChange={handleGoogleToggle}
            />
          </div>
        </div>
      </Card>

      {/* Demo Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const isConnecting = connectingTools.has(tool.id);
          
          return (
            <Card key={tool.id} className="p-4 hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                      {tool.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{tool.name}</h4>
                      <p className="text-xs text-muted-foreground">{tool.category}</p>
                    </div>
                  </div>
                  
                  <Switch
                    checked={tool.isConnected}
                    onCheckedChange={() => handleDemoToolToggle(tool.id)}
                    disabled={isConnecting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getConnectionStatusIcon(tool.connectionStatus, isConnecting)}
                    {getStatusBadge(tool.connectionStatus)}
                  </div>
                  
                  {tool.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      {tool.lastSync.toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {tool.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{tool.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {tool.isConnected && (
                  <Button variant="ghost" size="sm" className="w-full">
                    <Settings className="h-3 w-3 mr-2" />
                    Configure
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
