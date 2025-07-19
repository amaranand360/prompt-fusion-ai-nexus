// Demo Tools Service - Realistic simulations for impressive demos

export interface DemoTool {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync?: Date;
  features: string[];
}

export interface DemoSearchResult {
  id: string;
  title: string;
  content: string;
  source: DemoTool;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'message' | 'document' | 'task' | 'issue' | 'meeting' | 'file' | 'page';
  relevanceScore: number;
  tags: string[];
  url?: string;
  metadata?: Record<string, any>;
}

export interface DemoActionResult {
  success: boolean;
  message: string;
  data?: any;
  executionTime: number;
}

// Demo Tools Configuration
export const DEMO_TOOLS: DemoTool[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    color: 'bg-purple-500',
    category: 'Communication',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    features: ['Messages', 'Channels', 'Direct Messages', 'File Sharing']
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: '🎯',
    color: 'bg-blue-600',
    category: 'Project Management',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    features: ['Issues', 'Projects', 'Sprints', 'Workflows']
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    color: 'bg-gray-800',
    category: 'Development',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    features: ['Repositories', 'Issues', 'Pull Requests', 'Actions']
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    color: 'bg-gray-700',
    category: 'Documentation',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    features: ['Pages', 'Databases', 'Templates', 'Collaboration']
  },
  {
    id: 'confluence',
    name: 'Confluence',
    icon: '📚',
    color: 'bg-blue-500',
    category: 'Documentation',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 8 * 60 * 1000),
    features: ['Spaces', 'Pages', 'Templates', 'Comments']
  },
  {
    id: 'asana',
    name: 'Asana',
    icon: '✅',
    color: 'bg-pink-500',
    category: 'Task Management',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 12 * 60 * 1000),
    features: ['Tasks', 'Projects', 'Teams', 'Goals']
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: '📋',
    color: 'bg-blue-400',
    category: 'Project Management',
    isConnected: false,
    connectionStatus: 'disconnected',
    features: ['Boards', 'Cards', 'Lists', 'Power-Ups']
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: '🎨',
    color: 'bg-purple-600',
    category: 'Design',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 20 * 60 * 1000),
    features: ['Files', 'Projects', 'Components', 'Comments']
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: '⚡',
    color: 'bg-indigo-600',
    category: 'Issue Tracking',
    isConnected: false,
    connectionStatus: 'disconnected',
    features: ['Issues', 'Projects', 'Cycles', 'Roadmaps']
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: 'bg-indigo-500',
    category: 'Communication',
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: new Date(Date.now() - 3 * 60 * 1000),
    features: ['Servers', 'Channels', 'Messages', 'Voice']
  }
];

// Mock search results for different tools
const generateMockResults = (query: string, tools: DemoTool[]): DemoSearchResult[] => {
  const mockData = {
    slack: [
      {
        title: 'Team Standup Discussion',
        content: `Hey team! Quick update on the ${query} project. We've made significant progress on the backend implementation and the API endpoints are now ready for testing.`,
        author: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
        type: 'message' as const,
        tags: ['standup', 'project', 'backend'],
        metadata: { channel: '#development', reactions: 5 }
      },
      {
        title: 'Design Review Feedback',
        content: `The new ${query} designs look great! I have a few suggestions for the user flow. Can we schedule a quick call to discuss?`,
        author: { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
        type: 'message' as const,
        tags: ['design', 'review', 'feedback'],
        metadata: { channel: '#design', reactions: 3 }
      }
    ],
    jira: [
      {
        title: `Implement ${query} Feature`,
        content: `As a user, I want to be able to ${query} so that I can improve my workflow efficiency. Acceptance criteria: 1. User can access the feature from the main menu...`,
        author: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        type: 'issue' as const,
        tags: ['feature', 'user-story', 'high-priority'],
        metadata: { status: 'In Progress', assignee: 'John Doe', storyPoints: 8 }
      },
      {
        title: `Bug: ${query} not working correctly`,
        content: `When users try to ${query}, the system throws an error. Steps to reproduce: 1. Navigate to the feature page 2. Click on ${query} button...`,
        author: { name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
        type: 'issue' as const,
        tags: ['bug', 'critical', 'frontend'],
        metadata: { status: 'Open', priority: 'High', reporter: 'QA Team' }
      }
    ],
    github: [
      {
        title: `Add ${query} functionality to main branch`,
        content: `This PR adds the ${query} feature with comprehensive tests and documentation. Changes include: - New API endpoints - Frontend components - Unit tests`,
        author: { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
        type: 'document' as const,
        tags: ['pull-request', 'feature', 'ready-for-review'],
        metadata: { status: 'Open', additions: 245, deletions: 12, commits: 8 }
      }
    ],
    notion: [
      {
        title: `${query} Project Documentation`,
        content: `Comprehensive documentation for the ${query} project including architecture decisions, API specifications, and deployment guidelines.`,
        author: { name: 'Lisa Park', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
        type: 'page' as const,
        tags: ['documentation', 'project', 'architecture'],
        metadata: { workspace: 'Engineering', lastEdited: '2 hours ago' }
      }
    ],
    confluence: [
      {
        title: `${query} Implementation Guide`,
        content: `Step-by-step guide for implementing ${query} in our system. This document covers best practices, common pitfalls, and troubleshooting tips.`,
        author: { name: 'Tom Anderson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
        type: 'page' as const,
        tags: ['guide', 'implementation', 'best-practices'],
        metadata: { space: 'Engineering Docs', views: 156 }
      }
    ],
    asana: [
      {
        title: `Complete ${query} milestone`,
        content: `Finish all tasks related to the ${query} feature before the sprint deadline. This includes development, testing, and documentation.`,
        author: { name: 'Rachel Green', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
        type: 'task' as const,
        tags: ['milestone', 'sprint', 'deadline'],
        metadata: { project: 'Q4 Features', dueDate: 'Next Friday', progress: 75 }
      }
    ],
    figma: [
      {
        title: `${query} UI Components`,
        content: `Design system components for the ${query} feature including buttons, forms, and layout elements. All components follow our design guidelines.`,
        author: { name: 'Chris Taylor', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
        type: 'file' as const,
        tags: ['design-system', 'components', 'ui'],
        metadata: { project: 'Design System v2', lastModified: '1 hour ago' }
      }
    ],
    discord: [
      {
        title: `${query} discussion in #general`,
        content: `Great discussion about ${query} implementation. The team shared some valuable insights and we've decided on the approach moving forward.`,
        author: { name: 'Jordan Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
        type: 'message' as const,
        tags: ['discussion', 'team', 'decision'],
        metadata: { server: 'Company Server', channel: '#general', reactions: 8 }
      }
    ]
  };

  const results: DemoSearchResult[] = [];
  const connectedTools = tools.filter(tool => tool.isConnected);

  connectedTools.forEach(tool => {
    const toolData = mockData[tool.id as keyof typeof mockData];
    if (toolData) {
      toolData.forEach((item, index) => {
        results.push({
          id: `${tool.id}-${index}`,
          title: item.title,
          content: item.content,
          source: tool,
          author: item.author,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          type: item.type,
          relevanceScore: Math.floor(Math.random() * 30) + 70,
          tags: item.tags,
          url: `https://${tool.name.toLowerCase()}.com/item/${index}`,
          metadata: item.metadata
        });
      });
    }
  });

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

class DemoToolsService {
  private tools: DemoTool[] = [...DEMO_TOOLS];
  private connectionDelay = 2000; // 2 seconds for realistic connection simulation

  async getTools(): Promise<DemoTool[]> {
    return [...this.tools];
  }

  async getConnectedTools(): Promise<DemoTool[]> {
    return this.tools.filter(tool => tool.isConnected);
  }

  async connectTool(toolId: string): Promise<boolean> {
    const tool = this.tools.find(t => t.id === toolId);
    if (!tool) return false;

    tool.connectionStatus = 'connecting';
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, this.connectionDelay));
    
    // 95% success rate for demo
    const success = Math.random() > 0.05;
    
    if (success) {
      tool.isConnected = true;
      tool.connectionStatus = 'connected';
      tool.lastSync = new Date();
    } else {
      tool.connectionStatus = 'error';
    }

    return success;
  }

  async disconnectTool(toolId: string): Promise<boolean> {
    const tool = this.tools.find(t => t.id === toolId);
    if (!tool) return false;

    tool.isConnected = false;
    tool.connectionStatus = 'disconnected';
    tool.lastSync = undefined;

    return true;
  }

  async searchAcrossTools(query: string, toolIds?: string[]): Promise<DemoSearchResult[]> {
    const searchTools = toolIds 
      ? this.tools.filter(t => toolIds.includes(t.id) && t.isConnected)
      : this.tools.filter(t => t.isConnected);

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return generateMockResults(query, searchTools);
  }

  async executeAction(toolId: string, action: string, parameters: any): Promise<DemoActionResult> {
    const tool = this.tools.find(t => t.id === toolId);
    if (!tool || !tool.isConnected) {
      return {
        success: false,
        message: `Tool ${toolId} is not connected`,
        executionTime: 0
      };
    }

    const startTime = Date.now();
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const executionTime = Date.now() - startTime;
    
    // 90% success rate for demo actions
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        message: `Successfully executed ${action} on ${tool.name}`,
        data: {
          tool: tool.name,
          action,
          parameters,
          timestamp: new Date().toISOString()
        },
        executionTime
      };
    } else {
      return {
        success: false,
        message: `Failed to execute ${action} on ${tool.name}`,
        executionTime
      };
    }
  }

  async syncTool(toolId: string): Promise<boolean> {
    const tool = this.tools.find(t => t.id === toolId);
    if (!tool || !tool.isConnected) return false;

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    tool.lastSync = new Date();
    return true;
  }

  getToolStatus(toolId: string): DemoTool | null {
    return this.tools.find(t => t.id === toolId) || null;
  }

  async getToolCategories(): Promise<string[]> {
    const categories = [...new Set(this.tools.map(tool => tool.category))];
    return categories.sort();
  }
}

export const demoToolsService = new DemoToolsService();
