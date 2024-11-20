import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FormControl, FormLabel, Text, Link, Stack, Button, useToast, Spinner, FormHelperText } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';

import { connectGoogleCalendar, disconnectGoogleCalendar } from './api';
import { schema } from './schema';
import type { FormValues } from './types';
import { useStorage } from '../lib/use-storage';

const DEFAULT_EXCLUDE_KEYWORDS: string[] = ['stand-up', 'standup', 'lunch', 'home'];

const TOKEN_GUIDE_URL = 'https://developers.google.com/calendar/auth';

export const GCalSettings = () => {
  const [isConnecting, setConnecting] = useState(false);
  const toast = useToast();

  const [gcalExcludeKeywords, setGcalExcludeKeywords] = useStorage<string[]>({
    key: 'gcalExcludeKeywords',
    defaultValue: DEFAULT_EXCLUDE_KEYWORDS,
    area: 'local',
  });

  const [isConnected, setConnected] = useStorage<boolean>({
    key: 'googleCalendarConnected',
    defaultValue: false,
    area: 'local',
  });

  const { control, setValue, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      excludeKeywords: gcalExcludeKeywords,
    },
  });

  useEffect(() => {
    chrome.identity.getAuthToken({ interactive: false }, function (token) {
      setConnected(!!token);
    });
    setValue('excludeKeywords', gcalExcludeKeywords);
  }, [setValue, gcalExcludeKeywords, setConnected]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const success = await connectGoogleCalendar();
      if (success) {
        setConnected(true);
        toast({
          title: 'Connected to Google Calendar',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    try {
      const success = await disconnectGoogleCalendar();
      if (success) {
        setConnected(false);
        toast({
          title: 'Disconnected from Google Calendar',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleSave = (data: FormValues) => {
    setGcalExcludeKeywords(data.excludeKeywords);
    toast({
      title: 'Google Calendar settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Google Authorization</FormLabel>
          <Button
            onClick={isConnected ? handleDisconnect : handleConnect}
            size="sm"
            colorScheme={isConnected ? 'red' : 'gray'}
            variant="outline"
            isLoading={isConnecting}>
            {isConnecting ? (
              <Spinner size="sm" />
            ) : isConnected ? (
              'Disconnect from Google Calendar'
            ) : (
              'Connect to Google Calendar'
            )}
          </Button>
          <Text fontSize="sm" mt={1}>
            <Link href={TOKEN_GUIDE_URL} isExternal color="blue.500">
              Learn more <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel>Excluded events</FormLabel>
          <Controller
            name="excludeKeywords"
            control={control}
            render={({ field: { onChange, value } }) => {
              const options = value.map(keyword => ({ value: keyword, label: keyword }));
              return (
                <CreatableSelect
                  isMulti
                  value={options}
                  onChange={selectedOptions => onChange(selectedOptions.map(item => item.value))}
                  options={options}
                  placeholder="Add or select keywords to exclude..."
                />
              );
            }}
          />
          <FormHelperText>Events containing these keywords will be excluded from the report.</FormHelperText>
        </FormControl>

        <Button type="submit" colorScheme="blue" size="sm">
          Save Calendar Settings
        </Button>
      </Stack>
    </form>
  );
};
