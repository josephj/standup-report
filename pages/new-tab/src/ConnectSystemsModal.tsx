import React, { useState, useCallback, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { debounce } from 'lodash';

interface ConnectSystemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (systems: string[]) => void;
  connectedSystems: string[];
}

interface SystemConfig {
  name: string;
  connectFunction: (token: string, url?: string) => Promise<boolean>;
  tokenGuideUrl: string;
  requiresUrl?: boolean;
  placeholder?: string;
}

const systems: SystemConfig[] = [
  {
    name: 'GitHub',
    connectFunction: async (token: string) => {
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        return response.ok;
      } catch (error) {
        console.error('Error validating GitHub token:', error);
        return false;
      }
    },
    tokenGuideUrl: 'https://github.com/settings/tokens/new?scopes=repo,user&description=StandupReportExtension',
  },
  {
    name: 'Jira',
    connectFunction: async (token: string, url?: string) => {
      if (!url) return false;
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      try {
        const response = await fetch(`${fullUrl}/rest/api/3/myself`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        return response.ok;
      } catch (error) {
        console.error('Error validating Jira token:', error);
        return false;
      }
    },
    tokenGuideUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    requiresUrl: true,
  },
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
  },
];

export const ConnectSystemsModal: React.FC<ConnectSystemsModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  connectedSystems,
}) => {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [tokenValidation, setTokenValidation] = useState<Record<string, boolean | null>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, string>>({});
  const [initialUrls, setInitialUrls] = useState<Record<string, string>>({});
  const toast = useToast();

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
      if (token && (!system.requiresUrl || url)) {
        console.log('system :', system);
        chrome.storage.local.set({
          [`${system.name.toLowerCase()}Token`]: token,
          ...(system.requiresUrl && { [`${system.name.toLowerCase()}Url`]: url }),
        });
        setInitialTokens(prev => ({ ...prev, [system.name]: token }));
        setInitialUrls(prev => ({ ...prev, [system.name]: url }));
        newConnectedSystems.push(system.name);
      }
    });
    onConnect(newConnectedSystems);
    toast({
      title: 'Settings saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {systems.map(system => (
              <FormControl key={system.name}>
                <FormLabel>{system.name}</FormLabel>
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
                    Get {system.name} token <ExternalLinkIcon mx="2px" />
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