
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Settings,
  Users,
  Database,
  Activity,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const systemHealth = [
    { service: 'Search Engine', status: 'healthy', uptime: '99.9%' },
    { service: 'Knowledge Base', status: 'healthy', uptime: '99.8%' },
    { service: 'Connectors', status: 'warning', uptime: '98.5%' },
    { service: 'Analytics', status: 'healthy', uptime: '99.9%' }
  ];

  const dataSources = [
    { name: 'Google Drive Documents', items: 15420, lastSync: '2 min ago', status: 'syncing' },
    { name: 'Gmail Messages', items: 45678, lastSync: '5 min ago', status: 'complete' },
    { name: 'Slack Messages', items: 8934, lastSync: '2 hours ago', status: 'error' },
    { name: 'Notion Pages', items: 567, lastSync: '30 min ago', status: 'complete' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'warning':
      case 'syncing':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'syncing':
        return <RefreshCw className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage knowledge base, connectors, and system health</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemHealth.map((service, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{service.service}</h3>
              <Badge className={`${getStatusColor(service.status)} flex items-center gap-1`}>
                {getStatusIcon(service.status)}
                {service.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{service.uptime}</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </Card>
        ))}
      </div>

      {/* Knowledge Base Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Knowledge Base Sources</h3>
          <div className="flex items-center gap-3">
            <Input placeholder="Search sources..." className="w-64" />
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {dataSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Database className="h-8 w-8 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <p className="text-sm text-gray-500">
                    {source.items.toLocaleString()} items • Last sync: {source.lastSync}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(source.status)}>
                  {source.status}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scraping Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraping Schedule</h3>
          <div className="space-y-4">
            {[
              { source: 'Google Drive', frequency: 'Every 15 minutes', nextRun: 'In 8 minutes' },
              { source: 'Gmail', frequency: 'Every 30 minutes', nextRun: 'In 22 minutes' },
              { source: 'Slack', frequency: 'Every hour', nextRun: 'In 45 minutes' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.source}</p>
                  <p className="text-sm text-gray-500">{item.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{item.nextRun}</p>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Full Resync
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Rebuild Search Index
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage User Permissions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              System Configuration
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
