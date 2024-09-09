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
  Button,
} from '@chakra-ui/react';
import { ExternalLinkIcon, SettingsIcon, TimeIcon, StarIcon, RepeatIcon } from '@chakra-ui/icons';
import { t } from '@extension/i18n';
import { ConnectSystemsModal } from './ConnectSystemsModal';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { formatDistanceToNow } from 'date-fns';
import promptTemplate from './prompt.md?raw';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HtmlContent } from './html-content';

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
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(45deg, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)',
      },
    },
  },
});

const NewTab: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedSystems, setConnectedSystems] = useState<string[]>([]);
  const [aiGeneratedReport, setAiGeneratedReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [hasOpenAIToken, setHasOpenAIToken] = useState(false);
  const [hasValidTokens, setHasValidTokens] = useState(false);

  useEffect(() => {
    const checkTokens = async () => {
      const { jiraToken, githubToken } = await chrome.storage.local.get(['jiraToken', 'githubToken']);
      setHasValidTokens(Boolean(jiraToken && githubToken));
    };
    checkTokens();
  }, []);

  useEffect(() => {
    const checkOpenAIToken = async () => {
      const { openaiToken } = await chrome.storage.local.get('openaiToken');
      setHasOpenAIToken(Boolean(openaiToken));
    };
    checkOpenAIToken();
  }, []);

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
          <ListItem key={index} p={3} borderWidth={1} borderRadius="md" bg="white" boxShadow="sm">
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" flexGrow={1} mr={2} minWidth={0}>
                <Badge colorScheme={item.type === 'Jira' ? 'blue' : 'green'} mr={2} flexShrink={0}>
                  {item.type === 'Jira' ? '🎟️' : '🐙'} {item.type}
                </Badge>
                <Text fontWeight="medium" isTruncated maxWidth="calc(100% - 100px)">
                  <Link href={item.url} isExternal color="blue.500">
                    {item.title} <ExternalLinkIcon mx="2px" />
                  </Link>
                  {item.type === 'GitHub' && item.isDraft && (
                    <Badge ml={2} colorScheme="orange" flexShrink={0}>
                      📝 Draft
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
                <TimeIcon mr={1} />
                {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
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
      if (!reader) {
        throw new Error('Failed to get reader from response');
      }

      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
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
      if (error instanceof Error && error.name === 'AbortError') {
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
    setIsReportGenerated(false);

    const workItemsText = workItems
      .map(item => `${item.type}: ${item.title} (${item.status || 'No status'}) - Updated: ${item.updatedAt}`)
      .join('\n');

    const fullPrompt = `${promptTemplate}\n\nWork items:\n${workItemsText}`;

    try {
      await callOpenAI(fullPrompt);
      setIsReportGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [workItems]);

  const renderSummarySection = () => (
    <Box flex="1">
      <Heading size="md" mb={4}>
        📊 Summary
      </Heading>
      <Box
        height="calc(100% - 40px)"
        overflowY="auto"
        border="1px solid"
        borderColor="purple.200"
        borderRadius="md"
        p={4}
        bg="white"
        boxShadow="md"
        position="relative">
        {!hasOpenAIToken ? (
          <Flex direction="column" justifyContent="center" alignItems="center" height="100%">
            <Text mb={4} textAlign="center">
              To generate a summary, please provide an OpenAI API key in the settings.
            </Text>
            <Button onClick={onOpen} colorScheme="purple" leftIcon={<SettingsIcon />}>
              Open Settings
            </Button>
          </Flex>
        ) : aiGeneratedReport ? (
          <>
            <HtmlContent sx={{ p: { _last: { mb: 0 } } }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiGeneratedReport}</ReactMarkdown>
            </HtmlContent>
            <Flex position="absolute" bottom={4} right={4} gap={2}>
              {isGeneratingReport && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (abortControllerRef.current) {
                      abortControllerRef.current.abort();
                      setIsGeneratingReport(false);
                    }
                  }}
                  colorScheme="red">
                  🛑 Stop
                </Button>
              )}
              {isReportGenerated && (
                <Button
                  onClick={generateStandupReport}
                  isLoading={isGeneratingReport}
                  loadingText="Regenerating..."
                  colorScheme="purple"
                  size="sm"
                  leftIcon={<RepeatIcon />}>
                  Regenerate Report
                </Button>
              )}
            </Flex>
          </>
        ) : (
          <Flex justifyContent="center" alignItems="flex-start" height="100%" py="32">
            <Button
              onClick={generateStandupReport}
              isLoading={isGeneratingReport}
              loadingText="Generating..."
              colorScheme="purple"
              variant="outline"
              size="sm"
              leftIcon={<StarIcon />}>
              Generate Report
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );

  const handleSettingsSaved = useCallback(() => {
    fetchWorkItems();
    const checkOpenAIToken = async () => {
      const { openaiToken } = await chrome.storage.local.get('openaiToken');
      setHasOpenAIToken(Boolean(openaiToken));
    };
    checkOpenAIToken();
  }, [fetchWorkItems]);

  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" p={8} display="flex" justifyContent="center">
        <Box maxWidth="1400px" width="100%">
          {hasValidTokens ? (
            <VStack spacing={8} align="stretch">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading>📋 Stand-up Report</Heading>
                <Tooltip label="Manage Connections" aria-label="Manage Connections">
                  <IconButton
                    aria-label="Manage Connections"
                    icon={<SettingsIcon />}
                    onClick={onOpen}
                    variant="outline"
                    colorScheme="purple"
                  />
                </Tooltip>
              </Flex>

              {isLoading ? (
                <Center>
                  <Spinner size="xl" color="purple.500" />
                </Center>
              ) : (
                <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
                  <Box flex="1">
                    <VStack spacing={8} align="stretch">
                      <Box>
                        <Heading size="md" mb={4}>
                          🔥 Recent Updates
                        </Heading>
                        {renderWorkItems(workItems, false)}
                      </Box>
                      <Box>
                        <Heading size="md" mb={4}>
                          ⏳ Stale Items
                        </Heading>
                        {renderWorkItems(workItems, true)}
                      </Box>
                    </VStack>
                  </Box>
                  {renderSummarySection()}
                </Flex>
              )}
            </VStack>
          ) : (
            <VStack spacing={8} align="center" justify="center" height="100vh">
              <Heading>Welcome to Stand-up Report</Heading>
              <Text fontSize="xl" textAlign="center">
                It seems you haven't connected Jira and GitHub yet.
                <br />
                Please provide tokens for these systems to get started.
              </Text>
              <Button onClick={onOpen} colorScheme="purple" size="lg" leftIcon={<SettingsIcon />}>
                Connect Systems
              </Button>
            </VStack>
          )}

          <ConnectSystemsModal
            isOpen={isOpen}
            onClose={onClose}
            onConnect={setConnectedSystems}
            connectedSystems={connectedSystems}
            onSettingsSaved={() => {
              handleSettingsSaved();
              setHasValidTokens(true);
            }}
          />
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div>Error Occurred</div>);
