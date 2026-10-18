import { expect, test } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { PermissionGuard, PublicRoute, RequirePermission } from '../src/authorization';

class FixtureController {
  @RequirePermission('admin.audit.read')
  readAudit() {}
  unprotected() {}
}
@PublicRoute()
class PublicFixture { read() {} }

function context(principal?: { id: string; permissions: string[]; mfaVerified: boolean }, handler = FixtureController.prototype.readAudit): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => FixtureController,
    switchToHttp: () => ({ getRequest: () => ({ principal }) }),
  } as unknown as ExecutionContext;
}

const guard = new PermissionGuard(new Reflector());
test('permission guard denies missing metadata and anonymous requests', () => {
  expect(() => guard.canActivate(context(undefined, FixtureController.prototype.unprotected))).toThrow(ForbiddenException);
  expect(() => guard.canActivate(context())).toThrow(UnauthorizedException);
});
test('public route metadata permits anonymous health-style access', () => {
  const publicContext = {
    getHandler: () => PublicFixture.prototype.read,
    getClass: () => PublicFixture,
  } as ExecutionContext;
  expect(guard.canActivate(publicContext)).toBe(true);
});
test('permission guard enforces permission and MFA', () => {
  expect(() => guard.canActivate(context({ id: 'staff', permissions: ['admin.audit.read'], mfaVerified: false }))).toThrow(ForbiddenException);
  expect(() => guard.canActivate(context({ id: 'staff', permissions: [], mfaVerified: true }))).toThrow(ForbiddenException);
  expect(guard.canActivate(context({ id: 'staff', permissions: ['admin.audit.read'], mfaVerified: true }))).toBe(true);
});
