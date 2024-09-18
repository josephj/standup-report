import { List, ListItem, Flex, Box, Text, Link, Badge } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJira, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { TimeIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';

import { getYesterdayOrLastFriday, getStatusColor } from './lib';

import type { WorkItem } from './lib';

type Props = {
  items: WorkItem[];
  filter: 'ongoing' | 'yesterday' | 'stale';
  emptyMessage?: string; // 新增這個可選屬性
};

const filterWorkItems = (item: WorkItem, filter: 'ongoing' | 'yesterday' | 'stale') => {
  const itemDate = new Date(item.type === 'Calendar' ? item.start! : item.updatedAt);
  const yesterdayOrLastFriday = getYesterdayOrLastFriday();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayOrLastFridayStart = new Date(yesterdayOrLastFriday);
  yesterdayOrLastFridayStart.setHours(0, 0, 0, 0);
  const yesterdayOrLastFridayEnd = new Date(yesterdayOrLastFriday);
  yesterdayOrLastFridayEnd.setHours(23, 59, 59, 999);

  const isToday = itemDate > yesterdayOrLastFridayEnd;
  const isYesterdayOrLastFriday = itemDate >= yesterdayOrLastFridayStart && itemDate < todayStart;

  switch (filter) {
    case 'ongoing':
      if (item.type === 'Calendar') {
        return isToday;
      }

      if (item.type === 'GitHub') {
        if (['Open', 'Draft'].includes(item?.status || '')) {
          return isYesterdayOrLastFriday;
        }
        if (item.status === 'Merged' || item.status === 'Participated') {
          return isToday;
        }
      }

      if (item.type === 'Jira') {
        if (['Open', 'In Progress'].includes(item?.status || '')) {
          return isYesterdayOrLastFriday;
        }
      }

      return isToday && item.status !== 'Merged';
    case 'yesterday':
      if (item.type === 'GitHub') {
        if (item.status === 'Merged' || item.status === 'Participated') {
          return isYesterdayOrLastFriday;
        }
        if (['Open', 'Draft'].includes(item?.status || '')) {
          return false;
        }
      }

      if (item.type === 'Jira') {
        return (
          !item.isStale &&
          item.status !== 'In Progress' &&
          itemDate >= yesterdayOrLastFridayStart &&
          itemDate < todayStart
        );
      }

      return itemDate >= yesterdayOrLastFridayStart && itemDate < todayStart;
    case 'stale':
      if (item.type === 'GitHub' && !item.isAuthor && item.status === 'Participated') {
        return false;
      }
      return item.isStale;
  }
};

export const WorkItems = ({ items, filter, emptyMessage }: Props) => {
  const filteredItems = items.filter(item => filterWorkItems(item, filter));

  if (filteredItems.length === 0 && emptyMessage) {
    return (
      <Box py={2} borderWidth={1} borderRadius="md" borderColor="gray.200">
        <Text>{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <List spacing={3}>
      {filteredItems.map((item, index) => (
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
