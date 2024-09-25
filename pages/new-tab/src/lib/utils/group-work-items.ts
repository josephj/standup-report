import type { WorkItem } from '../types';
import { getYesterdayOrLastFriday } from './date';

type GroupedWorkItems = {
  ongoing: WorkItem[];
  yesterday: WorkItem[];
  stale: WorkItem[];
};

export const groupWorkItems = (items: WorkItem[]): GroupedWorkItems => {
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

      if (item.isStale && !(item.type === 'GitHub' && !item.isAuthor && item.status === 'Participated')) {
        acc.stale.push(item);
      } else if (
        (item.type === 'Calendar' && isToday) ||
        (item.type === 'GitHub' &&
          ((['Open', 'Draft'].includes(item.status || '') && isYesterdayOrLastFriday) ||
            (['Merged', 'Participated'].includes(item.status || '') && isToday))) ||
        (item.type === 'Jira' && ['Open', 'In Progress'].includes(item.status || '') && isYesterdayOrLastFriday) ||
        (isToday && item.status !== 'Merged')
      ) {
        acc.ongoing.push(item);
      } else if (
        (item.type === 'GitHub' &&
          ((['Merged', 'Participated'].includes(item.status || '') && isYesterdayOrLastFriday) ||
            !['Open', 'Draft'].includes(item.status || ''))) ||
        (item.type === 'Jira' && !item.isStale && item.status !== 'In Progress' && isYesterdayOrLastFriday) ||
        isYesterdayOrLastFriday
      ) {
        acc.yesterday.push(item);
      }

      return acc;
    },
    { ongoing: [], yesterday: [], stale: [] },
  );
};
