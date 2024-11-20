import { ExternalLinkIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Link,
  Text,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Spinner,
  Stack,
  Switch,
  HStack,
  StackDivider,
  Fade,
} from '@chakra-ui/react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faRobot, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import { useState, useCallback, useEffect } from 'react';

import { GCalSettings } from './gcal-settings';
import { GitHubSettings } from './github-settings';
import { JiraSettings } from './jira-settings';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

type JiraStatus = { value: string; label: string };

interface SystemConfig {
  name: string;
  connectFunction: (token?: string, url?: string) => Promise<boolean>;
  disconnectFunction?: () => Promise<boolean>;
  tokenGuideUrl: string;
  requiresUrl?: boolean;
  placeholder?: string;
  icon: IconDefinition;
  useOAuth?: boolean;
  isConnected?: boolean;
  jiraStatuses?: {
    inProgress: JiraStatus[];
    closed: JiraStatus[];
  };
  fetchRepos?: () => Promise<{ value: string; label: string }[]>;
}

const systems: SystemConfig[] = [
  {
    name: 'OpenAI',
    connectFunction: async (token: string) => {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.ok;
      } catch (error) {
        console.error('Error validating OpenAI token:', error);
        return false;
      }
    },
    tokenGuideUrl: 'https://platform.openai.com/account/api-keys',
    placeholder: 'sk-...',
    requiresUrl: false,
    icon: faRobot,
  },
];

export const SettingsView = ({ isOpen, onClose, onSave }: Props) => {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [tokenValidation, setTokenValidation] = useState<Record<string, boolean | null>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, string>>({});
  const [initialUrls, setInitialUrls] = useState<Record<string, string>>({});
  const toast = useToast();
  const [isOverrideNewTab, setOverrideNewTab] = useState(false);
  const [showTick, setShowTick] = useState(false);

  useEffect(() => {
    systems.forEach(system => {
      chrome.storage.local.get([`${system.name.toLowerCase()}Token`, `${system.name.toLowerCase()}Url`], result => {
        if (result[`${system.name.toLowerCase()}Token`]) {
          setTokens(prev => ({ ...prev, [system.name]: result[`${system.name.toLowerCase()}Token`] }));
          setInitialTokens(prev => ({ ...prev, [system.name]: result[`${system.name.toLowerCase()}Token`] }));
        }
        if (result[`${system.name.toLowerCase()}Url`]) {
          setUrls(prev => ({ ...prev, [system.name]: result[`${system.name.toLowerCase()}Url`] }));
          setInitialUrls(prev => ({ ...prev, [system.name]: result[`${system.name.toLowerCase()}Url`] }));
        }
      });
    });

    chrome.storage.sync.get('overrideNewTab', result => {
      setOverrideNewTab(result.overrideNewTab ?? false);
    });
  }, []);

  const validateToken = useCallback(
    debounce(async (system: SystemConfig, token: string, url?: string) => {
      if (!token || (system.requiresUrl && !url)) {
        setTokenValidation(prev => ({ ...prev, [system.name]: null }));
        setIsValidating(prev => ({ ...prev, [system.name]: false }));
        return;
      }

      setIsValidating(prev => ({ ...prev, [system.name]: true }));
      try {
        const isValid = await system.connectFunction(token, url);
        setTokenValidation(prev => ({ ...prev, [system.name]: isValid }));
      } catch (error) {
        setTokenValidation(prev => ({ ...prev, [system.name]: false }));
        console.error(`Error validating ${system.name} token:`, error);
      } finally {
        setIsValidating(prev => ({ ...prev, [system.name]: false }));
      }
    }, 500),
    [],
  );

  const handleTokenChange = (system: SystemConfig, token: string) => {
    setTokens(prev => ({ ...prev, [system.name]: token }));
    setTokenValidation(prev => ({ ...prev, [system.name]: null }));
    if (!system.requiresUrl || urls[system.name]) {
      validateToken(system, token, urls[system.name]);
    }
  };

  const handleUrlChange = (system: SystemConfig, url: string) => {
    const cleanUrl = url.replace(/^(https?:\/\/)/, '');
    setUrls(prev => ({ ...prev, [system.name]: cleanUrl }));
    setTokenValidation(prev => ({ ...prev, [system.name]: null }));
    if (tokens[system.name]) {
      validateToken(system, tokens[system.name], cleanUrl);
    }
  };

  const handleClose = () => {
    setTokens(initialTokens);
    setUrls(initialUrls);
    setTokenValidation({});
    setIsValidating({});
    onClose();
  };

  const handleSave = () => {
    const newConnectedSystems: string[] = [];
    systems.forEach(system => {
      const token = tokens[system.name];
      const url = urls[system.name];

      chrome.storage.local.set({
        [`${system.name.toLowerCase()}Token`]: token || '',
      });

      if (system.requiresUrl) {
        chrome.storage.local.set({
          [`${system.name.toLowerCase()}Url`]: url || '',
        });
      }

      setInitialTokens(prev => ({ ...prev, [system.name]: token || '' }));
      setInitialUrls(prev => ({ ...prev, [system.name]: url || '' }));

      if (token && (!system.requiresUrl || url)) {
        newConnectedSystems.push(system.name);
      }
    });
    onSave();

    toast({
      title: 'Settings saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  const handleChangeOverrideNewTab = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isOverride = e.target.checked;
    setOverrideNewTab(isOverride);
    chrome.storage.sync.set({ overrideNewTab: isOverride });
    chrome.runtime.sendMessage({ type: 'UPDATE_NEW_TAB_OVERRIDE', value: isOverride });
    setShowTick(true);
    setTimeout(() => setShowTick(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <FontAwesomeIcon icon={faCog} fixedWidth /> Settings
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} divider={<StackDivider borderStyle="dotted" borderColor="gray.500" />}>
            <FormControl display="flex" alignItems="center">
              <HStack spacing="4">
                <Switch id="custom-new-tab" isChecked={isOverrideNewTab} onChange={handleChangeOverrideNewTab} />
                <Stack spacing="1">
                  <FormLabel htmlFor="custom-new-tab" mb="0">
                    Display on new tab page
                  </FormLabel>
                </Stack>
                <Fade in={showTick} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.1 } }}>
                  <CheckIcon color="green.500" />
                </Fade>
              </HStack>
            </FormControl>

            <GitHubSettings />
            <JiraSettings />
            <GCalSettings />

            {systems.map(system => (
              <FormControl key={system.name}>
                <FormLabel>
                  <FontAwesomeIcon icon={system.icon} fixedWidth /> {system.name}
                </FormLabel>

                <Stack spacing={2}>
                  {system.requiresUrl && (
                    <InputGroup>
                      <InputLeftAddon>https://</InputLeftAddon>
                      <Input
                        value={urls[system.name] || ''}
                        onChange={e => handleUrlChange(system, e.target.value)}
                        placeholder={`your-domain.atlassian.net`}
                      />
                    </InputGroup>
                  )}
                  <InputGroup>
                    <Input
                      type="password"
                      value={tokens[system.name] || ''}
                      onChange={e => handleTokenChange(system, e.target.value)}
                      placeholder={system.placeholder || `Enter ${system.name} API Token`}
                      isDisabled={system.requiresUrl && !urls[system.name]}
                    />
                    <InputRightElement>
                      {isValidating[system.name] && <Spinner size="sm" />}
                      {!isValidating[system.name] && tokenValidation[system.name] === true && (
                        <CheckIcon color="green.500" />
                      )}
                      {!isValidating[system.name] && tokenValidation[system.name] === false && (
                        <CloseIcon color="red.500" />
                      )}
                    </InputRightElement>
                  </InputGroup>
                </Stack>
                <Text fontSize="sm" mt={1}>
                  <Link href={system.tokenGuideUrl} isExternal color="blue.500">
                    {system.useOAuth ? 'Learn more' : `Get ${system.name} token`} <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
              </FormControl>
            ))}
            <Button onClick={handleSave} colorScheme="blue">
              Save
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
