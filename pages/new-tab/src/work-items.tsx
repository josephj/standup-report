import { TimeIcon } from '@chakra-ui/icons';
import { List, ListItem, Flex, Box, Text, Link, Badge } from '@chakra-ui/react';
import { faJira, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

import type { WorkItem } from './lib';
import { getStatusColor } from './lib';

type Props = {
  items: WorkItem[];
  emptyMessage?: string;
};

export const WorkItems = ({ items, emptyMessage }: Props) => {
  const [ongoingStatuses, setOngoingStatuses] = useState(['In Progress']);

  useEffect(() => {
    chrome.storage.local.get('jiraInProgressStatuses', result => {
      setOngoingStatuses(
        result.jiraInProgressStatuses.map((status: { value: string }) => status.value) || ['In Progress'],
      );
    });
  }, []);

  if (items.length === 0 && emptyMessage) {
    return (
      <Box py={2} borderWidth={1} borderRadius="md" borderColor="gray.200">
        <Text>{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <List spacing={3}>
      {items.map((item, index) => (
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
                <Badge fontSize="11px" colorScheme={getStatusColor(item.status, ongoingStatuses)} mr={2}>
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
