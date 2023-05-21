import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { dependencies } from './package.json';

const external = [/^node:.+$/];

Object.entries(dependencies).forEach(([dep, version]) => {
  if (version !== 'workspace:*') {
    const depRegex = new RegExp(`^${dep}(/.*)?$`);
    external.push(depRegex);
  }
});

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: {
      $services: resolve(__dirname, './src/services'),
      $commands: resolve(__dirname, './src/services/commands'),
      $openapi: resolve(__dirname, './openapi')
    }
  },
  define: {
    fetch: 'fetch'
  },
  build: {
    rollupOptions: {
      external
    }
  }
});
