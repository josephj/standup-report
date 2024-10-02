import React, { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Flex, Text, Button, IconButton, Tooltip, HStack, useDisclosure } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSyncAlt, faStar, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HtmlContent } from './html-content';
import { defaultPrompt } from './lib';
import { PromptView } from './prompt-view';
import { RichTextEditor } from './elements/rich-text-editor';

interface SummarySectionProps {
  hasOpenAIToken: boolean;
  aiGeneratedReport: string;
  isGeneratingReport: boolean;
  cachedReport: string | null;
  onOpen: () => void;
  onGenerateReport: () => void;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  setIsGeneratingReport: (value: boolean) => void;
  setCachedReport: (report: string) => void;
  setAiGeneratedReport: (report: string) => void;
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
  setCachedReport,
  setAiGeneratedReport,
}) => {
  const { isOpen, onOpen: modalOnOpen, onClose } = useDisclosure();
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState('');

  useEffect(() => {
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

  const handleEditStart = () => {
    setIsEditing(true);
    setEditedReport(aiGeneratedReport || cachedReport || '');
  };

  const handleEditEnd = useCallback(() => {
    setIsEditing(false);
    if (aiGeneratedReport) {
      setAiGeneratedReport(editedReport);
    } else {
      setCachedReport(editedReport);
    }

    // Save the edited report to chrome.storage.local
    chrome.storage.local.set({ cachedReport: editedReport }, () => {
      console.log('Report saved to cache');
    });
  }, [aiGeneratedReport, editedReport, setAiGeneratedReport, setCachedReport]);

  const handleChange = (value: string) => {
    setEditedReport(value);
  };

  const ckEditorContentStyles = {
    '.ck-content': {
      fontFamily: 'Lato, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#333',
      '& h1, & h2, & h3, & h4, & h5, & h6': {
        marginBottom: '0.5em',
      },
      '& p': { marginBottom: '1em' },
      '& ul, & ol': { paddingLeft: '2em', marginBottom: '1em' },
      '& ul ul, & ol ol, & ul ol, & ol ul': { paddingLeft: '2em', marginBottom: '0' },
      '& a': { color: '#0066cc', textDecoration: 'underline' },
      '& blockquote': {
        borderLeft: '4px solid #ccc',
        paddingLeft: '1em',
        marginLeft: '0',
        fontStyle: 'italic',
      },
      '& code': {
        fontFamily: 'monospace',
        backgroundColor: '#f0f0f0',
        padding: '0.2em 0.4em',
        borderRadius: '3px',
      },
    },
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
        position="relative"
        onClick={!isEditing ? handleEditStart : undefined}
        cursor={!isEditing ? 'text' : 'default'}>
        {!hasOpenAIToken ? (
          <Flex direction="column" justifyContent="center" alignItems="center" height="100%">
            <Text mb={4} textAlign="center">
              To generate a summary, please provide an OpenAI API key in the settings.
            </Text>
            <Button onClick={onOpen} colorScheme="purple" leftIcon={<FontAwesomeIcon icon={faCog} color="white" />}>
              Open Settings
            </Button>
          </Flex>
        ) : aiGeneratedReport || cachedReport ? (
          <>
            {isEditing ? (
              <Box sx={{ '.ck-editor__editable': { borderWidth: 0 } }}>
                <RichTextEditor
                  defaultValue={editedReport}
                  width="100%"
                  height="100%"
                  onChange={handleChange}
                  onBlur={handleEditEnd}
                  isToolbarVisible={false} // Hide toolbar for summary editing
                />
              </Box>
            ) : (
              <HtmlContent
                sx={{
                  ...ckEditorContentStyles,
                  p: { _last: { mb: 0 } },
                  pb: '60px',
                }}>
                <div className="ck-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiGeneratedReport || cachedReport}</ReactMarkdown>
                </div>
              </HtmlContent>
            )}
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
