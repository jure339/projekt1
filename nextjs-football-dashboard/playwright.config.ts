import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', // ✅ samo E2E testi iz mape e2e

  // (optional) dodatno zaklene, da pobere samo *.spec.*
  testMatch: /.*\.spec\.(ts|js)/,

  use: {
    baseURL: 'http://127.0.0.1:3000',
  },

  webServer: {
    command: 'pnpm exec next dev -p 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
