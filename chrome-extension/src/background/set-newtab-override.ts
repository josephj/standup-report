import { Storage } from '@plasmohq/storage';

const storage = new Storage();

const NEW_TAB_URL = 'chrome://newtab/';
const KEY_OVERRIDE_NEW_TAB = 'overrideNewTab';

const handleTabCreated = (tab: chrome.tabs.Tab) => {
  if (tab.pendingUrl === NEW_TAB_URL || tab.url === NEW_TAB_URL) {
    if (tab.id) {
      chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('new-tab/index.html') });
    }
  }
};

const handleOverrideNewTab = (isOverride: boolean) => {
  if (isOverride) {
    chrome.tabs.onCreated.addListener(handleTabCreated);
  } else {
    chrome.tabs.onCreated.removeListener(handleTabCreated);
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  const overrideNewTab = await storage.get(KEY_OVERRIDE_NEW_TAB);
  if (overrideNewTab === undefined) {
    await storage.set(KEY_OVERRIDE_NEW_TAB, true);
  }
});

chrome.runtime.onMessage.addListener(async message => {
  if (message.type === 'UPDATE_NEW_TAB_OVERRIDE') {
    await storage.set(KEY_OVERRIDE_NEW_TAB, message.value);
    handleOverrideNewTab(message.value);
  }
});

storage.get(KEY_OVERRIDE_NEW_TAB).then(handleOverrideNewTab);
