export type Principal = { id: string; permissions: readonly string[]; mfaVerified: boolean };
export function can(principal: Principal | null, permission: string, ownerId?: string): boolean {
  if (!principal) return false;
  if (permission.startsWith('admin.') && !principal.mfaVerified) return false;
  if (ownerId !== undefined && principal.id !== ownerId && !principal.permissions.includes('admin.customer.read')) return false;
  return principal.permissions.includes(permission);
}
