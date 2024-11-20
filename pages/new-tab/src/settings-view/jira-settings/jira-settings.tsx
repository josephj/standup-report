import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Link,
  Spinner,
  Stack,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';

import { fetchJiraStatuses, validateToken } from './api';
import { schema } from './schema';
import type { FormValues, JiraStatus } from './types';
import { useStorage } from '../lib/use-storage';

const TOKEN_GUIDE_URL = 'https://id.atlassian.com/manage-profile/security/api-tokens';

const DEFAULT_IN_PROGRESS_STATUSES: JiraStatus[] = [
  { value: 'In Review', label: 'In Review' },
  { value: 'In Development', label: 'In Development' },
];

const DEFAULT_CLOSED_STATUSES: JiraStatus[] = [
  { value: 'Closed', label: 'Closed' },
  { value: 'Done', label: 'Done' },
  { value: 'Resolved', label: 'Resolved' },
];

export const JiraSettings = () => {
  const [isValidating, setValidating] = useState(false);
  const [isValid, setValid] = useState<boolean | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<JiraStatus[]>([]);
  const toast = useToast();

  const [jiraToken, setJiraToken] = useStorage<string>({
    key: 'jiraToken',
    defaultValue: '',
    area: 'local',
  });

  const [jiraUrl, setJiraUrl] = useStorage<string>({
    key: 'jiraUrl',
    defaultValue: '',
    area: 'local',
  });

  const [jiraInProgressStatuses, setJiraInProgressStatuses] = useStorage<JiraStatus[]>({
    key: 'jiraInProgressStatuses',
    defaultValue: DEFAULT_IN_PROGRESS_STATUSES,
    area: 'local',
  });

  const [jiraClosedStatuses, setJiraClosedStatuses] = useStorage<JiraStatus[]>({
    key: 'jiraClosedStatuses',
    defaultValue: DEFAULT_CLOSED_STATUSES,
    area: 'local',
  });

  const { control, setValue, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: jiraToken,
      url: jiraUrl,
      inProgressStatuses: jiraInProgressStatuses,
      closedStatuses: jiraClosedStatuses,
    },
  });

  const token = useWatch({ control, name: 'token' });
  const url = useWatch({ control, name: 'url' });

  const handleValidateToken = useCallback(
    debounce(async (token: string, url: string) => {
      if (!token || !url) {
        setValid(null);
        return;
      }

      setValidating(true);
      try {
        const isValid = await validateToken(token, url);
        setValid(isValid);
        if (isValid) {
          const statuses = await fetchJiraStatuses(token, url);
          setAvailableStatuses(statuses);
          chrome.storage.local.set({ jiraStatuses: statuses });
        }
      } catch (error) {
        setValid(false);
      } finally {
        setValidating(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    setValue('token', jiraToken);
    setValue('url', jiraUrl);
    setValue('inProgressStatuses', jiraInProgressStatuses);
    setValue('closedStatuses', jiraClosedStatuses);
  }, [setValue, jiraToken, jiraUrl, jiraInProgressStatuses, jiraClosedStatuses]);

  useEffect(() => {
    handleValidateToken(token, url);
  }, [handleValidateToken, token, url]);

  const handleSave = (data: FormValues) => {
    setJiraUrl(data.url);
    setJiraToken(data.token);
    setJiraInProgressStatuses(data.inProgressStatuses);
    setJiraClosedStatuses(data.closedStatuses);

    toast({
      title: 'Jira settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} style={{ width: '100%' }}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>URL</FormLabel>
          <InputGroup>
            <InputLeftAddon>https://</InputLeftAddon>
            <Controller
              name="url"
              control={control}
              render={({ field }) => <Input {...field} placeholder="your-domain.atlassian.net" />}
            />
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel>Token</FormLabel>
          <InputGroup>
            <Controller
              name="token"
              control={control}
              render={({ field }) => <Input type="password" {...field} placeholder="Enter Jira API Token" />}
            />
            <InputRightElement>
              {isValidating && <Spinner size="sm" />}
              {!isValidating && isValid === true && <CheckIcon color="green.500" />}
              {!isValidating && isValid === false && <CloseIcon color="red.500" />}
            </InputRightElement>
          </InputGroup>
          <Text fontSize="sm" mt={1}>
            <Link href={TOKEN_GUIDE_URL} isExternal color="blue.500">
              Get Jira token <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel>In Progress Statuses</FormLabel>
          <Controller
            name="inProgressStatuses"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CreatableSelect
                isMulti
                options={availableStatuses}
                value={value}
                onChange={selected => onChange(selected as JiraStatus[])}
                placeholder="Add or select statuses..."
              />
            )}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Closed Statuses</FormLabel>
          <Controller
            name="closedStatuses"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CreatableSelect
                isMulti
                options={availableStatuses}
                value={value}
                onChange={selected => onChange(selected as JiraStatus[])}
                placeholder="Add or select statuses..."
              />
            )}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" size="sm">
          Save Jira Settings
        </Button>
      </Stack>
    </form>
  );
};
