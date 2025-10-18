# Phase 2: Service Provider Foundation - Implementation Guide

**Version**: 1.0  
**Last Updated**: 2024  
**Phase Duration**: 2 weeks (80 hours)  
**Team Size**: 1-2 developers

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Week 1: Core Packages](#3-week-1-core-packages)
4. [Week 2: Template & Integration](#4-week-2-template--integration)
5. [Testing & Verification](#5-testing--verification)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Common Issues](#7-common-issues)
8. [Performance Metrics](#8-performance-metrics)

---

## 1. Overview

### 1.1 What is Service Provider Foundation?

Service Provider Foundation adalah kumpulan template, packages, dan patterns yang akan digunakan oleh **15 Service Provider applications**:
- PPDB (Phase 3)
- SIS (Phase 4)
- Academic (Phase 5)
- Attendance (Phase 6)
- Finance (Phase 7)
- LMS (Phase 8)
- Examination (Phase 9)
- ... dan 8 aplikasi lainnya

### 1.2 Why Do We Need This?

**Tanpa Service Provider Foundation:**
- Setiap SP harus implement auth dari scratch (15x duplikasi)
- Inconsistent patterns across services
- Hard to maintain
- Slow development

**Dengan Service Provider Foundation:**
- Bootstrap new SP dalam 30 menit
- Consistent architecture
- Built-in auth, RBAC, multi-tenancy
- Focus on business logic only

### 1.3 What We're Building

#### Packages:
1. `@repo/database-template` - Template untuk database package
2. `@repo/auth-client` - Client-side authentication utilities
3. `@repo/middleware` - Middleware untuk auth, RBAC, tenant
4. `@repo/api-client` - Inter-service communication
5. `@repo/layouts` - Shared layouts dan navigation

#### Template:
6. `packages/templates/service-provider/` - Next.js app template

#### Demo:
7. `apps/test-service/` - Demo SP untuk validasi

---

## 2. Prerequisites

### 2.1 Phase Completion Check

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Phase 0 check
test -f turbo.json && echo "✅ Phase 0: Monorepo"
test -d packages/ui && echo "✅ Phase 0: Packages"

# Phase 1 check
test -d apps/identity-provider && echo "✅ Phase 1: IdP App"
test -d packages/database-identity && echo "✅ Phase 1: Identity DB"

# Should see all ✅
```

### 2.2 Identity Provider Running

```bash
# Start Identity Provider
cd apps/identity-provider
pnpm dev

# Should run on http://localhost:3000
# Test login at http://localhost:3000/auth/login
```

### 2.3 Tools & Environment

```bash
# Verify versions
node --version     # >= 20.0.0
pnpm --version     # >= 8.0.0
supabase --version # >= 1.0.0

# Should all pass
```

---

## 3. Week 1: Core Packages

### Story Breakdown - Week 1

| Day | Story | Focus |
|-----|-------|-------|
| Mon | STORY-022 | Database Package Template |
| Tue | STORY-023 | Auth Client Package |
| Wed | STORY-024 | Middleware Package (Part 1) |
| Thu | STORY-024 | Middleware Package (Part 2) |
| Fri | STORY-025 | API Client Package |

---

### 3.1 STORY-022: Create Database Package Template

**Goal**: Create reusable template for Service Provider databases

#### Structure:

```
packages/
└── templates/
    └── database-service/
        ├── package.json
        ├── tsconfig.json
        ├── src/
        │   ├── client.ts           # Supabase client setup
        │   ├── types.ts            # Generated types
        │   ├── queries/            # Query functions
        │   │   ├── index.ts
        │   │   └── example.ts
        │   ├── mutations/          # Mutation functions
        │   │   ├── index.ts
        │   │   └── example.ts
        │   └── utils/              # Utilities
        │       ├── rls-helpers.ts  # Row Level Security
        │       └── tenant-context.ts
        └── README.md
```

#### Implementation:

**Create directory:**
```bash
mkdir -p packages/templates/database-service/src/{queries,mutations,utils}
```

**File: `packages/templates/database-service/package.json`**
```json
{
  "name": "@repo/database-template",
  "version": "0.0.0",
  "private": true,
  "description": "Template for Service Provider database packages",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate-types": "supabase gen types typescript --project-id $PROJECT_ID > src/types.ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@repo/types": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

**File: `packages/templates/database-service/src/client.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Server-side client (with service role)
export function createServerClient(
  url: string,
  serviceKey: string
) {
  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Client-side client (with anon key)
export function createBrowserClient(
  url: string,
  anonKey: string
) {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Get client based on environment
export function getClient() {
  const url = process.env.NEXT_PUBLIC_SERVICE_DB_URL;
  const key = typeof window === 'undefined'
    ? process.env.SERVICE_DB_SERVICE_KEY
    : process.env.NEXT_PUBLIC_SERVICE_DB_ANON_KEY;

  if (!url || !key) {
    throw new Error('Database credentials not configured');
  }

  return typeof window === 'undefined'
    ? createServerClient(url, key)
    : createBrowserClient(url, key);
}
```

**File: `packages/templates/database-service/src/utils/rls-helpers.ts`**
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Set school context for Row Level Security
 * This tells Supabase which school's data to access
 */
export async function setSchoolContext(
  client: SupabaseClient,
  schoolId: string
) {
  const { error } = await client.rpc('set_current_school', {
    school_id: schoolId,
  });

  if (error) {
    throw new Error(`Failed to set school context: ${error.message}`);
  }
}

/**
 * Get current school from context
 */
export async function getCurrentSchool(
  client: SupabaseClient
): Promise<string | null> {
  const { data, error } = await client.rpc('get_current_school');

  if (error) {
    console.error('Failed to get current school:', error);
    return null;
  }

  return data;
}

/**
 * With school context wrapper
 * Automatically sets and clears school context
 */
export async function withSchoolContext<T>(
  client: SupabaseClient,
  schoolId: string,
  fn: () => Promise<T>
): Promise<T> {
  await setSchoolContext(client, schoolId);
  try {
    return await fn();
  } finally {
    // Clear context after operation
    await client.rpc('clear_current_school');
  }
}
```

**File: `packages/templates/database-service/src/utils/tenant-context.ts`**
```typescript
/**
 * Tenant context utilities for multi-tenant queries
 */

export interface TenantContext {
  schoolId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

/**
 * Extract tenant context from JWT claims
 */
export function extractTenantContext(jwtPayload: any): TenantContext {
  return {
    schoolId: jwtPayload.school_id,
    userId: jwtPayload.user_id,
    roles: jwtPayload.roles || [],
    permissions: jwtPayload.permissions || [],
  };
}

/**
 * Validate tenant context
 */
export function validateTenantContext(context: TenantContext): boolean {
  return !!(
    context.schoolId &&
    context.userId &&
    Array.isArray(context.roles) &&
    Array.isArray(context.permissions)
  );
}

/**
 * Build RLS-safe query filter
 */
export function buildTenantFilter(
  schoolId: string
): { school_id: string } {
  return { school_id: schoolId };
}
```

**File: `packages/templates/database-service/src/queries/example.ts`**
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

type ExampleTable = Database['public']['Tables']['examples']['Row'];

/**
 * Example query function
 * Replace 'examples' with actual table name
 */
export async function getExamples(
  client: SupabaseClient<Database>,
  schoolId: string
) {
  const { data, error } = await client
    .from('examples')
    .select('*')
    .eq('school_id', schoolId);

  if (error) throw error;
  return data as ExampleTable[];
}

/**
 * Get example by ID
 */
export async function getExampleById(
  client: SupabaseClient<Database>,
  id: string,
  schoolId: string
) {
  const { data, error } = await client
    .from('examples')
    .select('*')
    .eq('id', id)
    .eq('school_id', schoolId)
    .single();

  if (error) throw error;
  return data as ExampleTable;
}
```

**File: `packages/templates/database-service/src/mutations/example.ts`**
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

type ExampleInsert = Database['public']['Tables']['examples']['Insert'];
type ExampleUpdate = Database['public']['Tables']['examples']['Update'];

/**
 * Create example
 */
export async function createExample(
  client: SupabaseClient<Database>,
  data: ExampleInsert
) {
  const { data: created, error } = await client
    .from('examples')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update example
 */
export async function updateExample(
  client: SupabaseClient<Database>,
  id: string,
  schoolId: string,
  updates: ExampleUpdate
) {
  const { data, error } = await client
    .from('examples')
    .update(updates)
    .eq('id', id)
    .eq('school_id', schoolId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete example
 */
export async function deleteExample(
  client: SupabaseClient<Database>,
  id: string,
  schoolId: string
) {
  const { error } = await client
    .from('examples')
    .delete()
    .eq('id', id)
    .eq('school_id', schoolId);

  if (error) throw error;
}
```

**File: `packages/templates/database-service/src/index.ts`**
```typescript
// Clients
export {
  createServerClient,
  createBrowserClient,
  getClient,
} from './client';

// Types
export type { Database } from './types';

// Utilities
export {
  setSchoolContext,
  getCurrentSchool,
  withSchoolContext,
} from './utils/rls-helpers';

export {
  extractTenantContext,
  validateTenantContext,
  buildTenantFilter,
  type TenantContext,
} from './utils/tenant-context';

// Queries
export * from './queries/example';

// Mutations
export * from './mutations/example';
```

**File: `packages/templates/database-service/README.md`**
```markdown
# Database Package Template

Template for creating Service Provider database packages.

## Usage

1. Copy this template:
   \`\`\`bash
   cp -r packages/templates/database-service packages/database-[service-name]
   \`\`\`

2. Update package.json name:
   \`\`\`json
   {
     "name": "@repo/database-[service-name]"
   }
   \`\`\`

3. Setup Supabase project for your service

4. Generate types:
   \`\`\`bash
   cd packages/database-[service-name]
   PROJECT_ID=your-project-id pnpm generate-types
   \`\`\`

5. Replace example queries with your actual tables

6. Use in your Service Provider app:
   \`\`\`typescript
   import { getClient } from '@repo/database-[service-name]';
   
   const client = getClient();
   const data = await getYourData(client, schoolId);
   \`\`\`

## Best Practices

- Always filter by school_id for multi-tenancy
- Use RLS helpers for complex operations
- Keep queries focused and single-purpose
- Export types for use in app
```

---

### 3.2 STORY-023: Create Auth Client Package

**Goal**: Client-side utilities for authentication with Identity Provider

#### Structure:

```
packages/
└── auth-client/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── auth-provider.tsx      # React context
        ├── use-auth.ts            # React hook
        ├── jwt-utils.ts           # JWT parsing
        └── types.ts               # Auth types
```

**File: `packages/auth-client/package.json`**
```json
{
  "name": "@repo/auth-client",
  "version": "0.0.0",
  "private": true,
  "description": "Client-side authentication utilities for Service Providers",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "js-cookie": "^3.0.5",
    "jose": "^5.2.0"
  },
  "devDependencies": {
    "@repo/types": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/js-cookie": "^3.0.6",
    "@types/react": "^18.2.48",
    "react": "^18.2.0",
    "typescript": "^5.3.3"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

**File: `packages/auth-client/src/types.ts`**
```typescript
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  school_id: string;
  school_name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  school_id: string;
  school_name: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}
```

**File: `packages/auth-client/src/jwt-utils.ts`**
```typescript
import { jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import Cookies from 'js-cookie';
import type { JWTPayload, AuthUser } from './types';

const JWT_COOKIE_NAME = 'ekosistem_auth_token';
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key';

/**
 * Get JWT token from cookie
 */
export function getToken(): string | null {
  return Cookies.get(JWT_COOKIE_NAME) || null;
}

/**
 * Set JWT token in cookie
 */
export function setToken(token: string, expires: Date) {
  Cookies.set(JWT_COOKIE_NAME, token, {
    expires,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Remove JWT token from cookie
 */
export function removeToken() {
  Cookies.remove(JWT_COOKIE_NAME);
}

/**
 * Decode JWT without verification (for client-side)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    );

    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verify JWT token (server-side only)
 */
export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Get user from token
 */
export function getUserFromToken(token: string): AuthUser | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.user_id,
    email: decoded.email,
    name: decoded.name || null,
    avatar_url: decoded.avatar_url || null,
    school_id: decoded.school_id,
    school_name: decoded.school_name,
    roles: decoded.roles,
    permissions: decoded.permissions,
  };
}
```

**File: `packages/auth-client/src/auth-provider.tsx`**
```typescript
'use client';

import React, { createContext, useEffect, useState } from 'react';
import { getToken, getUserFromToken, isTokenExpired, removeToken } from './jwt-utils';
import type { AuthState, AuthUser } from './types';

interface AuthContextValue extends AuthState {
  login: (redirectUrl?: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
  idpUrl?: string;
}

export function AuthProvider({ 
  children,
  idpUrl = process.env.NEXT_PUBLIC_IDP_URL || 'http://localhost:3000'
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      const token = getToken();

      if (!token) {
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      if (isTokenExpired(token)) {
        removeToken();
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const user = getUserFromToken(token);
      if (user) {
        setState({ user, isAuthenticated: true, isLoading: false });
      } else {
        removeToken();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();

    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const login = (redirectUrl?: string) => {
    const currentUrl = redirectUrl || window.location.href;
    const loginUrl = `${idpUrl}/auth/login?redirect=${encodeURIComponent(currentUrl)}`;
    window.location.href = loginUrl;
  };

  const logout = () => {
    removeToken();
    setState({ user: null, isAuthenticated: false, isLoading: false });
    
    // Redirect to IdP logout
    const logoutUrl = `${idpUrl}/auth/logout`;
    window.location.href = logoutUrl;
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!state.user) return false;
    return state.user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

**File: `packages/auth-client/src/use-auth.ts`**
```typescript
'use client';

import { useContext } from 'react';
import { AuthContext } from './auth-provider';

/**
 * Hook to access authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const auth = useAuth();

  if (!auth.isLoading && !auth.isAuthenticated) {
    auth.login();
  }

  return auth;
}

/**
 * Hook to require specific permission
 */
export function useRequirePermission(permission: string) {
  const auth = useRequireAuth();

  if (!auth.isLoading && !auth.hasPermission(permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return auth;
}

/**
 * Hook to require specific role
 */
export function useRequireRole(role: string) {
  const auth = useRequireAuth();

  if (!auth.isLoading && !auth.hasRole(role)) {
    throw new Error(`Missing required role: ${role}`);
  }

  return auth;
}
```

**File: `packages/auth-client/src/index.ts`**
```typescript
// Provider & Hook
export { AuthProvider } from './auth-provider';
export {
  useAuth,
  useRequireAuth,
  useRequirePermission,
  useRequireRole,
} from './use-auth';

// JWT utilities
export {
  getToken,
  setToken,
  removeToken,
  decodeToken,
  verifyToken,
  isTokenExpired,
  getUserFromToken,
} from './jwt-utils';

// Types
export type { AuthUser, AuthState, JWTPayload } from './types';
```

---

### 3.3 STORY-024: Create Middleware Package

**Goal**: Reusable middleware for auth, RBAC, and tenant context

#### Structure:

```
packages/
└── middleware/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── auth-middleware.ts      # JWT verification
        ├── rbac-middleware.ts      # Permission check
        ├── tenant-middleware.ts    # School context
        ├── chain.ts                # Middleware chain composer
        └── types.ts                # Middleware types
```

**File: `packages/middleware/package.json`**
```json
{
  "name": "@repo/middleware",
  "version": "0.0.0",
  "private": true,
  "description": "Reusable middleware for Service Providers",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
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

**File: `packages/middleware/src/types.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export type MiddlewareFunction = (
  request: NextRequest,
  context: MiddlewareContext
) => Promise<NextResponse | void>;

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

export interface AuthMiddlewareConfig {
  publicPaths?: string[];
  redirectTo?: string;
}

export interface RBACMiddlewareConfig {
  requiredPermission?: string;
  requiredRole?: string;
  deniedRedirect?: string;
}
```

**File: `packages/middleware/src/auth-middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getToken } from '@repo/auth-client';
import type { MiddlewareFunction, AuthMiddlewareConfig } from './types';

/**
 * Authentication middleware
 * Verifies JWT token and extracts user info
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

    // Check if path is public
    const isPublicPath = publicPaths.some(path => 
      pathname.startsWith(path)
    );

    if (isPublicPath) {
      return; // Continue without auth check
    }

    // Get token from cookie
    const token = getToken();

    if (!token) {
      return NextResponse.redirect(
        new URL(redirectTo, request.url)
      );
    }

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      // Invalid token - redirect to login
      const response = NextResponse.redirect(
        new URL(redirectTo, request.url)
      );
      response.cookies.delete('ekosistem_auth_token');
      return response;
    }

    // Add user to context
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

**File: `packages/middleware/src/rbac-middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFunction, RBACMiddlewareConfig } from './types';

/**
 * RBAC middleware
 * Checks user permissions and roles
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

    if (!user) {
      throw new Error('RBAC middleware requires auth middleware to run first');
    }

    // Check permission
    if (requiredPermission) {
      const hasPermission = user.permissions.includes(requiredPermission);
      
      if (!hasPermission) {
        return NextResponse.redirect(
          new URL(deniedRedirect, request.url)
        );
      }
    }

    // Check role
    if (requiredRole) {
      const hasRole = user.roles.includes(requiredRole);
      
      if (!hasRole) {
        return NextResponse.redirect(
          new URL(deniedRedirect, request.url)
        );
      }
    }

    // User has required permissions/roles
  };
}

/**
 * Create permission-based middleware
 */
export function requirePermission(permission: string): MiddlewareFunction {
  return createRBACMiddleware({ requiredPermission: permission });
}

/**
 * Create role-based middleware
 */
export function requireRole(role: string): MiddlewareFunction {
  return createRBACMiddleware({ requiredRole: role });
}
```

**File: `packages/middleware/src/tenant-middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFunction } from './types';

/**
 * Tenant middleware
 * Sets school context in headers for RLS
 */
export function createTenantMiddleware(): MiddlewareFunction {
  return async (request, context) => {
    const { user } = context;

    if (!user) {
      throw new Error('Tenant middleware requires auth middleware to run first');
    }

    // Clone request and add school context header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-id', user.schoolId);
    requestHeaders.set('x-user-id', user.id);

    // Create modified request
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Also add to response headers (for debugging)
    response.headers.set('x-school-id', user.schoolId);
    response.headers.set('x-user-id', user.id);

    return response;
  };
}
```

**File: `packages/middleware/src/chain.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFunction, MiddlewareContext } from './types';

/**
 * Chain multiple middleware functions
 * Executes in order: middleware1 → middleware2 → ...
 */
export function chain(...middlewares: MiddlewareFunction[]) {
  return async (request: NextRequest) => {
    const context: MiddlewareContext = {};

    for (const middleware of middlewares) {
      const result = await middleware(request, context);
      
      // If middleware returns response, stop chain
      if (result instanceof NextResponse) {
        return result;
      }
    }

    // All middleware passed, continue
    return NextResponse.next();
  };
}
```

**File: `packages/middleware/src/index.ts`**
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

**Usage Example:**
```typescript
// middleware.ts in Service Provider app
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
```

---

### 3.4 STORY-025: Create API Client Package

**Goal**: Type-safe API client for inter-service communication

#### Structure:

```
packages/
└── api-client/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── client.ts              # Base HTTP client
        ├── identity-client.ts     # IdP API client
        ├── interceptors.ts        # Request/response interceptors
        └── types.ts               # API types
```

**File: `packages/api-client/package.json`**
```json
{
  "name": "@repo/api-client",
  "version": "0.0.0",
  "private": true,
  "description": "API client for inter-service communication",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/auth-client": "workspace:*",
    "@repo/types": "workspace:*",
    "ky": "^1.2.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

**File: `packages/api-client/src/types.ts`**
```typescript
export interface APIResponse<T = any> {
  data: T;
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}
```

**File: `packages/api-client/src/client.ts`**
```typescript
import ky, { type KyInstance } from 'ky';
import { getToken } from '@repo/auth-client';
import type { RequestConfig } from './types';

/**
 * Create API client with default configuration
 */
export function createAPIClient(baseURL: string): KyInstance {
  return ky.create({
    prefixUrl: baseURL,
    timeout: 30000,
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        request => {
          // Add auth token
          const token = getToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }

          // Add content type
          if (!request.headers.has('Content-Type')) {
            request.headers.set('Content-Type', 'application/json');
          }
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          // Log errors
          if (!response.ok) {
            console.error('API Error:', {
              status: response.status,
              url: response.url,
            });
          }
          return response;
        },
      ],
    },
  });
}

/**
 * Base API client class
 */
export class BaseAPIClient {
  protected client: KyInstance;

  constructor(baseURL: string) {
    this.client = createAPIClient(baseURL);
  }

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get(path, config);
    return response.json<T>();
  }

  async post<T>(
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.post(path, {
      json: body,
      ...config,
    });
    return response.json<T>();
  }

  async put<T>(
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.put(path, {
      json: body,
      ...config,
    });
    return response.json<T>();
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete(path, config);
    return response.json<T>();
  }
}
```

**File: `packages/api-client/src/identity-client.ts`**
```typescript
import { BaseAPIClient } from './client';

interface User {
  id: string;
  email: string;
  name: string;
  school_id: string;
}

interface School {
  id: string;
  name: string;
  domain: string;
}

/**
 * Identity Provider API client
 */
export class IdentityAPIClient extends BaseAPIClient {
  constructor(idpURL?: string) {
    super(idpURL || process.env.NEXT_PUBLIC_IDP_URL || 'http://localhost:3000');
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    return this.get<User>(`/api/users/${userId}`);
  }

  /**
   * Get school by ID
   */
  async getSchool(schoolId: string): Promise<School> {
    return this.get<School>(`/api/schools/${schoolId}`);
  }

  /**
   * Verify user has permission
   */
  async checkPermission(
    userId: string,
    permission: string
  ): Promise<boolean> {
    const result = await this.post<{ hasPermission: boolean }>(
      '/api/auth/check-permission',
      { userId, permission }
    );
    return result.hasPermission;
  }
}
```

**File: `packages/api-client/src/index.ts`**
```typescript
// Base client
export { BaseAPIClient, createAPIClient } from './client';

// Specific clients
export { IdentityAPIClient } from './identity-client';

// Types
export type { APIResponse, APIError, RequestConfig } from './types';
```

---

## 4. Week 2: Template & Integration

### Story Breakdown - Week 2

| Day | Story | Focus |
|-----|-------|-------|
| Mon-Tue | STORY-026 | Service Provider App Template |
| Wed | STORY-027 | SSO Flow Implementation |
| Thu | STORY-028 | Layouts Package |
| Fri | STORY-029 | Test Demo SP |
| Fri | STORY-030 | Documentation |

---

### 4.1 STORY-026: Create SP App Template

**Goal**: Next.js app template for Service Providers

**Create template directory:**
```bash
mkdir -p packages/templates/service-provider
cd packages/templates/service-provider
```

**Initialize Next.js:**
```bash
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

**Structure:**
```
packages/templates/service-provider/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   └── login/
│   └── (dashboard)/
│       └── dashboard/
├── middleware.ts
├── components/
├── lib/
├── .env.example
├── package.json
└── README.md
```

**File: `packages/templates/service-provider/.env.example`**
```bash
# Service Database
NEXT_PUBLIC_SERVICE_DB_URL=https://xxx.supabase.co
SERVICE_DB_SERVICE_KEY=xxx
NEXT_PUBLIC_SERVICE_DB_ANON_KEY=xxx

# Identity Provider
NEXT_PUBLIC_IDP_URL=http://localhost:3000

# JWT Secret (must match IdP)
NEXT_PUBLIC_JWT_SECRET=your-secret-key

# App Config
NEXT_PUBLIC_APP_NAME=Service Name
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**File: `packages/templates/service-provider/middleware.ts`**
```typescript
import { chain, createAuthMiddleware, createTenantMiddleware } from '@repo/middleware';

export default chain(
  createAuthMiddleware({
    publicPaths: ['/login', '/api/health'],
    redirectTo: '/login',
  }),
  createTenantMiddleware()
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
};
```

**File: `packages/templates/service-provider/app/layout.tsx`**
```typescript
import { AuthProvider } from '@repo/auth-client';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 4.2 STORY-027: Implement SSO Flow

**File: `packages/templates/service-provider/app/(auth)/login/page.tsx`**
```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@repo/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      // Already logged in, redirect to dashboard
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } else {
      // Not logged in, redirect to IdP
      login();
    }
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
```

---

### 4.3 STORY-028: Create Layouts Package

**Structure:**
```
packages/
└── layouts/
    ├── package.json
    └── src/
        ├── index.ts
        ├── main-layout.tsx
        ├── dashboard-layout.tsx
        └── components/
            ├── navbar.tsx
            └── sidebar.tsx
```

---

### 4.4 STORY-029: Create Test Demo SP

**Bootstrap from template:**
```bash
cp -r packages/templates/service-provider apps/test-service
cd apps/test-service

# Update package.json
# Set name to "test-service"

# Copy .env.example to .env.local
cp .env.example .env.local

# Configure environment variables
# ... update with actual values ...

# Install dependencies
pnpm install

# Start app
pnpm dev
```

**Test SSO flow:**
1. Visit http://localhost:3001
2. Should redirect to http://localhost:3000/auth/login
3. Login
4. Should redirect back to http://localhost:3001/dashboard
5. User authenticated ✅

---

### 4.5 STORY-030: Documentation

Create comprehensive guide for using templates:
- How to bootstrap new SP
- Configuration guide
- Best practices
- Troubleshooting

---

## 5. Testing & Verification

### 5.1 Package Testing

**Test each package:**
```bash
# Database template
cd packages/templates/database-service
pnpm type-check

# Auth client
cd packages/auth-client
pnpm type-check

# Middleware
cd packages/middleware
pnpm type-check

# API client
cd packages/api-client
pnpm type-check
```

### 5.2 Integration Testing

**Test SSO flow end-to-end:**
```bash
# Terminal 1: Start IdP
cd apps/identity-provider
pnpm dev # http://localhost:3000

# Terminal 2: Start Test SP
cd apps/test-service
pnpm dev # http://localhost:3001

# Browser:
# 1. Visit http://localhost:3001
# 2. Redirects to http://localhost:3000/auth/login
# 3. Login with test credentials
# 4. Redirects back to http://localhost:3001
# 5. Access granted ✅
```

### 5.3 Middleware Chain Testing

**Verify middleware execution order:**
- [ ] Auth middleware verifies JWT
- [ ] Tenant middleware sets school context
- [ ] Protected routes require authentication
- [ ] Public routes accessible without auth

---

## 6. Acceptance Criteria

### Functional Requirements
- [ ] All packages build without errors
- [ ] Auth client can verify JWT tokens
- [ ] Middleware chain executes in correct order
- [ ] SSO flow works end-to-end
- [ ] Demo SP authenticates via IdP
- [ ] Multi-tenant filtering works
- [ ] Permission checking works

### Non-Functional Requirements
- [ ] All packages have TypeScript types
- [ ] Code passes `pnpm type-check`
- [ ] Code passes `pnpm lint`
- [ ] Documentation clear and complete
- [ ] Template can bootstrap new SP in <30 min

---

## 7. Common Issues

### Issue: "Cannot find module '@repo/auth-client'"

**Solution:**
```bash
# Rebuild workspace
pnpm install
turbo build
```

### Issue: "JWT verification failed"

**Check:**
- JWT_SECRET matches between IdP and SP
- Token not expired
- Token format correct (Bearer token)

### Issue: "School context not set"

**Solution:**
Ensure middleware runs in order:
1. Auth (verifies JWT)
2. Tenant (sets school context)  
3. Your handler

### Issue: "SSO redirect loop"

**Check:**
- Callback URL configured correctly
- Token being saved in cookie
- Cookie domain/path settings
- No conflicting middleware

---

## 8. Performance Metrics

### Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Bootstrap Time | <30 min | Time to create new SP from template |
| Code Reuse | >80% | % of code shared across SPs |
| Type Safety | 100% | No `any` types in packages |
| SSO Success | >99% | Login flow completion rate |
| Middleware Overhead | <50ms | Request processing time |

---

## 🎉 Phase 2 Complete!

After completing all stories, you will have:
- ✅ Reusable foundation for 15+ Service Providers
- ✅ Complete SSO integration pattern
- ✅ Type-safe packages with full TypeScript
- ✅ Working demo application
- ✅ Comprehensive documentation

**Time investment**: 2 weeks  
**Time saved**: 45-75 days across 15 services  
**ROI**: Extremely High! 🚀

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Complete Implementation Guide
