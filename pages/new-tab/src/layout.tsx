import { Box, HStack, Text } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';

import { getVersion } from './lib';

export const Layout = () => {
  return (
    <Box minH="100vh" display="flex" flexDir="column">
      <Box>
        <HStack spacing={4} p={4}>
          <Link to="/">Daily</Link>
          <Link to="/weekly">Weekly</Link>
        </HStack>
        <Box p={4} flex="1">
          <Outlet />
        </Box>
      </Box>
      <Box as="footer" p={4} textAlign="center" mt="auto">
        <Text color="gray.500" fontSize="sm">
          Version {getVersion()}
        </Text>
      </Box>
    </Box>
  );
};
