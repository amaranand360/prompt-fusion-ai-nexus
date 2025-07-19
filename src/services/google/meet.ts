import { CalendarService, CreateEventRequest } from './calendar';
import { GoogleAuthService, GoogleTokens } from './auth';

export interface MeetingRequest {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
  timeZone?: string;
  sendNotifications?: boolean;
}

export interface MeetingInfo {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  meetLink: string;
  joinUrl: string;
  phoneNumbers?: {
    number: string;
    pin: string;
  }[];
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
  }[];
  organizer: {
    email: string;
    displayName?: string;
  };
  status: string;
  location?: string;
}

export class GoogleMeetService {
  private calendarService: CalendarService;
  private authService: GoogleAuthService;

  constructor(authService: GoogleAuthService, tokens: GoogleTokens) {
    this.authService = authService;
    this.calendarService = new CalendarService(authService, tokens);
  }

  /**
   * Create a new Google Meet meeting (mock implementation)
   */
  async createMeeting(meetingRequest: MeetingRequest): Promise<MeetingInfo> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockMeeting: MeetingInfo = {
        id: `mock_meeting_${Date.now()}`,
        title: meetingRequest.title,
        description: meetingRequest.description,
        startDateTime: meetingRequest.startDateTime,
        endDateTime: meetingRequest.endDateTime,
        meetLink: `https://meet.google.com/mock-${Date.now().toString(36)}`,
        joinUrl: `https://meet.google.com/mock-${Date.now().toString(36)}`,
        attendees: meetingRequest.attendees?.map(email => ({ email })),
        organizer: {
          email: 'you@company.com',
          displayName: 'You'
        },
        status: 'confirmed'
      };

      console.log('Mock Google Meet created:', mockMeeting);
      return mockMeeting;
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      throw new Error('Failed to create Google Meet meeting');
    }
  }

  /**
   * Get meeting information by event ID
   */
  async getMeeting(eventId: string, calendarId: string = 'primary'): Promise<MeetingInfo> {
    try {
      const event = await this.calendarService.getEvent(eventId, calendarId);
      return this.parseEventToMeetingInfo(event);
    } catch (error) {
      console.error('Error getting meeting:', error);
      throw new Error('Failed to get meeting information');
    }
  }

  /**
   * Update existing meeting
   */
  async updateMeeting(
    eventId: string,
    updates: Partial<MeetingRequest>,
    calendarId: string = 'primary'
  ): Promise<MeetingInfo> {
    try {
      const eventRequest: Partial<CreateEventRequest> = {
        summary: updates.title,
        description: updates.description,
        startDateTime: updates.startDateTime,
        endDateTime: updates.endDateTime,
        attendees: updates.attendees,
        timeZone: updates.timeZone,
        createMeetLink: true,
      };

      const event = await this.calendarService.updateEvent(eventId, eventRequest, calendarId);
      return this.parseEventToMeetingInfo(event);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw new Error('Failed to update meeting');
    }
  }

  /**
   * Cancel/Delete meeting
   */
  async cancelMeeting(eventId: string, calendarId: string = 'primary'): Promise<void> {
    try {
      await this.calendarService.deleteEvent(eventId, calendarId);
    } catch (error) {
      console.error('Error canceling meeting:', error);
      throw new Error('Failed to cancel meeting');
    }
  }

  /**
   * Get upcoming meetings
   */
  async getUpcomingMeetings(maxResults: number = 10): Promise<MeetingInfo[]> {
    try {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const events = await this.calendarService.getEvents('primary', {
        timeMin: now.toISOString(),
        timeMax: oneWeekFromNow.toISOString(),
        maxResults,
        orderBy: 'startTime',
        singleEvents: true,
      });

      // Filter only events with Meet links
      const meetingEvents = events.filter(event => 
        event.conferenceData?.entryPoints?.some(entry => 
          entry.entryPointType === 'video' && entry.uri?.includes('meet.google.com')
        )
      );

      return meetingEvents.map(event => this.parseEventToMeetingInfo(event));
    } catch (error) {
      console.error('Error getting upcoming meetings:', error);
      throw new Error('Failed to get upcoming meetings');
    }
  }

  /**
   * Create instant meeting (starts now) - mock implementation
   */
  async createInstantMeeting(
    title: string,
    durationMinutes: number = 60,
    attendees?: string[]
  ): Promise<MeetingInfo> {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

      const mockMeeting: MeetingInfo = {
        id: `instant_meeting_${Date.now()}`,
        title,
        description: 'Instant meeting created via AI Assistant',
        startDateTime: now.toISOString(),
        endDateTime: endTime.toISOString(),
        meetLink: `https://meet.google.com/instant-${Date.now().toString(36)}`,
        joinUrl: `https://meet.google.com/instant-${Date.now().toString(36)}`,
        attendees: attendees?.map(email => ({ email })),
        organizer: {
          email: 'you@company.com',
          displayName: 'You'
        },
        status: 'confirmed'
      };

      console.log('Mock instant meeting created:', mockMeeting);
      return mockMeeting;
    } catch (error) {
      console.error('Error creating instant meeting:', error);
      throw new Error('Failed to create instant meeting');
    }
  }

  /**
   * Schedule recurring meeting
   */
  async createRecurringMeeting(
    meetingRequest: MeetingRequest & {
      recurrence: {
        frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        interval?: number;
        count?: number;
        until?: string;
        byDay?: string[];
      };
    }
  ): Promise<MeetingInfo> {
    try {
      const eventRequest: CreateEventRequest = {
        summary: meetingRequest.title,
        description: meetingRequest.description,
        startDateTime: meetingRequest.startDateTime,
        endDateTime: meetingRequest.endDateTime,
        attendees: meetingRequest.attendees,
        timeZone: meetingRequest.timeZone,
        createMeetLink: true,
        recurrence: meetingRequest.recurrence,
        reminders: [
          { method: 'email', minutes: 10 },
          { method: 'popup', minutes: 5 },
        ],
      };

      const event = await this.calendarService.createEvent(eventRequest);
      return this.parseEventToMeetingInfo(event);
    } catch (error) {
      console.error('Error creating recurring meeting:', error);
      throw new Error('Failed to create recurring meeting');
    }
  }

  /**
   * Get meeting recording information (if available)
   */
  async getMeetingRecordings(eventId: string): Promise<any[]> {
    // Note: Google Meet recordings are typically stored in Google Drive
    // This would require additional Drive API integration
    // For now, return empty array as placeholder
    console.log('Meeting recordings feature requires Google Drive API integration');
    return [];
  }

  private parseEventToMeetingInfo(event: any): MeetingInfo {
    const meetLink = event.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'video'
    )?.uri || '';

    const phoneEntry = event.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'phone'
    );

    const phoneNumbers = phoneEntry ? [{
      number: phoneEntry.uri?.replace('tel:', '') || '',
      pin: event.conferenceData?.conferenceSolution?.key?.type === 'hangoutsMeet' 
        ? 'PIN will be provided in meeting' 
        : '',
    }] : undefined;

    return {
      id: event.id,
      title: event.summary,
      description: event.description,
      startDateTime: event.start.dateTime || event.start.date,
      endDateTime: event.end.dateTime || event.end.date,
      meetLink,
      joinUrl: meetLink,
      phoneNumbers,
      attendees: event.attendees?.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus,
      })),
      organizer: {
        email: event.organizer?.email || '',
        displayName: event.organizer?.displayName,
      },
      status: event.status || 'confirmed',
      location: event.location,
    };
  }

  /**
   * Generate meeting summary for AI processing
   */
  generateMeetingSummary(meeting: MeetingInfo): string {
    const startDate = new Date(meeting.startDateTime);
    const endDate = new Date(meeting.endDateTime);
    
    return `
Meeting: ${meeting.title}
Date: ${startDate.toLocaleDateString()}
Time: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}
Duration: ${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))} minutes
Attendees: ${meeting.attendees?.length || 0} people
Google Meet Link: ${meeting.meetLink}
Status: ${meeting.status}
${meeting.description ? `Description: ${meeting.description}` : ''}
${meeting.location ? `Location: ${meeting.location}` : ''}
    `.trim();
  }
}
