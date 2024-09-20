import { CACHE_DURATION } from '../vars';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Merged':
    case 'Closed':
      return 'red';
    case 'In Progress':
      return 'blue';
    case 'In Review':
      return 'yellow';
    case 'Draft':
      return 'orange';
    default:
      return 'gray';
  }
};

export async function fetchWithCache<T>(url: string, fetchFunction: () => Promise<T>): Promise<T> {
  const cacheKey = `cache_${url}`;
  const cachedData = await chrome.storage.local.get(cacheKey);

  if (cachedData[cacheKey] && Date.now() - cachedData[cacheKey].timestamp < CACHE_DURATION) {
    return cachedData[cacheKey].data;
  } else {
    const freshData = await fetchFunction();
    await chrome.storage.local.set({
      [cacheKey]: { data: freshData, timestamp: Date.now() },
    });
    return freshData;
  }
}
