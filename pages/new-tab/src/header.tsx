import { Flex, Heading, IconButton, Tooltip, Image, HStack } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

type Props = {
  onOpenSettings: () => void;
};

export const Header = ({ onOpenSettings }: Props) => {
  return (
    <Flex as="header" align="center" justify="space-between">
      <HStack>
        <Image src={chrome.runtime.getURL('icon-128.png')} alt="Logo" boxSize="48px" />
        <Heading as="h1" size="lg">
          Stand-up Report
        </Heading>
      </HStack>
      <Flex>
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
