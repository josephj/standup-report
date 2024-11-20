import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  Switch,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Spinner,
  Stack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import AsyncSelect from 'react-select/async';

import { fetchRepos, validateToken } from './api';
import { schema } from './schema';
import type { Option, FormValues } from './types';
import { useStorage } from '../lib/use-storage';

const DEFAULT_SELECTED_REPOS: Option[] = [];

const TOKEN_GUIDE_URL = 'https://github.com/settings/tokens/new?scopes=repo,user&description=StandupReportExtension';

export const GitHubSettings = () => {
  const [isValidating, setValidating] = useState(false);
  const [isValid, setValid] = useState<boolean | null>(null);
  const toast = useToast();

  const [githubToken, setGithubToken] = useStorage<string>({
    key: 'githubToken',
    defaultValue: '',
    area: 'local',
  });

  const [githubUseSpecificRepos, setGithubUseSpecificRepos] = useStorage<boolean>({
    key: 'githubUseSpecificRepos',
    defaultValue: false,
    area: 'local',
  });

  const [githubSelectedRepos, setGithubSelectedRepos] = useStorage<Option[]>({
    key: 'githubSelectedRepos',
    defaultValue: DEFAULT_SELECTED_REPOS,
    area: 'local',
  });

  const { control, setValue, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: githubToken,
      useSpecificRepos: githubUseSpecificRepos,
      selectedRepos: githubSelectedRepos,
    },
  });

  const token = useWatch({
    control,
    name: 'token',
  });

  const useSpecificRepos = useWatch({
    control,
    name: 'useSpecificRepos',
  });

  const handleValidateToken = useCallback(
    () =>
      debounce(async (token: string) => {
        if (!token) {
          setValid(null);
          return;
        }

        setValidating(true);
        try {
          const isValid = await validateToken(token);
          setValid(isValid);
        } catch (error) {
          setValid(false);
        } finally {
          setValidating(false);
        }
      }, 500),
    [setValid, setValidating],
  );

  useEffect(() => {
    setValue('token', githubToken);
    setValue('useSpecificRepos', githubUseSpecificRepos);
    setValue('selectedRepos', githubSelectedRepos);
  }, [setValue, githubToken, githubUseSpecificRepos, githubSelectedRepos]);

  useEffect(() => {
    handleValidateToken();
  }, [handleValidateToken]);

  const handleLoadOptions = async (search: string) => {
    const repos = await fetchRepos(token, search);
    return repos.map(repo => ({ value: repo, label: repo }));
  };

  const handleSave = (data: FormValues) => {
    setGithubToken(data.token);
    setGithubUseSpecificRepos(data.useSpecificRepos);
    setGithubSelectedRepos(data.selectedRepos);

    toast({
      title: 'GitHub settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Token</FormLabel>
          <InputGroup>
            <Controller
              name="token"
              control={control}
              render={({ field }) => <Input type="password" {...field} placeholder="ghp_..." />}
            />
            <InputRightElement>
              {isValidating && <Spinner size="sm" />}
              {!isValidating && isValid === true && <CheckIcon color="green.500" />}
              {!isValidating && isValid === false && <CloseIcon color="red.500" />}
            </InputRightElement>
          </InputGroup>
          <Text fontSize="sm" mt={1}>
            <Link href={TOKEN_GUIDE_URL} isExternal color="blue.500">
              Get GitHub token <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
        </FormControl>

        <div>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="github-specific-repos" mb="0">
              Select specific repos
            </FormLabel>
            <Controller
              name="useSpecificRepos"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch
                  id="github-specific-repos"
                  isChecked={value}
                  onChange={e => {
                    onChange(e.target.checked);
                  }}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="selectedRepos" fontSize="xs" mt={1} color="gray.500">
              Only commits from selected repositories will be included in the report
            </FormLabel>
            <Controller
              name="selectedRepos"
              control={control}
              render={({ field: { onChange, value } }) => (
                <AsyncSelect
                  isMulti
                  isDisabled={!useSpecificRepos}
                  value={value}
                  onChange={selected => onChange(selected as Option[])}
                  placeholder="Select repositories..."
                  loadOptions={handleLoadOptions}
                  cacheOptions
                  defaultOptions
                />
              )}
            />
          </FormControl>
        </div>

        <Button type="submit" colorScheme="blue" size="sm">
          Save GitHub Settings
        </Button>
      </Stack>
    </form>
  );
};
