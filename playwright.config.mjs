import { defineConfig } from '@playwright/test';

export default defineConfig({
  outputDir: '/tmp/SP-UI-683/playwright-results',
  use: {
    video: 'on',
  },
});
