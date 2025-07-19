import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Zap, 
  Brain,
  Clock,
  TrendingUp
} from 'lucide-react';

export const TalkPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you be more productive today?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant' as const,
        content: 'I understand you want to ' + message.toLowerCase() + '. Let me help you with that. I can search across your tools, create tasks, schedule meetings, and much more!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ZenBox <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">AI</span> Talk</h1>
              <p className="text-muted-foreground">Chat with your AI-powered productivity companion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              4x productivity
            </Badge>
            <Badge variant="outline">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`
                  p-4 rounded-2xl shadow-sm
                  ${msg.type === 'user' 
                    ? 'bg-blue-600 text-white ml-12' 
                    : 'bg-card border mr-12'
                  }
                `}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${
                    msg.type === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.type === 'user' ? 'order-1 ml-3' : 'order-2 mr-3'
              }`}>
                {msg.type === 'user' ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything... I can search, create tasks, schedule meetings, and more!"
                className="pr-12 h-12 text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Quick actions:</span>
            <Button variant="outline" size="sm" onClick={() => setMessage('Search my emails for project updates')}>
              <Zap className="h-3 w-3 mr-1" />
              Search emails
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMessage('Schedule a meeting for tomorrow')}>
              <Zap className="h-3 w-3 mr-1" />
              Schedule meeting
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMessage('Create a task for the new feature')}>
              <Zap className="h-3 w-3 mr-1" />
              Create task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
