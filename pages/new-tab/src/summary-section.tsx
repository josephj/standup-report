import React from 'react';
import { Box, Heading, Flex, Text, Button } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSyncAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HtmlContent } from './html-content';

interface SummarySectionProps {
  hasOpenAIToken: boolean;
  aiGeneratedReport: string;
  isGeneratingReport: boolean;
  isReportGenerated: boolean;
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
  isReportGenerated,
  cachedReport,
  onOpen,
  onGenerateReport,
  abortControllerRef,
  setIsGeneratingReport,
}) => {
  return (
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
              {isReportGenerated && (
                <Button
                  onClick={onGenerateReport}
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
        ) : cachedReport ? (
          <>
            <HtmlContent sx={{ p: { _last: { mb: 0 } }, pb: '60px' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cachedReport}</ReactMarkdown>
            </HtmlContent>
            <Flex position="absolute" bottom={4} right={4} gap={2}>
              <Button
                onClick={onGenerateReport}
                isLoading={isGeneratingReport}
                loadingText="Generating..."
                colorScheme="purple"
                size="sm"
                leftIcon={<FontAwesomeIcon icon={faStar} color="white" />}>
                Generate New Report
              </Button>
            </Flex>
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
    </Box>
  );
};
