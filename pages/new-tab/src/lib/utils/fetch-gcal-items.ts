import type { WorkItem, CalendarEvent } from '../types';
import { getPreviousWorkday } from './date';

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
    const timeMin = previousWorkday.toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

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
        // 令牌可能已過期，嘗試移除它並重新獲取
        await new Promise<void>(resolve => {
          chrome.identity.removeCachedAuthToken({ token }, () => resolve());
        });
        return fetchGcalItems(); // 遞歸調用以重試
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
        const ignoredTitles = ['Lunch', 'Home'];
        const isIgnoredTitle = ignoredTitles.some(title => event.summary.toLowerCase().includes(title.toLowerCase()));
        return isAttending && !isIgnoredTitle;
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
