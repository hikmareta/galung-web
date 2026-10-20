import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  workers: 2,
  use: { browserName: 'chromium', headless: true, trace: 'retain-on-failure' },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  webServer: [
    { command: 'corepack pnpm --filter @galung/web dev', url: 'http://127.0.0.1:3000/login', reuseExistingServer: !process.env.CI,
      env: { NEXT_PUBLIC_API_BASE_URL: '', NEXT_PUBLIC_LEGAL_TERMS_VERSION: 'synthetic-browser-test', NEXT_PUBLIC_LEGAL_PRIVACY_VERSION: 'synthetic-browser-test',
        NEXT_PUBLIC_LEGAL_TERMS_URL: 'https://example.invalid/terms', NEXT_PUBLIC_LEGAL_PRIVACY_URL: 'https://example.invalid/privacy' }, timeout: 120_000 },
    { command: 'corepack pnpm --filter @galung/admin dev', url: 'http://127.0.0.1:3001/login', reuseExistingServer: !process.env.CI,
      env: { NEXT_PUBLIC_API_BASE_URL: '' }, timeout: 120_000 },
  ],
});
