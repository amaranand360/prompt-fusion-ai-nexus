import { GoogleAuth } from 'google-auth-library';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

// Google API Scopes for different services
export const GOOGLE_SCOPES = {
  GMAIL: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],
  CALENDAR: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  DRIVE: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file'
  ],
  MEET: [
    'https://www.googleapis.com/auth/meetings.space.created'
  ],
  PROFILE: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// All scopes combined
const ALL_SCOPES = [
  ...GOOGLE_SCOPES.GMAIL,
  ...GOOGLE_SCOPES.CALENDAR,
  ...GOOGLE_SCOPES.DRIVE,
  ...GOOGLE_SCOPES.PROFILE
].join(' ');

export interface GoogleAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

class GoogleAuthService {
  private auth: GoogleAuth;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ALL_SCOPES,
      credentials: {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uris: [REDIRECT_URI]
      }
    });

    // Load tokens from localStorage
    this.loadTokensFromStorage();
  }

  /**
   * Initiate Google OAuth flow
   */
  async signIn(): Promise<void> {
    try {
      const authUrl = this.buildAuthUrl();
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for the callback
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        // Listen for message from popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            
            this.handleAuthSuccess(event.data.code);
            resolve();
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Build Google OAuth URL
   */
  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: ALL_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateState()
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Handle successful authentication
   */
  private async handleAuthSuccess(code: string): Promise<void> {
    try {
      const tokenResponse = await this.exchangeCodeForTokens(code);
      
      this.accessToken = tokenResponse.access_token;
      this.refreshToken = tokenResponse.refresh_token || this.refreshToken;
      this.expiresAt = Date.now() + (tokenResponse.expires_in * 1000);

      this.saveTokensToStorage();
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<GoogleAuthResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  /**
   * Get current access token (refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) return null;

    // Check if token is expired
    if (this.expiresAt && Date.now() >= this.expiresAt - 60000) { // 1 minute buffer
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokenResponse: GoogleAuthResponse = await response.json();
      
      this.accessToken = tokenResponse.access_token;
      this.expiresAt = Date.now() + (tokenResponse.expires_in * 1000);

      this.saveTokensToStorage();
    } catch (error) {
      console.error('Token refresh error:', error);
      this.signOut(); // Clear invalid tokens
      throw error;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<GoogleUserInfo | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return response.json();
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.expiresAt && Date.now() < this.expiresAt;
  }

  /**
   * Sign out user
   */
  signOut(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_expires_at');
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(): void {
    if (this.accessToken) {
      localStorage.setItem('google_access_token', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('google_refresh_token', this.refreshToken);
    }
    if (this.expiresAt) {
      localStorage.setItem('google_expires_at', this.expiresAt.toString());
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('google_access_token');
    this.refreshToken = localStorage.getItem('google_refresh_token');
    const expiresAt = localStorage.getItem('google_expires_at');
    this.expiresAt = expiresAt ? parseInt(expiresAt) : null;
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const googleAuthService = new GoogleAuthService();
