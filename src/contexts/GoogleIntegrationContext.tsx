import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GoogleIntegrationManager, GoogleTokens, AIActionRequest, AIActionResponse } from '@/services/google';

interface GoogleIntegrationContextType {
  manager: GoogleIntegrationManager | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
  setDemoMode: (demo: boolean) => void;
  authenticate: () => void;
  processAction: (request: AIActionRequest) => Promise<AIActionResponse>;
  disconnect: () => void;
  status: {
    authenticated: boolean;
    tokenValid: boolean;
    services: {
      gmail: boolean;
      calendar: boolean;
      meet: boolean;
    };
  };
}

const GoogleIntegrationContext = createContext<GoogleIntegrationContextType | undefined>(undefined);

export const useGoogleIntegration = () => {
  const context = useContext(GoogleIntegrationContext);
  if (!context) {
    throw new Error('useGoogleIntegration must be used within a GoogleIntegrationProvider');
  }
  return context;
};

interface GoogleIntegrationProviderProps {
  children: ReactNode;
}

export const GoogleIntegrationProvider: React.FC<GoogleIntegrationProviderProps> = ({ children }) => {
  const [manager, setManager] = useState<GoogleIntegrationManager | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo mode
  const [status, setStatus] = useState({
    authenticated: false,
    tokenValid: false,
    services: {
      gmail: false,
      calendar: false,
      meet: false,
    },
  });

  // Initialize Google Integration Manager
  useEffect(() => {
    const initializeManager = () => {
      try {
        // These should be set in environment variables
        const credentials = {
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`,
        };

        if (!credentials.client_id) {
          setError('Google Client ID not configured. Please check your .env file and ensure VITE_GOOGLE_CLIENT_ID is set.');
          return;
        }

        console.log('Initializing Google Integration with Client ID:', credentials.client_id);

        const integrationManager = new GoogleIntegrationManager({ credentials });
        setManager(integrationManager);

        // Check for stored tokens
        const storedTokens = localStorage.getItem('google_tokens');
        if (storedTokens) {
          try {
            const tokens: GoogleTokens = JSON.parse(storedTokens);
            integrationManager.setTokens(tokens);
            setIsAuthenticated(true);
            updateStatus(integrationManager);
          } catch (error) {
            console.error('Error parsing stored tokens:', error);
            localStorage.removeItem('google_tokens');
          }
        }
      } catch (error) {
        console.error('Error initializing Google Integration Manager:', error);
        setError('Failed to initialize Google integration');
      }
    };

    initializeManager();
  }, []);

  // No need for OAuth callback handling with Google Identity Services
  // Authentication is handled directly in the authenticate function

  const updateStatus = (integrationManager: GoogleIntegrationManager) => {
    const currentStatus = integrationManager.getStatus();
    setStatus(currentStatus);
  };

  const authenticate = async () => {
    if (!manager) {
      setError('Google integration not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        // Demo mode: simulate successful authentication
        console.log('Demo mode: Simulating Google authentication...');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock tokens for demo
        const mockTokens = {
          access_token: 'demo_access_token_' + Date.now(),
          refresh_token: 'demo_refresh_token_' + Date.now(),
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'email profile openid'
        };

        localStorage.setItem('google_tokens', JSON.stringify(mockTokens));
        setIsAuthenticated(true);
        setStatus({
          authenticated: true,
          tokenValid: true,
          services: {
            gmail: true,
            calendar: true,
            meet: true,
          },
        });

        console.log('Demo authentication successful');
      } else {
        // Real mode: use actual Google OAuth
        console.log('Real mode: Authenticating with Google APIs...');

        const tokens = await manager.authenticate();
        localStorage.setItem('google_tokens', JSON.stringify(tokens));
        setIsAuthenticated(true);
        updateStatus(manager);

        console.log('Real authentication successful');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setError(isDemoMode ? 'Demo authentication failed' : 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const processAction = async (request: AIActionRequest): Promise<AIActionResponse> => {
    if (!manager) {
      return {
        success: false,
        error: 'Google integration not initialized',
        message: 'Please initialize Google integration first',
      };
    }

    if (!isAuthenticated) {
      return {
        success: false,
        error: 'Not authenticated',
        message: 'Please authenticate with Google first',
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        // Demo mode: handle actions with mock responses
        console.log('Processing action in demo mode:', request);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          data: {
            message: `Demo: ${request.type} action completed successfully`,
            demoMode: true,
            request
          },
          message: `Demo ${request.type} action completed`,
        };
      }

      // Real mode: check if token needs refresh
      const currentStatus = manager.getStatus();
      if (!currentStatus.tokenValid) {
        try {
          const newTokens = await manager.refreshTokens();
          localStorage.setItem('google_tokens', JSON.stringify(newTokens));
          updateStatus(manager);
        } catch (refreshError) {
          console.error('Error refreshing tokens:', refreshError);
          // If refresh fails, user needs to re-authenticate
          setIsAuthenticated(false);
          localStorage.removeItem('google_tokens');
          return {
            success: false,
            error: 'Authentication expired',
            message: 'Please re-authenticate with Google',
          };
        }
      }

      const response = await manager.processAIAction(request);
      
      if (!response.success && response.error?.includes('auth')) {
        // Handle authentication errors
        setIsAuthenticated(false);
        localStorage.removeItem('google_tokens');
      }

      return response;
    } catch (error) {
      console.error('Error processing action:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to process the requested action',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('google_tokens');
    setIsAuthenticated(false);
    setError(null);
    
    if (manager) {
      // Reinitialize manager without tokens
      const credentials = {
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`,
      };
      
      const newManager = new GoogleIntegrationManager({ credentials });
      setManager(newManager);
      updateStatus(newManager);
    }
  };

  const value: GoogleIntegrationContextType = {
    manager,
    isAuthenticated,
    isLoading,
    error,
    isDemoMode,
    setDemoMode: setIsDemoMode,
    authenticate,
    processAction,
    disconnect,
    status,
  };

  return (
    <GoogleIntegrationContext.Provider value={value}>
      {children}
    </GoogleIntegrationContext.Provider>
  );
};

// Hook for easy access to specific Google services
export const useGoogleServices = () => {
  const { manager, isAuthenticated, processAction } = useGoogleIntegration();

  return {
    isReady: isAuthenticated && manager?.isReady(),
    
    // Gmail helpers
    sendEmail: async (to: string[], subject: string, body: string, options?: { cc?: string[]; bcc?: string[]; isHtml?: boolean }) => {
      return processAction({
        type: 'email',
        action: 'send',
        parameters: {
          to,
          subject,
          body,
          ...options,
        },
      });
    },

    searchEmails: async (query: string, maxResults?: number) => {
      return processAction({
        type: 'email',
        action: 'search',
        parameters: { query, maxResults },
      });
    },

    // Calendar helpers
    createEvent: async (title: string, startDateTime: string, endDateTime: string, options?: { 
      description?: string; 
      attendees?: string[]; 
      location?: string; 
      createMeetLink?: boolean 
    }) => {
      return processAction({
        type: 'calendar',
        action: 'create',
        parameters: {
          title,
          startDateTime,
          endDateTime,
          ...options,
        },
      });
    },

    getUpcomingEvents: async (maxResults?: number) => {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return processAction({
        type: 'calendar',
        action: 'list',
        parameters: {
          timeMin: now.toISOString(),
          timeMax: oneWeekFromNow.toISOString(),
          maxResults,
        },
      });
    },

    // Meet helpers
    createMeeting: async (title: string, startDateTime: string, endDateTime: string, options?: {
      description?: string;
      attendees?: string[];
    }) => {
      return processAction({
        type: 'meet',
        action: 'create',
        parameters: {
          title,
          startDateTime,
          endDateTime,
          ...options,
        },
      });
    },

    createInstantMeeting: async (title?: string, duration?: number, attendees?: string[]) => {
      return processAction({
        type: 'meet',
        action: 'instant',
        parameters: { title, duration, attendees },
      });
    },

    // Universal search
    searchAll: async (query: string, options?: {
      searchEmails?: boolean;
      searchCalendar?: boolean;
      searchMeetings?: boolean;
    }) => {
      return processAction({
        type: 'search',
        action: 'search',
        parameters: { query, ...options },
      });
    },
  };
};
