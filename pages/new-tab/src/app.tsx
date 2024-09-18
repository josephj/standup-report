import { withErrorBoundary, withSuspense } from '@extension/shared';
import { Box, VStack, Heading, useDisclosure, Flex, useBoolean, IconButton, Tooltip, HStack } from '@chakra-ui/react';
import { t } from '@extension/i18n';
import { useState, useCallback, useEffect, useRef } from 'react';

import { WorkItemsSkeleton, ZeroState } from './elements';
import { SettingsView } from './settings-view';
import { SummarySection } from './summary-section';
import { WorkItems } from './work-items';
import { fetchJiraItems, isMonday, promptTemplate } from './lib';
import type { WorkItem } from './lib';
import { Header } from './header';
import { fetchWithCache, fetchGitHubItems, fetchGcalItems, callOpenAI } from './lib/utils';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AppContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setLoading] = useBoolean(true);
  const [aiGeneratedReport, setAiGeneratedReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [hasOpenAIToken, setHasOpenAIToken] = useState(false);
  const [hasValidTokens, setHasValidTokens] = useState(false);
  const [cachedReport, setCachedReport] = useState<string | null>(null);

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

  useEffect(() => {
    // Load cached report from chrome.storage.local when component mounts
    chrome.storage.local.get('cachedReport', result => {
      if (result.cachedReport) {
        setCachedReport(result.cachedReport);
      }
    });
  }, []);

  const fetchWorkItems = useCallback(async () => {
    setLoading.on();
    setWorkItems([]);
    try {
      const jiraItems = await fetchWithCache<WorkItem[]>('jira', fetchJiraItems);
      const githubItems = await fetchWithCache<WorkItem[]>('github', fetchGitHubItems);
      const gcalItems = await fetchWithCache<WorkItem[]>('gcal', fetchGcalItems);
      setWorkItems([...jiraItems, ...githubItems, ...gcalItems]);
    } catch (error) {
      console.error('Error fetching work items:', error);
    } finally {
      setLoading.off();
    }
  }, [setLoading]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    setAiGeneratedReport('');
    setIsReportGenerated(false);

    const workItemsText = workItems
      .map(item => `${item.type}: ${item.title} (${item.status || 'No status'}) - Updated: ${item.updatedAt}`)
      .join('\n');

    const fullPrompt = `${promptTemplate}\n\nWork items:\n${workItemsText}`;

    await callOpenAI(fullPrompt, {
      onAbort: () => {
        console.log('Fetch aborted');
      },
      onError: error => {
        console.error('Error calling OpenAI:', error);
        setAiGeneratedReport('Error: Failed to generate report. Please check your API key and try again.');
      },
      onUpdate: response => {
        setAiGeneratedReport(response);
      },
      onComplete: fullResponse => {
        setIsReportGenerated(true);
        chrome.storage.local.set({ cachedReport: fullResponse });
        setCachedReport(fullResponse);
      },
    });

    setIsGeneratingReport(false);
  }, [workItems]);

  const handleSaveSetting = useCallback(() => {
    fetchWorkItems();
    const checkOpenAIToken = async () => {
      const { openaiToken } = await chrome.storage.local.get('openaiToken');
      setHasOpenAIToken(Boolean(openaiToken));
    };
    checkOpenAIToken();
  }, [fetchWorkItems]);

  const handleForceRefresh = useCallback(async () => {
    setLoading.on();
    try {
      await chrome.storage.local.remove(['cache_jira', 'cache_github', 'cache_gcal']);
      await fetchWorkItems();
    } finally {
      setLoading.off();
    }
  }, [fetchWorkItems, setLoading]);

  return (
    <Flex minHeight="100vh" p={8} justifyContent="center">
      <Box maxWidth="1400px" width="100%">
        {hasValidTokens ? (
          <VStack spacing={8} align="stretch">
            <Header onOpenSettings={onOpen} />

            <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
              <Box flex="1">
                <HStack mb={4}>
                  <Heading size="md" color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                    🧳 Work Items
                  </Heading>
                  <Tooltip label="Force Refresh" hasArrow fontSize="x-small" aria-label="Force Refresh">
                    <IconButton
                      aria-label="Force Refresh"
                      size="xs"
                      icon={<FontAwesomeIcon icon={faSyncAlt} />}
                      onClick={handleForceRefresh}
                      variant="outline"
                      colorScheme="blue"
                      isLoading={isLoading}>
                      Refresh
                    </IconButton>
                  </Tooltip>
                </HStack>
                <VStack spacing={8} align="stretch">
                  <Box>
                    <Heading size="sm" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                      🔥 Ongoing
                    </Heading>
                    {isLoading ? <WorkItemsSkeleton /> : <WorkItems items={workItems} filter="ongoing" />}
                  </Box>
                  <Box>
                    <Heading size="sm" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                      {isMonday() ? '📅 Last Friday' : '⏰ Yesterday'}
                    </Heading>
                    {isLoading ? <WorkItemsSkeleton /> : <WorkItems items={workItems} filter="yesterday" />}
                  </Box>
                  <Box>
                    <Heading size="sm" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                      ⏳ Stale Items
                    </Heading>
                    {isLoading ? (
                      <WorkItemsSkeleton />
                    ) : (
                      <WorkItems items={workItems} filter="stale" emptyMessage="🎉 No stale items found" />
                    )}
                  </Box>
                </VStack>
              </Box>
              <SummarySection
                hasOpenAIToken={hasOpenAIToken}
                aiGeneratedReport={aiGeneratedReport}
                isGeneratingReport={isGeneratingReport}
                isReportGenerated={isReportGenerated}
                cachedReport={cachedReport}
                onOpen={onOpen}
                onGenerateReport={handleGenerateReport}
                abortControllerRef={abortControllerRef}
                setIsGeneratingReport={setIsGeneratingReport}
              />
            </Flex>
          </VStack>
        ) : (
          <ZeroState onOpenSettings={onOpen} />
        )}

        <SettingsView isOpen={isOpen} onClose={onClose} onSave={handleSaveSetting} />
      </Box>
    </Flex>
  );
};

export const App = withErrorBoundary(withSuspense(AppContent, <div>{t('loading')}</div>), <div>Error Occurred</div>);
