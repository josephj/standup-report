import { Flex, Heading, IconButton, Tooltip } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCog } from '@fortawesome/free-solid-svg-icons';

type Props = {
  isLoading: boolean;
  onForceRefresh: () => void;
  onOpenSettings: () => void;
};

export const Header = ({ isLoading, onForceRefresh, onOpenSettings }: Props) => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Heading color="gray.700" textShadow="1px 1px 1px rgb(255,255,255)">
        📋 Stand-up Report
      </Heading>
      <Flex>
        <Tooltip label="Force Refresh" aria-label="Force Refresh">
          <IconButton
            aria-label="Force Refresh"
            icon={<FontAwesomeIcon icon={faSyncAlt} color="#2B6CB0" />}
            onClick={onForceRefresh}
            variant="outline"
            colorScheme="blue"
            mr={2}
            isLoading={isLoading}
          />
        </Tooltip>
        <Tooltip label="Manage Connections" aria-label="Manage Connections">
          <IconButton
            aria-label="Manage Connections"
            icon={<FontAwesomeIcon icon={faCog} color="#6B46C1" />}
            onClick={onOpenSettings}
            variant="outline"
            colorScheme="purple"
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};
