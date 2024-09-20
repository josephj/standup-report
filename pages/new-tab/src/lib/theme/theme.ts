import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(45deg, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)',
      },
    },
  },
});
