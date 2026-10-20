import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { IdentityGateway } from '../src/identity-http';
import type { IdentityStore } from '../src/identity-store';

const integration = process.env.IDENTITY_REDIS_TEST === 'true' ? it : it.skip;
describe('distributed identity rate limit', () => {
  integration('limits by network and account and fails closed when Redis is unavailable', async () => {
    Object.assign(process.env, {
      IDENTITY_ENABLED: 'true', APP_ENV: 'test', CUSTOMER_ORIGIN: 'http://localhost:3000', ADMIN_ORIGIN: 'http://localhost:3001',
      IDENTITY_CSRF_KEY: '11'.repeat(32), IDENTITY_ENCRYPTION_KEY: '22'.repeat(32),
      IDENTITY_OUTBOX_KEY: '55'.repeat(32), IDENTITY_MAIL_POLL_MS: '1000',
      SESSION_CUSTOMER_IDLE_MINUTES: '20', SESSION_CUSTOMER_ABSOLUTE_MINUTES: '60',
      SESSION_ADMIN_IDLE_MINUTES: '5', SESSION_ADMIN_ABSOLUTE_MINUTES: '10',
      CHALLENGE_EMAIL_MINUTES: '30', CHALLENGE_RESET_MINUTES: '30', CHALLENGE_MFA_MINUTES: '5',
      MFA_CHALLENGE_MAX_ATTEMPTS: '5',
      IDENTITY_RATE_LIMIT_MAX: '2', IDENTITY_RATE_LIMIT_WINDOW_SECONDS: '60',
      ARGON2_MEMORY_KIB: '19456', ARGON2_TIME_COST: '2', ARGON2_PARALLELISM: '1',
      LEGAL_TERMS_VERSION: 'synthetic', LEGAL_TERMS_SHA256: '33'.repeat(32),
      LEGAL_PRIVACY_VERSION: 'synthetic', LEGAL_PRIVACY_SHA256: '44'.repeat(32),
      SMTP_URL: 'smtp://localhost:2525', SMTP_FROM: 'noreply@example.invalid',
    });
    const gateway = new IdentityGateway({} as IdentityStore);
    const req = { ip: `192.0.2.${Math.floor(Math.random() * 200) + 1}`, socket: { remoteAddress: '192.0.2.1' } } as Request;
    const action = `test-${randomUUID()}`;
    await gateway.rate(action, req, 'synthetic@example.invalid');
    await gateway.rate(action, req, 'synthetic@example.invalid');
    await expect(gateway.rate(action, req, 'synthetic@example.invalid')).rejects.toMatchObject({ status: 429 });
    const redis = Reflect.get(gateway, 'redis') as { disconnect: () => void; status: string };
    redis.disconnect();
    await expect(gateway.rate(`closed-${randomUUID()}`, req)).rejects.toMatchObject({ status: 503 });
  });
});
