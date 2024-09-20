import 'webextension-polyfill';

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('new-tab/index.html') });
});