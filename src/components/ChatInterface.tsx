import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  User, 
  Bot, 
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Mail,
  Video,
  FileText,
  Search,
  Plus
} from 'lucide-react';
import { useGoogleIntegration } from '@/contexts/GoogleIntegrationContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  actions?: ChatAction[];
  metadata?: {
    tool?: string;
    actionType?: string;
    result?: any;
  };
}

interface ChatAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'default' | 'secondary' | 'outline';
}

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to ZenBox AI! I can help you search across all your tools and perform actions. Try asking me to send an email, schedule a meeting, or search for documents.',
      timestamp: new Date(),
      actions: [
        {
          id: 'search-emails',
          label: 'Search Emails',
          icon: Mail,
          action: () => handleQuickAction('Search for emails from my manager about project updates'),
        },
        {
          id: 'schedule-meeting',
          label: 'Schedule Meeting',
          icon: Calendar,
          action: () => handleQuickAction('Schedule a team meeting tomorrow at 2 PM'),
        },
        {
          id: 'create-meet',
          label: 'Create Meet',
          icon: Video,
          action: () => handleQuickAction('Create an instant Google Meet for standup'),
        },
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { processAction, isAuthenticated, isDemoMode } = useGoogleIntegration();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (message: string) => {
    setInputValue(message);
    setTimeout(() => handleSendMessage(message), 100);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process the action
      const response = await processAction({
        type: 'search', // This will be determined by AI parsing
        action: 'query',
        parameters: { query: content }
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.success 
          ? `${response.message}\n\n${isDemoMode ? '(Demo Mode: This is a simulated response)' : '(Real API: Action completed successfully)'}`
          : `I encountered an error: ${response.error}. Please try again or rephrase your request.`,
        timestamp: new Date(),
        status: response.success ? 'sent' : 'error',
        metadata: {
          tool: 'google',
          actionType: 'search',
          result: response.data
        }
      };

      // Add follow-up actions based on the response
      if (response.success) {
        assistantMessage.actions = [
          {
            id: 'follow-up-1',
            label: 'Search More',
            icon: Search,
            action: () => handleQuickAction('Search for more related items'),
          },
          {
            id: 'follow-up-2',
            label: 'Create Event',
            icon: Calendar,
            action: () => handleQuickAction('Create a calendar event based on this'),
          }
        ];
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an unexpected error. Please try again.',
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user': return User;
      case 'assistant': return Bot;
      case 'system': return Sparkles;
      default: return Bot;
    }
  };

  const getStatusIcon = (status?: ChatMessage['status']) => {
    switch (status) {
      case 'sending': return Loader2;
      case 'sent': return CheckCircle;
      case 'error': return AlertCircle;
      default: return CheckCircle;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => {
          const MessageIcon = getMessageIcon(message.type);
          const StatusIcon = getStatusIcon(message.status);
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.type === 'user' 
                  ? 'bg-[hsl(var(--chat-user-bg))] text-white' 
                  : message.type === 'system'
                  ? 'bg-[hsl(var(--brand-primary))] text-white'
                  : 'bg-[hsl(var(--chat-assistant-bg))] text-foreground border'
                }
              `}>
                <MessageIcon className="h-4 w-4" />
              </div>

              {/* Message Content */}
              <div className={`
                flex-1 max-w-[80%] space-y-2
                ${message.type === 'user' ? 'items-end' : 'items-start'}
              `}>
                {/* Message Bubble */}
                <div className={`
                  rounded-2xl px-4 py-3 break-words
                  ${message.type === 'user'
                    ? 'bg-[hsl(var(--chat-user-bg))] text-white ml-auto'
                    : message.type === 'system'
                    ? 'bg-[hsl(var(--brand-primary))] text-white'
                    : 'bg-[hsl(var(--chat-assistant-bg))] text-foreground border'
                  }
                  ${message.status === 'error' ? 'border-destructive' : ''}
                `}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant={action.variant || 'outline'}
                          size="sm"
                          onClick={action.action}
                          className="text-xs h-8"
                        >
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Timestamp and Status */}
                <div className={`
                  flex items-center gap-1 text-xs text-muted-foreground
                  ${message.type === 'user' ? 'justify-end' : 'justify-start'}
                `}>
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(message.timestamp)}</span>
                  {message.status && (
                    <>
                      <StatusIcon className={`
                        h-3 w-3 ml-1
                        ${message.status === 'sending' ? 'animate-spin' : ''}
                        ${message.status === 'error' ? 'text-destructive' : 'text-success'}
                      `} />
                    </>
                  )}
                  {message.metadata?.tool && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {message.metadata.tool}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--chat-assistant-bg))] border flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-[hsl(var(--chat-assistant-bg))] border rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing your request...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isAuthenticated 
                  ? "Ask me anything: send emails, schedule meetings, search documents..."
                  : "Connect to Google services to start using the assistant..."
              }
              disabled={!isAuthenticated || isProcessing}
              className="pr-12 min-h-[44px] resize-none"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || !isAuthenticated || isProcessing}
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Connection Status */}
        {!isAuthenticated && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Connect your Google account to start using the assistant
          </div>
        )}
        
        {isAuthenticated && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-success" />
            <span>Connected in {isDemoMode ? 'Demo' : 'Real'} mode</span>
          </div>
        )}
      </div>
    </div>
  );
};
