import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Server,
  AlertTriangle,
  Info
} from 'lucide-react';
import { testBackendConnection, BackendConnectionTest } from '@/utils/testBackendConnection';

interface BackendStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const [connectionTest, setConnectionTest] = useState<BackendConnectionTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testBackendConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (connectionTest?.isAvailable) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (connectionTest?.isAvailable) return 'Connected';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isLoading) return 'bg-blue-100 text-blue-600 border-blue-200';
    if (connectionTest?.isAvailable) return 'bg-green-100 text-green-600 border-green-200';
    return 'bg-red-100 text-red-600 border-red-200';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
          Test-Agents
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Backend Status</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connection Status</span>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge variant="outline" className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
          </div>

          {connectionTest?.isAvailable && connectionTest.status && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Server Status</span>
                <Badge variant="outline" className="text-xs">
                  {connectionTest.status.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Agents</span>
                <div className="flex gap-1">
                  {Object.keys(connectionTest.status.agents || {}).map((agent) => (
                    <Badge key={agent} variant="outline" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Authorization</span>
                <div className="flex gap-1">
                  {connectionTest.status.authorization?.gmail && (
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-600">
                      Gmail
                    </Badge>
                  )}
                  {connectionTest.status.authorization?.calendar && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-600">
                      Calendar
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {connectionTest?.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Connection Error
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {connectionTest.error}
                </p>
              </div>
            </div>
          )}

          {!connectionTest?.isAvailable && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Backend Not Available
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  The Test-Agents backend is not running. Actions will use demo mode.
                  To enable real Google integration, start the backend server.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
