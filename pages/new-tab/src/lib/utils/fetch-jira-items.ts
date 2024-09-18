import axios from "axios";
import type { JiraIssue, WorkItem } from "../types";
import { getPreviousWorkday } from './date';

export const fetchJiraItems = async (): Promise<WorkItem[]> => {
    const { jiraUrl, jiraToken } = await chrome.storage.local.get(['jiraUrl', 'jiraToken']);

    if (!jiraUrl || !jiraToken) {
        console.log('Jira URL or token not found in local storage');
        return [];
    }

    const inProgressStatuses = ['In Progress', 'In Review'];
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const baseUrl = jiraUrl.startsWith('http') ? jiraUrl : `https://${jiraUrl}`;
    const apiUrl = `${baseUrl}/rest/api/2/search`;
    const previousWorkday = getPreviousWorkday();

    try {
        const openIssuesResponse = await axios.get<{ issues: JiraIssue[] }>(apiUrl, {
            headers: {
                Authorization: `Bearer ${jiraToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                jql: `assignee = currentUser() AND status IN (${inProgressStatuses.map(status => `"${status}"`).join(', ')}) ORDER BY updated DESC`,
                fields: 'id,key,summary,status,updated,assignee',
            },
        });

        const closedIssuesResponse = await axios.get<{ issues: JiraIssue[] }>(apiUrl, {
            headers: {
                Authorization: `Bearer ${jiraToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                jql: `assignee = currentUser() AND status = Closed AND updated >= "${twoDaysAgo.toISOString().split('T')[0]}" ORDER BY updated DESC`,
                fields: 'id,key,summary,status,updated,assignee',
            },
        });

        return [
            ...openIssuesResponse.data.issues.map(issue => ({
                type: 'Jira' as const,
                title: `${issue.key}: ${issue.fields.summary}`,
                url: `${baseUrl}/browse/${issue.key}`,
                updatedAt: issue.fields.updated,
                isStale: new Date(issue.fields.updated) < previousWorkday,
                status: issue.fields.status.name,
                assigneeAvatarUrl: issue.fields.assignee?.avatarUrls['24x24'],
            })),
            ...closedIssuesResponse.data.issues.map(issue => ({
                type: 'Jira' as const,
                title: `${issue.key}: ${issue.fields.summary}`,
                url: `${baseUrl}/browse/${issue.key}`,
                updatedAt: issue.fields.updated,
                isStale: false,
                status: 'Closed',
                assigneeAvatarUrl: issue.fields.assignee?.avatarUrls['24x24'],
            })),
        ];
    } catch (error) {
        console.error('Error fetching Jira tickets:', error);
        return [];
    }
};