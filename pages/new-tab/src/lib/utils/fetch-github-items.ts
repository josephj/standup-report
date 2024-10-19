import { Octokit } from '@octokit/rest';
import { format, formatISO } from 'date-fns';

import { getPreviousWorkday } from './date';
import type { WorkItem } from '../types';

export const fetchGitHubItems = async (): Promise<WorkItem[]> => {
  const { githubToken, githubUseSpecificRepos, githubSelectedRepos } = await chrome.storage.local.get([
    'githubToken',
    'githubUseSpecificRepos',
    'githubSelectedRepos',
  ]);

  if (!githubToken) {
    throw new Error('GitHub token not found in local storage');
  }

  const octokit = new Octokit({ auth: githubToken });
  const previousWorkday = getPreviousWorkday();

  const repoFilter =
    githubUseSpecificRepos && githubSelectedRepos.length > 0
      ? `repo:${githubSelectedRepos.map(repo => repo.value).join(' repo:')}`
      : '';

  try {
    const { data: user } = await octokit.users.getAuthenticated();
    const username = user.login;

    const openPRs = await octokit.search.issuesAndPullRequests({
      q: `is:open is:pr author:${username} ${repoFilter}`,
      sort: 'updated',
      order: 'desc',
      per_page: 20,
    });

    const mergedPRs = await octokit.search.issuesAndPullRequests({
      q: `is:pr is:merged author:${username} merged:>=${format(previousWorkday, 'yyyy-MM-dd')} ${repoFilter}`,
      sort: 'updated',
      order: 'desc',
      per_page: 20,
    });

    const userReviewRequestedPRs = await octokit.search.issuesAndPullRequests({
      q: `is:pr is:open user-review-requested:${username} updated:>=${format(previousWorkday, 'yyyy-MM-dd')} ${repoFilter}`,
      sort: 'updated',
      order: 'desc',
      per_page: 20,
    });

    const participatedPRs = await octokit.search.issuesAndPullRequests({
      q: `is:pr -author:${username} commenter:${username} updated:>=${format(previousWorkday, 'yyyy-MM-dd')} ${repoFilter}`,
      sort: 'updated',
      order: 'desc',
      per_page: 20,
    });

    const participatedPRsWithComments = await Promise.all(
      participatedPRs.data.items.map(async item => {
        const [owner, repo] = item.repository_url.split('/').slice(-2);
        const [issueComments, reviewComments] = await Promise.all([
          octokit.issues.listComments({
            owner,
            repo,
            issue_number: item.number,
          }),
          octokit.pulls.listReviewComments({
            owner,
            repo,
            pull_number: item.number,
          }),
        ]);

        const allComments = [...issueComments.data, ...reviewComments.data];
        const userComments = allComments.filter(
          comment => comment.user?.login === username && new Date(comment.created_at) >= previousWorkday,
        );
        const lastCommentDate =
          userComments.length > 0 ? new Date(userComments[userComments.length - 1].created_at) : null;

        return lastCommentDate
          ? {
              ...item,
              updated_at: lastCommentDate,
            }
          : null;
      }),
    );
    const filteredParticipatedPRs = participatedPRsWithComments.filter(Boolean);

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
      ...filteredParticipatedPRs.map(item => ({
        type: 'GitHub' as const,
        title: item?.title || '',
        url: item?.html_url || '',
        updatedAt: item?.updated_at ? formatISO(item?.updated_at) : undefined,
        isStale: item?.updated_at ? item?.updated_at < previousWorkday : false,
        isDraft: item?.draft || false,
        status: 'Participated',
        isAuthor: false,
        authorAvatarUrl: item?.user?.avatar_url,
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
      ...userReviewRequestedPRs.data.items.map(item => ({
        type: 'GitHub' as const,
        title: item?.title || '',
        url: item?.html_url || '',
        updatedAt: item?.updated_at || '',
        isStale: new Date(item?.updated_at || '') < previousWorkday,
        isDraft: item?.draft || false,
        status: 'Requested',
        isAuthor: false,
        authorAvatarUrl: item?.user?.avatar_url,
      })),
    ];
  } catch (error) {
    console.error('Error fetching GitHub PRs:', error);
    return [];
  }
};
