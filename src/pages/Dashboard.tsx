
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="space-y-12 p-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-16 pb-8">
          <h1 className="text-6xl font-bold text-foreground mb-4">
            Words to actions{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dash is your AI agent for Gmail, Calendar, Notion, and more
          </p>
        </div>

        {/* Search Interface */}
        <SearchInterface />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-background/50 border backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg">
                  <stat.icon className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">{stat.trend}</span>
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Actions */}
        <div className="max-w-6xl mx-auto">
          <Card className="p-6 bg-background/50 border backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Recent Actions</h3>
              <Button variant="outline" size="sm" className="bg-background/50 border hover:bg-background/70">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{action.action}</p>
                      <p className="text-sm text-muted-foreground">by {action.user} • {action.time}</p>
                    </div>
                  </div>
                  <Badge className={action.status === 'completed' ? 'bg-green-600/20 text-green-400 border-green-600/30' : 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'}>
                    {action.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Connected Apps */}
        <div className="max-w-6xl mx-auto">
          <ConnectorGrid />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
