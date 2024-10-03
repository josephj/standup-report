import type { WorkItem } from '../types';
import { getYesterdayOrLastFriday } from './date';

type GroupedWorkItems = {
  ongoing: WorkItem[];
  yesterday: WorkItem[];
  stale: WorkItem[];
};

export const groupWorkItems = (items: WorkItem[], ongoingStatuses: string[]): GroupedWorkItems => {
  const yesterdayOrLastFriday = getYesterdayOrLastFriday();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayOrLastFridayStart = new Date(yesterdayOrLastFriday);
  yesterdayOrLastFridayStart.setHours(0, 0, 0, 0);
  const yesterdayOrLastFridayEnd = new Date(yesterdayOrLastFriday);
  yesterdayOrLastFridayEnd.setHours(23, 59, 59, 999);

  return items.reduce<GroupedWorkItems>(
    (acc, item) => {
      const itemDate = new Date(item.type === 'Calendar' ? item.start! : item.updatedAt);
      const isToday = itemDate > yesterdayOrLastFridayEnd;
      const isYesterdayOrLastFriday = itemDate >= yesterdayOrLastFridayStart && itemDate < todayStart;

      if (isStaleItem(item)) {
        acc.stale.push(item);
      } else if (isOngoingItem(item, isToday, ongoingStatuses)) {
        acc.ongoing.push(item);
      } else if (isYesterdayItem(item, isYesterdayOrLastFriday, ongoingStatuses)) {
        acc.yesterday.push(item);
      }

      return acc;
    },
    { ongoing: [], yesterday: [], stale: [] },
  );
};

function isStaleItem(item: WorkItem): boolean {
  return item.isStale && !(item.type === 'GitHub' && item.status === 'Participated');
}

function isOngoingItem(item: WorkItem, isToday: boolean, ongoingStatuses: string[]): boolean {
  const status = item.status || '';
  switch (item.type) {
    case 'Calendar':
      return isToday;
    case 'GitHub':
      return (
        ['Open', 'Draft', 'Requested'].includes(status) || (['Merged', 'Participated'].includes(status) && isToday)
      );
    case 'Jira':
      return ongoingStatuses.includes(status);
    default:
      return isToday && status !== 'Merged';
  }
}

function isYesterdayItem(item: WorkItem, isYesterdayOrLastFriday: boolean, ongoingStatuses: string[]): boolean {
  const status = item.status || '';
  switch (item.type) {
    case 'GitHub':
      return (
        (['Merged', 'Participated'].includes(status) && isYesterdayOrLastFriday) || !['Open', 'Draft'].includes(status)
      );
    case 'Jira':
      return !item.isStale && !ongoingStatuses.includes(status) && isYesterdayOrLastFriday;
    default:
      return isYesterdayOrLastFriday;
  }
}
