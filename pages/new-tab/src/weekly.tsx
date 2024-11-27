import { Box, Heading } from '@chakra-ui/react';
import { subDays } from 'date-fns';
import { useEffect, useState } from 'react';

import { fetchJiraItems, type WorkItem } from './lib';
import { WorkItems } from './work-items';

export const Weekly = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJiraItems = async () => {
      try {
        const today = new Date();
        const items = await fetchJiraItems({
          startDate: subDays(today, 7),
          endDate: today,
        });
        setWorkItems(items);
      } catch (error) {
        console.error('Error fetching Jira items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJiraItems();
  }, []);

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Last 7 Days Report
      </Heading>
      <WorkItems items={workItems} emptyMessage={isLoading ? 'Loading...' : 'No work items found'} />
    </Box>
  );
};
