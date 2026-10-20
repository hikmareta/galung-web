import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import { IdentityStore } from '../src/identity-store';
import { hashPassword, newTotpSecret, type IdentityConfiguration } from '../src/identity-security';

let db: PGlite;
let store: IdentityStore;
const config = {
  IDENTITY_CSRF_KEY: Buffer.alloc(32, 1), IDENTITY_ENCRYPTION_KEY: Buffer.alloc(32, 2),
  IDENTITY_OUTBOX_KEY: Buffer.alloc(32, 3),
  SESSION_CUSTOMER_IDLE_MINUTES: 20, SESSION_CUSTOMER_ABSOLUTE_MINUTES: 60,
  SESSION_ADMIN_IDLE_MINUTES: 5, SESSION_ADMIN_ABSOLUTE_MINUTES: 10,
  MFA_CHALLENGE_MAX_ATTEMPTS: 5,
} as IdentityConfiguration;
const requestId = 'test-request';
const setup = async (email: string) => {
  const id = await store.register({ email, passwordHash: await hashPassword('correct horse battery staple'), displayName: 'Synthetic',
    countryCode: 'ID', locale: 'id-ID', termsVersion: 'synthetic-v1', termsHash: Buffer.alloc(32, 1),
    privacyVersion: 'synthetic-v1', privacyHash: Buffer.alloc(32, 2), requestId });
  const verification = await store.challenge(id, 'email_verify', 'customer', 30, requestId, config.IDENTITY_OUTBOX_KEY);
  expect(await store.verifyEmail(verification.token, requestId)).toBe(true);
  expect(await store.verifyEmail(verification.token, requestId)).toBe(false);
  return id;
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(resolve(process.cwd(), 'test/fixtures/identity-schema.sql'), 'utf8'));
  await db.exec(readFileSync(resolve(process.cwd(), '../../Documentation/database/005_identity_contract_candidate.sql'), 'utf8'));
  await db.exec(readFileSync(resolve(process.cwd(), '../../Documentation/database/006_identity_runtime.sql'), 'utf8'));
  store = new IdentityStore();
  const adapter = { query: (sql: string, values?: unknown[]) => db.query(sql, values), connect: async () => ({ query: (sql: string, values?: unknown[]) => db.query(sql, values), release: () => undefined }) };
  Reflect.set(store, 'pool', adapter);
}, 30000);
afterAll(async () => { await db?.close(); });

describe('identity persistence and boundaries', () => {
  it('registers legal evidence, verifies once, and prevents cross-owner session revocation', async () => {
    const alice = await setup('alice@example.invalid');
    const bob = await setup('bob@example.invalid');
    const session = await store.createSession(alice, 'customer', 'password', config, requestId);
    expect((await store.resolveSession(session.token, 'customer', 20))?.user_id).toBe(alice);
    expect(await store.revokeSession(bob, session.id, 'customer', requestId)).toBe(false);
    expect(await store.revokeSession(alice, session.id, 'customer', requestId)).toBe(true);
    expect(await store.resolveSession(session.token, 'customer', 20)).toBeNull();
    const idle = await store.createSession(alice, 'customer', 'password', config, requestId);
    await db.query(`UPDATE galung.auth_sessions SET idle_expires_at=now()-interval '1 second' WHERE id=$1`, [idle.id]);
    expect(await store.resolveSession(idle.token, 'customer', 20)).toBeNull();
    expect(await store.legalAcceptances(alice)).toMatchObject([{ termsVersion: 'synthetic-v1' }]);
    expect((await store.profile(alice))?.email).toBe('alice@example.invalid');
    expect((await store.sessions(bob, 'customer')).length).toBe(0);
  });
  it('consumes reset token once and revokes every existing session atomically', async () => {
    const userId = await setup('reset@example.invalid');
    const first = await store.createSession(userId, 'customer', 'password', config, requestId);
    const challenge = await store.challenge(userId, 'password_reset', 'customer', 30, requestId, config.IDENTITY_OUTBOX_KEY);
    expect(await store.resetPassword(challenge.token, await hashPassword('replacement secure password'), requestId)).toBe(true);
    expect(await store.resetPassword(challenge.token, await hashPassword('another secure password'), requestId)).toBe(false);
    expect(await store.resolveSession(first.token, 'customer', 20)).toBeNull();
  });
  it('requires MFA, prevents TOTP and recovery replay, and rejects removed roles', async () => {
    const userId = await setup('admin@example.invalid');
    await db.query(`INSERT INTO galung.user_roles(user_id,role_id) SELECT $1,id FROM galung.roles WHERE code='identity_admin'`, [userId]);
    const challenge = await store.challenge(userId, 'login_mfa', 'admin', 10, requestId);
    const secret = newTotpSecret();
    expect(await store.enrollFactor(challenge.id, secret, config, requestId)).toBe(true);
    const totp = new TOTP({ secret, crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin(), period: 30, digits: 6 });
    const code = await totp.generate();
    const enrolled = await store.completeMfa(challenge.id, code, config, requestId, true);
    expect(enrolled?.recoveryCodes).toHaveLength(8);
    expect(await store.completeMfa(challenge.id, code, config, requestId, true)).toBeNull();
    const mfa = await store.challenge(userId, 'login_mfa', 'admin', 10, requestId);
    expect(await store.completeMfa(mfa.id, code, config, requestId, false)).toBeNull();
    const recovered = await store.recoverMfa(mfa.id, enrolled!.recoveryCodes![0], config, requestId);
    expect(recovered?.id).toBeDefined();
    expect(await store.resolveSession(enrolled!.token, 'admin', 5)).toBeNull();
    const next = await store.challenge(userId, 'login_mfa', 'admin', 10, requestId);
    expect(await store.recoverMfa(next.id, enrolled!.recoveryCodes![0], config, requestId)).toBeNull();
    for (let attempt = 1; attempt < 5; attempt++) expect(await store.recoverMfa(next.id, '0'.repeat(64), config, requestId)).toBeNull();
    expect(await store.recoverMfa(next.id, enrolled!.recoveryCodes![1], config, requestId)).toBeNull();
    await db.query(`DELETE FROM galung.user_roles WHERE user_id=$1 AND role_id=(SELECT id FROM galung.roles WHERE code='identity_admin')`, [userId]);
    expect(await store.resolveSession(recovered!.token, 'admin', 5)).toBeNull();
  });
});
