import React from 'react';
import { List, ListItem, Flex, Box, Text, Link, Badge } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJira, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { TimeIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';

import type { WorkItem } from './lib';

type WorkItemsProps = {
  items: WorkItem[];
  filter: 'ongoing' | 'yesterday' | 'stale';
  getYesterdayOrLastFriday: () => Date;
  getPreviousWorkday: () => Date;
  getStatusColor: (status: string) => string;
};

const filterWorkItems = (
  item: WorkItem,
  filter: 'ongoing' | 'yesterday' | 'stale',
  getYesterdayOrLastFriday: () => Date,
  getPreviousWorkday: () => Date,
) => {
  const itemDate = new Date(item.type === 'Calendar' ? item.start! : item.updatedAt);
  const yesterdayOrLastFriday = getYesterdayOrLastFriday();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'ongoing':
      if (item.type === 'Calendar') {
        return itemDate >= today;
      }
      return !item.isStale && itemDate > yesterdayOrLastFriday && item.status !== 'Merged';
    case 'yesterday':
      if (item.type === 'Calendar') {
        return itemDate >= yesterdayOrLastFriday && itemDate < today;
      }
      if (item.type === 'GitHub' && item.status === 'Merged') {
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        return itemDate >= twoDaysAgo && itemDate < today;
      }
      return !item.isStale && itemDate <= yesterdayOrLastFriday && itemDate >= getPreviousWorkday();
    case 'stale':
      if (item.type === 'GitHub' && !item.isAuthor && item.status === 'Participated') {
        return false;
      }
      return item.isStale;
  }
};

export const WorkItems: React.FC<WorkItemsProps> = ({
  items,
  filter,
  getYesterdayOrLastFriday,
  getPreviousWorkday,
  getStatusColor,
}) => {
  return (
    <List spacing={3}>
      {items
        .filter(item => filterWorkItems(item, filter, getYesterdayOrLastFriday, getPreviousWorkday))
        .map((item, index) => (
          <ListItem
            key={index}
            p={3}
            borderWidth={1}
            borderRadius="md"
            bg="white"
            boxShadow="sm"
            opacity={
              (item.type === 'Calendar' && new Date(item.end!) < new Date()) ||
              (item.type === 'GitHub' && item.status === 'Merged')
                ? 0.5
                : 1
            }
            transition="opacity 0.3s">
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" flexGrow={1} mr={2} minWidth={0}>
                <Box mr={2} flexShrink={0}>
                  <FontAwesomeIcon
                    icon={item.type === 'Jira' ? faJira : item.type === 'GitHub' ? faGithub : faCalendar}
                    color={item.type === 'Jira' ? '#0052CC' : item.type === 'GitHub' ? '#24292e' : '#4285F4'}
                  />
                </Box>
                {item.type === 'GitHub' && item.authorAvatarUrl && (
                  <Box mr={2} flexShrink={0}>
                    <img
                      src={item.authorAvatarUrl}
                      alt="Author avatar"
                      width="24"
                      height="24"
                      style={{ borderRadius: '50%' }}
                    />
                  </Box>
                )}
                {item.type === 'Jira' && item.assigneeAvatarUrl && (
                  <Box mr={2} flexShrink={0}>
                    <img
                      src={item.assigneeAvatarUrl}
                      alt="Assignee avatar"
                      width="24"
                      height="24"
                      style={{ borderRadius: '50%' }}
                    />
                  </Box>
                )}
                {item.type === 'Calendar' ? (
                  <Text fontWeight="medium" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                    {item.title}
                  </Text>
                ) : (
                  <Link
                    fontWeight="medium"
                    href={item.url}
                    isExternal
                    color="blue.500"
                    display="inline-block"
                    width="400px"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis">
                    {item.title}
                  </Link>
                )}
              </Flex>
              <Flex alignItems="center" flexShrink={0}>
                {item.status && (
                  <Badge fontSize="11px" colorScheme={getStatusColor(item.status)} mr={2}>
                    {item.status}
                  </Badge>
                )}
                {item.type === 'Calendar' && item.eventStatus === 'tentative' && (
                  <Badge fontSize="11px" colorScheme="yellow" mr={2}>
                    Maybe
                  </Badge>
                )}
                <Text color="gray.500" fontSize="x-small">
                  <TimeIcon mr={1} />
                  {item.type === 'Calendar'
                    ? `${new Date(item.start!).toLocaleTimeString()} - ${new Date(item.end!).toLocaleTimeString()}`
                    : formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </Text>
              </Flex>
            </Flex>
          </ListItem>
        ))}
    </List>
  );
};
