import {
  Box,
  VStack,
  Heading,
  useDisclosure,
  Flex,
  useBoolean,
  IconButton,
  Tooltip,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { t } from '@extension/i18n';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useCallback, useEffect, useMemo } from 'react';

import { WorkItemsSkeleton, ZeroState } from './elements';
import { Header } from './header';
import type { WorkItem } from './lib';
import { fetchJiraItems, isMonday } from './lib';
import { fetchWithCache, fetchGitHubItems, fetchGcalItems, groupWorkItems } from './lib/utils';
import { SettingsView } from './settings-view';
import { SummarySection } from './summary-section';
import { WorkItems } from './work-items';

import 'ckeditor5/ckeditor5.css';
import './app.css';

const AppContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setLoading] = useBoolean(true);

  const [hasValidTokens, setHasValidTokens] = useState(false);
  const toast = useToast();

  const [ongoingStatuses, setOngoingStatuses] = useState(['In Progress']);

  useEffect(() => {
    chrome.storage.local.get('jiraInProgressStatuses', result => {
      setOngoingStatuses(
        result.jiraInProgressStatuses?.map((status: { value: string }) => status.value) || ['In Progress'],
      );
    });
  }, []);

  const groupedItems = useMemo(() => groupWorkItems(workItems, ongoingStatuses), [workItems, ongoingStatuses]);

  const checkTokens = useCallback(async () => {
    const { jiraToken, githubToken, googleCalendarToken } = await chrome.storage.local.get([
      'jiraToken',
      'githubToken',
      'googleCalendarToken',
    ]);
    setHasValidTokens(Boolean(jiraToken || githubToken || googleCalendarToken));
  }, []);

  useEffect(() => {
    checkTokens();
  }, [checkTokens]);

  const fetchWorkItems = useCallback(async () => {
    const { jiraToken, githubToken, googleCalendarToken } = await chrome.storage.local.get([
      'jiraToken',
      'githubToken',
      'googleCalendarToken',
    ]);
    setLoading.on();
    setWorkItems([]);
    try {
      const jiraItems = jiraToken ? await fetchWithCache<WorkItem[]>('jira', fetchJiraItems) : [];
      const githubItems = githubToken ? await fetchWithCache<WorkItem[]>('github', fetchGitHubItems) : [];
      const gcalItems = googleCalendarToken ? await fetchWithCache<WorkItem[]>('gcal', fetchGcalItems) : [];
      setWorkItems([...jiraItems, ...githubItems, ...gcalItems]);
    } catch (error) {
      console.error('Error fetching work items:', error);
      toast({
        title: 'Error fetching work items',
        description: 'An error occurred while fetching your work items. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading.off();
    }
  }, [setLoading, toast]);

  useEffect(() => {
    if (hasValidTokens) {
      fetchWorkItems();
    }
  }, [fetchWorkItems, hasValidTokens]);

  const handleSaveSetting = useCallback(async () => {
    await checkTokens();

    await chrome.storage.local.remove(['cache_jira', 'cache_github', 'cache_gcal']);
    await fetchWorkItems();
  }, [checkTokens, fetchWorkItems]);

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
                    {isLoading ? <WorkItemsSkeleton /> : <WorkItems items={groupedItems['ongoing']} />}
                  </Box>
                  <Box>
                    <Heading size="sm" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                      {isMonday() ? '📅 Last Friday' : '⏰ Yesterday'}
                    </Heading>
                    {isLoading ? <WorkItemsSkeleton /> : <WorkItems items={groupedItems['yesterday']} />}
                  </Box>
                  <Box>
                    <Heading size="sm" mb={4} color="gray.700" textShadow="1px 1px 1px rgba(255,255,255)">
                      ⏳ Stale Items
                    </Heading>
                    {isLoading ? (
                      <WorkItemsSkeleton />
                    ) : (
                      <WorkItems items={groupedItems['stale']} emptyMessage="🎉 No stale items found" />
                    )}
                  </Box>
                </VStack>
              </Box>
              <SummarySection groupedItems={groupedItems} />
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
