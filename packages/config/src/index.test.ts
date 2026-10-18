import { expect, test } from 'vitest';
import { parseConfig } from './index';
const valid = { NODE_ENV: 'development', APP_ENV: 'local', DATABASE_URL: 'postgresql://local:local@localhost:5432/db', REDIS_URL: 'redis://localhost:6379', NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4000' };
test('accepts local configuration', () => expect(parseConfig(valid).API_PORT).toBe(4000));
test('rejects missing database', () => expect(() => parseConfig({ ...valid, DATABASE_URL: undefined })).toThrow());
test('rejects staging with local services', () => expect(() => parseConfig({ ...valid, APP_ENV: 'staging' })).toThrow());
