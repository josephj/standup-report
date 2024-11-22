# Stand-up Report Generator

## Overview

Stand-up Report Generator is a Chrome extension that streamlines your daily stand-up process. It automatically fetches data from Jira tickets, GitHub PRs, and Google Calendar events. Using this information, it can generate a comprehensive stand-up report, saving you time and effort every morning.

You can install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/stand-up-report-generator/iiokonekdbnkbpbdoppdenommagiaheh).

![Stand-up Report Generator](https://standup.flycoder.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fextension-screenshot.476dc665.png&w=3840&q=75)

## Development

### Installation

```bash
npm install -g pnpm
git clone https://github.com/josephj/stand-up-report.git
cd stand-up-report
pnpm install
pnpm dev
```

## Run

In Chrome browser, click the `Window` menu, then `Extensions`. Click the `Load unpacked` button and select the `dist` directory.

### Update package version

For update package version in all ```package.json``` files use this command in root:

```bash
pnpm update-version <new_version>
```

If script was run successfully you will see ```Updated versions to <new_version>```

### Build

```bash
pnpm zip
```

### Important files and folders

- `chrome-extension/manifest.js` - Manifest file for the extension.
- `chrome-extension/src/background` - Background script for the extension.
- `packages/gcf-auth-groq` - Google Cloud Function for Inference API.
- `pages/new-tab` - The main page of the extension.
- `dist/` - Built code
- `zip/` - Zip file for Chrome Web Store

## Credits

This Chrome Extension is built on top of [Chrome Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite).
