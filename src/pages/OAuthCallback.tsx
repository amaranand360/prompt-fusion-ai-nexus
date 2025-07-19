import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OAuthService } from '@/services/oauthService';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const OAuthCallback: React.FC = () => {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      if (!provider) {
        throw new Error('Provider not specified');
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        throw new Error(`OAuth error: ${errorParam}`);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      setMessage(`Connecting to ${provider}...`);

      const success = await OAuthService.handleOAuthCallback(provider, code, state);

      if (success) {
        setStatus('success');
        setMessage(`Successfully connected to ${provider}!`);
        
        // Redirect back to integrations page after delay
        setTimeout(() => {
          navigate('/dashboard/integrations');
        }, 2000);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setMessage('Authentication failed');
    }
  };

  const handleRetry = () => {
    if (provider) {
      OAuthService.startOAuthFlow(provider);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard/integrations');
  };

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'Google';
      case 'slack':
        return 'Slack';
      case 'jira':
        return 'Jira';
      default:
        return providerId;
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return '🔍';
      case 'slack':
        return '💬';
      case 'jira':
        return '🎯';
      default:
        return '🔗';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">
            {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 mx-auto text-green-500" />}
            {status === 'error' && <AlertCircle className="h-16 w-16 mx-auto text-red-500" />}
          </div>
          
          {provider && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">{getProviderIcon(provider)}</span>
              <h1 className="text-2xl font-bold">
                {getProviderName(provider)} Integration
              </h1>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-lg font-medium">
            {message}
          </p>

          {status === 'loading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait while we complete the authentication...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  🎉 You can now use {getProviderName(provider)} features in ZenBox AI!
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting you back to integrations...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                  Authentication Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetry} variant="default">
                  Try Again
                </Button>
                <Button onClick={handleGoBack} variant="outline">
                  Go Back
                </Button>
              </div>
            </div>
          )}
        </div>

        {status === 'success' && (
          <div className="mt-6 pt-6 border-t">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              Continue to Integrations
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
