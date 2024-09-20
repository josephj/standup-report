import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Text, Button, IconButton, Tooltip, HStack, useDisclosure } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSyncAlt, faStar, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HtmlContent } from './html-content';
import { defaultPrompt } from './lib';
import { PromptView } from './prompt-view';

interface SummarySectionProps {
  hasOpenAIToken: boolean;
  aiGeneratedReport: string;
  isGeneratingReport: boolean;
  cachedReport: string | null;
  onOpen: () => void;
  onGenerateReport: () => void;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  setIsGeneratingReport: (value: boolean) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  hasOpenAIToken,
  aiGeneratedReport,
  isGeneratingReport,
  cachedReport,
  onOpen,
  onGenerateReport,
  abortControllerRef,
  setIsGeneratingReport,
}) => {
  const { isOpen, onOpen: modalOnOpen, onClose } = useDisclosure();
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);

  useEffect(() => {
    // Load custom prompt from Chrome storage
    chrome.storage.sync.get(['customPrompt'], result => {
      if (result.customPrompt) {
        setCustomPrompt(result.customPrompt);
      }
    });
  }, []);

  const handleSavePrompt = async (newPrompt: string) => {
    setCustomPrompt(newPrompt);
    await chrome.storage.sync.set({ customPrompt: newPrompt });
    onClose();
    onGenerateReport();
  };

  return (
    <Box flex="1">
      <HStack mb={4}>
        <Heading size="md" color="gray.700" textShadow="1px 1px 0 rgba(255,255,255)">
          📊 Summary
        </Heading>
        {hasOpenAIToken && (
          <>
            <Tooltip label="Force refresh" hasArrow fontSize="x-small" aria-label="Force refresh">
              <IconButton
                aria-label="Generate new report"
                icon={<FontAwesomeIcon icon={faSyncAlt} />}
                onClick={onGenerateReport}
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
                onClick={modalOnOpen}
                variant="outline"
                colorScheme="purple"
                size="xs"
              />
            </Tooltip>
          </>
        )}
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
        position="relative">
        {!hasOpenAIToken ? (
          <Flex direction="column" justifyContent="center" alignItems="center" height="100%">
            <Text mb={4} textAlign="center">
              To generate a summary, please provide an OpenAI API key in the settings.
            </Text>
            <Button onClick={onOpen} colorScheme="purple" leftIcon={<FontAwesomeIcon icon={faCog} color="white" />}>
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
            </Flex>
          </>
        ) : cachedReport ? (
          <>
            <HtmlContent sx={{ p: { _last: { mb: 0 } } }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cachedReport}</ReactMarkdown>
            </HtmlContent>
          </>
        ) : (
          <Flex justifyContent="center" alignItems="flex-start" height="100%" py="32">
            <Button
              onClick={onGenerateReport}
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
      {isOpen ? (
        <PromptView
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleSavePrompt}
          initialPrompt={customPrompt || defaultPrompt}
        />
      ) : null}
    </Box>
  );
};
