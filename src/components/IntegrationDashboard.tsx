import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGoogleIntegration, useGoogleServices } from '@/contexts/GoogleIntegrationContext';
import { EnhancedToolConnectionManager } from '@/components/EnhancedToolConnectionManager';
import {
  Mail,
  Calendar,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  itemCount?: number;
  color: string;
  description: string;
}

interface RecentActivity {
  id: string;
  type: 'email' | 'calendar' | 'meet';
  action: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  details: string;
}

export const IntegrationDashboard: React.FC = () => {
  const { isAuthenticated, authenticate, disconnect, status, error } = useGoogleIntegration();
  const googleServices = useGoogleServices();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const services: ServiceStatus[] = [
    {
      name: 'Gmail',
      icon: <Mail className="h-6 w-6" />,
      connected: status.services.gmail,
      lastSync: '2 minutes ago',
      itemCount: 1247,
      color: 'text-red-500',
      description: 'Send and manage emails with AI assistance'
    },
    {
      name: 'Google Calendar',
      icon: <Calendar className="h-6 w-6" />,
      connected: status.services.calendar,
      lastSync: '5 minutes ago',
      itemCount: 234,
      color: 'text-blue-500',
      description: 'Schedule meetings and manage events'
    },
    {
      name: 'Google Meet',
      icon: <Video className="h-6 w-6" />,
      connected: status.services.meet,
      lastSync: '1 hour ago',
      itemCount: 12,
      color: 'text-green-500',
      description: 'Create and manage video meetings'
    },
    {
      name: 'Google Drive',
      icon: <FileText className="h-6 w-6" />,
      connected: false,
      lastSync: 'Never',
      itemCount: 0,
      color: 'text-yellow-600',
      description: 'Access and manage documents (Coming Soon)'
    }
  ];

  const mockRecentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'email',
      action: 'Sent email to team@company.com',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success',
      details: 'Subject: Weekly Update'
    },
    {
      id: '2',
      type: 'calendar',
      action: 'Created meeting "Team Standup"',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'success',
      details: 'Tomorrow at 10:00 AM'
    },
    {
      id: '3',
      type: 'meet',
      action: 'Generated instant meeting link',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'success',
      details: 'Duration: 60 minutes'
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setRecentActivity(mockRecentActivity);
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-red-500" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'meet':
        return <Video className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const connectedServices = services.filter(service => service.connected).length;
  const connectionProgress = (connectedServices / services.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Google services and monitor AI automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAuthenticated ? (
            <Button variant="outline" onClick={disconnect}>
              Disconnect Google
            </Button>
          ) : (
            <Button onClick={authenticate}>
              <Shield className="h-4 w-4 mr-2" />
              Connect Google
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            {isAuthenticated ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAuthenticated ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? 'Google services are active' : 'Authentication required'}
            </p>
            <Progress value={connectionProgress} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {connectedServices} of {services.length} services connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Actions Today</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">Trending up</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Actions completed successfully
            </p>
            <Progress value={98.5} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Integration Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="all-tools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-tools">All Tools</TabsTrigger>
          <TabsTrigger value="services">Google Services</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all-tools" className="space-y-6">
          <EnhancedToolConnectionManager />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={service.color}>
                        {service.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(service.connected)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={service.connected ? "default" : "secondary"}>
                        {service.connected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    
                    {service.connected && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <span className="text-sm">{service.lastSync}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Items</span>
                          <span className="text-sm font-medium">
                            {service.itemCount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-3 border-t">
                      <Button
                        variant={service.connected ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        disabled={!isAuthenticated && !service.connected}
                      >
                        {service.connected ? (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Actions</CardTitle>
              <CardDescription>
                Latest automated actions performed by the AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.details}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge
                            variant={activity.status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No recent activity. Start using AI commands to see actions here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>AI action breakdown by service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Gmail Actions</span>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Calendar Actions</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Meet Actions</span>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Response Time</span>
                    <span className="text-sm font-medium">1.2s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">API Calls Today</span>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Error Rate</span>
                    <span className="text-sm font-medium text-green-600">1.5%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
