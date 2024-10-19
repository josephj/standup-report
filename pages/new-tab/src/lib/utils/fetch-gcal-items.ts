import { startOfDay, endOfDay } from 'date-fns';

import { getPreviousWorkday } from './date';
import type { WorkItem, CalendarEvent } from '../types';

async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, token => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

export async function fetchGcalItems(): Promise<WorkItem[]> {
  try {
    const token = await getAuthToken();

    const now = new Date();
    const previousWorkday = getPreviousWorkday();
    const timeMin = startOfDay(previousWorkday).toISOString();
    const timeMax = endOfDay(now).toISOString();

    const { gcalExcludeKeywords = ['stand-up', 'standup', 'lunch', 'home'] } = await new Promise<{
      gcalExcludeKeywords?: string[];
    }>(resolve => {
      chrome.storage.local.get('gcalExcludeKeywords', result => resolve(result));
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        await new Promise<void>(resolve => {
          chrome.identity.removeCachedAuthToken({ token }, () => resolve());
        });
        return fetchGcalItems();
      }
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    const calendarEvents: CalendarEvent[] = data.items;

    return calendarEvents
      .filter((event: CalendarEvent) => {
        const attendees = event.attendees || [];
        const userAttendee = attendees.find(a => a.self);
        const isAttending = !userAttendee || userAttendee.responseStatus !== 'declined';
        const isExcluded = gcalExcludeKeywords.some(keyword =>
          event.summary.toLowerCase().includes(keyword.toLowerCase()),
        );
        return isAttending && !isExcluded;
      })
      .map((event: CalendarEvent) => ({
        type: 'Calendar' as const,
        title: event.summary,
        updatedAt: event.start.dateTime || event.start.date || '',
        isStale: new Date(event.start.dateTime || event.start.date || '') < getPreviousWorkday(),
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        eventStatus: event.status,
      }));
  } catch (error) {
    console.error('Error fetching calendar items:', error);
    return [];
  }
}
