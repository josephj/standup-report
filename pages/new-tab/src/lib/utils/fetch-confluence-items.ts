import type { WorkItem } from '../types';
import { isMonday } from './utils';

type ConfluenceContent = {
  id: string;
  type: string;
  title: string;
  space: {
    key: string;
    name: string;
  };
  history: {
    lastUpdated: {
      when: string;
    };
  };
  _links: {
    webui: string;
  };
};

export const fetchConfluenceItems = async (): Promise<WorkItem[]> => {
  const { jiraToken, jiraUrl } = await chrome.storage.local.get(['jiraToken', 'jiraUrl']);

  if (!jiraToken || !jiraUrl) {
    return [];
  }

  const fullUrl = jiraUrl.startsWith('http') ? jiraUrl : `https://${jiraUrl}`;

  // Calculate the correct start date in local timezone
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0); // Start of today in local time

  if (isMonday()) {
    // If today is Monday, get items from last Friday
    startDate.setDate(startDate.getDate() - 3);
  } else {
    // Otherwise, get items from yesterday
    startDate.setDate(startDate.getDate() - 1);
  }

  // Convert to UTC for the API query
  const utcDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
  const isoDate = utcDate.toISOString().split('T')[0];

  try {
    // Fetch updated content using the correct API endpoint
    const updatesResponse = await fetch(
      `${fullUrl}/wiki/rest/api/content/search?` +
        new URLSearchParams({
          cql: `lastmodified >= "${isoDate}" and contributor in (currentUser())`,
          expand: 'space,history',
          limit: '20',
          orderby: 'lastmodified desc',
        }),
      {
        headers: {
          Authorization: `Bearer ${jiraToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!updatesResponse.ok) throw new Error('Failed to fetch Confluence updates');
    const updatesData = await updatesResponse.json();

    // Convert to WorkItem format and adjust timestamps to local time
    const workItems: WorkItem[] = updatesData.results.map((content: ConfluenceContent) => ({
      id: content.id,
      title: content.title,
      type: 'Confluence',
      status: 'Updated',
      url: `${fullUrl}${content._links.webui}`,
      updatedAt: new Date(content.history.lastUpdated.when).toISOString(),
      source: 'confluence',
    }));

    return workItems;
  } catch (error) {
    console.error('Error fetching Confluence items:', error);
    return [];
  }
};
