import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { can, type Principal } from '@galung/authz';

const PERMISSION = 'galung.required_permission';
const PUBLIC = 'galung.public_route';
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION, permission);
export const PublicRoute = () => SetMetadata(PUBLIC, true);

// Phase 01 wiring only. Phase 02 must establish authenticated request principals
// and enforce record ownership at the query/service boundary.
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const permission = this.reflector.getAllAndOverride<string>(PERMISSION, [context.getHandler(), context.getClass()]);
    if (!permission) throw new ForbiddenException('Permission metadata missing');
    const request = context.switchToHttp().getRequest<{ principal?: Principal }>();
    if (!request.principal) throw new UnauthorizedException();
    if (!can(request.principal, permission)) throw new ForbiddenException();
    return true;
  }
}
