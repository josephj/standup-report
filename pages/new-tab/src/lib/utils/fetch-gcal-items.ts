import type { WorkItem, CalendarEvent } from "../types";
import { getPreviousWorkday } from './date';

export async function fetchGcalItems(): Promise<WorkItem[]> {
    console.log('fetchGcalItems');
    const { googleCalendarToken } = await chrome.storage.local.get('googleCalendarToken');
    console.log('googleCalendarToken :', googleCalendarToken);
    if (!googleCalendarToken) {
        return [];
    }

    const now = new Date();
    const previousWorkday = getPreviousWorkday();
    const timeMin = previousWorkday.toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
            headers: {
                Authorization: `Bearer ${googleCalendarToken}`,
            },
        },
    );

    if (!response.ok) {
        if (response.status === 401) {
            await chrome.storage.local.remove('googleCalendarToken');
            throw new Error('Google Calendar token is invalid. Disconnected automatically.');
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
}