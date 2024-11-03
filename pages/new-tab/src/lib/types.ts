export type WorkItem = {
  id: string;
  title: string;
  type: string;
  status?: string;
  url: string;
  updatedAt: string;
  source?: 'jira' | 'github' | 'gcal' | 'confluence';
};

export type GroupedWorkItems = {
  ongoing: WorkItem[];
  yesterday: WorkItem[];
  stale: WorkItem[];
};

export type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    updated: string;
    assignee?: {
      avatarUrls: {
        '24x24': string;
      };
    };
  };
};

export type CalendarEvent = {
  summary: string;
  start: { dateTime: string; date?: string };
  end: { dateTime: string; date?: string };
  status: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: Array<{ self?: boolean; responseStatus?: string }>;
};
