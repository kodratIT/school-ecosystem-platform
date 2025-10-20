import type { User, PermissionCheck } from '../types';
import { PermissionChecker } from './permission-checker';

/**
 * Require permission (throws if not allowed)
 */
export function requirePermission(
  user: User,
  checker: PermissionChecker,
  check: PermissionCheck
): void {
  const result = checker.can(user, check);

  if (!result.allowed) {
    throw new Error(`Permission denied: ${check.resource}.${check.action}`);
  }
}

/**
 * Require any of permissions
 */
export function requireAnyPermission(
  user: User,
  checker: PermissionChecker,
  checks: PermissionCheck[]
): void {
  const result = checker.canAny(user, checks);

  if (!result.allowed) {
    throw new Error('Permission denied: None of the required permissions');
  }
}

/**
 * Require all permissions
 */
export function requireAllPermissions(
  user: User,
  checker: PermissionChecker,
  checks: PermissionCheck[]
): void {
  const result = checker.canAll(user, checks);

  if (!result.allowed) {
    throw new Error('Permission denied: Missing required permissions');
  }
}

/**
 * Require role
 */
export function requireRole(user: User, role: string | string[]): void {
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role)) {
    throw new Error(`Role required: ${roles.join(' or ')}`);
  }
}

/**
 * Check if user has role
 */
export function hasRole(user: User, role: string): boolean {
  return user.role === role;
}

/**
 * Check if user is in same school
 */
export function isSameSchool(user: User, schoolId: string): boolean {
  return user.schoolId === schoolId;
}

/**
 * Require same school
 */
export function requireSameSchool(user: User, schoolId: string): void {
  if (!isSameSchool(user, schoolId)) {
    throw new Error('Access denied: Different school');
  }
}
