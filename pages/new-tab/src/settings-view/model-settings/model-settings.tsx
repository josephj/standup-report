import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Spinner,
  Stack,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';

import { validateToken, fetchOpenAIModels } from './api';
import { schema } from './schema';
import type { FormValues, ModelOption } from './types';
import { useStorage } from '../lib/use-storage';

const TOKEN_GUIDE_URL = 'https://platform.openai.com/account/api-keys';
const DEFAULT_MODEL = 'gpt-4o-mini-2024-07-18';

export const ModelSettings = () => {
  const [isValidating, setValidating] = useState(false);
  const [isValid, setValid] = useState<boolean | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const toast = useToast();

  const [openaiToken, setOpenaiToken] = useStorage<string>({
    key: 'openaiToken',
    defaultValue: '',
    area: 'local',
  });

  const [openaiModel, setOpenaiModel] = useStorage<string>({
    key: 'openaiModel',
    defaultValue: DEFAULT_MODEL,
    area: 'local',
  });

  const { control, setValue, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      useOpenAI: false,
      token: '',
      model: DEFAULT_MODEL,
    },
  });

  const useOpenAI = watch('useOpenAI');
  const token = watch('token');
  const selectedModel = watch('model');

  const handleValidateToken = useCallback(
    debounce(async (token: string) => {
      if (!token) {
        setValid(null);
        setModels([]);
        return;
      }

      setValidating(true);
      try {
        const isValid = await validateToken(token);
        setValid(isValid);
        if (isValid) {
          const modelOptions = await fetchOpenAIModels(token);
          setModels(modelOptions);
        } else {
          setModels([]);
        }
      } catch (error) {
        setValid(false);
        setModels([]);
      } finally {
        setValidating(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    setValue('token', openaiToken);
    setValue('useOpenAI', !!openaiToken);
  }, [openaiToken, setValue]);

  useEffect(() => {
    setValue('model', openaiModel);
  }, [openaiModel, setValue]);

  useEffect(() => {
    if (token) {
      handleValidateToken(token);
    }
  }, [token, handleValidateToken]);

  const currentModelOption = models.find(model => model.value === selectedModel) || {
    value: selectedModel,
    label: selectedModel,
  };

  const handleSave = (data: FormValues) => {
    if (data.useOpenAI) {
      setOpenaiToken(data.token);
      setOpenaiModel(data.model);
    } else {
      setOpenaiToken('');
      setOpenaiModel(DEFAULT_MODEL);
    }

    toast({
      title: 'Settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} style={{ width: '100%' }}>
      <Stack spacing={4}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="use-openai" mb="0" fontSize="sm">
            Use OpenAI
          </FormLabel>
          <HStack>
            <Controller
              name="useOpenAI"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  id="use-openai"
                  isChecked={value}
                  onChange={e => {
                    onChange(e.target.checked);
                    if (!e.target.checked) {
                      setValue('token', '');
                      setValue('model', DEFAULT_MODEL);
                    }
                  }}
                />
              )}
            />
            <FormHelperText fontSize="xs" mt="0">
              {useOpenAI ? 'You are using Open AI model' : 'You are using the built-in model'}
            </FormHelperText>
          </HStack>
        </FormControl>

        {useOpenAI && (
          <>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Token</FormLabel>
              <InputGroup>
                <Controller
                  name="token"
                  control={control}
                  render={({ field }) => <Input type="password" {...field} placeholder="sk-..." />}
                />
                <InputRightElement>
                  {isValidating && <Spinner size="sm" />}
                  {!isValidating && isValid === true && <CheckIcon color="green.500" />}
                  {!isValidating && isValid === false && <CloseIcon color="red.500" />}
                </InputRightElement>
              </InputGroup>
              <Text fontSize="sm" mt={1}>
                <Link href={TOKEN_GUIDE_URL} isExternal color="blue.500">
                  Get OpenAI token <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Model</FormLabel>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={models}
                    value={currentModelOption}
                    onChange={option => {
                      if (option) {
                        field.onChange(option.value);
                      }
                    }}
                    isDisabled={models.length === 0}
                    placeholder="Loading models..."
                  />
                )}
              />
            </FormControl>
          </>
        )}

        <Button type="submit" colorScheme="blue" size="sm">
          Save Settings
        </Button>
      </Stack>
    </form>
  );
};
