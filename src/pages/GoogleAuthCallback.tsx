import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const GoogleAuthCallback: React.FC = () => {
  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      if (error) {
        // Send error to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error
          }, window.location.origin);
        }
        return;
      }

      if (code) {
        // Send success to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            code: code,
            state: state
          }, window.location.origin);
        }
        return;
      }

      // No code or error - something went wrong
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'No authorization code received'
        }, window.location.origin);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand-primary))]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Completing Authentication
            </h2>
            <p className="text-muted-foreground">
              Please wait while we complete your Google authentication...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
