
import React from 'react';
import { SearchInterface } from '@/components/SearchInterface';
import { ConnectorGrid } from '@/components/ConnectorGrid';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Search, 
  Zap,
  Clock,
  Star
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Searches', value: '12,483', icon: Search, trend: '+12%' },
    { label: 'Active Users', value: '1,247', icon: Users, trend: '+8%' },
    { label: 'Actions Executed', value: '3,891', icon: Zap, trend: '+23%' },
    { label: 'Avg Response Time', value: '1.2s', icon: Clock, trend: '-15%' }
  ];

  const recentActions = [
    {
      action: 'Created "Project Roadmap" presentation',
      user: 'Sarah Johnson',
      time: '2 minutes ago',
      status: 'completed'
    },
    {
      action: 'Scheduled team meeting for next week',
      user: 'Mike Chen',
      time: '5 minutes ago',
      status: 'completed'
    },
    {
      action: 'Generated Q3 performance report',
      user: 'Alex Rivera',
      time: '12 minutes ago',
      status: 'in_progress'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Brain MAX
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your intelligent AI assistant for search, actions, and productivity across all your connected apps.
        </p>
      </div>

      {/* Search Interface */}
      <SearchInterface />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{stat.trend}</span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Actions</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        
        <div className="space-y-4">
          {recentActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{action.action}</p>
                  <p className="text-sm text-gray-500">by {action.user} • {action.time}</p>
                </div>
              </div>
              <Badge className={action.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                {action.status === 'completed' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected Apps */}
      <ConnectorGrid />
    </div>
  );
};

export default Dashboard;
