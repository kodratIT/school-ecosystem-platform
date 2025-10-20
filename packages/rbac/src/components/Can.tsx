'use client';

import type { ReactNode } from 'react';
import type { User, PermissionCheck, Permission } from '../types';
import { usePermission } from '../hooks';

interface CanProps {
  user: User | null;
  permissions: Permission[];
  do: PermissionCheck;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render based on permission
 */
export function Can({
  user,
  permissions,
  do: check,
  children,
  fallback = null,
}: CanProps) {
  const { can } = usePermission(user, permissions);

  if (!can(check)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
