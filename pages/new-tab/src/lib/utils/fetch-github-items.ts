import type { WorkItem } from "../types";
import { Octokit } from "@octokit/rest";
import { getPreviousWorkday } from './date';

export const fetchGitHubItems = async (): Promise<WorkItem[]> => {
    console.log('fetchGitHubItems');
    const { githubToken } = await chrome.storage.local.get('githubToken');

    if (!githubToken) {
        console.log('GitHub token not found in local storage');
        return [];
    }

    const octokit = new Octokit({ auth: githubToken });
    const previousWorkday = getPreviousWorkday();

    try {
        const { data: user } = await octokit.users.getAuthenticated();
        const username = user.login;

        const openPRs = await octokit.search.issuesAndPullRequests({
            q: `is:open is:pr author:${username}`,
            sort: 'updated',
            order: 'desc',
            per_page: 100,
        });

        const participatedPRs = await octokit.search.issuesAndPullRequests({
            q: `is:pr -author:${username} commenter:${username}`,
            sort: 'updated',
            order: 'desc',
            per_page: 100,
        });

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const mergedPRs = await octokit.search.issuesAndPullRequests({
            q: `is:pr is:merged author:${username} merged:>=${twoDaysAgo.toISOString().split('T')[0]}`,
            sort: 'updated',
            order: 'desc',
            per_page: 100,
        });

        return [
            ...openPRs.data.items.map(item => ({
                type: 'GitHub' as const,
                title: item.title,
                url: item.html_url,
                updatedAt: item.updated_at,
                isStale: new Date(item.updated_at) < previousWorkday,
                isDraft: item.draft || false,
                status: item.draft ? 'Draft' : 'Open',
                isAuthor: true,
                authorAvatarUrl: item.user?.avatar_url,
            })),
            ...participatedPRs.data.items.map(item => ({
                type: 'GitHub' as const,
                title: item.title,
                url: item.html_url,
                updatedAt: item.updated_at,
                isStale: new Date(item.updated_at) < previousWorkday,
                isDraft: item.draft || false,
                status: 'Participated',
                isAuthor: false,
                authorAvatarUrl: item.user?.avatar_url,
            })),
            ...mergedPRs.data.items.map(item => ({
                type: 'GitHub' as const,
                title: item.title,
                url: item.html_url,
                updatedAt: item.updated_at,
                isStale: false,
                isDraft: false,
                status: 'Merged',
                isAuthor: true,
                authorAvatarUrl: item.user?.avatar_url,
            })),
        ];
    } catch (error) {
        console.error('Error fetching GitHub PRs:', error);
        return [];
    }
};