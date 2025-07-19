// OAuth Service for handling multiple providers (Google, Slack, Jira)

export interface OAuthProvider {
  id: string;
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  redirectUri: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
  expiry_date?: number;
}

export interface OAuthConnection {
  providerId: string;
  isConnected: boolean;
  tokens?: OAuthTokens;
  userInfo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastSync?: Date;
  error?: string;
}

class OAuthServiceClass {
  private connections: Map<string, OAuthConnection> = new Map();
  private providers: Map<string, OAuthProvider> = new Map();

  constructor() {
    this.initializeProviders();
    this.loadStoredConnections();
  }

  private initializeProviders() {
    // Google OAuth Provider
    this.providers.set('google', {
      id: 'google',
      name: 'Google',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'openid',
        'profile',
        'email'
      ],
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`
    });

    // Slack OAuth Provider
    this.providers.set('slack', {
      id: 'slack',
      name: 'Slack',
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: [
        'channels:read',
        'chat:write',
        'files:read',
        'users:read',
        'team:read'
      ],
      clientId: import.meta.env.VITE_SLACK_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_SLACK_REDIRECT_URI || `${window.location.origin}/auth/slack/callback`
    });

    // Jira OAuth Provider (Atlassian)
    this.providers.set('jira', {
      id: 'jira',
      name: 'Jira',
      authUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: [
        'read:jira-work',
        'write:jira-work',
        'read:jira-user',
        'offline_access'
      ],
      clientId: import.meta.env.VITE_JIRA_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_JIRA_REDIRECT_URI || `${window.location.origin}/auth/jira/callback`
    });
  }

  private loadStoredConnections() {
    try {
      const stored = localStorage.getItem('oauth_connections');
      if (stored) {
        const connections = JSON.parse(stored);
        Object.entries(connections).forEach(([providerId, connection]: [string, any]) => {
          this.connections.set(providerId, {
            ...connection,
            lastSync: connection.lastSync ? new Date(connection.lastSync) : undefined
          });
        });
      }
    } catch (error) {
      console.error('Error loading stored OAuth connections:', error);
    }
  }

  private saveConnections() {
    try {
      const connectionsObj: Record<string, any> = {};
      this.connections.forEach((connection, providerId) => {
        connectionsObj[providerId] = {
          ...connection,
          lastSync: connection.lastSync?.toISOString()
        };
      });
      localStorage.setItem('oauth_connections', JSON.stringify(connectionsObj));
    } catch (error) {
      console.error('Error saving OAuth connections:', error);
    }
  }

  // Start OAuth flow for a provider
  async startOAuthFlow(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.clientId) {
      throw new Error(`Client ID not configured for ${provider.name}`);
    }

    // Generate state parameter for security
    const state = this.generateState();
    sessionStorage.setItem(`oauth_state_${providerId}`, state);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      scope: provider.scopes.join(' '),
      response_type: 'code',
      state: state,
      access_type: 'offline', // For refresh tokens
      prompt: 'consent'
    });

    const authUrl = `${provider.authUrl}?${params.toString()}`;
    
    // Open OAuth popup or redirect
    if (import.meta.env.VITE_OAUTH_MODE === 'popup') {
      this.openOAuthPopup(authUrl, providerId);
    } else {
      window.location.href = authUrl;
    }
  }

  private openOAuthPopup(authUrl: string, providerId: string) {
    const popup = window.open(
      authUrl,
      `oauth_${providerId}`,
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for popup completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Check if authentication was successful
        this.checkAuthCompletion(providerId);
      }
    }, 1000);
  }

  private async checkAuthCompletion(providerId: string) {
    // This would be called after popup closes or redirect returns
    // Implementation depends on your callback handling
    const connection = this.connections.get(providerId);
    if (connection?.isConnected) {
      console.log(`${providerId} authentication successful`);
    }
  }

  // Handle OAuth callback (called from callback page)
  async handleOAuthCallback(providerId: string, code: string, state: string): Promise<boolean> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem(`oauth_state_${providerId}`);
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(provider, code);
      
      // Get user info
      const userInfo = await this.getUserInfo(providerId, tokens);

      // Store connection
      const connection: OAuthConnection = {
        providerId,
        isConnected: true,
        tokens,
        userInfo,
        lastSync: new Date()
      };

      this.connections.set(providerId, connection);
      this.saveConnections();

      // Clean up
      sessionStorage.removeItem(`oauth_state_${providerId}`);

      return true;
    } catch (error) {
      console.error(`OAuth callback error for ${providerId}:`, error);
      
      // Store error state
      this.connections.set(providerId, {
        providerId,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
      this.saveConnections();

      return false;
    }
  }

  private async exchangeCodeForTokens(provider: OAuthProvider, code: string): Promise<OAuthTokens> {
    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: provider.clientId,
        client_secret: this.getClientSecret(provider.id),
        code,
        grant_type: 'authorization_code',
        redirect_uri: provider.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    
    // Add expiry date if expires_in is provided
    if (tokens.expires_in) {
      tokens.expiry_date = Date.now() + (tokens.expires_in * 1000);
    }

    return tokens;
  }

  private getClientSecret(providerId: string): string {
    switch (providerId) {
      case 'google':
        return import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
      case 'slack':
        return import.meta.env.VITE_SLACK_CLIENT_SECRET || '';
      case 'jira':
        return import.meta.env.VITE_JIRA_CLIENT_SECRET || '';
      default:
        return '';
    }
  }

  private async getUserInfo(providerId: string, tokens: OAuthTokens): Promise<any> {
    // Implementation would vary by provider
    // This is a simplified version
    switch (providerId) {
      case 'google':
        return this.getGoogleUserInfo(tokens);
      case 'slack':
        return this.getSlackUserInfo(tokens);
      case 'jira':
        return this.getJiraUserInfo(tokens);
      default:
        return null;
    }
  }

  private async getGoogleUserInfo(tokens: OAuthTokens) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });
    return response.json();
  }

  private async getSlackUserInfo(tokens: OAuthTokens) {
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });
    return response.json();
  }

  private async getJiraUserInfo(tokens: OAuthTokens) {
    const response = await fetch('https://api.atlassian.com/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });
    return response.json();
  }

  // Disconnect a provider
  disconnect(providerId: string): void {
    this.connections.delete(providerId);
    this.saveConnections();
  }

  // Get connection status
  getConnection(providerId: string): OAuthConnection | null {
    return this.connections.get(providerId) || null;
  }

  // Get all connections
  getAllConnections(): Map<string, OAuthConnection> {
    return new Map(this.connections);
  }

  // Check if provider is connected
  isConnected(providerId: string): boolean {
    const connection = this.connections.get(providerId);
    return connection?.isConnected || false;
  }

  // Get available providers
  getProviders(): OAuthProvider[] {
    return Array.from(this.providers.values());
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const OAuthService = new OAuthServiceClass();
