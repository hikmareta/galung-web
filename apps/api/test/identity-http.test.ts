import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from '../src/module';
import { IdentityStore } from '../src/identity-store';
import { IdentityMail } from '../src/identity-mail';
import { IdentityGateway } from '../src/identity-http';
import { IdentityDeliveryWorker } from '../src/identity-delivery';
import { IdentityStore as Store } from '../src/identity-store';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

let app: INestApplication, db: PGlite, base: string;
const sent: { to: string; purpose: string; token: string }[] = [];
const origin = 'http://localhost:3000';
const request = (path: string, options: { method?: string; body?: unknown; cookie?: string; csrf?: string; origin?: string; audience?: 'admin' | 'customer' } = {}) => fetch(`${base}/api/v1${path}`, {
  method: options.method ?? 'GET',
  headers: { Origin: options.origin ?? (path.startsWith('/auth/mfa') || options.audience === 'admin' || (options.body as { audience?: string } | undefined)?.audience === 'admin' ? 'http://localhost:3001' : origin), ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(options.cookie ? { Cookie: options.cookie } : {}), ...(options.csrf ? { 'X-CSRF-Token': options.csrf } : {}),
    ...(options.audience ? { 'X-Galung-Audience': options.audience } : {}) },
  ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
});

beforeAll(async () => {
  Object.assign(process.env, {
    APP_ENV: 'test',
    IDENTITY_ENABLED: 'true', CUSTOMER_ORIGIN: origin, ADMIN_ORIGIN: 'http://localhost:3001',
    IDENTITY_CSRF_KEY: '11'.repeat(32), IDENTITY_ENCRYPTION_KEY: '22'.repeat(32),
    IDENTITY_OUTBOX_KEY: '55'.repeat(32), IDENTITY_MAIL_POLL_MS: '1000',
    SESSION_CUSTOMER_IDLE_MINUTES: '20', SESSION_CUSTOMER_ABSOLUTE_MINUTES: '60',
    SESSION_ADMIN_IDLE_MINUTES: '5', SESSION_ADMIN_ABSOLUTE_MINUTES: '10',
    CHALLENGE_EMAIL_MINUTES: '30', CHALLENGE_RESET_MINUTES: '30', CHALLENGE_MFA_MINUTES: '5',
    MFA_CHALLENGE_MAX_ATTEMPTS: '5',
    IDENTITY_RATE_LIMIT_MAX: '10', IDENTITY_RATE_LIMIT_WINDOW_SECONDS: '900',
    ARGON2_MEMORY_KIB: '19456', ARGON2_TIME_COST: '2', ARGON2_PARALLELISM: '1',
    LEGAL_TERMS_VERSION: 'synthetic-v1', LEGAL_TERMS_SHA256: '33'.repeat(32),
    LEGAL_PRIVACY_VERSION: 'synthetic-v1', LEGAL_PRIVACY_SHA256: '44'.repeat(32),
    SMTP_URL: 'smtp://localhost:2525', SMTP_FROM: 'noreply@example.invalid',
    DATABASE_URL: 'postgresql://synthetic:synthetic@localhost:5432/synthetic', REDIS_URL: 'redis://localhost:6379',
  });
  db = new PGlite();
  await db.exec(readFileSync(resolve(process.cwd(), 'test/fixtures/identity-schema.sql'), 'utf8'));
  await db.exec(readFileSync(resolve(process.cwd(), '../../Documentation/database/005_identity_contract_candidate.sql'), 'utf8'));
  await db.exec(readFileSync(resolve(process.cwd(), '../../Documentation/database/006_identity_runtime.sql'), 'utf8'));
  app = await NestFactory.create(AppModule, { logger: false });
  const store = app.get(IdentityStore);
  Reflect.set(store, 'pool', { query: (sql: string, values?: unknown[]) => db.query(sql, values), connect: async () => ({ query: (sql: string, values?: unknown[]) => db.query(sql, values), release: () => undefined }) });
  app.get(IdentityMail).send = async (to, purpose, token) => { sent.push({ to, purpose, token }); };
  app.get(IdentityGateway).rate = async () => undefined;
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
}, 30000);
afterAll(async () => { await app?.close(); await db?.close(); });

describe('identity HTTP journey', () => {
  it('rejects foreign origins, requires verification, binds CSRF, scopes profile, and invalidates reset sessions', async () => {
    const input = { email: 'journey@example.invalid', password: 'correct horse battery staple', displayName: 'Synthetic',
      countryCode: 'ID', preferredLocale: 'id-ID', termsVersion: 'synthetic-v1', privacyNoticeVersion: 'synthetic-v1', acceptTerms: true, acknowledgePrivacy: true };
    expect((await request('/auth/register', { method: 'POST', body: input, origin: 'https://evil.invalid' })).status).toBe(403);
    expect((await request('/auth/register', { method: 'POST', body: input })).status).toBe(201);
    expect((await request('/auth/register', { method: 'POST', body: input })).status).toBe(201);
    expect((await request('/auth/register', { method: 'POST', body: { ...input, termsVersion: 'stale' } })).status).toBe(409);
    expect((await request('/auth/register', { method: 'POST', body: { ...input, role: 'identity_admin' } })).status).toBe(400);
    expect(await app.get(IdentityDeliveryWorker).deliverOnce()).toBe(true);
    expect((await request('/auth/login', { method: 'POST', body: { email: input.email, password: input.password, audience: 'customer' } })).status).toBe(401);
    expect((await request('/auth/email-verification/confirm', { method: 'POST', body: { token: sent[0].token } })).status).toBe(204);
    expect((await request('/auth/email-verification/confirm', { method: 'POST', body: { token: sent[0].token } })).status).toBe(409);
    const login = await request('/auth/login', { method: 'POST', body: { email: input.email, password: input.password, audience: 'customer' } });
    expect(login.status).toBe(200);
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    expect(cookie).toMatch(/^__Host-galung_customer=/);
    const csrfResponse = await request('/auth/csrf', { cookie });
    expect(csrfResponse.status).toBe(200);
    const csrf = (await csrfResponse.json()).csrfToken as string;
    expect((await request('/me', { cookie })).status).toBe(200);
    expect((await request('/me', { method: 'PATCH', cookie, body: { displayName: 'Updated' } })).status).toBe(403);
    expect((await request('/me', { method: 'PATCH', cookie, csrf, body: { displayName: 'Updated', legalBillingName: 'Synthetic Legal Name' } })).status).toBe(200);
    const privacy = await request('/me/privacy-requests', { method: 'POST', cookie, csrf, body: { kind: 'export' } });
    expect(privacy.status).toBe(202);
    const requestId = (await privacy.json()).id;
    const duplicate = await request('/me/privacy-requests', { method: 'POST', cookie, csrf, body: { kind: 'export' } });
    expect((await duplicate.json()).id).toBe(requestId);
    expect((await (await request('/me/privacy-requests', { cookie })).json())).toHaveLength(1);
    expect((await request('/me/sessions/00000000-0000-4000-8000-000000000000/revoke', { method: 'POST', cookie, csrf, body: {} })).status).toBe(404);
    expect((await request('/auth/password-reset/request', { method: 'POST', body: { email: 'unknown@example.invalid' } })).status).toBe(202);
    expect((await request('/auth/password-reset/request', { method: 'POST', body: { email: input.email } })).status).toBe(202);
    expect(await app.get(IdentityDeliveryWorker).deliverOnce()).toBe(true);
    const reset = sent.findLast(message => message.purpose === 'password_reset')!;
    expect((await request('/auth/password-reset/confirm', { method: 'POST', body: { token: reset.token, newPassword: 'replacement secure password' } })).status).toBe(204);
    expect((await request('/auth/password-reset/confirm', { method: 'POST', body: { token: reset.token, newPassword: 'replacement secure password' } })).status).toBe(409);
    expect((await request('/me', { cookie })).status).toBe(401);
    const renewed = await request('/auth/login', { method: 'POST', body: { email: input.email, password: 'replacement secure password', audience: 'customer' } });
    expect(renewed.status).toBe(200);
    const newCookie = renewed.headers.get('set-cookie')!.split(';')[0];
    const newCsrf = (await (await request('/auth/csrf', { cookie: newCookie })).json()).csrfToken as string;
    expect((await request('/auth/logout', { method: 'POST', cookie: newCookie })).status).toBe(403);
    expect((await request('/auth/logout', { method: 'POST', cookie: newCookie, csrf: newCsrf })).status).toBe(204);
    expect((await request('/me', { cookie: newCookie })).status).toBe(401);
  });
  it('keeps email tokens encrypted and retries a failed delivery without exposing account existence', async () => {
    const mail = app.get(IdentityMail);
    const original = mail.send;
    mail.send = async () => { throw new Error('synthetic SMTP outage'); };
    expect((await request('/auth/password-reset/request', { method: 'POST', body: { email: 'journey@example.invalid' } })).status).toBe(202);
    expect(await app.get(IdentityDeliveryWorker).deliverOnce()).toBe(true);
    const pending = await db.query<{ id: string; payload_ciphertext: Uint8Array; status: string }>(`
      SELECT id,payload_ciphertext,status FROM galung.identity_delivery_outbox WHERE purpose='password_reset' ORDER BY created_at DESC LIMIT 1`);
    expect(pending.rows[0].status).toBe('pending');
    expect(pending.rows[0].payload_ciphertext.length).toBeGreaterThan(32);
    mail.send = original;
    await db.query('UPDATE galung.identity_delivery_outbox SET available_at=now() WHERE id=$1', [pending.rows[0].id]);
    expect(await app.get(IdentityDeliveryWorker).deliverOnce()).toBe(true);
    const delivered = await db.query<{ status: string; payload_ciphertext: Uint8Array | null }>('SELECT status,payload_ciphertext FROM galung.identity_delivery_outbox WHERE id=$1', [pending.rows[0].id]);
    const token = sent.findLast(message => message.purpose === 'password_reset')!.token;
    expect(delivered.rows[0].status).toBe('delivered');
    expect(Buffer.from(pending.rows[0].payload_ciphertext).toString('utf8')).not.toContain(token);
    expect(delivered.rows[0].payload_ciphertext).toBeNull();
    expect((await request('/auth/password-reset/request', { method: 'POST', body: { email: 'missing@example.invalid' } })).status).toBe(202);
  });
  it('holds admin login pending MFA, permits one-time enrollment, and rejects recovery replay', async () => {
    const input = { email: 'staff@example.invalid', password: 'synthetic staff password 123', displayName: 'Synthetic Staff',
      countryCode: 'ID', preferredLocale: 'id-ID', termsVersion: 'synthetic-v1', privacyNoticeVersion: 'synthetic-v1', acceptTerms: true, acknowledgePrivacy: true };
    expect((await request('/auth/register', { method: 'POST', body: input })).status).toBe(201);
    expect(await app.get(IdentityDeliveryWorker).deliverOnce()).toBe(true);
    const verification = sent.findLast(message => message.to === input.email)!;
    expect((await request('/auth/email-verification/confirm', { method: 'POST', body: { token: verification.token } })).status).toBe(204);
    const staff = await app.get(Store).userByEmail(input.email);
    await db.query(`INSERT INTO galung.user_roles(user_id,role_id) SELECT $1,id FROM galung.roles WHERE code='identity_admin'`, [staff!.id]);
    const loginBody = { email: input.email, password: input.password, audience: 'admin' };
    const first = await request('/auth/login', { method: 'POST', body: loginBody });
    expect(first.status).toBe(202);
    expect(first.headers.get('set-cookie')).toBeNull();
    const pending = await first.json();
    expect((await request('/auth/session', { audience: 'admin' })).status).toBe(401);
    const enroll = await request('/auth/mfa/enroll', { method: 'POST', body: { challengeId: pending.challengeId } });
    expect(enroll.status).toBe(200);
    const { secret } = await enroll.json();
    const totp = new TOTP({ secret, crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin(), period: 30, digits: 6 });
    const code = await totp.generate();
    const completed = await request('/auth/mfa/enroll/confirm', { method: 'POST', body: { challengeId: pending.challengeId, code } });
    expect(completed.status).toBe(200);
    const adminCookie = completed.headers.get('set-cookie')!.split(';')[0];
    const recoveryCodes = (await completed.json()).recoveryCodes as string[];
    expect(recoveryCodes).toHaveLength(8);
    expect((await request('/auth/session', { cookie: adminCookie, audience: 'admin' })).status).toBe(200);
    expect((await request('/auth/csrf', { cookie: adminCookie, audience: 'admin', origin })).status).toBe(403);
    expect((await request('/auth/mfa/enroll/confirm', { method: 'POST', body: { challengeId: pending.challengeId, code } })).status).toBe(401);
    const next = await request('/auth/login', { method: 'POST', body: loginBody });
    const nextPending = await next.json();
    const recovered = await request('/auth/mfa/recovery', { method: 'POST', body: { challengeId: nextPending.challengeId, recoveryCode: recoveryCodes[0] } });
    expect(recovered.status).toBe(200);
    expect((await request('/auth/session', { cookie: adminCookie, audience: 'admin' })).status).toBe(401);
    const last = await request('/auth/login', { method: 'POST', body: loginBody });
    const lastPending = await last.json();
    expect((await request('/auth/mfa/recovery', { method: 'POST', body: { challengeId: lastPending.challengeId, recoveryCode: recoveryCodes[0] } })).status).toBe(401);
  });
});
