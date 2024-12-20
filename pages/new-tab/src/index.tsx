import { ChakraProvider } from '@chakra-ui/react';
import { App } from '@src/app';
import { createRoot } from 'react-dom/client';

import { theme } from './lib';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  root.render(
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>,
  );
}

init();
