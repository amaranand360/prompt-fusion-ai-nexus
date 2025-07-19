import { GoogleAuthService, GoogleTokens } from './auth';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  location?: string;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet';
      };
    };
    entryPoints?: {
      entryPointType: string;
      uri: string;
      label?: string;
    }[];
  };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: 'email' | 'popup';
      minutes: number;
    }[];
  };
  visibility?: 'default' | 'public' | 'private';
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface CreateEventRequest {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  attendees?: string[];
  location?: string;
  createMeetLink?: boolean;
  reminders?: {
    method: 'email' | 'popup';
    minutes: number;
  }[];
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    count?: number;
    until?: string;
    byDay?: string[];
  };
}

export interface EventSearchOptions {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  orderBy?: 'startTime' | 'updated';
  singleEvents?: boolean;
  showDeleted?: boolean;
  q?: string;
}

export class CalendarService {
  private authService: GoogleAuthService;

  constructor(authService: GoogleAuthService, tokens: GoogleTokens) {
    this.authService = authService;
    authService.getAuthenticatedClient(tokens);
  }

  /**
   * Get list of calendars
   */
  async getCalendars() {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items?.map(calendar => ({
        id: calendar.id!,
        summary: calendar.summary!,
        description: calendar.description,
        timeZone: calendar.timeZone,
        accessRole: calendar.accessRole,
        primary: calendar.primary,
        backgroundColor: calendar.backgroundColor,
        foregroundColor: calendar.foregroundColor,
      })) || [];
    } catch (error) {
      console.error('Error getting calendars:', error);
      throw new Error('Failed to get calendars');
    }
  }

  /**
   * Get events from calendar
   */
  async getEvents(calendarId: string = 'primary', options: EventSearchOptions = {}): Promise<CalendarEvent[]> {
    try {
      const {
        timeMin = new Date().toISOString(),
        timeMax,
        maxResults = 50,
        orderBy = 'startTime',
        singleEvents = true,
        showDeleted = false,
        q
      } = options;

      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults,
        orderBy,
        singleEvents,
        showDeleted,
        q,
      });

      return response.data.items?.map(this.parseCalendarEvent) || [];
    } catch (error) {
      console.error('Error getting events:', error);
      throw new Error('Failed to get events');
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string, calendarId: string = 'primary'): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      return this.parseCalendarEvent(response.data);
    } catch (error) {
      console.error('Error getting event:', error);
      throw new Error('Failed to get event');
    }
  }

  /**
   * Create new event (supports both demo and real modes)
   */
  async createEvent(eventRequest: CreateEventRequest, calendarId: string = 'primary', isDemoMode: boolean = true): Promise<CalendarEvent> {
    try {
      console.log('Creating calendar event:', eventRequest, 'Demo mode:', isDemoMode);

      if (isDemoMode) {
        // Demo mode: simulate event creation
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockEvent: CalendarEvent = {
          id: `demo_event_${Date.now()}`,
          summary: eventRequest.summary,
          description: eventRequest.description,
          start: {
            dateTime: eventRequest.startDateTime,
            timeZone: eventRequest.timeZone || 'UTC',
          },
          end: {
            dateTime: eventRequest.endDateTime,
            timeZone: eventRequest.timeZone || 'UTC',
          },
          attendees: eventRequest.attendees?.map(email => ({ email })),
          location: eventRequest.location,
          conferenceData: eventRequest.createMeetLink ? {
            entryPoints: [{
              entryPointType: 'video',
              uri: `https://meet.google.com/demo-${Date.now()}`,
              label: 'Google Meet (Demo)'
            }]
          } : undefined,
          status: 'confirmed',
        };

        console.log('Demo calendar event created:', mockEvent);
        return mockEvent;
      } else {
        // Real mode: use actual Google Calendar API
        const event = this.buildEventObject(eventRequest);

        const response = await window.gapi.client.calendar.events.insert({
          calendarId,
          resource: event,
          conferenceDataVersion: eventRequest.createMeetLink ? 1 : 0,
        });

        console.log('Real calendar event created:', response.result);
        return this.parseCalendarEvent(response.result);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create calendar event. Make sure you have granted Calendar permissions.');
    }
  }

  /**
   * Update existing event
   */
  async updateEvent(
    eventId: string,
    eventRequest: Partial<CreateEventRequest>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    try {
      const event = this.buildEventObject(eventRequest);
      
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
        conferenceDataVersion: eventRequest.createMeetLink ? 1 : 0,
      });

      return this.parseCalendarEvent(response.data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  /**
   * Get free/busy information
   */
  async getFreeBusy(
    emails: string[],
    timeMin: string,
    timeMax: string,
    timeZone: string = 'UTC'
  ) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          timeZone,
          items: emails.map(email => ({ id: email })),
        },
      });

      return response.data.calendars;
    } catch (error) {
      console.error('Error getting free/busy info:', error);
      throw new Error('Failed to get free/busy information');
    }
  }

  /**
   * Quick add event (natural language)
   */
  async quickAddEvent(text: string, calendarId: string = 'primary'): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.quickAdd({
        calendarId,
        text,
      });

      return this.parseCalendarEvent(response.data);
    } catch (error) {
      console.error('Error quick adding event:', error);
      throw new Error('Failed to quick add event');
    }
  }

  private parseCalendarEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      summary: event.summary || '',
      description: event.description,
      start: {
        dateTime: event.start?.dateTime,
        date: event.start?.date,
        timeZone: event.start?.timeZone,
      },
      end: {
        dateTime: event.end?.dateTime,
        date: event.end?.date,
        timeZone: event.end?.timeZone,
      },
      attendees: event.attendees?.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus,
      })),
      location: event.location,
      conferenceData: event.conferenceData,
      recurrence: event.recurrence,
      reminders: event.reminders,
      visibility: event.visibility,
      status: event.status,
    };
  }

  private buildEventObject(eventRequest: Partial<CreateEventRequest>): any {
    const event: any = {};

    if (eventRequest.summary) event.summary = eventRequest.summary;
    if (eventRequest.description) event.description = eventRequest.description;
    if (eventRequest.location) event.location = eventRequest.location;

    if (eventRequest.startDateTime && eventRequest.endDateTime) {
      event.start = {
        dateTime: eventRequest.startDateTime,
        timeZone: eventRequest.timeZone || 'UTC',
      };
      event.end = {
        dateTime: eventRequest.endDateTime,
        timeZone: eventRequest.timeZone || 'UTC',
      };
    }

    if (eventRequest.attendees && eventRequest.attendees.length > 0) {
      event.attendees = eventRequest.attendees.map(email => ({ email }));
    }

    if (eventRequest.createMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    if (eventRequest.reminders) {
      event.reminders = {
        useDefault: false,
        overrides: eventRequest.reminders,
      };
    }

    if (eventRequest.recurrence) {
      const { frequency, interval, count, until, byDay } = eventRequest.recurrence;
      let rrule = `FREQ=${frequency}`;
      if (interval) rrule += `;INTERVAL=${interval}`;
      if (count) rrule += `;COUNT=${count}`;
      if (until) rrule += `;UNTIL=${until}`;
      if (byDay && byDay.length > 0) rrule += `;BYDAY=${byDay.join(',')}`;
      
      event.recurrence = [`RRULE:${rrule}`];
    }

    return event;
  }
}
