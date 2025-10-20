import type {
  Permission,
  PermissionCheck,
  PermissionResult,
  User,
} from '../types';

export class PermissionChecker {
  private permissions: Permission[] = [];
  private cache: Map<string, boolean> = new Map();

  constructor(permissions: Permission[] = []) {
    this.permissions = permissions;
  }

  /**
   * Check if user has permission
   */
  can(user: User, check: PermissionCheck): PermissionResult {
    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return { allowed: true, reason: 'Super admin' };
    }

    const cacheKey = `${user.id}:${check.resource}:${check.action}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return { allowed: this.cache.get(cacheKey)! };
    }

    // Check permissions
    const hasPermission = this.permissions.some(
      (p) => p.resource === check.resource && p.action === check.action
    );

    // Cache result
    this.cache.set(cacheKey, hasPermission);

    return {
      allowed: hasPermission,
      reason: hasPermission ? 'Permission granted' : 'Permission denied',
    };
  }

  /**
   * Check if user has any of the permissions
   */
  canAny(user: User, checks: PermissionCheck[]): PermissionResult {
    for (const check of checks) {
      const result = this.can(user, check);
      if (result.allowed) {
        return result;
      }
    }

    return { allowed: false, reason: 'No matching permissions' };
  }

  /**
   * Check if user has all permissions
   */
  canAll(user: User, checks: PermissionCheck[]): PermissionResult {
    for (const check of checks) {
      const result = this.can(user, check);
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true, reason: 'All permissions granted' };
  }

  /**
   * Clear permission cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Update permissions
   */
  updatePermissions(permissions: Permission[]) {
    this.permissions = permissions;
    this.clearCache();
  }
}
