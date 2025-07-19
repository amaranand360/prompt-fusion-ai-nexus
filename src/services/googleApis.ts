import { googleAuthService } from './googleAuth';

// Gmail API Types
export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string } }>;
  };
  internalDate: string;
  labelIds: string[];
}

export interface GmailThread {
  id: string;
  snippet: string;
  historyId: string;
  messages: GmailMessage[];
}

// Calendar API Types
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  location?: string;
  htmlLink: string;
  status: string;
  created: string;
  updated: string;
}

// Drive API Types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
  owners: Array<{ displayName: string; emailAddress: string }>;
  shared: boolean;
}

class GoogleGmailService {
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1';

  async getMessages(query?: string, maxResults = 10): Promise<GmailMessage[]> {
    const token = await googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        ...(query && { q: query })
      });

      const response = await fetch(`${this.baseUrl}/users/me/messages?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      
      // Get full message details
      const messages = await Promise.all(
        (data.messages || []).map((msg: { id: string }) => this.getMessage(msg.id))
      );

      return messages.filter(Boolean);
    } catch (error) {
      console.error('Gmail messages error:', error);
      return [];
    }
  }

  async getMessage(messageId: string): Promise<GmailMessage | null> {
    const token = await googleAuthService.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/users/me/messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Gmail message error:', error);
      return null;
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const token = await googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(`${this.baseUrl}/users/me/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      return response.ok;
    } catch (error) {
      console.error('Send email error:', error);
      return false;
    }
  }

  getEmailContent(message: GmailMessage): string {
    if (message.payload.body?.data) {
      return atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    
    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return message.snippet;
  }

  getEmailHeader(message: GmailMessage, headerName: string): string {
    const header = message.payload.headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
    return header?.value || '';
  }
}

class GoogleCalendarService {
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  async getEvents(calendarId = 'primary', maxResults = 10): Promise<CalendarEvent[]> {
    const token = await googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin: new Date().toISOString()
      });

      const response = await fetch(`${this.baseUrl}/calendars/${calendarId}/events?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Calendar events error:', error);
      return [];
    }
  }

  async createEvent(event: Partial<CalendarEvent>, calendarId = 'primary'): Promise<CalendarEvent | null> {
    const token = await googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${this.baseUrl}/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    } catch (error) {
      console.error('Create event error:', error);
      return null;
    }
  }

  async searchEvents(query: string, calendarId = 'primary'): Promise<CalendarEvent[]> {
    const token = await googleAuthService.getAccessToken();
    if (!token) return [];

    try {
      const params = new URLSearchParams({
        q: query,
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await fetch(`${this.baseUrl}/calendars/${calendarId}/events?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Search events error:', error);
      return [];
    }
  }
}

class GoogleDriveService {
  private baseUrl = 'https://www.googleapis.com/drive/v3';

  async getFiles(query?: string, maxResults = 10): Promise<DriveFile[]> {
    const token = await googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const params = new URLSearchParams({
        pageSize: maxResults.toString(),
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,owners,shared)',
        ...(query && { q: `name contains '${query}' or fullText contains '${query}'` })
      });

      const response = await fetch(`${this.baseUrl}/files?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch files');

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Drive files error:', error);
      return [];
    }
  }

  async searchFiles(query: string): Promise<DriveFile[]> {
    return this.getFiles(query);
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFile | null> {
    const token = await googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] })
      };

      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) throw new Error('Failed to create folder');
      return response.json();
    } catch (error) {
      console.error('Create folder error:', error);
      return null;
    }
  }
}

// Export service instances
export const gmailService = new GoogleGmailService();
export const calendarService = new GoogleCalendarService();
export const driveService = new GoogleDriveService();
