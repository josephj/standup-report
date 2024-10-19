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
  FormHelperText,
  HStack,
  StackDivider,
} from '@chakra-ui/react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGithub, faGoogle, faJira } from '@fortawesome/free-brands-svg-icons';
import { faRobot, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import { useState, useCallback, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

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
    placeholder: 'ghp_...',
    fetchRepos: async () => {
      const { githubToken } = await chrome.storage.local.get('githubToken');
      if (!githubToken) return [];

      try {
        const response = await fetch('https://api.github.com/user/repos?per_page=100', {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch repos');
        const repos = await response.json();
        return repos.map((repo: any) => ({ value: repo.full_name, label: repo.full_name }));
      } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
      }
    },
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
    jiraStatuses: {
      inProgress: [
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'In Review', label: 'In Review' },
        { value: 'In Development', label: 'In Development' },
        { value: 'Code Review', label: 'Code Review' },
        { value: 'Testing', label: 'Testing' },
      ],
      closed: [
        { value: 'Closed', label: 'Closed' },
        { value: 'Done', label: 'Done' },
        { value: 'Resolved', label: 'Resolved' },
      ],
    },
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
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [jiraInProgressStatuses, setJiraInProgressStatuses] = useState<JiraStatus[]>([]);
  const [jiraClosedStatuses, setJiraClosedStatuses] = useState<JiraStatus[]>([]);
  const [jiraStatuses, setJiraStatuses] = useState<JiraStatus[]>([]);
  const [gcalExcludeKeywords, setGcalExcludeKeywords] = useState<string[]>(['stand-up', 'standup', 'lunch', 'home']);
  const [overrideNewTab, setOverrideNewTab] = useState(false);
  const [githubUseSpecificRepos, setGithubUseSpecificRepos] = useState(false);
  const [githubRepos, setGithubRepos] = useState<{ value: string; label: string }[]>([]);
  const [selectedGithubRepos, setSelectedGithubRepos] = useState<{ value: string; label: string }[]>([]);

  const fetchJiraStatuses = useCallback(async (token: string, url: string) => {
    if (!token || !url) return;

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      const projectsResponse = await fetch(`${fullUrl}/rest/api/3/project/search?maxResults=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!projectsResponse.ok) {
        console.error('Failed to fetch Jira projects');
        return;
      }

      const projects = await projectsResponse.json();
      const activeProjectIds = projects.values
        .filter((project: any) => project.isPrivate !== true && project.archived !== true)
        .map((project: any) => project.id);

      // Fetch statuses for active projects
      const statusesResponse = await fetch(`${fullUrl}/rest/api/3/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!statusesResponse.ok) {
        console.error('Failed to fetch Jira statuses');
        return;
      }

      const allStatuses = await statusesResponse.json();

      const activeStatuses = allStatuses.filter(
        (status: any) => status.scope && status.scope.project && activeProjectIds.includes(status.scope.project.id),
      );

      const formattedStatuses = Array.from(new Set(activeStatuses.map((status: any) => status.name))).map(name => ({
        value: name,
        label: name,
      }));

      setJiraStatuses(formattedStatuses);

      // Save fetched statuses to storage
      chrome.storage.local.set({ jiraStatuses: formattedStatuses });
    } catch (error) {
      console.error('Error fetching Jira statuses:', error);
    }
  }, []);

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

    // 檢查 Google Calendar 的連接狀態
    chrome.identity.getAuthToken({ interactive: false }, function (token) {
      setGoogleCalendarConnected(!!token);
    });

    // Load Jira statuses from storage or fetch if not available
    chrome.storage.local.get(['jiraStatuses', 'jiraToken', 'jiraUrl'], result => {
      if (result.jiraStatuses) {
        setJiraStatuses(result.jiraStatuses);
      } else if (result.jiraToken && result.jiraUrl) {
        fetchJiraStatuses(result.jiraToken, result.jiraUrl);
      }
    });

    // Load Jira statuses from storage or set defaults
    chrome.storage.local.get(['jiraInProgressStatuses', 'jiraClosedStatuses'], result => {
      if (result.jiraInProgressStatuses) {
        setJiraInProgressStatuses(result.jiraInProgressStatuses);
      } else {
        const defaultInProgressStatuses =
          systems
            .find(s => s.name === 'Jira')
            ?.jiraStatuses?.inProgress.filter(
              status => status.value === 'In Review' || status.value === 'In Development',
            ) || [];
        setJiraInProgressStatuses(defaultInProgressStatuses);
      }
      if (result.jiraClosedStatuses) {
        setJiraClosedStatuses(result.jiraClosedStatuses);
      } else {
        const defaultClosedStatuses = systems.find(s => s.name === 'Jira')?.jiraStatuses?.closed || [];
        setJiraClosedStatuses(defaultClosedStatuses);
      }
    });

    // Load Google Calendar excluded keywords from storage
    chrome.storage.local.get('gcalExcludeKeywords', result => {
      if (result.gcalExcludeKeywords) {
        setGcalExcludeKeywords(result.gcalExcludeKeywords);
      }
    });

    // Load overrideNewTab setting
    chrome.storage.sync.get('overrideNewTab', result => {
      setOverrideNewTab(result.overrideNewTab ?? true);
    });

    // Load GitHub settings
    chrome.storage.local.get(['githubUseSpecificRepos', 'githubSelectedRepos'], result => {
      setGithubUseSpecificRepos(result.githubUseSpecificRepos || false);
      setSelectedGithubRepos(result.githubSelectedRepos || []);
    });
  }, [fetchJiraStatuses]);

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

    // Save Jira statuses
    chrome.storage.local.set({
      jiraInProgressStatuses,
      jiraClosedStatuses,
    });

    // Save Google Calendar excluded keywords
    chrome.storage.local.set({ gcalExcludeKeywords });

    // Save overrideNewTab setting
    chrome.storage.sync.set({ overrideNewTab });

    // Save GitHub specific settings
    chrome.storage.local.set({
      githubUseSpecificRepos,
      githubSelectedRepos: selectedGithubRepos,
    });

    // Send message to update new tab override
    chrome.runtime.sendMessage({ type: 'UPDATE_NEW_TAB_OVERRIDE', value: overrideNewTab });

    onSave();
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
        if (system.name === 'Google Calendar') {
          setGoogleCalendarConnected(true);
        }
        setTokenValidation(prev => ({ ...prev, [system.name]: true }));
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
      if (system.name === 'Google Calendar') {
        setGoogleCalendarConnected(false);
      }
      setTokenValidation(prev => ({ ...prev, [system.name]: null }));
    }
  };

  const fetchGithubRepos = async () => {
    const githubSystem = systems.find(s => s.name === 'GitHub');
    if (githubSystem && githubSystem.fetchRepos) {
      const repos = await githubSystem.fetchRepos();
      setGithubRepos(repos);
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
          <VStack spacing={6} divider={<StackDivider borderStyle="dotted" borderColor="gray.500" />}>
            <FormControl display="flex" alignItems="center">
              <HStack spacing="4">
                <Switch
                  id="custom-new-tab"
                  isChecked={overrideNewTab === true}
                  onChange={e => setOverrideNewTab(e.target.checked)}
                />
                <Stack spacing="1">
                  <FormLabel htmlFor="custom-new-tab" mb="0">
                    Override chrome://newtab/
                  </FormLabel>
                  <FormHelperText mt={0}>Show this page when new tab is opened</FormHelperText>
                </Stack>
              </HStack>
            </FormControl>

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

                {system.name === 'Jira' && (
                  <>
                    <FormLabel mt={4} fontSize="small">
                      Jira In Progress Statuses
                    </FormLabel>
                    <CreatableSelect
                      isMulti
                      options={jiraStatuses}
                      value={jiraInProgressStatuses}
                      onChange={selected => setJiraInProgressStatuses(selected as JiraStatus[])}
                      placeholder="Add or select statuses..."
                    />

                    <FormLabel mt={4} fontSize="small">
                      Jira Closed Statuses
                    </FormLabel>
                    <CreatableSelect
                      isMulti
                      options={jiraStatuses}
                      value={jiraClosedStatuses}
                      onChange={selected => setJiraClosedStatuses(selected as JiraStatus[])}
                      placeholder="Add or select statuses..."
                    />
                  </>
                )}

                {system.name === 'Google Calendar' && (
                  <>
                    <FormLabel mt={4} fontSize="small">
                      Excluded events
                    </FormLabel>
                    <CreatableSelect
                      isMulti
                      options={gcalExcludeKeywords.map(keyword => ({ value: keyword, label: keyword }))}
                      value={gcalExcludeKeywords.map(keyword => ({ value: keyword, label: keyword }))}
                      onChange={selected => setGcalExcludeKeywords(selected.map(item => item.value))}
                      placeholder="Add or select keywords to exclude..."
                    />
                    <Text fontSize="xs" mt={1} color="gray.500">
                      Events containing these keywords will be excluded from the report.
                    </Text>
                  </>
                )}

                {system.name === 'GitHub' && (
                  <>
                    <FormControl display="flex" alignItems="center" mt={4}>
                      <FormLabel htmlFor="github-specific-repos" mb="0" fontSize="small">
                        Select specific repos
                      </FormLabel>
                      <Switch
                        id="github-specific-repos"
                        isChecked={githubUseSpecificRepos}
                        onChange={e => {
                          setGithubUseSpecificRepos(e.target.checked);
                          if (e.target.checked && githubRepos.length === 0) {
                            fetchGithubRepos();
                          }
                        }}
                      />
                    </FormControl>
                    <FormControl mt={2}>
                      <Select
                        isMulti
                        isDisabled={!githubUseSpecificRepos}
                        options={githubRepos}
                        value={selectedGithubRepos}
                        onChange={selected => setSelectedGithubRepos(selected as { value: string; label: string }[])}
                        placeholder="Select repositories..."
                        onFocus={() => {
                          if (githubRepos.length === 0) {
                            fetchGithubRepos();
                          }
                        }}
                      />
                    </FormControl>
                  </>
                )}
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
