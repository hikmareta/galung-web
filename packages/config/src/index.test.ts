import { expect, test } from 'vitest';
import { parseConfig } from './index';
const valid = { NODE_ENV: 'development', APP_ENV: 'local', DATABASE_URL: 'postgresql://local:local@localhost:5432/db', REDIS_URL: 'redis://localhost:6379', NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4000' };
test('accepts local configuration', () => expect(parseConfig(valid).API_PORT).toBe(4000));
test('rejects missing database', () => expect(() => parseConfig({ ...valid, DATABASE_URL: undefined })).toThrow());
test('rejects staging with local services', () => expect(() => parseConfig({ ...valid, APP_ENV: 'staging' })).toThrow());
test('rejects production endpoints without TLS', () => expect(() => parseConfig({ ...valid, NODE_ENV: 'production', APP_ENV: 'production', DATABASE_URL: 'postgresql://app@db.internal:5432/galung', REDIS_URL: 'redis://redis.internal:6379', NEXT_PUBLIC_API_BASE_URL: 'http://api.internal' })).toThrow());
test('accepts production TLS endpoints', () => expect(parseConfig({ ...valid, NODE_ENV: 'production', APP_ENV: 'production', DATABASE_URL: 'postgresql://app@db.internal:5432/galung?sslmode=verify-full', REDIS_URL: 'rediss://redis.internal:6379', NEXT_PUBLIC_API_BASE_URL: 'https://api.galung.id' }).APP_ENV).toBe('production'));
