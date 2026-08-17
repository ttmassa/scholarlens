import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'ScholarLens',
    description: 'Real-time fact-checking extension for academic research',
    version: '0.1.0',
    permissions: [],
    host_permissions: [
      'https://localhost:8787/*',
      'https://*.workers.dev/*'
    ]
  }
});
