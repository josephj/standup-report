import { resolve } from 'node:path';

import { withPageConfig } from '@extension/vite-config';
import { defineConfig } from 'vite';

import { version } from './package.json';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

export default defineConfig(
  withPageConfig({
    resolve: {
      alias: {
        '@src': srcDir,
      },
    },
    publicDir: resolve(rootDir, 'public'),
    build: {
      outDir: resolve(rootDir, '..', '..', 'dist', 'new-tab'),
    },
    define: {
      __APP_VERSION__: JSON.stringify(version),
    },
  }),
);
