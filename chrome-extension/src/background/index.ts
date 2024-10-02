import 'webextension-polyfill';

import './set-newtab-override';

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('new-tab/index.html') });
});
