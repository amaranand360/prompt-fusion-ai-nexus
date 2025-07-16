
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Mail, 
  Calendar, 
  Slack, 
  Database,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  lastSync?: string;
  itemCount?: number;
}

const connectors: Connector[] = [
  {
    id: 'drive',
    name: 'Google Drive',
    icon: <FileText className="h-6 w-6" />,
    status: 'connected',
    description: 'Access documents, presentations, and spreadsheets',
    lastSync: '2 minutes ago',
    itemCount: 1247
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: <Mail className="h-6 w-6" />,
    status: 'connected',
    description: 'Search and analyze email conversations',
    lastSync: '5 minutes ago',
    itemCount: 5678
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: <Calendar className="h-6 w-6" />,
    status: 'connected',
    description: 'Schedule meetings and manage events',
    lastSync: '1 hour ago',
    itemCount: 234
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: <Slack className="h-6 w-6" />,
    status: 'error',
    description: 'Search team conversations and channels',
    lastSync: '2 days ago',
    itemCount: 0
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: <Database className="h-6 w-6" />,
    status: 'disconnected',
    description: 'Access notes, databases, and wikis',
    itemCount: 0
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: <Database className="h-6 w-6" />,
    status: 'connected',
    description: 'Track issues and project progress',
    lastSync: '30 minutes ago',
    itemCount: 89
  }
];

export const ConnectorGrid = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Connected Apps</h2>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage Connections
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((connector) => (
          <Card key={connector.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {connector.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{connector.name}</h3>
                  {getStatusBadge(connector.status)}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {connector.description}
            </p>
            
            {connector.status === 'connected' && (
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Items indexed:</span>
                  <span className="font-medium">{connector.itemCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last sync:</span>
                  <span className="font-medium">{connector.lastSync}</span>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant={connector.status === 'connected' ? 'outline' : 'default'}
                size="sm" 
                className="w-full"
              >
                {connector.status === 'connected' ? 'Reconfigure' : 'Connect'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
