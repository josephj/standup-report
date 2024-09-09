import React, { useState, useCallback, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useDisclosure,
  useColorModeValue,
  Badge,
  List,
  ListItem,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { t } from '@extension/i18n';
import { ConnectSystemsModal } from './ConnectSystemsModal';
import axios from 'axios';
import { Octokit } from '@octokit/rest';

interface WorkItem {
  type: 'Jira' | 'GitHub';
  title: string;
  url: string;
  updatedAt: string;
  isStale: boolean;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    updated: string;
  };
}

// 暂时注释掉未使用的接口
// interface GitHubEvent {
//   id: string;
//   type: string;
//   // ... 其他属性 ...
// }

const NewTab: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const fetchWorkItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const jiraItems = await fetchJiraItems();
      const githubItems = await fetchGitHubItems();
      setWorkItems([...jiraItems, ...githubItems]);
    } catch (error) {
      console.error('Error fetching work items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const getPreviousWorkday = () => {
    const date = new Date();
    do {
      date.setDate(date.getDate() - 1);
    } while (date.getDay() === 0 || date.getDay() === 6);
    date.setHours(0, 0, 0, 0); // 设置为前一个工作日的开始
    return date;
  };

  const fetchJiraItems = async (): Promise<WorkItem[]> => {
    const { jiraUrl, jiraToken } = await chrome.storage.local.get(['jiraUrl', 'jiraToken']);

    if (!jiraUrl || !jiraToken) {
      console.log('Jira URL or token not found in local storage');
      return [];
    }

    const baseUrl = jiraUrl.startsWith('http') ? jiraUrl : `https://${jiraUrl}`;
    const apiUrl = `${baseUrl}/rest/api/2/search`;
    const previousWorkday = getPreviousWorkday();

    try {
      const response = await axios.get<{ issues: JiraIssue[] }>(apiUrl, {
        headers: {
          Authorization: `Bearer ${jiraToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          jql: `assignee = currentUser() AND status != Done ORDER BY updated DESC`,
          fields: 'id,key,summary,status,updated',
        },
      });

      return response.data.issues.map(issue => ({
        type: 'Jira',
        title: `${issue.key}: ${issue.fields.summary}`,
        url: `${baseUrl}/browse/${issue.key}`,
        updatedAt: issue.fields.updated,
        isStale: new Date(issue.fields.updated) < previousWorkday,
      }));
    } catch (error) {
      console.error('Error fetching Jira tickets:', error);
      return [];
    }
  };

  const fetchGitHubItems = async (): Promise<WorkItem[]> => {
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

      const response = await octokit.search.issuesAndPullRequests({
        q: `is:open is:pr author:${username}`,
        sort: 'updated',
        order: 'desc',
        per_page: 100,
      });

      return response.data.items.map(item => ({
        type: 'GitHub',
        title: `PR: ${item.title}`,
        url: item.html_url,
        updatedAt: item.updated_at,
        isStale: new Date(item.updated_at) < previousWorkday,
      }));
    } catch (error) {
      console.error('Error fetching GitHub PRs:', error);
      return [];
    }
  };

  const renderWorkItems = (items: WorkItem[], isStale: boolean) => (
    <List spacing={3}>
      {items
        .filter(item => item.isStale === isStale)
        .map((item, index) => (
          <ListItem key={index} p={3} borderWidth={1} borderRadius="md">
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center">
                <Badge colorScheme={item.type === 'Jira' ? 'blue' : 'green'} mr={2}>
                  {item.type}
                </Badge>
                <Text fontWeight="bold" isTruncated>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </Text>
              </Flex>
              <Text fontSize="sm" color="gray.500" ml={2} flexShrink={0}>
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </Flex>
          </ListItem>
        ))}
    </List>
  );

  return (
    <Box bg={bgColor} minHeight="100vh" p={8}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading color={textColor}>Work Summary</Heading>
          <Button onClick={onOpen}>Manage Connections</Button>
        </Flex>
        {isLoading ? (
          <Center>
            <Spinner size="xl" />
          </Center>
        ) : (
          <>
            <Box>
              <Heading size="md" mb={4} color={textColor}>
                Recent Updates
              </Heading>
              {renderWorkItems(workItems, false)}
            </Box>
            <Box>
              <Heading size="md" mb={4} color={textColor}>
                Stale Items
              </Heading>
              {renderWorkItems(workItems, true)}
            </Box>
          </>
        )}
      </VStack>
      <ConnectSystemsModal
        isOpen={isOpen}
        onClose={onClose}
        onConnect={() => {
          // 重新获取工作项
          fetchWorkItems();
        }}
        connectedSystems={[]} // 如果需要，可以从状态中获取已连接的系统
      />
    </Box>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div>Error Occurred</div>);
