
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Search, 
  Zap,
  Clock,
  Download,
  Filter
} from 'lucide-react';

const Analytics = () => {
  const usageData = [
    { name: 'Mon', searches: 120, actions: 45 },
    { name: 'Tue', searches: 140, actions: 52 },
    { name: 'Wed', searches: 190, actions: 78 },
    { name: 'Thu', searches: 160, actions: 61 },
    { name: 'Fri', searches: 210, actions: 89 },
    { name: 'Sat', searches: 85, actions: 32 },
    { name: 'Sun', searches: 75, actions: 28 }
  ];

  const sourceData = [
    { name: 'Google Drive', value: 35, color: '#3B82F6' },
    { name: 'Gmail', value: 25, color: '#8B5CF6' },
    { name: 'Slack', value: 20, color: '#10B981' },
    { name: 'Calendar', value: 12, color: '#F59E0B' },
    { name: 'Others', value: 8, color: '#6B7280' }
  ];

  const performanceMetrics = [
    { metric: 'Average Response Time', value: '1.2s', change: '-15%', positive: true },
    { metric: 'Success Rate', value: '98.5%', change: '+2.1%', positive: true },
    { metric: 'User Satisfaction', value: '4.8/5', change: '+0.3', positive: true },
    { metric: 'Error Rate', value: '1.5%', change: '-0.8%', positive: true }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track usage, performance, and user engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.metric}</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <Badge className={metric.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {metric.change}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Usage Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="searches" fill="#3B82F6" name="Searches" />
              <Bar dataKey="actions" fill="#8B5CF6" name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={usageData.map(d => ({ ...d, responseTime: Math.random() * 2 + 0.5 }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Queries */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Search Queries</h3>
        <div className="space-y-3">
          {[
            { query: "Find last week's meeting notes", count: 127 },
            { query: "Generate quarterly report", count: 89 },
            { query: "Schedule team standup", count: 76 },
            { query: "Email client update", count: 54 },
            { query: "Create project timeline", count: 43 }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{item.query}</span>
              <Badge variant="secondary">{item.count} searches</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
