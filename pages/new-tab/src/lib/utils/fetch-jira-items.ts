import axios from 'axios';
import type { JiraIssue, WorkItem } from '../types';
import { getPreviousWorkday } from './date';
import { format } from 'date-fns';

type JiraStatus = { value: string; label: string };

const FIELDS = ['id', 'key', 'summary', 'status', 'updated', 'assignee'];
const DEFAULT_ONGOING_STATUSES = ['In Review', 'In Development'];
const DEFAULT_CLOSED_STATUSES = ['Done', 'Closed', 'Resolved'];

const normalizeIssue = (baseUrl: string, issue: JiraIssue): WorkItem => ({
  type: 'Jira' as const,
  assigneeAvatarUrl: issue.fields.assignee?.avatarUrls['24x24'],
  isStale: false,
  status: issue.fields.status.name,
  title: `${issue.key}: ${issue.fields.summary}`,
  updatedAt: issue.fields.updated,
  url: `${baseUrl}/browse/${issue.key}`,
});

const fetchIssues = async ({ statuses, updatedAfter }: { statuses: JiraStatus[]; updatedAfter?: Date }) => {
  const { jiraUrl, jiraToken } = await chrome.storage.local.get(['jiraUrl', 'jiraToken']);

  if (!jiraUrl || !jiraToken) {
    throw new Error('Jira URL or token are not available');
  }

  const baseUrl = jiraUrl.startsWith('http') ? jiraUrl : `https://${jiraUrl}`;
  const apiUrl = `${baseUrl}/rest/api/2/search`;
  const headers = {
    Authorization: `Bearer ${jiraToken}`,
    'Content-Type': 'application/json',
  };

  const statusString = statuses.length
    ? `status IN (${statuses.map(({ value }) => `"${value}"`).join(', ')})`
    : undefined;
  const updateAfterString = updatedAfter ? `updated >= "${format(updatedAfter, 'yyyy-MM-dd')}"` : undefined;
  const jql = `${['assignee = currentUser()', statusString, updateAfterString].filter(Boolean).join(' AND ')} ORDER BY updated DESC`;

  const response = await axios.get<{ issues: JiraIssue[] }>(apiUrl, {
    headers,
    params: { jql, fields: FIELDS.join(',') },
  });

  return response.data.issues;
};

export const fetchJiraItems = async (): Promise<WorkItem[]> => {
  const { jiraUrl, jiraInProgressStatuses, jiraClosedStatuses } = await chrome.storage.local.get([
    'jiraUrl',
    'jiraInProgressStatuses',
    'jiraClosedStatuses',
  ]);

  if (!jiraUrl) {
    throw new Error('jiraUrl not found in local storage');
  }

  const baseUrl = jiraUrl.startsWith('http') ? jiraUrl : `https://${jiraUrl}`;
  const previousWorkday = getPreviousWorkday();

  const ongoingStatuses = jiraInProgressStatuses || DEFAULT_ONGOING_STATUSES;
  const closedStatuses = jiraClosedStatuses || DEFAULT_CLOSED_STATUSES;

  try {
    const [ongoingResult, closedResult] = await Promise.allSettled([
      fetchIssues({ statuses: ongoingStatuses }),
      fetchIssues({ statuses: closedStatuses, updatedAfter: previousWorkday }),
    ]);

    const ongoingIssues = ongoingResult.status === 'fulfilled' ? ongoingResult.value : [];
    const closedIssues = closedResult.status === 'fulfilled' ? closedResult.value : [];

    if (ongoingResult.status === 'rejected') {
      throw new Error('Error fetching ongoing Jira tickets:', ongoingResult.reason);
    }
    if (closedResult.status === 'rejected') {
      throw new Error('Error fetching closed Jira tickets:', closedResult.reason);
    }

    return [...ongoingIssues, ...closedIssues].map(issue => ({
      ...normalizeIssue(baseUrl, issue),
      isStale: ongoingStatuses.includes(issue.fields.status.name) && new Date(issue.fields.updated) < previousWorkday,
    }));
  } catch (error) {
    console.error('Error in fetchJiraItems:', error);
    return [];
  }
};
