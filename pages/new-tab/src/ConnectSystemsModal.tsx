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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faJira } from '@fortawesome/free-brands-svg-icons';
import { faRobot, faCog } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

interface ConnectSystemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (systems: string[]) => void;
  onSettingsSaved: () => void;
  connectedSystems: string[];
}

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
    icon: faGithub,
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
    icon: faJira,
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
    icon: faRobot,
  },
  {
    name: 'Google Calendar',
    connectFunction: async () => {
      return new Promise(resolve => {
        chrome.identity.getAuthToken(
          { interactive: true, scopes: ['https://www.googleapis.com/auth/calendar.readonly'] },
          function (token) {
            if (chrome.runtime.lastError) {
              console.error('Error getting auth token:', chrome.runtime.lastError);
              resolve(false);
            } else if (!token) {
              console.error('No token received');
              resolve(false);
            } else {
              console.log('Google Calendar auth token obtained successfully');
              chrome.storage.local.set({ googleCalendarToken: token }, () => {
                if (chrome.runtime.lastError) {
                  console.error('Error saving token to storage:', chrome.runtime.lastError);
                  resolve(false);
                } else {
                  console.log('Google Calendar token saved to storage');
                  resolve(true);
                }
              });
            }
          },
        );
      });
    },
    disconnectFunction: async () => {
      return new Promise(resolve => {
        chrome.identity.getAuthToken({ interactive: false }, function (token) {
          if (chrome.runtime.lastError || !token) {
            console.error('Error getting auth token:', chrome.runtime.lastError);
            resolve(false);
          } else {
            // First, remove the token from Chrome's cache
            chrome.identity.removeCachedAuthToken({ token }, async function () {
              try {
                // Then, revoke the token on Google's servers
                const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                });

                if (response.ok) {
                  // If revocation was successful, remove the token from storage
                  chrome.storage.local.remove('googleCalendarToken', () => {
                    console.log('Google Calendar token removed from storage');
                    resolve(true);
                  });
                } else {
                  console.error('Failed to revoke token');
                  resolve(false);
                }
              } catch (error) {
                console.error('Error revoking token:', error);
                resolve(false);
              }
            });
          }
        });
      });
    },
    tokenGuideUrl: 'https://developers.google.com/calendar/auth',
    icon: faGoogle,
    useOAuth: true,
    isConnected: false,
  },
];

export const ConnectSystemsModal: React.FC<ConnectSystemsModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  onSettingsSaved,
  connectedSystems,
}) => {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [tokenValidation, setTokenValidation] = useState<Record<string, boolean | null>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, string>>({});
  const [initialUrls, setInitialUrls] = useState<Record<string, string>>({});
  const toast = useToast();
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);

  useEffect(() => {
    systems.forEach(system => {
      if (system.useOAuth) {
        chrome.storage.local.get('googleCalendarToken', result => {
          if (result.googleCalendarToken) {
            system.isConnected = true;
            setTokenValidation(prev => ({ ...prev, [system.name]: true }));
            if (system.name === 'Google Calendar') {
              setGoogleCalendarConnected(true);
            }
          }
        });
      }
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
      if (system.useOAuth) {
        chrome.storage.local.get('googleCalendarToken', result => {
          if (result.googleCalendarToken) {
            newConnectedSystems.push(system.name);
          }
        });
      } else {
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
      }
    });

    onConnect(newConnectedSystems);
    onSettingsSaved();
    toast({
      title: 'Settings saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  const handleOAuthConnect = async (system: SystemConfig) => {
    console.log('Attempting to connect:', system.name);
    setIsValidating(prev => ({ ...prev, [system.name]: true }));
    try {
      const success = await system.connectFunction();
      console.log('Connection result:', success);
      setIsValidating(prev => ({ ...prev, [system.name]: false }));
      if (success) {
        system.isConnected = true;
        setTokenValidation(prev => ({ ...prev, [system.name]: true }));
        if (system.name === 'Google Calendar') {
          setGoogleCalendarConnected(true);
        }
      } else {
        console.error('Failed to connect:', system.name);
      }
    } catch (error) {
      console.error('Error during connection:', error);
      setIsValidating(prev => ({ ...prev, [system.name]: false }));
    }
  };

  const handleOAuthDisconnect = async (system: SystemConfig) => {
    setIsValidating(prev => ({ ...prev, [system.name]: true }));
    const success = await system.disconnectFunction!();
    setIsValidating(prev => ({ ...prev, [system.name]: false }));
    if (success) {
      system.isConnected = false;
      setTokenValidation(prev => ({ ...prev, [system.name]: null }));
      if (system.name === 'Google Calendar') {
        setGoogleCalendarConnected(false);
      }
    }
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
          <VStack spacing={6}>
            {systems.map(system => (
              <FormControl key={system.name}>
                <FormLabel>
                  <FontAwesomeIcon icon={system.icon} fixedWidth /> {system.name}
                </FormLabel>
                {system.useOAuth ? (
                  <Button
                    onClick={() =>
                      (system.name === 'Google Calendar' ? googleCalendarConnected : system.isConnected)
                        ? handleOAuthDisconnect(system)
                        : handleOAuthConnect(system)
                    }
                    size="sm"
                    colorScheme={
                      (system.name === 'Google Calendar' ? googleCalendarConnected : system.isConnected)
                        ? 'red'
                        : 'gray'
                    }
                    variant="outline"
                    isLoading={isValidating[system.name]}>
                    {(system.name === 'Google Calendar' ? googleCalendarConnected : system.isConnected)
                      ? 'Disconnect'
                      : 'Connect'}
                  </Button>
                ) : (
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
                )}
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
