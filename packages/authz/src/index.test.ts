import { expect, test } from 'vitest';
import { can } from './index';
const actor = { id: 'fixture-user-a', permissions: ['customer.read', 'admin.audit.read'], mfaVerified: false };
test('denies anonymous and foreign owner', () => { expect(can(null, 'customer.read')).toBe(false); expect(can(actor, 'customer.read', 'fixture-user-b')).toBe(false); });
test('denies privileged action without MFA', () => expect(can(actor, 'admin.audit.read')).toBe(false));
test('allows owner permission', () => expect(can(actor, 'customer.read', actor.id)).toBe(true));
