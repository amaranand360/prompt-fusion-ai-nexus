import React from 'react';
import { Loader2, Search, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Skeleton Loading Components
export const SearchResultSkeleton: React.FC = () => (
  <Card className="p-4 animate-pulse">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="pl-11 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="flex gap-2 mt-3">
          <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-14 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  </Card>
);

export const ToolConnectionSkeleton: React.FC = () => (
  <Card className="p-4 animate-pulse">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>
        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  </Card>
);

// Loading States
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[hsl(var(--brand-primary))]`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

interface SearchLoadingProps {
  query: string;
}

export const SearchLoading: React.FC<SearchLoadingProps> = ({ query }) => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <div className="relative">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute inset-0 border-4 border-[hsl(var(--brand-primary))] rounded-full border-t-transparent animate-spin" />
          <Search className="absolute inset-0 m-auto h-6 w-6 text-[hsl(var(--brand-primary))]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Searching across all tools...
        </h3>
        <p className="text-muted-foreground">
          Looking for "{query}" in Gmail, Slack, Jira, GitHub, and more
        </p>
      </div>
    </div>

    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  </div>
);

interface ActionLoadingProps {
  action: string;
  step: string;
  progress: number;
}

export const ActionLoading: React.FC<ActionLoadingProps> = ({ 
  action, 
  step, 
  progress 
}) => (
  <div className="text-center py-8">
    <div className="relative mb-6">
      <div className="w-20 h-20 mx-auto relative">
        <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
        <div 
          className="absolute inset-0 border-4 border-[hsl(var(--brand-primary))] rounded-full border-t-transparent animate-spin transition-all duration-500"
          style={{ 
            background: `conic-gradient(from 0deg, hsl(var(--brand-primary)) ${progress}%, transparent ${progress}%)`,
            borderRadius: '50%'
          }}
        />
        <Zap className="absolute inset-0 m-auto h-8 w-8 text-[hsl(var(--brand-primary))]" />
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-foreground mb-2">
      Executing Action
    </h3>
    <p className="text-muted-foreground mb-4">
      {action}
    </p>
    <div className="flex items-center justify-center gap-2">
      <div className="w-2 h-2 bg-[hsl(var(--brand-primary))] rounded-full animate-pulse" />
      <span className="text-sm text-muted-foreground">{step}</span>
    </div>
  </div>
);

// Success Animations
interface SuccessAnimationProps {
  title: string;
  message: string;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  title, 
  message, 
  onComplete 
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="text-center py-12">
      <div className="relative mb-6">
        <div className="w-20 h-20 mx-auto relative">
          {/* Success circle animation */}
          <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping" />
          <CheckCircle className="absolute inset-0 m-auto h-10 w-10 text-green-500 animate-bounce" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {message}
      </p>
      
      {/* Confetti effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Error States
interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  message, 
  onRetry 
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 relative">
      <AlertCircle className="h-16 w-16 text-red-500 animate-pulse" />
    </div>
    
    <h3 className="text-lg font-semibold text-foreground mb-2">
      {title}
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      {message}
    </p>
    
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Connection Status Indicators
interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  tool: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  status, 
  tool 
}) => {
  const statusConfig = {
    connected: {
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900',
      icon: CheckCircle,
      text: 'Connected',
      animation: 'animate-none'
    },
    connecting: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      icon: Loader2,
      text: 'Connecting...',
      animation: 'animate-spin'
    },
    disconnected: {
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-900',
      icon: AlertCircle,
      text: 'Disconnected',
      animation: 'animate-none'
    },
    error: {
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900',
      icon: AlertCircle,
      text: 'Error',
      animation: 'animate-pulse'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1 rounded-full ${config.bgColor}`}>
        <Icon className={`h-3 w-3 ${config.color} ${config.animation}`} />
      </div>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};

// Typing Animation
interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 50, 
  onComplete 
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className="font-mono">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
