import { describe, expect, it } from 'vitest';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import { csrfToken, decryptFactor, encryptFactor, hashPassword, identityConfiguration, newOpaqueToken, newTotpSecret, safeHashMatch, tokenHash, verifyPassword, verifyTotp } from '../src/identity-security';
import { identityLink } from '../src/identity-mail';

describe('identity security primitives', () => {
  it('uses Argon2id with per-password salt and rejects bad credentials', async () => {
    const first = await hashPassword('a sufficiently long test password');
    const second = await hashPassword('a sufficiently long test password');
    expect(first).toMatch(/^\$argon2id\$/);
    expect(first).not.toBe(second);
    expect(await verifyPassword(first, 'a sufficiently long test password')).toBe(true);
    expect(await verifyPassword(first, 'wrong password')).toBe(false);
    expect(await verifyPassword('malformed', 'a sufficiently long test password')).toBe(false);
  }, 30_000);
  it('uses unpredictable opaque tokens and session-bound CSRF', () => {
    const key = Buffer.alloc(32, 1);
    const a = newOpaqueToken(), b = newOpaqueToken();
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toBe(b);
    const csrf = csrfToken(a, key);
    expect(csrf).not.toBe(csrfToken(b, key));
    expect(safeHashMatch(csrf, tokenHash(csrf))).toBe(true);
    expect(safeHashMatch('bad', tokenHash(csrf))).toBe(false);
  });
  it('encrypts TOTP seed with authentication and rejects tampering and replay', async () => {
    const key = Buffer.alloc(32, 3), secret = newTotpSecret();
    const encrypted = encryptFactor(secret, key);
    expect(encrypted.toString()).not.toContain(secret);
    expect(decryptFactor(encrypted, key)).toBe(secret);
    encrypted[15] ^= 1;
    expect(() => decryptFactor(encrypted, key)).toThrow();
    const totp = new TOTP({ secret, crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin(), period: 30, digits: 6 });
    const code = await totp.generate();
    const accepted = await verifyTotp(secret, code);
    expect(accepted).toBeTypeOf('number');
    expect(await verifyTotp(secret, code, accepted!)).toBeNull();
  });
  it('fails closed without a complete identity configuration', () => {
    expect(identityConfiguration.safeParse({ IDENTITY_ENABLED: 'true' }).success).toBe(false);
  });
  it('keeps email tokens in URL fragments so server requests do not carry them', () => {
    const url = new URL(identityLink('https://galung.id', 'password_reset', 'a'.repeat(64)));
    expect(url.pathname).toBe('/reset-password');
    expect(url.search).toBe('');
    expect(url.hash).toContain('token=');
  });
});
