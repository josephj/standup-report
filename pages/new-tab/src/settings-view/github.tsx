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
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';

type Option = {
  value: string;
  label: string;
};

const githubSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  useSpecificRepos: z.boolean(),
  selectedRepos: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
});

type GitHubFormData = z.infer<typeof githubSchema>;

type Props = {
  initialToken?: string;
  onSave: (data: GitHubFormData) => void;
};

const TOKEN_GUIDE_URL = 'https://github.com/settings/tokens/new?scopes=repo,user&description=StandupReportExtension';

export const GitHubSettings = ({ initialToken = '', onSave }: Props) => {
  const [isValidating, setIsValidating] = useState(false);
  const [tokenValidation, setTokenValidation] = useState<boolean | null>(null);

  const { control, watch, setValue } = useForm<GitHubFormData>({
    resolver: zodResolver(githubSchema),
    defaultValues: {
      token: initialToken,
      useSpecificRepos: false,
      selectedRepos: [],
    },
  });

  const token = watch('token');
  const useSpecificRepos = watch('useSpecificRepos');

  const validateToken = debounce(async (token: string) => {
    if (!token) {
      setTokenValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      setTokenValidation(response.ok);
    } catch (error) {
      console.error('Error validating GitHub token:', error);
      setTokenValidation(false);
    } finally {
      setIsValidating(false);
    }
  }, 500);

  const fetchRepos = async () => {
    if (!token) return [];

    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch repos');
      const repos = await response.json();
      return repos.map((repo: { full_name: string }) => ({
        value: repo.full_name,
        label: repo.full_name,
      }));
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      return [];
    }
  };

  useEffect(() => {
    // Load saved settings
    chrome.storage.local.get(['githubToken', 'githubUseSpecificRepos', 'githubSelectedRepos'], result => {
      setValue('token', result.githubToken || '');
      setValue('useSpecificRepos', result.githubUseSpecificRepos || false);
      setValue('selectedRepos', result.githubSelectedRepos || []);
    });
  }, [setValue]);

  useEffect(() => {
    validateToken(token);
  }, [token, validateToken]);

  return (
    <Stack spacing={4}>
      <FormControl>
        <InputGroup>
          <Input
            type="password"
            value={token}
            onChange={e => setValue('token', e.target.value)}
            placeholder="ghp_..."
          />
          <InputRightElement>
            {isValidating && <Spinner size="sm" />}
            {!isValidating && tokenValidation === true && <CheckIcon color="green.500" />}
            {!isValidating && tokenValidation === false && <CloseIcon color="red.500" />}
          </InputRightElement>
        </InputGroup>
        <Text fontSize="sm" mt={1}>
          <Link href={TOKEN_GUIDE_URL} isExternal color="blue.500">
            Get GitHub token <ExternalLinkIcon mx="2px" />
          </Link>
        </Text>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="github-specific-repos" mb="0" fontSize="small">
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
              loadOptions={fetchRepos}
              cacheOptions
              defaultOptions
            />
          )}
        />
        <Text fontSize="xs" mt={1} color="gray.500">
          Only commits from selected repositories will be included in the report
        </Text>
      </FormControl>
    </Stack>
  );
};
