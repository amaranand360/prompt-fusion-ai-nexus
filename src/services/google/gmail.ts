import { GoogleAuthService, GoogleTokens } from './auth';

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  date: Date;
  isRead: boolean;
  hasAttachments: boolean;
  labels: string[];
}

export interface SendEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
}

export interface EmailSearchOptions {
  query?: string;
  maxResults?: number;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

export class GmailService {
  private authService: GoogleAuthService;

  constructor(authService: GoogleAuthService, tokens: GoogleTokens) {
    this.authService = authService;
    authService.getAuthenticatedClient(tokens);
  }

  /**
   * Search for emails (supports both demo and real modes)
   */
  async searchEmails(options: EmailSearchOptions = {}, isDemoMode: boolean = true): Promise<EmailMessage[]> {
    try {
      console.log('Searching emails with options:', options, 'Demo mode:', isDemoMode);

      if (isDemoMode) {
        // Demo mode: return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock email data for development
        const mockEmails: EmailMessage[] = [
        {
          id: '1',
          threadId: 'thread1',
          subject: 'Weekly Team Meeting',
          from: 'manager@company.com',
          to: ['you@company.com'],
          body: 'Hi team, let\'s schedule our weekly meeting for tomorrow at 2 PM.',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: false,
          hasAttachments: false,
          labels: ['INBOX', 'IMPORTANT']
        },
        {
          id: '2',
          threadId: 'thread2',
          subject: 'Project Update Required',
          from: 'client@example.com',
          to: ['you@company.com'],
          body: 'Could you please send me an update on the current project status?',
          date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          isRead: true,
          hasAttachments: false,
          labels: ['INBOX']
        },
        {
          id: '3',
          threadId: 'thread3',
          subject: 'Google Meet Invitation',
          from: 'calendar-notification@google.com',
          to: ['you@company.com'],
          body: 'You have been invited to a Google Meet session.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          isRead: true,
          hasAttachments: false,
          labels: ['INBOX']
        }
      ];

      // Filter based on query if provided
      const { query = '', maxResults = 50 } = options;
      let filteredEmails = mockEmails;

      if (query) {
        filteredEmails = mockEmails.filter(email =>
          email.subject.toLowerCase().includes(query.toLowerCase()) ||
          email.from.toLowerCase().includes(query.toLowerCase()) ||
          email.body.toLowerCase().includes(query.toLowerCase())
        );
      }

        console.log('Found emails (demo):', filteredEmails.length);
        return filteredEmails.slice(0, maxResults);
      } else {
        // Real mode: use actual Gmail API
        const {
          query = '',
          maxResults = 10,
          labelIds,
          includeSpamTrash = false
        } = options;

        const response = await window.gapi.client.gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults,
          labelIds,
          includeSpamTrash,
        });

        if (!response.result.messages) {
          return [];
        }

        // Get full message details for each message
        const messages = await Promise.all(
          response.result.messages.slice(0, 5).map(async (message: any) => {
            const fullMessage = await window.gapi.client.gmail.users.messages.get({
              userId: 'me',
              id: message.id,
              format: 'full',
            });

            return this.parseEmailMessage(fullMessage.result);
          })
        );

        console.log('Found emails (real):', messages.length);
        return messages;
      }
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new Error('Failed to search emails. Make sure you have granted Gmail permissions.');
    }
  }

  /**
   * Get email by ID (mock implementation)
   */
  async getEmail(messageId: string): Promise<EmailMessage> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return mock email
      return {
        id: messageId,
        threadId: 'thread1',
        subject: 'Mock Email',
        from: 'sender@example.com',
        to: ['you@company.com'],
        body: 'This is a mock email for demonstration purposes.',
        date: new Date(),
        isRead: false,
        hasAttachments: false,
        labels: ['INBOX']
      };
    } catch (error) {
      console.error('Error getting email:', error);
      throw new Error('Failed to get email');
    }
  }

  /**
   * Send email (supports both demo and real modes)
   */
  async sendEmail(emailRequest: SendEmailRequest, isDemoMode: boolean = true): Promise<string> {
    try {
      console.log('Sending email:', {
        to: emailRequest.to,
        subject: emailRequest.subject,
        body: emailRequest.body,
        demoMode: isDemoMode
      });

      if (isDemoMode) {
        // Demo mode: simulate sending
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockMessageId = `demo_message_${Date.now()}`;

        console.log('Email sent successfully (demo):', {
          to: emailRequest.to,
          subject: emailRequest.subject,
          messageId: mockMessageId
        });

        return mockMessageId;
      } else {
        // Real mode: use actual Gmail API
        const email = this.createEmailMessage(emailRequest);

        const response = await window.gapi.client.gmail.users.messages.send({
          userId: 'me',
          resource: {
            raw: email,
          },
        });

        console.log('Email sent successfully (real):', {
          to: emailRequest.to,
          subject: emailRequest.subject,
          messageId: response.result.id
        });

        return response.result.id;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email. Make sure you have granted Gmail send permissions.');
    }
  }

  /**
   * Reply to email
   */
  async replyToEmail(
    messageId: string,
    threadId: string,
    replyRequest: Omit<SendEmailRequest, 'to'>
  ): Promise<string> {
    try {
      // Get original message to extract reply-to information
      const originalMessage = await this.getEmail(messageId);
      
      const email = this.createEmailMessage({
        ...replyRequest,
        to: [originalMessage.from],
        subject: originalMessage.subject.startsWith('Re:') 
          ? originalMessage.subject 
          : `Re: ${originalMessage.subject}`,
      });

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: email,
          threadId,
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error('Error replying to email:', error);
      throw new Error('Failed to reply to email');
    }
  }

  /**
   * Mark email as read/unread
   */
  async markAsRead(messageId: string, isRead: boolean = true): Promise<void> {
    try {
      const labelIds = isRead ? ['UNREAD'] : ['UNREAD'];
      const action = isRead ? 'remove' : 'add';

      if (action === 'remove') {
        await this.gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: labelIds,
          },
        });
      } else {
        await this.gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: labelIds,
          },
        });
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw new Error('Failed to mark email as read');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      });

      return {
        emailAddress: response.data.emailAddress!,
        messagesTotal: response.data.messagesTotal!,
        threadsTotal: response.data.threadsTotal!,
        historyId: response.data.historyId!,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  private parseEmailMessage(message: any): EmailMessage {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject');
    const from = getHeader('From');
    const to = getHeader('To').split(',').map((email: string) => email.trim());
    const cc = getHeader('Cc').split(',').map((email: string) => email.trim()).filter(Boolean);
    const date = new Date(getHeader('Date'));

    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload?.parts) {
      const textPart = message.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      subject,
      from,
      to,
      cc: cc.length > 0 ? cc : undefined,
      body,
      date,
      isRead: !message.labelIds?.includes('UNREAD'),
      hasAttachments: message.payload?.parts?.some((part: any) => 
        part.filename && part.filename.length > 0
      ) || false,
      labels: message.labelIds || [],
    };
  }

  private createEmailMessage(emailRequest: SendEmailRequest): string {
    const { to, cc, bcc, subject, body, isHtml = false } = emailRequest;
    
    let email = '';
    email += `To: ${to.join(', ')}\r\n`;
    if (cc && cc.length > 0) email += `Cc: ${cc.join(', ')}\r\n`;
    if (bcc && bcc.length > 0) email += `Bcc: ${bcc.join(', ')}\r\n`;
    email += `Subject: ${subject}\r\n`;
    email += `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8\r\n`;
    email += `\r\n${body}`;

    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }
}
