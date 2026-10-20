import { defineConfig } from '@playwright/test';

const synthetic = {
  IDENTITY_ENABLED: 'true', APP_ENV: 'test', API_PORT: '4000',
  CUSTOMER_ORIGIN: 'http://localhost:3000', ADMIN_ORIGIN: 'http://localhost:3001',
  IDENTITY_CSRF_KEY: '11'.repeat(32), IDENTITY_ENCRYPTION_KEY: '22'.repeat(32), IDENTITY_OUTBOX_KEY: '55'.repeat(32),
  SESSION_CUSTOMER_IDLE_MINUTES: '20', SESSION_CUSTOMER_ABSOLUTE_MINUTES: '60',
  SESSION_ADMIN_IDLE_MINUTES: '5', SESSION_ADMIN_ABSOLUTE_MINUTES: '10',
  CHALLENGE_EMAIL_MINUTES: '30', CHALLENGE_RESET_MINUTES: '30', CHALLENGE_MFA_MINUTES: '5', MFA_CHALLENGE_MAX_ATTEMPTS: '5',
  IDENTITY_MAIL_POLL_MS: '1000', IDENTITY_RATE_LIMIT_MAX: '100', IDENTITY_RATE_LIMIT_WINDOW_SECONDS: '60',
  ARGON2_MEMORY_KIB: '19456', ARGON2_TIME_COST: '2', ARGON2_PARALLELISM: '1',
  LEGAL_TERMS_VERSION: 'synthetic-browser-test', LEGAL_TERMS_SHA256: '33'.repeat(32),
  LEGAL_PRIVACY_VERSION: 'synthetic-browser-test', LEGAL_PRIVACY_SHA256: '44'.repeat(32),
  SMTP_URL: 'smtp://localhost:2525', SMTP_FROM: 'noreply@example.invalid',
};
export default defineConfig({
  testDir: './tests/browser-integration', timeout: 90_000, expect: { timeout: 15_000 }, workers: 1,
  use: { browserName: 'chromium', headless: true, trace: 'retain-on-failure' },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-integration' }]],
  webServer: [
    { command: 'corepack pnpm --filter @galung/api exec tsx src/main.ts', url: 'http://localhost:4000/api/v1/health/live',
      env: synthetic, timeout: 120_000 },
    { command: 'corepack pnpm --filter @galung/web dev', url: 'http://localhost:3000/login',
      env: { NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4000', NEXT_PUBLIC_LEGAL_TERMS_VERSION: synthetic.LEGAL_TERMS_VERSION,
        NEXT_PUBLIC_LEGAL_PRIVACY_VERSION: synthetic.LEGAL_PRIVACY_VERSION, NEXT_PUBLIC_LEGAL_TERMS_URL: 'https://example.invalid/terms',
        NEXT_PUBLIC_LEGAL_PRIVACY_URL: 'https://example.invalid/privacy' }, timeout: 120_000 },
  ],
});
