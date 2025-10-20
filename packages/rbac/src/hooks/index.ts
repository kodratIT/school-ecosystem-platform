'use client';

import { useMemo } from 'react';
import type { User, PermissionCheck, Permission } from '../types';
import { PermissionChecker } from '../core/permission-checker';

/**
 * Hook to check permissions
 */
export function usePermission(user: User | null, permissions: Permission[]) {
  const checker = useMemo(
    () => new PermissionChecker(permissions),
    [permissions]
  );

  const can = (check: PermissionCheck) => {
    if (!user) return false;
    return checker.can(user, check).allowed;
  };

  const canAny = (checks: PermissionCheck[]) => {
    if (!user) return false;
    return checker.canAny(user, checks).allowed;
  };

  const canAll = (checks: PermissionCheck[]) => {
    if (!user) return false;
    return checker.canAll(user, checks).allowed;
  };

  return { can, canAny, canAll };
}

/**
 * Hook to check role
 */
export function useRole(user: User | null) {
  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isSchoolAdmin = user?.role === 'school_admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isParent = user?.role === 'parent';
  const isFinanceStaff = user?.role === 'finance_staff';
  const isStaff = user?.role === 'staff';

  return {
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
    isParent,
    isFinanceStaff,
    isStaff,
  };
}

/**
 * Hook for permission-based component rendering
 */
export function useCanRender(
  user: User | null,
  permissions: Permission[],
  check: PermissionCheck
): boolean {
  const { can } = usePermission(user, permissions);
  return can(check);
}
