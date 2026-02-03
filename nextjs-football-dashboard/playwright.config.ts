import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    '**/e2e/**/*.spec.{ts,tsx,js,jsx}',
    '**/tests/**/*.test.{ts,tsx,js,jsx}',
  ],
  testIgnore: [
    '**/tests/_support/**',
    '**/tests/setup-dom.ts',
    '**/tests/test-utils.ts',
  ],

  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: process.env.CI ? 0 : 200,
    },
  },

  webServer: {
    command: 'pnpm exec next dev -p 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      JWT_SECRET: process.env.JWT_SECRET ?? "test-secret",
      POSTGRES_URL: process.env.POSTGRES_URL ?? "postgres://localhost:5432/test",
    },
  },
});
