import { Box, HStack } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <Box>
      <HStack spacing={4} p={4}>
        <Link to="/">Daily</Link>
        <Link to="/weekly">Weekly</Link>
      </HStack>
      <Box p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};
