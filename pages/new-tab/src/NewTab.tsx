import '@src/NewTab.css';
import '@src/NewTab.scss';
import { useState } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import { useDisclosure } from '@chakra-ui/react';
import { t } from '@extension/i18n';
import { ConnectSystemsModal } from './ConnectSystemsModal';

const NewTab = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'new-tab/logo_horizontal.svg' : 'new-tab/logo_horizontal_dark.svg';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [connectedSystems, setConnectedSystems] = useState<string[]>([]);

  console.log(t('hello', 'World'));

  const handleConnect = (systems: string[]) => {
    setConnectedSystems(systems);
    // 这里可以添加保存连接状态到存储的逻辑
  };

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        <p>
          Edit <code>pages/new-tab/src/NewTab.tsx</code>
        </p>
        <h6>The color of this paragraph is defined using SASS.</h6>
        <Button className="mt-4" onClick={exampleThemeStorage.toggle} theme={theme}>
          {t('toggleTheme')}
        </Button>
        <Button className="mt-4" onClick={onOpen}>
          {connectedSystems.length > 0 ? 'Manage Connections' : 'Connect Systems'}
        </Button>
      </header>
      <ConnectSystemsModal
        isOpen={isOpen}
        onClose={onClose}
        onConnect={handleConnect}
        connectedSystems={connectedSystems}
      />
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div> Error Occur </div>);
