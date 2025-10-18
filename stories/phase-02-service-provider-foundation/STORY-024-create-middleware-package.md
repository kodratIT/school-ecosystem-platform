# STORY-024: Create Middleware Package

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 3 (Day 4-5)  
**Story Points**: 8  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a reusable middleware package** so that **Service Provider applications can easily implement authentication, authorization (RBAC), and tenant context with a composable middleware chain**.

---

## 🎯 Goals

- Create middleware package with auth, RBAC, and tenant middleware
- Implement middleware chain composer for sequential execution
- JWT token verification in auth middleware
- Permission and role checking in RBAC middleware
- School context setting in tenant middleware
- Type-safe middleware functions

---

## ✅ Acceptance Criteria

- [ ] Package directory structure created
- [ ] Auth middleware implemented (JWT verification)
- [ ] RBAC middleware implemented (permission/role checking)
- [ ] Tenant middleware implemented (school context)
- [ ] Middleware chain composer created
- [ ] Type definitions exported
- [ ] package.json configured
- [ ] Works with Next.js 14+ middleware
- [ ] pnpm type-check passes

---

## 🔗 Prerequisites

```bash
# Verify previous stories complete
test -d packages/auth-client && echo "✅ Auth client exists"
test -f packages/auth-client/src/jwt-utils.ts && echo "✅ JWT utils available"
```

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create directory
mkdir -p packages/middleware/src

cd packages/middleware
```

---

### Task 2: Create package.json

**File**: `packages/middleware/package.json`

```json
{
  "name": "@repo/middleware",
  "version": "0.0.0",
  "private": true,
  "description": "Reusable middleware for Service Providers",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@repo/auth-client": "workspace:*",
    "@repo/types": "workspace:*",
    "jose": "^5.2.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^20.11.5",
    "next": "^14.1.0",
    "typescript": "^5.3.3"
  },
  "peerDependencies": {
    "next": "^14.0.0"
  }
}
```

**Install:**
```bash
pnpm install
```

---

### Task 3: Create TypeScript Config

**File**: `packages/middleware/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Create Type Definitions

**File**: `packages/middleware/src/types.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware function signature
 * Takes request and shared context, returns response or void
 */
export type MiddlewareFunction = (
  request: NextRequest,
  context: MiddlewareContext
) => Promise<NextResponse | void>;

/**
 * Shared context passed between middleware
 * Can be extended by middleware to pass data to next middleware
 */
export interface MiddlewareContext {
  user?: {
    id: string;
    email: string;
    schoolId: string;
    roles: string[];
    permissions: string[];
  };
  [key: string]: any;
}

/**
 * Auth middleware configuration
 */
export interface AuthMiddlewareConfig {
  /**
   * Paths that don't require authentication
   * @example ['/login', '/register', '/api/health']
   */
  publicPaths?: string[];
  
  /**
   * Where to redirect unauthenticated users
   * @default '/login'
   */
  redirectTo?: string;
}

/**
 * RBAC middleware configuration
 */
export interface RBACMiddlewareConfig {
  /**
   * Required permission to access route
   * @example 'students.read'
   */
  requiredPermission?: string;
  
  /**
   * Required role to access route
   * @example 'teacher'
   */
  requiredRole?: string;
  
  /**
   * Where to redirect unauthorized users
   * @default '/unauthorized'
   */
  deniedRedirect?: string;
}
```

---

### Task 5: Implement Auth Middleware

**File**: `packages/middleware/src/auth-middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getToken } from '@repo/auth-client';
import type { MiddlewareFunction, AuthMiddlewareConfig } from './types';

/**
 * Authentication middleware
 * Verifies JWT token and extracts user information
 * 
 * Features:
 * - Public path bypass
 * - JWT token verification
 * - Automatic redirect to login
 * - Token expiration handling
 * - User context injection
 * 
 * @example
 * const authMiddleware = createAuthMiddleware({
 *   publicPaths: ['/login', '/api/health'],
 *   redirectTo: '/login'
 * });
 */
export function createAuthMiddleware(
  config: AuthMiddlewareConfig = {}
): MiddlewareFunction {
  const {
    publicPaths = ['/login', '/register', '/api/health'],
    redirectTo = '/login',
  } = config;

  return async (request, context) => {
    const { pathname } = request.nextUrl;

    // Check if path is public (no auth required)
    const isPublicPath = publicPaths.some(path => 
      pathname.startsWith(path)
    );

    if (isPublicPath) {
      // Allow access to public paths
      return;
    }

    // Get token from cookie
    const token = getToken();

    if (!token) {
      // No token - redirect to login
      const loginUrl = new URL(redirectTo, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      // Invalid or expired token - clear and redirect
      const response = NextResponse.redirect(
        new URL(redirectTo, request.url)
      );
      
      // Clear invalid token
      response.cookies.delete('ekosistem_auth_token');
      
      return response;
    }

    // Token is valid - add user to context for next middleware
    context.user = {
      id: payload.user_id,
      email: payload.email,
      schoolId: payload.school_id,
      roles: payload.roles,
      permissions: payload.permissions,
    };

    // Continue to next middleware
  };
}
```

---

### Task 6: Implement RBAC Middleware

**File**: `packages/middleware/src/rbac-middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFunction, RBACMiddlewareConfig } from './types';

/**
 * RBAC (Role-Based Access Control) middleware
 * Checks user permissions and roles before allowing access
 * 
 * Features:
 * - Permission-based access control
 * - Role-based access control
 * - Custom denied redirect
 * - Requires auth middleware to run first
 * 
 * @example
 * // Require specific permission
 * const rbacMiddleware = createRBACMiddleware({
 *   requiredPermission: 'students.read'
 * });
 * 
 * @example
 * // Require specific role
 * const rbacMiddleware = createRBACMiddleware({
 *   requiredRole: 'teacher'
 * });
 */
export function createRBACMiddleware(
  config: RBACMiddlewareConfig = {}
): MiddlewareFunction {
  const {
    requiredPermission,
    requiredRole,
    deniedRedirect = '/unauthorized',
  } = config;

  return async (request, context) => {
    const { user } = context;

    // User must exist (from auth middleware)
    if (!user) {
      throw new Error(
        'RBAC middleware requires auth middleware to run first. ' +
        'Ensure createAuthMiddleware() is before createRBACMiddleware() in chain.'
      );
    }

    // Check permission
    if (requiredPermission) {
      const hasPermission = user.permissions.includes(requiredPermission);
      
      if (!hasPermission) {
        const deniedUrl = new URL(deniedRedirect, request.url);
        deniedUrl.searchParams.set('reason', 'missing_permission');
        deniedUrl.searchParams.set('required', requiredPermission);
        
        return NextResponse.redirect(deniedUrl);
      }
    }

    // Check role
    if (requiredRole) {
      const hasRole = user.roles.includes(requiredRole);
      
      if (!hasRole) {
        const deniedUrl = new URL(deniedRedirect, request.url);
        deniedUrl.searchParams.set('reason', 'missing_role');
        deniedUrl.searchParams.set('required', requiredRole);
        
        return NextResponse.redirect(deniedUrl);
      }
    }

    // User has required permissions/roles - continue
  };
}

/**
 * Helper: Create permission-based middleware
 * 
 * @example
 * const middleware = requirePermission('students.read');
 */
export function requirePermission(permission: string): MiddlewareFunction {
  return createRBACMiddleware({ requiredPermission: permission });
}

/**
 * Helper: Create role-based middleware
 * 
 * @example
 * const middleware = requireRole('teacher');
 */
export function requireRole(role: string): MiddlewareFunction {
  return createRBACMiddleware({ requiredRole: role });
}
```

---

### Task 7: Implement Tenant Middleware

**File**: `packages/middleware/src/tenant-middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFunction } from './types';

/**
 * Tenant middleware
 * Sets school context in request headers for RLS (Row Level Security)
 * 
 * Features:
 * - Injects school_id into request headers
 * - Injects user_id into request headers
 * - Required for multi-tenant data isolation
 * - Headers available in API routes and server components
 * 
 * Headers set:
 * - x-school-id: Current user's school ID
 * - x-user-id: Current user's ID
 * 
 * @example
 * // In API route, access headers:
 * const schoolId = headers().get('x-school-id');
 * const userId = headers().get('x-user-id');
 */
export function createTenantMiddleware(): MiddlewareFunction {
  return async (request, context) => {
    const { user } = context;

    // User must exist (from auth middleware)
    if (!user) {
      throw new Error(
        'Tenant middleware requires auth middleware to run first. ' +
        'Ensure createAuthMiddleware() is before createTenantMiddleware() in chain.'
      );
    }

    // Clone request headers and add tenant context
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-id', user.schoolId);
    requestHeaders.set('x-user-id', user.id);

    // Create response with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Also add to response headers (useful for debugging)
    response.headers.set('x-school-id', user.schoolId);
    response.headers.set('x-user-id', user.id);

    return response;
  };
}
```

---

### Task 8: Implement Chain Composer

**File**: `packages/middleware/src/chain.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFunction, MiddlewareContext } from './types';

/**
 * Chain multiple middleware functions
 * Executes middleware in order: middleware1 → middleware2 → ...
 * 
 * Features:
 * - Sequential execution
 * - Shared context between middleware
 * - Early termination if middleware returns response
 * - Context passing for data sharing
 * 
 * @example
 * export default chain(
 *   createAuthMiddleware(),
 *   createTenantMiddleware()
 * );
 * 
 * @example
 * // With RBAC
 * export default chain(
 *   createAuthMiddleware(),
 *   requirePermission('students.read'),
 *   createTenantMiddleware()
 * );
 */
export function chain(...middlewares: MiddlewareFunction[]) {
  return async (request: NextRequest) => {
    // Shared context passed between all middleware
    const context: MiddlewareContext = {};

    // Execute each middleware in order
    for (const middleware of middlewares) {
      try {
        const result = await middleware(request, context);
        
        // If middleware returns a response, stop chain
        if (result instanceof NextResponse) {
          return result;
        }
      } catch (error) {
        console.error('Middleware error:', error);
        
        // Return 500 on middleware error
        return new NextResponse('Internal Server Error', {
          status: 500,
        });
      }
    }

    // All middleware passed, continue to route
    return NextResponse.next();
  };
}
```

---

### Task 9: Create Main Index

**File**: `packages/middleware/src/index.ts`

```typescript
// Middleware factories
export { createAuthMiddleware } from './auth-middleware';
export {
  createRBACMiddleware,
  requirePermission,
  requireRole,
} from './rbac-middleware';
export { createTenantMiddleware } from './tenant-middleware';

// Chain composer
export { chain } from './chain';

// Types
export type {
  MiddlewareFunction,
  MiddlewareContext,
  AuthMiddlewareConfig,
  RBACMiddlewareConfig,
} from './types';
```

---

### Task 10: Create README

**File**: `packages/middleware/README.md`

```markdown
# Middleware Package

Reusable middleware for Service Provider applications.

## Features

- **Auth Middleware**: JWT verification and user authentication
- **RBAC Middleware**: Permission and role-based access control
- **Tenant Middleware**: Multi-tenant context setting
- **Chain Composer**: Sequential middleware execution

## Installation

Already installed as workspace package: `@repo/middleware`

## Usage

### Basic Setup

\`\`\`typescript
// middleware.ts
import { 
  chain,
  createAuthMiddleware,
  createTenantMiddleware 
} from '@repo/middleware';

export default chain(
  createAuthMiddleware({
    publicPaths: ['/login', '/api/health'],
  }),
  createTenantMiddleware()
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
\`\`\`

### With RBAC

\`\`\`typescript
import { 
  chain,
  createAuthMiddleware,
  requirePermission,
  createTenantMiddleware 
} from '@repo/middleware';

export default chain(
  createAuthMiddleware(),
  requirePermission('students.read'), // Require permission
  createTenantMiddleware()
);
\`\`\`

### Public Paths

\`\`\`typescript
createAuthMiddleware({
  publicPaths: [
    '/login',
    '/register',
    '/api/health',
    '/api/public',
  ],
})
\`\`\`

### Access User in API Route

\`\`\`typescript
// app/api/students/route.ts
import { headers } from 'next/headers';

export async function GET() {
  const schoolId = headers().get('x-school-id');
  const userId = headers().get('x-user-id');
  
  // Use for database queries
  const students = await getStudents(schoolId);
  
  return Response.json(students);
}
\`\`\`

## Middleware Order

**IMPORTANT**: Middleware must run in this order:

1. **Auth** - Verifies JWT and sets user context
2. **RBAC** (optional) - Checks permissions/roles
3. **Tenant** - Sets school context headers

\`\`\`typescript
// ✅ Correct order
chain(
  createAuthMiddleware(),    // 1. Auth first
  requirePermission('...'),  // 2. RBAC second (optional)
  createTenantMiddleware()   // 3. Tenant last
)

// ❌ Wrong order - will error
chain(
  createTenantMiddleware(),  // Error: needs user from auth
  createAuthMiddleware()
)
\`\`\`

## API

### createAuthMiddleware(config?)

Verifies JWT token and authenticates user.

**Config:**
- `publicPaths`: Array of paths that don't require auth
- `redirectTo`: Where to redirect unauthenticated users

### createRBACMiddleware(config?)

Checks user permissions and roles.

**Config:**
- `requiredPermission`: Permission string (e.g., 'students.read')
- `requiredRole`: Role string (e.g., 'teacher')
- `deniedRedirect`: Where to redirect unauthorized users

### requirePermission(permission)

Helper to create permission-based middleware.

### requireRole(role)

Helper to create role-based middleware.

### createTenantMiddleware()

Sets school context in request headers.

### chain(...middlewares)

Chains multiple middleware functions.

## Troubleshooting

### Error: "RBAC middleware requires auth middleware to run first"

**Fix**: Put auth middleware before RBAC in chain:
\`\`\`typescript
chain(
  createAuthMiddleware(), // Must be first
  createRBACMiddleware()
)
\`\`\`

### Headers not available in API route

**Check**:
1. Tenant middleware is in chain
2. Middleware matcher includes the route
3. Using `headers()` from 'next/headers'

### Redirect loop

**Check**:
1. Login page is in publicPaths
2. redirectTo path exists
3. No conflicting middleware
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Package Builds

```bash
cd packages/middleware
pnpm type-check
# Should pass with 0 errors
```

### Test 2: Create Test Middleware File

**File**: `test-middleware.ts`

```typescript
import {
  chain,
  createAuthMiddleware,
  createTenantMiddleware
} from './src/index';

const middleware = chain(
  createAuthMiddleware(),
  createTenantMiddleware()
);

console.log('✅ Middleware created successfully');
console.log('Type:', typeof middleware); // Should be 'function'
```

Run:
```bash
npx tsx test-middleware.ts
rm test-middleware.ts
```

### Test 3: Type Check Imports

```typescript
import type {
  MiddlewareFunction,
  MiddlewareContext,
  AuthMiddlewareConfig
} from './src/types';

const config: AuthMiddlewareConfig = {
  publicPaths: ['/login'],
  redirectTo: '/login'
};

console.log('✅ Types imported successfully');
```

---

## 📸 Expected Results

```
packages/middleware/
├── package.json          ✅
├── tsconfig.json        ✅
├── README.md            ✅
└── src/
    ├── index.ts         ✅
    ├── types.ts         ✅
    ├── auth-middleware.ts      ✅
    ├── rbac-middleware.ts      ✅
    ├── tenant-middleware.ts    ✅
    └── chain.ts         ✅
```

**Terminal:**
```bash
$ pnpm type-check
✓ Type check passed

$ pnpm list --depth 0
@repo/middleware
├── @repo/auth-client workspace:*
├── jose 5.2.0
└── next 14.1.0
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module 'next/server'"

```bash
cd packages/middleware
pnpm add -D next@latest
```

### Error: "Middleware requires auth middleware to run first"

**Cause:** Wrong middleware order in chain

**Fix:**
```typescript
// ✅ Correct
chain(
  createAuthMiddleware(),  // First
  createTenantMiddleware() // Second
)

// ❌ Wrong
chain(
  createTenantMiddleware(), // Errors - needs user from auth
  createAuthMiddleware()
)
```

### Error: "user is undefined in RBAC middleware"

**Cause:** Auth middleware not running or not in chain

**Fix:** Ensure auth middleware is first in chain

---

## 💡 Usage Examples

### Example 1: Basic Auth Only

```typescript
// middleware.ts
import { chain, createAuthMiddleware } from '@repo/middleware';

export default chain(
  createAuthMiddleware()
);
```

### Example 2: Auth + Tenant (Recommended)

```typescript
import { 
  chain, 
  createAuthMiddleware, 
  createTenantMiddleware 
} from '@repo/middleware';

export default chain(
  createAuthMiddleware({
    publicPaths: ['/login', '/register'],
  }),
  createTenantMiddleware()
);
```

### Example 3: With Permission Check

```typescript
import { 
  chain, 
  createAuthMiddleware,
  requirePermission,
  createTenantMiddleware 
} from '@repo/middleware';

export default chain(
  createAuthMiddleware(),
  requirePermission('students.read'),
  createTenantMiddleware()
);
```

### Example 4: Conditional Middleware

```typescript
import { 
  chain, 
  createAuthMiddleware,
  createRBACMiddleware,
  createTenantMiddleware,
  type MiddlewareFunction
} from '@repo/middleware';

// Only apply RBAC to admin routes
const conditionalRBAC: MiddlewareFunction = async (request, context) => {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return requireRole('admin')(request, context);
  }
};

export default chain(
  createAuthMiddleware(),
  conditionalRBAC,
  createTenantMiddleware()
);
```

---

## 🔗 Dependencies

- **Depends on**: STORY-022, STORY-023 (Auth Client)
- **Blocks**: STORY-026 (SP Template uses middleware)

---

## 📚 Resources

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Middleware Patterns](https://nextjs.org/docs/pages/building-your-application/routing/middleware)

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] package.json configured
- [ ] TypeScript configured
- [ ] Auth middleware implemented
- [ ] RBAC middleware implemented
- [ ] Tenant middleware implemented
- [ ] Chain composer implemented
- [ ] Types exported
- [ ] README complete
- [ ] pnpm install works
- [ ] pnpm type-check passes
- [ ] Usage examples tested
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
