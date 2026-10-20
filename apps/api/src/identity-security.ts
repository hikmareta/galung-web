import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import * as argon2 from 'argon2';
import { NobleCryptoPlugin, ScureBase32Plugin, TOTP, generateSecret } from 'otplib';
import { z } from 'zod';

const positiveMinutes = z.coerce.number().int().positive().max(60 * 24 * 30);
const hexKey = z.string().regex(/^[0-9a-f]{64}$/i).transform(value => Buffer.from(value, 'hex'));
export const identityConfiguration = z.object({
  IDENTITY_ENABLED: z.literal('true'),
  CUSTOMER_ORIGIN: z.string().url().refine(value => new URL(value).origin === value),
  ADMIN_ORIGIN: z.string().url().refine(value => new URL(value).origin === value),
  IDENTITY_CSRF_KEY: hexKey,
  IDENTITY_ENCRYPTION_KEY: hexKey,
  IDENTITY_OUTBOX_KEY: hexKey,
  SESSION_CUSTOMER_IDLE_MINUTES: positiveMinutes,
  SESSION_CUSTOMER_ABSOLUTE_MINUTES: positiveMinutes,
  SESSION_ADMIN_IDLE_MINUTES: positiveMinutes,
  SESSION_ADMIN_ABSOLUTE_MINUTES: positiveMinutes,
  CHALLENGE_EMAIL_MINUTES: positiveMinutes,
  CHALLENGE_RESET_MINUTES: positiveMinutes,
  CHALLENGE_MFA_MINUTES: positiveMinutes,
  MFA_CHALLENGE_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(20),
  IDENTITY_MAIL_POLL_MS: z.coerce.number().int().min(1000).max(60000),
  IDENTITY_RATE_LIMIT_MAX: z.coerce.number().int().positive().max(1000),
  IDENTITY_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(60).max(86400),
  ARGON2_MEMORY_KIB: z.coerce.number().int().min(19456).max(262144),
  ARGON2_TIME_COST: z.coerce.number().int().min(2).max(10),
  ARGON2_PARALLELISM: z.coerce.number().int().min(1).max(4),
  LEGAL_TERMS_VERSION: z.string().min(1),
  LEGAL_TERMS_SHA256: hexKey,
  LEGAL_PRIVACY_VERSION: z.string().min(1),
  LEGAL_PRIVACY_SHA256: hexKey,
  SMTP_URL: z.string().url(),
  SMTP_FROM: z.string().email(),
}).superRefine((config, context) => {
  if (config.SESSION_CUSTOMER_IDLE_MINUTES > config.SESSION_CUSTOMER_ABSOLUTE_MINUTES ||
      config.SESSION_ADMIN_IDLE_MINUTES > config.SESSION_ADMIN_ABSOLUTE_MINUTES ||
      config.SESSION_ADMIN_ABSOLUTE_MINUTES > config.SESSION_CUSTOMER_ABSOLUTE_MINUTES)
    context.addIssue({ code: 'custom', message: 'Invalid session timeout ordering' });
  if (config.CUSTOMER_ORIGIN === config.ADMIN_ORIGIN) context.addIssue({ code: 'custom', message: 'Admin origin must be separate' });
  if (config.IDENTITY_CSRF_KEY.equals(config.IDENTITY_ENCRYPTION_KEY)) context.addIssue({ code: 'custom', message: 'Identity keys must differ' });
  if (config.IDENTITY_OUTBOX_KEY.equals(config.IDENTITY_ENCRYPTION_KEY) || config.IDENTITY_OUTBOX_KEY.equals(config.IDENTITY_CSRF_KEY)) context.addIssue({ code: 'custom', message: 'Identity keys must differ' });
});
export type IdentityConfiguration = z.infer<typeof identityConfiguration>;

export function passwordInput(value: unknown): string {
  return z.string().min(12).max(1024).parse(value);
}
export async function hashPassword(value: string, policy?: Pick<IdentityConfiguration, 'ARGON2_MEMORY_KIB' | 'ARGON2_TIME_COST' | 'ARGON2_PARALLELISM'>): Promise<string> {
  return argon2.hash(passwordInput(value), { type: argon2.argon2id,
    ...(policy ? { memoryCost: policy.ARGON2_MEMORY_KIB, timeCost: policy.ARGON2_TIME_COST, parallelism: policy.ARGON2_PARALLELISM } : {}) });
}
export async function verifyPassword(stored: string | null, candidate: string): Promise<boolean> {
  if (!stored || !stored.startsWith('$argon2id$')) return false;
  try { return await argon2.verify(stored, candidate); } catch { return false; }
}
export function newOpaqueToken(): string { return randomBytes(32).toString('hex'); }
export function tokenHash(value: string): Buffer { return createHash('sha256').update(value).digest(); }
export function csrfToken(sessionToken: string, key: Buffer): string { return createHmac('sha256', key).update(`galung-csrf-v1:${sessionToken}`).digest('hex'); }
export function safeHashMatch(value: string, expected: Buffer): boolean {
  return /^[a-f0-9]{64}$/i.test(value) && expected.length === 32 && timingSafeEqual(tokenHash(value), expected);
}
export function encryptFactor(secret: string, key: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, cipher.update(secret, 'utf8'), cipher.final(), cipher.getAuthTag()]);
}
export function decryptFactor(payload: Buffer, key: Buffer): string {
  if (payload.length < 29) throw new Error('Invalid encrypted factor');
  const iv = payload.subarray(0, 12), tag = payload.subarray(payload.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(payload.subarray(12, -16)), decipher.final()]).toString('utf8');
}
export function newTotpSecret(): string { return generateSecret(); }
export async function verifyTotp(secret: string, code: string, afterTimeStep?: number): Promise<number | null> {
  if (!/^\d{6}$/.test(code)) return null;
  const totp = new TOTP({ secret, crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin(), issuer: 'Galung.id', period: 30, digits: 6 });
  const result = await totp.verify(code, { epochTolerance: [30, 0], afterTimeStep });
  return result.valid ? result.timeStep : null;
}
