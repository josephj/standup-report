import { VStack, Heading, Text, Button } from '@chakra-ui/react';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface ZeroStateProps {
  onOpenSettings: () => void;
}

export const ZeroState: React.FC<ZeroStateProps> = ({ onOpenSettings }) => {
  return (
    <VStack spacing={8} align="center" justify="center" height="100vh">
      <Heading>Welcome to Stand-up Report Generator</Heading>
      <Text fontSize="xl" textAlign="center">
        It seems you haven{`'`}t connected Jira, GitHub, or Google yet.
        <br />
        Connect to these services to get started.
      </Text>
      <Button
        onClick={onOpenSettings}
        colorScheme="purple"
        size="lg"
        leftIcon={<FontAwesomeIcon icon={faCog} color="white" />}>
        Connect
      </Button>
    </VStack>
  );
};
