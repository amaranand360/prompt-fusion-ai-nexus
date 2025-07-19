import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Calendar, 
  FolderOpen, 
  Database, 
  Github,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';

const appConfigs = {
  clickup: {
    name: 'ClickUp',
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    description: 'Project management and productivity platform',
    features: ['Task Management', 'Time Tracking', 'Team Collaboration', 'Reporting'],
    status: 'connected',
    lastSync: '2 minutes ago'
  },
  calendar: {
    name: 'Google Calendar',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-600',
    description: 'Schedule and manage your meetings and events',
    features: ['Event Creation', 'Meeting Scheduling', 'Reminders', 'Calendar Sync'],
    status: 'connected',
    lastSync: '1 minute ago'
  },
  drive: {
    name: 'Google Drive',
    icon: FolderOpen,
    color: 'from-green-500 to-blue-600',
    description: 'Cloud storage and file management',
    features: ['File Storage', 'Document Sharing', 'Collaboration', 'Version Control'],
    status: 'connected',
    lastSync: '5 minutes ago'
  },
  dropbox: {
    name: 'Dropbox',
    icon: Database,
    color: 'from-blue-600 to-purple-600',
    description: 'Cloud storage and file synchronization',
    features: ['File Sync', 'Team Folders', 'File Recovery', 'Smart Sync'],
    status: 'disconnected',
    lastSync: 'Never'
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    description: 'Code repository and collaboration platform',
    features: ['Repository Management', 'Issue Tracking', 'Pull Requests', 'Actions'],
    status: 'connected',
    lastSync: '10 minutes ago'
  }
};

export const AppsPage: React.FC = () => {
  const { app } = useParams<{ app: string }>();
  const config = app ? appConfigs[app as keyof typeof appConfigs] : null;

  if (!config) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">App Not Found</h1>
          <p className="text-muted-foreground">The requested app integration could not be found.</p>
        </div>
      </div>
    );
  }

  const IconComponent = config.icon;
  const isConnected = config.status === 'connected';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 bg-gradient-to-br ${config.color} rounded-xl shadow-lg`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{config.name}</h1>
            <p className="text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }
          >
            {isConnected ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            {config.status}
          </Badge>
          <Button variant={isConnected ? "outline" : "default"}>
            <Settings className="h-4 w-4 mr-2" />
            {isConnected ? 'Configure' : 'Connect'}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Connection Status</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected and syncing' : 'Not connected'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last sync: {config.lastSync}
                </span>
              </div>
            </div>
          </div>
          
          {isConnected && (
            <Button variant="outline" size="sm">
              Sync Now
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Cards */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actions Today</p>
                <p className="text-2xl font-bold text-foreground">23</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">98%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Usage</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">0.8s</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Features */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-foreground font-medium">{feature}</span>
              {isConnected && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-12 justify-start" disabled={!isConnected}>
            <IconComponent className="h-4 w-4 mr-3" />
            Open {config.name}
          </Button>
          <Button variant="outline" className="h-12 justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Integration Settings
          </Button>
          <Button variant="outline" className="h-12 justify-start" disabled={!isConnected}>
            <Activity className="h-4 w-4 mr-3" />
            View Usage Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
};
