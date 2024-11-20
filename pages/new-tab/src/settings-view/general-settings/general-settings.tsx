import { CheckIcon } from '@chakra-ui/icons';
import { FormControl, FormLabel, Switch, Stack, HStack, Fade } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { schema } from './schema';
import type { FormValues } from './types';
import { useStorage } from '../lib/use-storage';

export const GeneralSettings = () => {
  const [showTick, setShowTick] = useState(false);

  const [overrideNewTab, setOverrideNewTab] = useStorage<boolean>({
    key: 'overrideNewTab',
    defaultValue: false,
    area: 'sync',
  });

  const { control, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      overrideNewTab,
    },
  });

  useEffect(() => {
    setValue('overrideNewTab', overrideNewTab);
  }, [setValue, overrideNewTab]);

  const handleChangeOverrideNewTab = (checked: boolean) => {
    setOverrideNewTab(checked);
    chrome.runtime.sendMessage({ type: 'UPDATE_NEW_TAB_OVERRIDE', value: checked });
    setShowTick(true);
    setTimeout(() => setShowTick(false), 2000);
  };

  return (
    <FormControl display="flex" alignItems="center">
      <HStack spacing="4">
        <Controller
          name="overrideNewTab"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              id="custom-new-tab"
              isChecked={value}
              onChange={e => {
                onChange(e.target.checked);
                handleChangeOverrideNewTab(e.target.checked);
              }}
            />
          )}
        />
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
  );
};
