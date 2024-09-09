import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Button,
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
    initialColorMode: 'light',
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
  const abortControllerRef = useRef<AbortController | null>(null);

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
              <Flex alignItems="center" flexGrow={1} mr={2} minWidth={0}>
                {' '}
                {/* 添加 minWidth={0} */}
                <Badge colorScheme={item.type === 'Jira' ? 'blue' : 'green'} mr={2} flexShrink={0}>
                  {item.type}
                </Badge>
                <Text fontWeight="medium" isTruncated maxWidth="calc(100% - 100px)">
                  {' '}
                  {/* 修改这里 */}
                  <Link href={item.url} isExternal color="blue.500">
                    {item.title} <ExternalLinkIcon mx="2px" />
                  </Link>
                  {item.type === 'GitHub' && item.isDraft && (
                    <Badge ml={2} colorScheme="orange" flexShrink={0}>
                      Draft
                    </Badge>
                  )}
                </Text>
                {item.type === 'Jira' && (
                  <Badge ml={2} colorScheme="purple" flexShrink={0}>
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
    if (!openaiToken) {
      console.error('OpenAI API key not found');
      setAiGeneratedReport('Error: OpenAI API key not found. Please set up your API key in the extension settings.');
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        const parsedLines = lines
          .map(line => line.replace(/^data: /, '').trim())
          .filter(line => line !== '' && line !== '[DONE]')
          .map(line => JSON.parse(line));

        for (const parsedLine of parsedLines) {
          const { choices } = parsedLine;
          const { delta } = choices[0];
          const { content } = delta;
          if (content) {
            setAiGeneratedReport(prev => prev + content);
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error calling OpenAI:', error);
        setAiGeneratedReport('Error: Failed to generate report. Please check your API key and try again.');
      }
    } finally {
      abortControllerRef.current = null;
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
      <Box minHeight="100vh" p={8} display="flex" justifyContent="center">
        <Box maxWidth="1400px" width="100%">
          <VStack spacing={8} align="stretch">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading>Stand-up Report</Heading>
              <Tooltip label="Manage Connections" aria-label="Manage Connections">
                <IconButton
                  aria-label="Manage Connections"
                  icon={<SettingsIcon />}
                  onClick={onOpen}
                  variant="outline"
                />
              </Tooltip>
            </Flex>

            {isLoading ? (
              <Center>
                <Spinner size="xl" />
              </Center>
            ) : (
              <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
                <Box flex="1">
                  <VStack spacing={8} align="stretch">
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
                  </VStack>
                </Box>
                <Box flex="1">
                  <Heading size="md" mb={2}>
                    Summary
                  </Heading>
                  <Textarea
                    value={aiGeneratedReport}
                    height="calc(100% - 40px)"
                    isReadOnly
                    placeholder="The summary will appear here once generated."
                  />
                  {isGeneratingReport && (
                    <Button
                      mt={2}
                      onClick={() => {
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort();
                          setIsGeneratingReport(false);
                        }
                      }}>
                      Stop Generating
                    </Button>
                  )}
                </Box>
              </Flex>
            )}
          </VStack>

          <ConnectSystemsModal
            isOpen={isOpen}
            onClose={onClose}
            onConnect={setConnectedSystems}
            connectedSystems={connectedSystems}
          />
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div>Error Occurred</div>);
