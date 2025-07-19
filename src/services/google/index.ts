import { GoogleAuthService, GoogleCredentials, GoogleTokens } from './auth';
import { GmailService, SendEmailRequest, EmailSearchOptions } from './gmail';
import { CalendarService, CreateEventRequest, EventSearchOptions } from './calendar';
import { GoogleMeetService, MeetingRequest } from './meet';

export interface GoogleIntegrationConfig {
  credentials: GoogleCredentials;
  tokens?: GoogleTokens;
}

export interface AIActionRequest {
  type: 'email' | 'calendar' | 'meet' | 'search';
  action: string;
  parameters: any;
  context?: string;
}

export interface AIActionResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

export class GoogleIntegrationManager {
  private authService: GoogleAuthService;
  private gmailService?: GmailService;
  private calendarService?: CalendarService;
  private meetService?: GoogleMeetService;
  private tokens?: GoogleTokens;

  constructor(config: GoogleIntegrationConfig) {
    this.authService = new GoogleAuthService(config.credentials);
    this.tokens = config.tokens;
    
    if (this.tokens) {
      this.initializeServices();
    }
  }

  /**
   * Initialize all Google services with tokens
   */
  private initializeServices() {
    if (!this.tokens) return;

    this.gmailService = new GmailService(this.authService, this.tokens);
    this.calendarService = new CalendarService(this.authService, this.tokens);
    this.meetService = new GoogleMeetService(this.authService, this.tokens);
  }

  /**
   * Set tokens and initialize services
   */
  setTokens(tokens: GoogleTokens) {
    this.tokens = tokens;
    this.initializeServices();
  }

  /**
   * Start OAuth flow using Google Identity Services
   */
  async authenticate(): Promise<GoogleTokens> {
    const tokens = await this.authService.requestAccessToken();
    this.setTokens(tokens);
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshTokens(): Promise<GoogleTokens> {
    const newTokens = await this.authService.refreshAccessToken();
    this.setTokens(newTokens);
    return newTokens;
  }

  /**
   * Check if services are ready
   */
  isReady(): boolean {
    return !!(this.tokens && this.gmailService && this.calendarService && this.meetService);
  }

  /**
   * Process AI action request
   */
  async processAIAction(request: AIActionRequest): Promise<AIActionResponse> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Google services not initialized',
        message: 'Please authenticate with Google first',
      };
    }

    try {
      switch (request.type) {
        case 'email':
          return await this.handleEmailAction(request);
        case 'calendar':
          return await this.handleCalendarAction(request);
        case 'meet':
          return await this.handleMeetAction(request);
        case 'search':
          return await this.handleSearchAction(request);
        default:
          return {
            success: false,
            error: 'Unknown action type',
            message: `Action type '${request.type}' is not supported`,
          };
      }
    } catch (error) {
      console.error('Error processing AI action:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process the requested action',
      };
    }
  }

  private async handleEmailAction(request: AIActionRequest): Promise<AIActionResponse> {
    const { action, parameters } = request;

    switch (action) {
      case 'send':
        const emailRequest: SendEmailRequest = {
          to: parameters.to || [],
          cc: parameters.cc,
          bcc: parameters.bcc,
          subject: parameters.subject || '',
          body: parameters.body || '',
          isHtml: parameters.isHtml || false,
        };
        
        const messageId = await this.gmailService!.sendEmail(emailRequest);
        return {
          success: true,
          data: { messageId },
          message: `Email sent successfully to ${emailRequest.to.join(', ')}`,
        };

      case 'search':
        const searchOptions: EmailSearchOptions = {
          query: parameters.query,
          maxResults: parameters.maxResults || 10,
        };
        
        const emails = await this.gmailService!.searchEmails(searchOptions);
        return {
          success: true,
          data: { emails },
          message: `Found ${emails.length} emails matching your search`,
        };

      case 'reply':
        const replyId = await this.gmailService!.replyToEmail(
          parameters.messageId,
          parameters.threadId,
          {
            subject: parameters.subject,
            body: parameters.body,
            isHtml: parameters.isHtml || false,
          }
        );
        return {
          success: true,
          data: { messageId: replyId },
          message: 'Reply sent successfully',
        };

      default:
        return {
          success: false,
          error: 'Unknown email action',
          message: `Email action '${action}' is not supported`,
        };
    }
  }

  private async handleCalendarAction(request: AIActionRequest): Promise<AIActionResponse> {
    const { action, parameters } = request;

    switch (action) {
      case 'create':
        const eventRequest: CreateEventRequest = {
          summary: parameters.title || parameters.summary,
          description: parameters.description,
          startDateTime: parameters.startDateTime,
          endDateTime: parameters.endDateTime,
          attendees: parameters.attendees,
          location: parameters.location,
          timeZone: parameters.timeZone,
          createMeetLink: parameters.createMeetLink || false,
        };
        
        const event = await this.calendarService!.createEvent(eventRequest);
        return {
          success: true,
          data: { event },
          message: `Event "${event.summary}" created successfully`,
        };

      case 'list':
        const events = await this.calendarService!.getEvents('primary', {
          timeMin: parameters.timeMin,
          timeMax: parameters.timeMax,
          maxResults: parameters.maxResults || 10,
        });
        return {
          success: true,
          data: { events },
          message: `Found ${events.length} upcoming events`,
        };

      case 'update':
        const updatedEvent = await this.calendarService!.updateEvent(
          parameters.eventId,
          parameters.updates
        );
        return {
          success: true,
          data: { event: updatedEvent },
          message: 'Event updated successfully',
        };

      case 'delete':
        await this.calendarService!.deleteEvent(parameters.eventId);
        return {
          success: true,
          message: 'Event deleted successfully',
        };

      default:
        return {
          success: false,
          error: 'Unknown calendar action',
          message: `Calendar action '${action}' is not supported`,
        };
    }
  }

  private async handleMeetAction(request: AIActionRequest): Promise<AIActionResponse> {
    const { action, parameters } = request;

    switch (action) {
      case 'create':
        const meetingRequest: MeetingRequest = {
          title: parameters.title,
          description: parameters.description,
          startDateTime: parameters.startDateTime,
          endDateTime: parameters.endDateTime,
          attendees: parameters.attendees,
          timeZone: parameters.timeZone,
        };
        
        const meeting = await this.meetService!.createMeeting(meetingRequest);
        return {
          success: true,
          data: { meeting },
          message: `Google Meet "${meeting.title}" created successfully. Join at: ${meeting.meetLink}`,
        };

      case 'instant':
        const instantMeeting = await this.meetService!.createInstantMeeting(
          parameters.title || 'Instant Meeting',
          parameters.duration || 60,
          parameters.attendees
        );
        return {
          success: true,
          data: { meeting: instantMeeting },
          message: `Instant meeting created! Join now at: ${instantMeeting.meetLink}`,
        };

      case 'upcoming':
        const upcomingMeetings = await this.meetService!.getUpcomingMeetings(
          parameters.maxResults || 5
        );
        return {
          success: true,
          data: { meetings: upcomingMeetings },
          message: `Found ${upcomingMeetings.length} upcoming meetings`,
        };

      case 'cancel':
        await this.meetService!.cancelMeeting(parameters.eventId);
        return {
          success: true,
          message: 'Meeting cancelled successfully',
        };

      default:
        return {
          success: false,
          error: 'Unknown meet action',
          message: `Meet action '${action}' is not supported`,
        };
    }
  }

  private async handleSearchAction(request: AIActionRequest): Promise<AIActionResponse> {
    const { parameters } = request;
    const results: any = {
      emails: [],
      events: [],
      meetings: [],
    };

    // Search emails if query provided
    if (parameters.searchEmails !== false) {
      try {
        const emails = await this.gmailService!.searchEmails({
          query: parameters.query,
          maxResults: parameters.emailLimit || 5,
        });
        results.emails = emails;
      } catch (error) {
        console.error('Error searching emails:', error);
      }
    }

    // Search calendar events
    if (parameters.searchCalendar !== false) {
      try {
        const events = await this.calendarService!.getEvents('primary', {
          q: parameters.query,
          maxResults: parameters.eventLimit || 5,
          timeMin: parameters.timeMin,
          timeMax: parameters.timeMax,
        });
        results.events = events;
      } catch (error) {
        console.error('Error searching events:', error);
      }
    }

    // Get upcoming meetings
    if (parameters.searchMeetings !== false) {
      try {
        const meetings = await this.meetService!.getUpcomingMeetings(
          parameters.meetingLimit || 3
        );
        results.meetings = meetings;
      } catch (error) {
        console.error('Error searching meetings:', error);
      }
    }

    const totalResults = results.emails.length + results.events.length + results.meetings.length;
    
    return {
      success: true,
      data: results,
      message: `Found ${totalResults} results across Gmail, Calendar, and Meet`,
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      authenticated: !!this.tokens,
      tokenValid: this.tokens ? this.authService.isTokenValid(this.tokens) : false,
      services: {
        gmail: !!this.gmailService,
        calendar: !!this.calendarService,
        meet: !!this.meetService,
      },
    };
  }
}

// Export all types and classes
export * from './auth';
export * from './gmail';
export * from './calendar';
export * from './meet';
