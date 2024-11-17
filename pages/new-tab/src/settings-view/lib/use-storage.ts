import { useCallback, useEffect, useMemo, useState } from 'react';

type StorageArea = 'sync' | 'local' | 'managed' | 'session';

type UseStorageConfig<T> = {
  key: string;
  defaultValue?: T;
  area?: StorageArea;
};

export function useStorage<T>(config: UseStorageConfig<T> & { defaultValue: T }): [T, (newValue: T) => Promise<void>];
export function useStorage<T>(config: UseStorageConfig<T>): [T | undefined, (newValue: T) => Promise<void>];

export function useStorage<T>(key: string, defaultValue: T, area?: StorageArea): [T, (newValue: T) => Promise<void>];
export function useStorage<T>(
  key: string,
  defaultValue?: T,
  area?: StorageArea,
): [T | undefined, (newValue: T) => Promise<void>];

export function useStorage<T>(
  keyOrConfig: string | UseStorageConfig<T>,
  defaultValue?: T,
  area: StorageArea = 'sync',
): [T | undefined, (newValue: T) => Promise<void>] {
  const configRef = useMemo(() => {
    const config =
      typeof keyOrConfig === 'string'
        ? { key: keyOrConfig, defaultValue, area }
        : { ...keyOrConfig, area: keyOrConfig.area ?? 'sync' };

    return {
      key: config.key,
      area: config.area,
      defaultValue: config.defaultValue,
    };
  }, [area, defaultValue, keyOrConfig]);

  const [value, setValue] = useState<T | undefined>(() => configRef.defaultValue);

  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: StorageArea) => {
      if (areaName === configRef.area && configRef.key in changes) {
        setValue(changes[configRef.key].newValue ?? configRef.defaultValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [configRef.key, configRef.area, configRef.defaultValue]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await chrome.storage[configRef.area].get(configRef.key);
      setValue(result[configRef.key] ?? configRef.defaultValue);
    };
    fetchData();
  }, [configRef.key, configRef.area, configRef.defaultValue]);

  const updateValue = useCallback(
    async (newValue: T) => {
      await chrome.storage[configRef.area].set({ [configRef.key]: newValue });
      setValue(newValue);
    },
    [configRef.key, configRef.area],
  );

  return [value, updateValue];
}
