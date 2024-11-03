import type { WorkItem, GroupedWorkItems } from '../types';
import { isMonday } from './utils';

export const groupWorkItems = (items: WorkItem[], ongoingStatuses: string[]): GroupedWorkItems => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);

  if (isMonday()) {
    yesterday.setDate(yesterday.getDate() - 3); // Go back to Friday
  } else {
    yesterday.setDate(yesterday.getDate() - 1);
  }

  return items.reduce(
    (acc, item) => {
      const itemDate = new Date(item.updatedAt);

      // Handle Confluence items
      if (item.source === 'confluence') {
        if (itemDate >= yesterday && itemDate < today) {
          acc.yesterday.push(item);
        }
        return acc;
      }

      // Handle other items as before
      if (ongoingStatuses.includes(item.status || '')) {
        acc.ongoing.push(item);
      } else if (itemDate >= yesterday && itemDate < today) {
        acc.yesterday.push(item);
      } else if (itemDate < yesterday) {
        acc.stale.push(item);
      }

      return acc;
    },
    { ongoing: [], yesterday: [], stale: [] } as GroupedWorkItems,
  );
};
