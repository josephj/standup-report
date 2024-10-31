import { Box, Button, Flex, HStack, Heading, IconButton, Tooltip, useDisclosure, useBoolean } from '@chakra-ui/react';
import { faSyncAlt, faStar, faMagicWandSparkles, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { ContentView } from './content-view';
import { PromptView } from './prompt-view';
import { ZeroState } from './zero-state';
import type { GroupedWorkItems } from '../lib';
import { askAssistant, defaultPrompt } from '../lib';

type Props = {
  groupedItems: GroupedWorkItems;
  onOpenSettings: () => void;
};

export const SummarySection: React.FC<Props> = ({ groupedItems, onOpenSettings }) => {
  const { isOpen: isPromptOpen, onOpen: onOpenPrompt, onClose: onClosePrompt } = useDisclosure();
  const [isEditing, setEditing] = useBoolean();
  const [isGeneratingReport, setGeneratingReport] = useBoolean();
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);
  const [aiGeneratedReport, setAiGeneratedReport] = useState<string>('');
  const [cachedReport, setCachedReport] = useState<string | null>(null);
  const [hasOpenAIToken, setHasOpenAIToken] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chrome.storage.sync.get(['customPrompt'], result => {
      if (result.customPrompt) {
        setCustomPrompt(result.customPrompt);
      }
    });

    chrome.storage.local.get(['cachedReport', 'openaiToken'], result => {
      if (result.cachedReport) {
        setCachedReport(result.cachedReport);
      }
      setHasOpenAIToken(Boolean(result.openaiToken));
    });
  }, []);

  const handleSavePrompt = async (newPrompt: string) => {
    setCustomPrompt(newPrompt);
    await chrome.storage.sync.set({ customPrompt: newPrompt });
    onClosePrompt();
    handleGenerateReport();
  };

  const handleSaveReport = useCallback(
    async (value: string) => {
      setAiGeneratedReport('');
      setCachedReport(value);
      setEditing.off();
      chrome.storage.local.set({ cachedReport: value });
    },
    [setEditing],
  );

  const handleGenerateReport = useCallback(async () => {
    setEditing.off();
    setGeneratingReport.on();
    setAiGeneratedReport('');

    const workItemsText = Object.entries(groupedItems)
      .map(([group, items]) => {
        const itemsText = items
          .map(item => `  - ${item.type}: ${item.title} (${item.status || 'No status'}) - Updated: ${item.updatedAt}`)
          .join('\n');
        return `${group.charAt(0).toUpperCase() + group.slice(1)}:\n${itemsText}`;
      })
      .join('\n\n');

    const { customPrompt } = await chrome.storage.sync.get(['customPrompt']);

    const systemPrompt = `Current date and time: ${new Date()}\n\n${customPrompt || defaultPrompt}`;
    const userPrompot = `Work items:\n\n${workItemsText}`;

    await askAssistant(systemPrompt, userPrompot, {
      onAbort: () => {
        console.log('Fetch aborted');
      },
      onError: error => {
        console.error('Error calling Chat Completion:', error);
        setAiGeneratedReport('Error: Failed to generate report. Please check your API key and try again.');
      },
      onUpdate: response => {
        setAiGeneratedReport(response);
      },
      onComplete: fullResponse => {
        chrome.storage.local.set({ cachedReport: fullResponse });
        setCachedReport(fullResponse);
      },
    });

    setGeneratingReport.off();
  }, [groupedItems, setEditing, setGeneratingReport]);

  const handleDownloadReport = useCallback(() => {
    const content = aiGeneratedReport || cachedReport || '';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const fileName = `standup-summary_${currentDate}.md`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [aiGeneratedReport, cachedReport]);

  return (
    <Box flex="1">
      <HStack mb={4}>
        <Heading size="md" color="gray.700" textShadow="1px 1px 0 rgba(255,255,255)">
          📊 Summary
        </Heading>
        {hasOpenAIToken ? (
          <>
            <Tooltip label="Force refresh" hasArrow fontSize="x-small" aria-label="Force refresh">
              <IconButton
                aria-label="Generate new report"
                icon={<FontAwesomeIcon icon={faSyncAlt} />}
                onClick={handleGenerateReport}
                isLoading={isGeneratingReport}
                variant="outline"
                colorScheme="blue"
                size="xs"
              />
            </Tooltip>
            <Tooltip label="Edit prompt" hasArrow fontSize="x-small" aria-label="Edit prompt">
              <IconButton
                aria-label="Edit Prompt"
                icon={<FontAwesomeIcon icon={faMagicWandSparkles} />}
                onClick={onOpenPrompt}
                variant="outline"
                colorScheme="purple"
                size="xs"
              />
            </Tooltip>
            <Tooltip label="Download report" hasArrow fontSize="x-small" aria-label="Download report">
              <IconButton
                aria-label="Download Report"
                icon={<FontAwesomeIcon icon={faDownload} />}
                onClick={handleDownloadReport}
                variant="outline"
                colorScheme="green"
                size="xs"
                isDisabled={!aiGeneratedReport && !cachedReport}
              />
            </Tooltip>
          </>
        ) : null}
      </HStack>
      <Box
        height="calc(100% - 40px)"
        overflowY="auto"
        border="1px solid"
        borderColor="purple.200"
        borderRadius="md"
        p={4}
        bg="white"
        boxShadow="md"
        position="relative"
        onClick={() => (!isEditing ? setEditing.on() : undefined)}
        cursor={!isEditing ? 'pointer' : 'default'}>
        {!hasOpenAIToken ? (
          <ZeroState onOpenSettings={onOpenSettings} />
        ) : aiGeneratedReport || cachedReport ? (
          <>
            <ContentView
              isEditing={isEditing}
              onSave={handleSaveReport}
              value={aiGeneratedReport || cachedReport || ''}
            />
            <Flex position="absolute" bottom={4} right={4} gap={2}>
              {isGeneratingReport && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (abortControllerRef.current) {
                      abortControllerRef.current.abort();
                      setGeneratingReport.off();
                    }
                  }}
                  colorScheme="red">
                  🛑 Stop
                </Button>
              )}
            </Flex>
          </>
        ) : (
          <Flex justifyContent="center" alignItems="flex-start" height="100%" py="32">
            <Button
              onClick={handleGenerateReport}
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

      {isPromptOpen ? (
        <PromptView
          isOpen={isPromptOpen}
          onClose={onClosePrompt}
          onSave={handleSavePrompt}
          initialPrompt={customPrompt || defaultPrompt}
        />
      ) : null}
    </Box>
  );
};
