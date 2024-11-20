import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Spinner,
  Stack,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';

import { validateToken } from './api';
import { schema } from './schema';
import type { FormValues } from './types';
import { useStorage } from '../lib/use-storage';

const TOKEN_GUIDE_URL = 'https://platform.openai.com/account/api-keys';

export const ModelSettings = () => {
  const [isValidating, setValidating] = useState(false);
  const [isValid, setValid] = useState<boolean | null>(null);
  const toast = useToast();

  const [openaiToken, setOpenaiToken] = useStorage<string>({
    key: 'openaiToken',
    defaultValue: '',
    area: 'local',
  });

  const { control, setValue, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: openaiToken,
    },
  });

  const token = useWatch({
    control,
    name: 'token',
  });

  const handleValidateToken = useCallback(
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
    [],
  );

  useEffect(() => {
    setValue('token', openaiToken);
  }, [setValue, openaiToken]);

  useEffect(() => {
    if (token) {
      handleValidateToken(token);
    }
  }, [token, handleValidateToken]);

  const handleSave = (data: FormValues) => {
    setOpenaiToken(data.token);

    toast({
      title: 'OpenAI settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} style={{ width: '100%' }}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>OpenAI</FormLabel>
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

        <Button type="submit" colorScheme="blue" size="sm">
          Save OpenAI Settings
        </Button>
      </Stack>
    </form>
  );
};
