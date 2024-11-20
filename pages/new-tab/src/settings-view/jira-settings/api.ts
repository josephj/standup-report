import type { JiraStatus } from './types';

const getFullUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

export const validateToken = async (token: string, url: string) => {
  if (!token || !url) return false;

  const fullUrl = getFullUrl(url);
  try {
    const response = await fetch(`${fullUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating Jira token:', error);
    return false;
  }
};

export const fetchJiraStatuses = async (token: string, url: string): Promise<JiraStatus[]> => {
  if (!token || !url) return [];

  const fullUrl = getFullUrl(url);
  try {
    const projectsResponse = await fetch(`${fullUrl}/rest/api/3/project/search?maxResults=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!projectsResponse.ok) {
      throw new Error('Failed to fetch Jira projects');
    }

    const projects = await projectsResponse.json();
    const activeProjectIds = projects.values
      .filter(
        (project: { isPrivate?: boolean; archived?: boolean }) =>
          project.isPrivate !== true && project.archived !== true,
      )
      .map((project: { id: string }) => project.id);

    const statusesResponse = await fetch(`${fullUrl}/rest/api/3/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!statusesResponse.ok) {
      throw new Error('Failed to fetch Jira statuses');
    }

    const allStatuses = await statusesResponse.json();

    const activeStatuses = allStatuses.filter(
      (status: { scope?: { project?: { id: string } } }) =>
        status.scope?.project && activeProjectIds.includes(status.scope.project.id),
    );

    return Array.from(new Set(activeStatuses.map((status: { name: string }) => status.name))).map(name => ({
      value: name,
      label: name,
    }));
  } catch (error) {
    console.error('Error fetching Jira statuses:', error);
    return [];
  }
};
