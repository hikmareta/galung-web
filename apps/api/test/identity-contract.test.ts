import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const contract = JSON.parse(readFileSync(resolve(process.cwd(), '../../Documentation/galung_api_v1/identity-openapi-v2-review.json'), 'utf8'));
const expected = ['/auth/register','/auth/login','/auth/logout','/auth/session','/auth/email-verification/request',
  '/auth/email-verification/confirm','/auth/password-reset/request','/auth/password-reset/confirm','/auth/csrf',
  '/auth/mfa/enroll','/auth/mfa/enroll/confirm','/auth/mfa/complete','/auth/mfa/recovery',
  '/me','/me/sessions','/me/sessions/{id}/revoke','/me/legal-acceptances','/me/privacy-requests'];

describe('Phase 02 identity-only API contract', () => {
  it('has every implemented route and no malformed nested responses', () => {
    expect(Object.keys(contract.paths).sort()).toEqual(expected.sort());
    for (const path of Object.values(contract.paths) as Record<string, unknown>[]) {
      for (const operation of Object.values(path) as { responses: Record<string, unknown> }[]) {
        expect(Object.keys(operation.responses).every(code => /^\d{3}$/.test(code))).toBe(true);
        for (const response of Object.values(operation.responses) as Record<string, unknown>[]) {
          expect(Object.keys(response).every(key => !/^\d{3}$/.test(key))).toBe(true);
        }
      }
    }
  });
  it('resolves all local JSON references', () => {
    const refs: string[] = [];
    const collect = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        if (key === '$ref') refs.push(child as string);
        else collect(child);
      }
    };
    collect(contract);
    for (const ref of refs) {
      expect(ref).toMatch(/^#\//);
      let value: unknown = contract;
      for (const segment of ref.slice(2).split('/')) value = (value as Record<string, unknown>)?.[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
      expect(value, ref).toBeDefined();
    }
  });
  it('requires MFA before admin session and CSRF for browser mutations', () => {
    expect(contract.paths['/auth/login'].post.responses['202']).toBeDefined();
    expect(contract.paths['/auth/mfa/complete'].post.security).toEqual([]);
    expect(contract.paths['/auth/logout'].post.security).toEqual([{ customerCookie: [], csrfToken: [] }, { adminCookie: [], csrfToken: [] }]);
    expect(contract.paths['/me'].patch.security).toEqual([{ customerCookie: [], csrfToken: [] }, { adminCookie: [], csrfToken: [] }]);
  });
});
