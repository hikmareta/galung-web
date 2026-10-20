import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = JSON.parse(readFileSync(resolve('Documentation/galung_api_v1/openapi.json'), 'utf8'));
const overlay = JSON.parse(readFileSync(resolve('Documentation/galung_api_v1/identity-openapi-candidate.json'), 'utf8'));
const target = resolve('Documentation/galung_api_v1/identity-openapi-v2-review.json');
const paths = {};
const core = ['/auth/register','/auth/login','/auth/logout','/auth/session','/auth/email-verification/request',
  '/auth/email-verification/confirm','/auth/password-reset/request','/auth/password-reset/confirm','/auth/csrf','/me'];
const extra = ['/auth/mfa/enroll','/auth/mfa/enroll/confirm','/auth/mfa/complete','/auth/mfa/recovery',
  '/me/sessions','/me/sessions/{id}/revoke','/me/legal-acceptances'];
for (const path of core) paths[path] = structuredClone(source.paths[path]);
for (const path of extra) paths[path] = structuredClone(overlay.paths[path]);
paths['/me/privacy-requests'] = {
  get: { operationId: 'listOwnPrivacyRequests', summary: 'List own data requests', security: [{ customerCookie: [] }, { adminCookie: [] }],
    responses: { '200': { description: 'Own privacy requests' }, '401': { $ref: '#/components/responses/Unauthorized' } } },
  post: { operationId: 'requestOwnPrivacyAction', summary: 'Request export or deletion review; no automatic financial record erasure',
    security: [{ customerCookie: [], csrfToken: [] }, { adminCookie: [], csrfToken: [] }],
    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, required: ['kind'],
      properties: { kind: { type: 'string', enum: ['export','deletion'] } } } } } },
    responses: { '202': { description: 'Pending human review; duplicate pending request returns same id' },
      '400': { $ref: '#/components/responses/BadRequest' }, '401': { $ref: '#/components/responses/Unauthorized' },
      '403': { $ref: '#/components/responses/Forbidden' } } },
};
paths['/auth/login'].post = { ...overlay.paths['/auth/login'].post, requestBody: source.paths['/auth/login'].post.requestBody };
paths['/me'].patch = structuredClone(overlay.paths['/me'].patch);
paths['/auth/register'].post.responses['201'] = { description: 'Verification pending; no session cookie' };
paths['/auth/mfa/enroll'].post.security = [];
paths['/auth/mfa/enroll'].post.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', required: ['challengeId'], additionalProperties: false,
  properties: { challengeId: { type: 'string', format: 'uuid' } } } } } };
paths['/auth/mfa/enroll'].post.responses['200'] = { description: 'One-time TOTP enrollment secret for a valid first-factor challenge' };
paths['/auth/mfa/enroll'].post.responses['200'].content = { 'application/json': { schema: { type: 'object', required: ['secret'], properties: { secret: { type: 'string', writeOnly: true } } } } };
paths['/auth/mfa/enroll/confirm'].post.security = [];
paths['/auth/mfa/enroll/confirm'].post.responses = { '200': { description: 'Admin session and recovery codes shown once' },
  '400': { $ref: '#/components/responses/BadRequest' }, '401': { $ref: '#/components/responses/Unauthorized' }, '429': { $ref: '#/components/responses/RateLimited' } };
paths['/auth/mfa/enroll/confirm'].post.responses['200'].content = { 'application/json': { schema: { allOf: [
  { $ref: '#/components/schemas/Session' }, { type: 'object', required: ['recoveryCodes'], properties: { recoveryCodes: { type: 'array', minItems: 8, maxItems: 8, items: { type: 'string', writeOnly: true } } } } ] } } };
for (const path of ['/auth/mfa/complete','/auth/mfa/recovery']) {
  const op = paths[path].post;
  op.responses = { '200': { description: 'Admin session issued after MFA' }, '400': { $ref: '#/components/responses/BadRequest' },
    '401': { $ref: '#/components/responses/Unauthorized' }, '429': { $ref: '#/components/responses/RateLimited' } };
}
for (const path of ['/auth/mfa/enroll','/auth/mfa/enroll/confirm','/auth/mfa/complete','/auth/mfa/recovery']) paths[path].post.security = [];
paths['/auth/mfa/recovery'].post.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RecoveryChallenge' } } } };
paths['/auth/mfa/complete'].post.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MfaChallenge' } } } };
for (const path of ['/auth/register','/auth/login','/auth/email-verification/request','/auth/email-verification/confirm',
  '/auth/password-reset/request','/auth/password-reset/confirm']) paths[path].post.security = [];
for (const path of ['/auth/logout','/me/sessions/{id}/revoke']) paths[path].post.security = [
  { customerCookie: [], csrfToken: [] }, { adminCookie: [], csrfToken: [] } ];
paths['/me'].patch.security = [{ customerCookie: [], csrfToken: [] }, { adminCookie: [], csrfToken: [] }];
for (const path of ['/auth/session','/auth/csrf','/me','/me/sessions','/me/legal-acceptances']) {
  const method = path === '/me' ? 'get' : 'get';
  paths[path][method].security = [{ customerCookie: [] }, { adminCookie: [] }];
}
paths['/auth/session'].get.description = 'Requires X-Galung-Audience: admin for an admin cookie; defaults to customer.';
paths['/auth/csrf'].get.description = 'Returns a session-bound token; use X-Galung-Audience: admin for an admin cookie.';
paths['/me'].patch.requestBody.content['application/json'].schema = { $ref: '#/components/schemas/IdentityProfileUpdate' };
for (const method of ['get','patch']) paths['/me'][method].responses['200'] = { description: 'Current owner profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentityProfile' } } } };
for (const path of Object.values(paths)) {
  for (const operation of Object.values(path)) {
    for (const response of Object.values(operation.responses)) {
      for (const [key, nested] of Object.entries(response)) {
        if (/^\d{3}$/.test(key)) {
          operation.responses[key] ??= nested;
          delete response[key];
        }
      }
    }
  }
}
const contract = {
  openapi: '3.1.0',
  info: { title: 'Galung Phase 02 identity implementation contract', version: '0.2.0-review',
    description: 'Identity-only review revision. Reconciles ODL-007 overlay with canonical draft; requires Security, Tech Lead and QA review before freeze. No commercial API is promoted.' },
  servers: [{ url: '/api/v1' }],
  components: { ...source.components, securitySchemes: overlay.components.securitySchemes,
    schemas: { ...source.components.schemas, ...overlay.components.schemas,
      Register: { type: 'object', additionalProperties: false,
        required: ['email','password','displayName','countryCode','preferredLocale','termsVersion','privacyNoticeVersion','acceptTerms','acknowledgePrivacy'],
        properties: { email: { type: 'string', format: 'email', maxLength: 320 }, password: { type: 'string', minLength: 12, maxLength: 1024, writeOnly: true },
          displayName: { type: 'string', minLength: 1, maxLength: 150 }, countryCode: { type: 'string', pattern: '^[A-Z]{2}$' },
          preferredLocale: { type: 'string', enum: ['id-ID','en'] }, termsVersion: { type: 'string' }, privacyNoticeVersion: { type: 'string' },
          acceptTerms: { const: true }, acknowledgePrivacy: { const: true } } },
      Login: { type: 'object', additionalProperties: false, required: ['email','password','audience'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', writeOnly: true }, audience: { type: 'string', enum: ['customer','admin'] } } },
      MfaPending: { type: 'object', required: ['challengeId','expiresInMinutes','enrollmentRequired'],
        properties: { challengeId: { type: 'string', format: 'uuid' }, expiresInMinutes: { type: 'integer' }, enrollmentRequired: { type: 'boolean' } } },
      RecoveryChallenge: { type: 'object', additionalProperties: false, required: ['challengeId','recoveryCode'],
        properties: { challengeId: { type: 'string', format: 'uuid' }, recoveryCode: { type: 'string', pattern: '^[a-f0-9]{64}$' } } },
      Session: { type: 'object', required: ['id','audience','expiresAt','authLevel'],
        properties: { id: { type: 'string', format: 'uuid' }, audience: { type: 'string', enum: ['customer','admin'] },
          expiresAt: { type: 'string', format: 'date-time' }, authLevel: { type: 'string', enum: ['password','mfa'] } } },
      IdentityProfile: { type: 'object', required: ['id','email','preferredLocale'], properties: {
        id: { type: 'string', format: 'uuid' }, email: { type: 'string', format: 'email' }, displayName: { type: ['string','null'] },
        countryCode: { type: ['string','null'] }, preferredLocale: { type: 'string', enum: ['id-ID','en'] }, emailVerifiedAt: { type: ['string','null'], format: 'date-time' },
        legalBillingName: { type: ['string','null'] }, companyName: { type: ['string','null'] }, companyRegistrationId: { type: ['string','null'] } } },
      IdentityProfileUpdate: { type: 'object', additionalProperties: false, properties: {
        displayName: { type: 'string', minLength: 1, maxLength: 150 }, preferredLocale: { type: 'string', enum: ['id-ID','en'] },
        countryCode: { type: 'string', pattern: '^[A-Z]{2}$' }, legalBillingName: { type: 'string', minLength: 1, maxLength: 200 },
        companyName: { type: ['string','null'], maxLength: 200 }, companyRegistrationId: { type: ['string','null'], maxLength: 100 } } },
    },
    responses: { ...overlay.components.responses, BadRequest: { description: 'Invalid JSON or input', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } } },
  paths,
};
const output = JSON.stringify(contract, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Identity OpenAPI output is stale');
} else writeFileSync(target, output);
