import { Flex, Heading, IconButton, Tooltip, Image, HStack } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCog } from '@fortawesome/free-solid-svg-icons';

type Props = {
  isLoading: boolean;
  onForceRefresh: () => void;
  onOpenSettings: () => void;
};

export const Header = ({ isLoading, onForceRefresh, onOpenSettings }: Props) => {
  return (
    <Flex as="header" align="center" justify="space-between">
      <HStack>
        <Image src={chrome.runtime.getURL('icon-128.png')} alt="Logo" boxSize="48px" />
        <Heading as="h1" size="lg">
          Stand-up Report
        </Heading>
      </HStack>
      <Flex>
        <Tooltip label="Force Refresh" aria-label="Force Refresh">
          <IconButton
            aria-label="Force Refresh"
            icon={<FontAwesomeIcon icon={faSyncAlt} />}
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
            icon={<FontAwesomeIcon icon={faCog} />}
            onClick={onOpenSettings}
            variant="outline"
            colorScheme="purple"
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};
