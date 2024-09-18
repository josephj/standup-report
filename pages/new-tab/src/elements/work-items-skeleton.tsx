import { Box, Skeleton, VStack } from '@chakra-ui/react';

export const WorkItemsSkeleton = () => {
  return (
    <VStack spacing={2} align="stretch">
      {[...Array(3)].map((_, index) => (
        <Box key={index} p={2}>
          <Skeleton height="16px" width="60%" mb={1} />
          <Skeleton height="12px" width="80%" mb={1} />
          <Skeleton height="12px" width="40%" />
        </Box>
      ))}
    </VStack>
  );
};
