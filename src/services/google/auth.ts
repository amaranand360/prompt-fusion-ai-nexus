// Browser-compatible Google Auth using Google Identity Services
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export interface GoogleCredentials {
  client_id: string;
  client_secret?: string; // Not needed for browser auth
  redirect_uri?: string;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
  id_token?: string;
}

export class GoogleAuthService {
  private credentials: GoogleCredentials;
  private tokenClient: any;
  private gapiInited = false;
  private gisInited = false;

  private readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
  ].join(' ');

  constructor(credentials: GoogleCredentials) {
    this.credentials = credentials;
    this.initializeGoogleAPIs();
  }

  private async initializeGoogleAPIs() {
    await this.loadGoogleScripts();
    await this.initializeGapi();
    this.initializeGis();
  }

  private loadGoogleScripts(): Promise<void> {
    return new Promise((resolve) => {
      // Load GAPI
      if (!document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => {
          // Load GIS
          if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.onload = () => resolve();
            document.head.appendChild(gisScript);
          } else {
            resolve();
          }
        };
        document.head.appendChild(gapiScript);
      } else {
        resolve();
      }
    });
  }

  private async initializeGapi(): Promise<void> {
    return new Promise((resolve) => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: '', // We'll use OAuth tokens instead
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
        });
        this.gapiInited = true;
        resolve();
      });
    });
  }

  private initializeGis() {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.credentials.client_id,
      scope: this.SCOPES,
      callback: '', // Will be set when requesting tokens
    });
    this.gisInited = true;
  }

  /**
   * Request access token using Google Identity Services
   */
  async requestAccessToken(): Promise<GoogleTokens> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient || !this.gapiInited || !this.gisInited) {
        reject(new Error('Google services not initialized yet. Please wait and try again.'));
        return;
      }

      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          reject(new Error(`Authentication failed: ${response.error}`));
          return;
        }

        const tokens: GoogleTokens = {
          access_token: response.access_token,
          token_type: 'Bearer',
          scope: response.scope,
          expiry_date: Date.now() + (response.expires_in * 1000),
        };

        // Set the token for GAPI client
        window.gapi.client.setToken({
          access_token: response.access_token,
        });

        console.log('Google authentication successful');
        resolve(tokens);
      };

      // Request access token
      this.tokenClient.requestAccessToken({
        prompt: 'consent',
      });
    });
  }

  /**
   * Set access token for API calls
   */
  setAccessToken(token: string) {
    if (window.gapi && window.gapi.client) {
      window.gapi.client.setToken({
        access_token: token,
      });
    }
  }

  /**
   * Refresh access token (browser-based auth doesn't support refresh tokens)
   * Instead, we'll request a new token
   */
  async refreshAccessToken(): Promise<GoogleTokens> {
    return this.requestAccessToken();
  }

  /**
   * Get authenticated client
   */
  getAuthenticatedClient(tokens: GoogleTokens) {
    this.setAccessToken(tokens.access_token);
    return window.gapi.client;
  }

  /**
   * Validate if tokens are still valid
   */
  isTokenValid(tokens: GoogleTokens): boolean {
    if (!tokens.expiry_date) return true;
    return Date.now() < tokens.expiry_date;
  }
}

// Singleton instance
let authService: GoogleAuthService | null = null;

export const getGoogleAuthService = (credentials?: GoogleCredentials): GoogleAuthService => {
  if (!authService && credentials) {
    authService = new GoogleAuthService(credentials);
  }
  if (!authService) {
    throw new Error('Google Auth Service not initialized. Please provide credentials.');
  }
  return authService;
};
