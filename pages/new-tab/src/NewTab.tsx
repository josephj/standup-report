import React, { useState, useCallback, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import {
  Box,
  VStack,
  Heading,
  Text,
  IconButton,
  useDisclosure,
  Badge,
  List,
  ListItem,
  Flex,
  Spinner,
  Center,
  Tooltip,
  ChakraProvider,
  extendTheme,
  Link,
  Textarea,
} from '@chakra-ui/react';
import { ExternalLinkIcon, SettingsIcon } from '@chakra-ui/icons';
import { t } from '@extension/i18n';
import { ConnectSystemsModal } from './ConnectSystemsModal';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { formatDistanceToNow } from 'date-fns';
import promptTemplate from './prompt.md?raw';

interface WorkItem {
  type: 'Jira' | 'GitHub';
  title: string;
  url: string;
  updatedAt: string;
  isStale: boolean;
  status?: string;
  isDraft?: boolean;
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

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

const NewTab: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedSystems, setConnectedSystems] = useState<string[]>([]);
  const [aiGeneratedReport, setAiGeneratedReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const fetchJiraItems = async (): Promise<WorkItem[]> => {
    const { jiraUrl, jiraToken } = await chrome.storage.local.get(['jiraUrl', 'jiraToken']);

    if (!jiraUrl || !jiraToken) {
      console.log('Jira URL or token not found in local storage');
      return [];
    }

    const inProgressStatuses = ['In Progress', 'In Review'];

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
          jql: `assignee = currentUser() AND status IN (${inProgressStatuses.map(status => `"${status}"`).join(', ')}) ORDER BY updated DESC`,
          fields: 'id,key,summary,status,updated',
        },
      });

      return response.data.issues.map(issue => ({
        type: 'Jira',
        title: `${issue.key}: ${issue.fields.summary}`,
        url: `${baseUrl}/browse/${issue.key}`,
        updatedAt: issue.fields.updated,
        isStale: new Date(issue.fields.updated) < previousWorkday,
        status: issue.fields.status.name,
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
        title: item.title,
        url: item.html_url,
        updatedAt: item.updated_at,
        isStale: new Date(item.updated_at) < previousWorkday,
        isDraft: item.draft || false,
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
              <Flex alignItems="center" flexGrow={1} mr={2}>
                <Badge colorScheme={item.type === 'Jira' ? 'blue' : 'green'} mr={2}>
                  {item.type}
                </Badge>
                <Text fontWeight="medium" isTruncated>
                  <Link href={item.url} isExternal color="blue.500">
                    {item.title} <ExternalLinkIcon mx="2px" />
                  </Link>
                  {item.type === 'GitHub' && item.isDraft && (
                    <Badge ml={2} colorScheme="orange">
                      Draft
                    </Badge>
                  )}
                </Text>
                {item.type === 'Jira' && (
                  <Badge ml={2} colorScheme="purple">
                    {item.status}
                  </Badge>
                )}
              </Flex>
              <Text fontSize="sm" color="gray.500" flexShrink={0}>
                Updated: {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
              </Text>
            </Flex>
          </ListItem>
        ))}
    </List>
  );

  const callOpenAI = async (prompt: string) => {
    const { openaiToken } = await chrome.storage.local.get('openaiToken');
    console.log('openaiApiKey :', openaiToken);
    if (!openaiToken) {
      console.error('OpenAI API key not found');
      setAiGeneratedReport('Error: OpenAI API key not found. Please set up your API key in the extension settings.');
      return;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const generatedText = response.data.choices[0].message.content;
      setAiGeneratedReport(generatedText);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      setAiGeneratedReport('Error: Failed to generate report. Please check your API key and try again.');
    }
  };

  const generateStandupReport = useCallback(async () => {
    setIsGeneratingReport(true);
    setAiGeneratedReport('');

    const workItemsText = workItems
      .map(item => `${item.type}: ${item.title} (${item.status || 'No status'}) - Updated: ${item.updatedAt}`)
      .join('\n');

    const fullPrompt = `${promptTemplate}\n\nWork items:\n${workItemsText}`;

    try {
      await callOpenAI(fullPrompt);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [workItems]);

  useEffect(() => {
    if (workItems.length > 0) {
      generateStandupReport();
    }
  }, [workItems, generateStandupReport]);

  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" p={8}>
        <VStack spacing={8} align="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading>Stand-up Report</Heading>
            <Tooltip label="Manage Connections" aria-label="Manage Connections">
              <IconButton aria-label="Manage Connections" icon={<SettingsIcon />} onClick={onOpen} variant="outline" />
            </Tooltip>
          </Flex>

          {isLoading ? (
            <Center>
              <Spinner size="xl" />
            </Center>
          ) : (
            <>
              <Box>
                <Heading size="md" mb={4}>
                  Recent Updates
                </Heading>
                {renderWorkItems(workItems, false)}
              </Box>
              <Box>
                <Heading size="md" mb={4}>
                  Stale Items
                </Heading>
                {renderWorkItems(workItems, true)}
              </Box>
              <Box>
                <Heading size="md" mb={2}>
                  Summary
                </Heading>
                {isGeneratingReport ? (
                  <Spinner size="xl" />
                ) : (
                  <Textarea value={aiGeneratedReport} height={400} isReadOnly />
                )}
              </Box>
            </>
          )}
        </VStack>

        <ConnectSystemsModal
          isOpen={isOpen}
          onClose={onClose}
          onConnect={setConnectedSystems}
          connectedSystems={connectedSystems}
        />
      </Box>
    </ChakraProvider>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div>Error Occurred</div>);
