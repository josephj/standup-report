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
import { TimeIcon } from '@chakra-ui/icons';
import { t } from '@extension/i18n';
import { ConnectSystemsModal } from './ConnectSystemsModal';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { formatDistanceToNow } from 'date-fns';
import promptTemplate from './prompt.md?raw';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HtmlContent } from './html-content';
import OpenAI from 'openai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJira, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSyncAlt, faCog, faStar } from '@fortawesome/free-solid-svg-icons';

interface WorkItem {
  type: 'Jira' | 'GitHub';
  title: string;
  url: string;
  updatedAt: string;
  isStale: boolean;
  status: string;
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

const CACHE_DURATION = 60 * 60 * 1000; // 1小时单位秒

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

  const fetchWithCache = useCallback(async (url: string, fetchFunction: () => Promise<WorkItem[]>) => {
    const cacheKey = `cache_${url}`;
    const cachedData = await chrome.storage.local.get(cacheKey);

    if (cachedData[cacheKey] && Date.now() - cachedData[cacheKey].timestamp < CACHE_DURATION) {
      return cachedData[cacheKey].data;
    } else {
      const freshData = await fetchFunction();
      await chrome.storage.local.set({
        [cacheKey]: { data: freshData, timestamp: Date.now() },
      });
      return freshData;
    }
  }, []);

  const fetchWorkItems = useCallback(async () => {
    setIsLoading(true);
    setWorkItems([]);
    try {
      const jiraItems = await fetchWithCache('jira', fetchJiraItems);
      const githubItems = await fetchWithCache('github', fetchGitHubItems);
      setWorkItems([...jiraItems, ...githubItems]);
    } catch (error) {
      console.error('Error fetching work items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithCache]);

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
          fields: 'id,key,summary,status,updated',
        },
      });

      const closedIssuesResponse = await axios.get<{ issues: JiraIssue[] }>(apiUrl, {
        headers: {
          Authorization: `Bearer ${jiraToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          jql: `assignee = currentUser() AND status = Closed AND updated >= "${twoDaysAgo.toISOString().split('T')[0]}" ORDER BY updated DESC`,
          fields: 'id,key,summary,status,updated',
        },
      });

      return [
        ...openIssuesResponse.data.issues.map(issue => ({
          type: 'Jira',
          title: `${issue.key}: ${issue.fields.summary}`,
          url: `${baseUrl}/browse/${issue.key}`,
          updatedAt: issue.fields.updated,
          isStale: new Date(issue.fields.updated) < previousWorkday,
          status: issue.fields.status.name,
        })),
        ...closedIssuesResponse.data.issues.map(issue => ({
          type: 'Jira',
          title: `${issue.key}: ${issue.fields.summary}`,
          url: `${baseUrl}/browse/${issue.key}`,
          updatedAt: issue.fields.updated,
          isStale: false,
          status: 'Closed',
        })),
      ];
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

      const openPRs = await octokit.search.issuesAndPullRequests({
        q: `is:open is:pr author:${username}`,
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
          type: 'GitHub',
          title: item.title,
          url: item.html_url,
          updatedAt: item.updated_at,
          isStale: new Date(item.updated_at) < previousWorkday,
          isDraft: item.draft || false,
          status: item.draft ? 'Draft' : '',
        })),
        ...mergedPRs.data.items.map(item => ({
          type: 'GitHub',
          title: item.title,
          url: item.html_url,
          updatedAt: item.updated_at,
          isStale: false,
          isDraft: false,
          status: 'Merged',
        })),
      ];
    } catch (error) {
      console.error('Error fetching GitHub PRs:', error);
      return [];
    }
  };

  const renderWorkItems = (items: WorkItem[], showStale: boolean) => (
    <List spacing={3}>
      {items
        .filter(item => (showStale ? item.isStale : !item.isStale))
        .map((item, index) => (
          <ListItem key={index} p={3} borderWidth={1} borderRadius="md" bg="white" boxShadow="sm">
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" flexGrow={1} mr={2} minWidth={0}>
                <Box mr={2} flexShrink={0}>
                  <FontAwesomeIcon
                    icon={item.type === 'Jira' ? faJira : faGithub}
                    color={item.type === 'Jira' ? '#0052CC' : '#24292e'}
                  />
                </Box>
                <Link
                  fontWeight="medium"
                  href={item.url}
                  isExternal
                  color="blue.500"
                  display="inline-block"
                  width="400px"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis">
                  {item.title}
                </Link>
              </Flex>
              <Flex alignItems="center" flexShrink={0}>
                {item.status && (
                  <Badge fontSize="11px" colorScheme={getStatusColor(item.status)} mr={2}>
                    {item.status}
                  </Badge>
                )}
                <Text color="gray.500" fontSize="x-small">
                  <TimeIcon mr={1} />
                  {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </Text>
              </Flex>
            </Flex>
          </ListItem>
        ))}
    </List>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Merged':
      case 'Closed':
        return 'red';
      case 'In Progress':
        return 'blue';
      case 'In Review':
        return 'yellow';
      case 'Draft':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const callOpenAI = async (prompt: string) => {
    const { openaiToken } = await chrome.storage.local.get('openaiToken');
    if (!openaiToken) {
      console.error('OpenAI API key not found');
      setAiGeneratedReport('Error: OpenAI API key not found. Please set up your API key in the extension settings.');
      return;
    }

    const openai = new OpenAI({
      apiKey: openaiToken,
      dangerouslyAllowBrowser: true,
    });

    abortControllerRef.current = new AbortController();

    try {
      const stream = await openai.chat.completions.create(
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          stream: true,
        },
        { signal: abortControllerRef.current.signal },
      );

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        setAiGeneratedReport(prev => prev + content);
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
      <Heading size="md" mb={4} color="gray.700" textShadow="1px 1px 0 rgba(255,255,255)">
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
            <Button onClick={onOpen} colorScheme="purple" leftIcon={<FontAwesomeIcon icon={faCog} color="#6B46C1" />}>
              Open Settings
            </Button>
          </Flex>
        ) : aiGeneratedReport ? (
          <>
            <HtmlContent sx={{ p: { _last: { mb: 0 } }, pb: '60px' }}>
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
                  leftIcon={<FontAwesomeIcon icon={faSyncAlt} color="#6B46C1" />}>
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
              leftIcon={<FontAwesomeIcon icon={faStar} color="#6B46C1" />}>
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

  const handleForceRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await chrome.storage.local.remove(['cache_jira', 'cache_github']);
      await fetchWorkItems();
    } finally {
      setIsLoading(false);
    }
  }, [fetchWorkItems]);

  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" p={8} display="flex" justifyContent="center">
        <Box maxWidth="1400px" width="100%">
          {hasValidTokens ? (
            <VStack spacing={8} align="stretch">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading color="gray.700" textShadow="1px 1px 1px rgb(255,255,255)">
                  📋 Stand-up Report
                </Heading>
                <Flex>
                  <Tooltip label="Force Refresh" aria-label="Force Refresh">
                    <IconButton
                      aria-label="Force Refresh"
                      icon={<FontAwesomeIcon icon={faSyncAlt} color="#2B6CB0" />}
                      onClick={handleForceRefresh}
                      variant="outline"
                      colorScheme="blue"
                      mr={2}
                      isLoading={isLoading}
                    />
                  </Tooltip>
                  <Tooltip label="Manage Connections" aria-label="Manage Connections">
                    <IconButton
                      aria-label="Manage Connections"
                      icon={<FontAwesomeIcon icon={faCog} color="#6B46C1" />}
                      onClick={onOpen}
                      variant="outline"
                      colorScheme="purple"
                    />
                  </Tooltip>
                </Flex>
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
                        <Heading size="md" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                          🔥 Recent Updates
                        </Heading>
                        {renderWorkItems(workItems, false)}
                      </Box>
                      <Box>
                        <Heading size="md" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
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
                It seems you haven{`'`}t connected Jira and GitHub yet.
                <br />
                Please provide tokens for these systems to get started.
              </Text>
              <Button
                onClick={onOpen}
                colorScheme="purple"
                size="lg"
                leftIcon={<FontAwesomeIcon icon={faCog} color="#6B46C1" />}>
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
