import { Button, Flex, Text } from '@chakra-ui/react';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  onOpenSettings: () => void;
};

export const ZeroState = ({ onOpenSettings }: Props) => (
  <Flex direction="column" justifyContent="center" alignItems="center" height="100%">
    <Text mb={4} textAlign="center">
      To generate a summary, please provide an OpenAI API key in the settings.
    </Text>
    <Button onClick={onOpenSettings} colorScheme="purple" leftIcon={<FontAwesomeIcon icon={faCog} color="white" />}>
      Open Settings
    </Button>
  </Flex>
);
