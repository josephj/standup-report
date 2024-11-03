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
  chrome.tabs.onCreated.removeListener(handleTabCreated);

  if (isOverride) {
    chrome.tabs.onCreated.addListener(handleTabCreated);
  }
};

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(KEY_OVERRIDE_NEW_TAB, result => {
    const isOverride = result[KEY_OVERRIDE_NEW_TAB] ?? true;
    chrome.storage.sync.set({ [KEY_OVERRIDE_NEW_TAB]: isOverride }, () => {
      handleOverrideNewTab(isOverride);
    });
  });
});

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_NEW_TAB_OVERRIDE') {
    const isOverride = Boolean(message.value);
    chrome.storage.sync.set({ [KEY_OVERRIDE_NEW_TAB]: isOverride }, () => {
      handleOverrideNewTab(isOverride);
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});

// Initialize on startup
chrome.storage.sync.get(KEY_OVERRIDE_NEW_TAB, result => {
  const isOverride = result[KEY_OVERRIDE_NEW_TAB] ?? true;
  handleOverrideNewTab(isOverride);
});
