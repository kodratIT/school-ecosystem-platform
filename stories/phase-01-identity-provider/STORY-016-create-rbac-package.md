# STORY-016: Create @repo/rbac Package

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 4  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create an RBAC (Role-Based Access Control) package** so that **applications can check user permissions consistently across the entire ecosystem**.

This package provides permission checking, role management, and access control utilities.

---

## 🎯 Goals

- Create @repo/rbac package
- Implement permission checker
- Create role-based guards
- Support resource-based permissions
- Implement permission caching
- Create React hooks for permissions
- Full TypeScript support

---

## ✅ Acceptance Criteria

- [ ] Package created with proper structure
- [ ] Permission checker implemented
- [ ] Role-based checks
- [ ] Resource-based permissions
- [ ] Permission caching
- [ ] React hooks for client
- [ ] Server-side utilities
- [ ] Type-safe permission checks
- [ ] Tests with >80% coverage

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

mkdir -p packages/rbac/src/{core,hooks,utils,types}
mkdir -p packages/rbac/__tests__

ls -R packages/rbac/
```

---

### Task 2: Create package.json

**File:** `packages/rbac/package.json`

```json
{
  "name": "@repo/rbac",
  "version": "0.1.0",
  "private": true,
  "description": "Role-Based Access Control for the school ecosystem",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "import": "./dist/hooks/index.mjs",
      "require": "./dist/hooks/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts src/hooks/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts src/hooks/index.ts --format esm,cjs --dts --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/types": "workspace:*",
    "@repo/database-identity": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "@types/jest": "^29.5.11",
    "@types/react": "^18.2.0",
    "jest": "^29.7.0",
    "react": "^18.2.0",
    "ts-jest": "^29.1.1",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  }
}
```

---

### Task 3: Create Permission Types

**File:** `packages/rbac/src/types/index.ts`

```typescript
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  role: string;
  schoolId?: string;
  roles?: Role[];
}

export type PermissionCheck = {
  resource: string;
  action: string;
};

export type PermissionResult = {
  allowed: boolean;
  reason?: string;
};
```

---

### Task 4: Create Permission Checker

**File:** `packages/rbac/src/core/permission-checker.ts`

```typescript
import type { Permission, PermissionCheck, PermissionResult, User } from '../types';

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
```

---

### Task 5: Create Permission Guards

**File:** `packages/rbac/src/core/guards.ts`

```typescript
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
```

---

### Task 6: Create React Hooks

**File:** `packages/rbac/src/hooks/index.ts`

```typescript
'use client';

import { useMemo } from 'react';
import type { User, PermissionCheck } from '../types';
import { PermissionChecker } from '../core/permission-checker';

/**
 * Hook to check permissions
 */
export function usePermission(user: User | null, permissions: any[]) {
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

  return {
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
    isParent,
  };
}

/**
 * Hook for permission-based component rendering
 */
export function useCanRender(
  user: User | null,
  permissions: any[],
  check: PermissionCheck
): boolean {
  const { can } = usePermission(user, permissions);
  return can(check);
}
```

---

### Task 7: Create Utility Functions

**File:** `packages/rbac/src/utils/permission-builder.ts`

```typescript
import type { PermissionCheck } from '../types';

/**
 * Build permission check object
 */
export function permission(resource: string, action: string): PermissionCheck {
  return { resource, action };
}

/**
 * Common permission builders
 */
export const Permissions = {
  // Users
  createUser: () => permission('users', 'create'),
  readUser: () => permission('users', 'read'),
  updateUser: () => permission('users', 'update'),
  deleteUser: () => permission('users', 'delete'),
  listUsers: () => permission('users', 'list'),

  // Schools
  createSchool: () => permission('schools', 'create'),
  readSchool: () => permission('schools', 'read'),
  updateSchool: () => permission('schools', 'update'),
  deleteSchool: () => permission('schools', 'delete'),
  listSchools: () => permission('schools', 'list'),

  // Students
  createStudent: () => permission('students', 'create'),
  readStudent: () => permission('students', 'read'),
  updateStudent: () => permission('students', 'update'),
  deleteStudent: () => permission('students', 'delete'),
  listStudents: () => permission('students', 'list'),

  // Grades
  createGrade: () => permission('grades', 'create'),
  readGrade: () => permission('grades', 'read'),
  updateGrade: () => permission('grades', 'update'),
  deleteGrade: () => permission('grades', 'delete'),

  // Roles
  assignRole: () => permission('roles', 'assign'),
  revokeRole: () => permission('roles', 'revoke'),

  // Custom permission
  custom: (resource: string, action: string) => permission(resource, action),
};
```

---

### Task 8: Create Permission Components

**File:** `packages/rbac/src/components/Can.tsx`

```typescript
'use client';

import type { ReactNode } from 'react';
import type { User, PermissionCheck } from '../types';
import { usePermission } from '../hooks';

interface CanProps {
  user: User | null;
  permissions: any[];
  do: PermissionCheck;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render based on permission
 */
export function Can({ user, permissions, do: check, children, fallback = null }: CanProps) {
  const { can } = usePermission(user, permissions);

  if (!can(check)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

### Task 9: Create Main Exports

**File:** `packages/rbac/src/index.ts`

```typescript
// Core
export { PermissionChecker } from './core/permission-checker';
export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireSameSchool,
  hasRole,
  isSameSchool,
} from './core/guards';

// Utils
export { permission, Permissions } from './utils/permission-builder';

// Types
export type {
  Permission,
  Role,
  User,
  PermissionCheck,
  PermissionResult,
} from './types';

// Components (re-export for convenience)
export { Can } from './components/Can';
```

**File:** `packages/rbac/src/hooks/index.ts` (already created above)

---

### Task 10: Create Tests

**File:** `packages/rbac/__tests__/permission-checker.test.ts`

```typescript
import { PermissionChecker } from '../src/core/permission-checker';
import type { User, Permission } from '../src/types';

describe('PermissionChecker', () => {
  const permissions: Permission[] = [
    { id: '1', name: 'users.create', resource: 'users', action: 'create' },
    { id: '2', name: 'users.read', resource: 'users', action: 'read' },
  ];

  const user: User = {
    id: 'user-1',
    role: 'teacher',
    schoolId: 'school-1',
  };

  const superAdmin: User = {
    id: 'admin-1',
    role: 'super_admin',
  };

  let checker: PermissionChecker;

  beforeEach(() => {
    checker = new PermissionChecker(permissions);
  });

  it('should allow super admin all permissions', () => {
    const result = checker.can(superAdmin, { resource: 'anything', action: 'anything' });
    expect(result.allowed).toBe(true);
  });

  it('should check user permissions', () => {
    const result = checker.can(user, { resource: 'users', action: 'create' });
    expect(result.allowed).toBe(true);
  });

  it('should deny permission not granted', () => {
    const result = checker.can(user, { resource: 'users', action: 'delete' });
    expect(result.allowed).toBe(false);
  });

  it('should cache permission checks', () => {
    checker.can(user, { resource: 'users', action: 'read' });
    checker.can(user, { resource: 'users', action: 'read' });
    // Second call should use cache
  });

  it('should clear cache', () => {
    checker.can(user, { resource: 'users', action: 'read' });
    checker.clearCache();
    // Cache cleared
  });
});
```

---

### Task 11: Create README

**File:** `packages/rbac/README.md`

```markdown
# @repo/rbac

Role-Based Access Control for the school ecosystem.

## Installation

\`\`\`typescript
import { PermissionChecker, Permissions } from '@repo/rbac';
\`\`\`

## Usage

### Server-Side

\`\`\`typescript
import { requirePermission, Permissions } from '@repo/rbac';

async function deleteUser(userId: string) {
  const user = await getCurrentUser();
  const checker = new PermissionChecker(userPermissions);
  
  requirePermission(user, checker, Permissions.deleteUser());
  
  // Delete user...
}
\`\`\`

### React Hooks

\`\`\`typescript
import { usePermission, Permissions } from '@repo/rbac/hooks';

function UserActions({ user }) {
  const { can } = usePermission(currentUser, permissions);
  
  return (
    <div>
      {can(Permissions.updateUser()) && (
        <button>Edit</button>
      )}
      {can(Permissions.deleteUser()) && (
        <button>Delete</button>
      )}
    </div>
  );
}
\`\`\`

### Permission Component

\`\`\`typescript
import { Can, Permissions } from '@repo/rbac';

<Can user={user} permissions={permissions} do={Permissions.deleteUser()}>
  <button>Delete User</button>
</Can>
\`\`\`

## API

### PermissionChecker

- `can(user, check)` - Check single permission
- `canAny(user, checks)` - Check any permission
- `canAll(user, checks)` - Check all permissions

### Guards

- `requirePermission(user, checker, check)` - Throws if not allowed
- `requireRole(user, role)` - Require specific role
- `requireSameSchool(user, schoolId)` - Require same school

### Hooks

- `usePermission(user, permissions)` - Permission checking hook
- `useRole(user)` - Role checking hook
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Run Tests

```bash
cd packages/rbac
pnpm test
```

**Expected:** All tests pass

---

### Test 2: Test Permission Checking

```typescript
import { PermissionChecker, Permissions } from '@repo/rbac';

const checker = new PermissionChecker(permissions);
const result = checker.can(user, Permissions.createUser());

console.log('Can create user:', result.allowed);
```

---

### Test 3: Test Guards

```typescript
import { requirePermission, requireRole } from '@repo/rbac';

try {
  requireRole(user, 'super_admin');
  console.log('User is super admin');
} catch (error) {
  console.error('Access denied');
}
```

---

## 📸 Expected Results

```
packages/rbac/
├── src/
│   ├── core/
│   │   ├── permission-checker.ts  ✅ Permission logic
│   │   └── guards.ts              ✅ Guards
│   ├── hooks/
│   │   └── index.ts               ✅ React hooks
│   ├── utils/
│   │   └── permission-builder.ts  ✅ Builders
│   ├── components/
│   │   └── Can.tsx                ✅ Can component
│   ├── types/
│   │   └── index.ts               ✅ Types
│   └── index.ts                   ✅ Main export
├── __tests__/                     ✅ Tests
└── README.md                      ✅ Docs
```

---

## ❌ Common Errors & Solutions

### Error: "Permission denied"

**Cause:** User doesn't have permission

**Solution:** Check user roles and permissions in database

---

### Error: "React hooks error"

**Cause:** Using hooks in server component

**Solution:** Add `'use client'` directive

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-014 (Database package)
  - STORY-002 (TypeScript config)
- **Blocks**: STORY-017 (IdP App)

---

## 💡 Tips

1. **Cache permissions** - Reduces database queries
2. **Super admin bypass** - Always allow super_admin
3. **Clear cache** - After permission changes
4. **Use guards** - For API routes
5. **Use hooks** - For UI components

---

## ✏️ Definition of Done

- [ ] Package created and built
- [ ] Permission checker implemented
- [ ] Guards implemented
- [ ] React hooks created
- [ ] Components created
- [ ] Tests >80% coverage
- [ ] Documentation complete
- [ ] Can be used in apps

---

**Created**: 2024  
**Story Owner**: Development Team
