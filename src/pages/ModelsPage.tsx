import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Cloud, 
  Bot, 
  Gem, 
  Zap, 
  Settings,
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';

const modelConfigs = {
  brain: {
    name: 'Brain',
    icon: Brain,
    color: 'from-purple-500 to-blue-600',
    description: 'Advanced reasoning and problem-solving AI model',
    capabilities: ['Complex reasoning', 'Code generation', 'Data analysis', 'Creative writing'],
    status: 'active'
  },
  claude: {
    name: 'Claude',
    icon: Cloud,
    color: 'from-orange-500 to-red-600',
    description: 'Anthropic\'s constitutional AI for helpful, harmless, and honest responses',
    capabilities: ['Long conversations', 'Document analysis', 'Ethical reasoning', 'Research assistance'],
    status: 'active'
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: Bot,
    color: 'from-green-500 to-teal-600',
    description: 'OpenAI\'s conversational AI model for general-purpose tasks',
    capabilities: ['General conversation', 'Task automation', 'Content creation', 'Problem solving'],
    status: 'active'
  },
  gemini: {
    name: 'Gemini',
    icon: Gem,
    color: 'from-blue-500 to-purple-600',
    description: 'Google\'s multimodal AI model with advanced capabilities',
    capabilities: ['Multimodal understanding', 'Code generation', 'Mathematical reasoning', 'Image analysis'],
    status: 'active',
    badge: '2.5 Pro #4'
  }
};

export const ModelsPage: React.FC = () => {
  const { model } = useParams<{ model: string }>();
  const config = model ? modelConfigs[model as keyof typeof modelConfigs] : null;

  if (!config) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Model Not Found</h1>
          <p className="text-muted-foreground">The requested AI model could not be found.</p>
        </div>
      </div>
    );
  }

  const IconComponent = config.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 bg-gradient-to-br ${config.color} rounded-xl shadow-lg`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{config.name}</h1>
              {config.badge && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {config.badge}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Activity className="h-3 w-3 mr-1" />
            {config.status}
          </Badge>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usage Today</p>
              <p className="text-2xl font-bold text-foreground">47</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold text-foreground">1.2s</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-foreground">98%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold text-foreground">99.9%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.capabilities.map((capability, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-foreground font-medium">{capability}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-12 justify-start">
            <Bot className="h-4 w-4 mr-3" />
            Start Conversation
          </Button>
          <Button variant="outline" className="h-12 justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Model Settings
          </Button>
          <Button variant="outline" className="h-12 justify-start">
            <Activity className="h-4 w-4 mr-3" />
            View Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
};
