import type { SpinnerProps, CenterProps } from '@chakra-ui/react';
import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';

type Props = CenterProps & {
  spinnerSize?: SpinnerProps['size'];
};

export const CenteredSpinner = ({ spinnerSize, ...rest }: Props) => (
  <Center height="100%" {...rest}>
    <Spinner color="purple.500" size={spinnerSize} />
  </Center>
);
