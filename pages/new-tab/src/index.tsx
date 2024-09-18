import { createRoot } from 'react-dom/client';
// import '@src/index.css';
// import '@extension/ui/lib/global.css';
import { ChakraProvider } from '@chakra-ui/react';
import { App } from '@src/app';
import { chakraTheme } from './chakra-theme';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  root.render(
    <ChakraProvider theme={chakraTheme}>
      <App />
    </ChakraProvider>,
  );
}

init();
