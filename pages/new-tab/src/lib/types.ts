export type WorkItem = {
  type: 'Jira' | 'GitHub' | 'Calendar';
  title: string;
  url?: string;
  updatedAt: string;
  isStale: boolean;
  status?: string;
  isDraft?: boolean;
  start?: string;
  end?: string;
  eventStatus?: 'confirmed' | 'tentative' | 'cancelled';
  isAuthor?: boolean;
  authorAvatarUrl?: string;
  assigneeAvatarUrl?: string;
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
