import fs from 'node:fs';
import deepmerge from 'deepmerge';

const packageJson = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const isFirefox = process.env.__FIREFOX__ === 'true';

const sidePanelConfig = {
  side_panel: {
    default_path: 'side-panel/index.html',
  },
  permissions: ['sidePanel'],
};

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = deepmerge(
  {
    manifest_version: 3,
    default_locale: 'en',
    /**
     * if you want to support multiple languages, you can use the following reference
     * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
     */
    name: '__MSG_extensionName__',
    version: packageJson.version,
    description: '__MSG_extensionDescription__',
    host_permissions: ['https://*.atlassian.net/*', 'https://github.com/*'],
    permissions: [
      'storage',
      // 'scripting',
      // 'tabs',
      // 'notifications',
      // 'activeTab',
      'identity',
      // 'https://www.googleapis.com/auth/calendar.readonly',
      // 'https://accounts.google.com/o/oauth2/revoke',
    ],
    oauth2: {
      client_id: '1016046366095-cv54v5gab9v5bd8nma2b1rssgflp0ud9.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    },
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr+5K51zKhMWLI9+joH4vMmmTy5ul7nsx5jjgelJtL8b5AZSczG3OjuzQKrerFhp3zxDBFjYqauQ64JyerjbjFuCIoJrkg61xnYv8FPF5YSJpmQSY1BzKsqlcqp+sg/bnGjei3fOAd6seIhS9lIAcx3vmDXC0MrvLUPHzDoMJJGqnX+eaWrINHQgCBIa75WHFI+Rs4wXR0q5qbus2S5lFVZT01xacR6IGDWVgPVJnBAlU10LRF1qZJlY01Rjt3T64ut+gXGd27aboZn1DLK3BHXFd1GJgoevBwdFUuyexbQMFpoYHrW44hnlmO0+CWnWV87GvevRD7VmynZWTGCtaVwIDAQAB',
    options_page: 'options/index.html',
    background: {
      service_worker: 'background.iife.js',
      type: 'module',
    },
    action: {
      default_popup: 'popup/index.html',
      default_icon: 'icon-34.png',
    },
    chrome_url_overrides: {
      newtab: 'new-tab/index.html',
    },
    icons: {
      128: 'icon-128.png',
    },
    content_scripts: [],
    // devtools_page: 'devtools/index.html',
    web_accessible_resources: [
      {
        resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
        matches: ['*://*/*'],
      },
    ],
  },
  !isFirefox && sidePanelConfig,
);

export default manifest;
