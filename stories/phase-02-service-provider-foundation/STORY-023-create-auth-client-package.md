# STORY-023: Create Auth Client Package

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 3 (Day 3)  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a client-side authentication package** so that **Service Provider applications can easily integrate authentication with Identity Provider using React hooks and JWT utilities**.

---

## 🎯 Goals

- Create auth client package with React context
- Implement JWT token utilities (decode, verify, storage)
- Provide React hooks for authentication state
- Support SSO login/logout flows
- Permission and role checking utilities

---

## ✅ Acceptance Criteria

- [ ] Package directory structure created
- [ ] JWT utilities implemented (decode, verify, get/set token)
- [ ] React AuthProvider context created
- [ ] useAuth hook implemented with state management
- [ ] Login/logout functions working
- [ ] Permission and role checking functions
- [ ] TypeScript types exported
- [ ] package.json configured
- [ ] pnpm type-check passes

---

## 🔗 Prerequisites

```bash
# Verify Phase 0 & STORY-022 complete
test -d packages/templates/database-service && echo "✅ Database template exists"
test -f turbo.json && echo "✅ Monorepo ready"
```

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create directory
mkdir -p packages/auth-client/src

cd packages/auth-client
```

**Verify:**
```bash
pwd
# Should show: .../packages/auth-client
```

---

### Task 2: Create package.json

**File**: `packages/auth-client/package.json`

```json
{
  "name": "@repo/auth-client",
  "version": "0.0.0",
  "private": true,
  "description": "Client-side authentication utilities for Service Providers",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
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

**Install dependencies:**
```bash
pnpm install
```

---

### Task 3: Create TypeScript Config

**File**: `packages/auth-client/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Create Type Definitions

**File**: `packages/auth-client/src/types.ts`

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

---

### Task 5: Implement JWT Utilities

**File**: `packages/auth-client/src/jwt-utils.ts`

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
 * Use for extracting payload when you already trust the token
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
 * Validates signature and expiration
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
 * Extracts user info from JWT payload
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

---

### Task 6: Create Auth Provider

**File**: `packages/auth-client/src/auth-provider.tsx`

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

    // Check every minute for token expiration
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

---

### Task 7: Create useAuth Hook

**File**: `packages/auth-client/src/use-auth.ts`

```typescript
'use client';

import { useContext } from 'react';
import { AuthContext } from './auth-provider';

/**
 * Hook to access authentication state and methods
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
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
 * 
 * Usage:
 * const auth = useRequireAuth();
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
 * Throws error if user doesn't have permission
 * 
 * Usage:
 * const auth = useRequirePermission('students.read');
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
 * Throws error if user doesn't have role
 * 
 * Usage:
 * const auth = useRequireRole('teacher');
 */
export function useRequireRole(role: string) {
  const auth = useRequireAuth();

  if (!auth.isLoading && !auth.hasRole(role)) {
    throw new Error(`Missing required role: ${role}`);
  }

  return auth;
}
```

---

### Task 8: Create Main Index

**File**: `packages/auth-client/src/index.ts`

```typescript
// Provider & Hooks
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

## 🧪 Testing Instructions

### Test 1: Package Builds

```bash
cd packages/auth-client

# Type check
pnpm type-check

# Should pass with 0 errors
```

### Test 2: Imports Work

Create test file: `test.ts`
```typescript
import {
  AuthProvider,
  useAuth,
  getToken,
  decodeToken,
  type AuthUser
} from './src/index';

console.log('✅ All imports successful');
```

Run:
```bash
npx tsx test.ts
rm test.ts
```

### Test 3: JWT Utils

Test JWT decoding:
```typescript
import { decodeToken, isTokenExpired } from './src/jwt-utils';

// Test with sample JWT (fake token for testing structure)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwic2Nob29sX2lkIjoiYWJjIiwicm9sZXMiOlsidGVhY2hlciJdLCJwZXJtaXNzaW9ucyI6WyJzdHVkZW50cy5yZWFkIl0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDA3MjAwfQ.dummy';

const decoded = decodeToken(testToken);
console.log('Decoded:', decoded);

const expired = isTokenExpired(testToken);
console.log('Expired:', expired);
```

---

## 📸 Expected Results

```
packages/auth-client/
├── package.json           ✅
├── tsconfig.json         ✅
└── src/
    ├── index.ts          ✅
    ├── types.ts          ✅
    ├── jwt-utils.ts      ✅
    ├── auth-provider.tsx ✅
    └── use-auth.ts       ✅
```

**Terminal output:**
```bash
$ pnpm type-check
✓ Type check passed

$ pnpm list --depth 0
@repo/auth-client
├── js-cookie 3.0.5
├── jose 5.2.0
└── react 18.2.0
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module 'js-cookie'"

```bash
cd packages/auth-client
pnpm install
```

### Error: "AuthContext undefined"

**Cause:** Using useAuth outside AuthProvider

**Solution:** Wrap app with AuthProvider:
```typescript
<AuthProvider>
  <YourApp />
</AuthProvider>
```

### Error: "Buffer is not defined"

**Cause:** Trying to use Buffer in browser without polyfill

**Solution:** Use atob instead for browser:
```typescript
// Browser-safe decode
const payload = JSON.parse(atob(parts[1]));
```

---

## 💡 Usage Examples

### Example 1: Wrap App with AuthProvider

```typescript
// app/layout.tsx
import { AuthProvider } from '@repo/auth-client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Example 2: Use Auth in Component

```typescript
'use client';

import { useAuth } from '@repo/auth-client';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <button>Login</button>;
  }

  return (
    <div>
      <span>Welcome, {user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Example 3: Protect Route

```typescript
'use client';

import { useRequireAuth } from '@repo/auth-client';

export default function DashboardPage() {
  const { user } = useRequireAuth(); // Auto-redirects if not authenticated

  return <div>Welcome {user.name}!</div>;
}
```

### Example 4: Check Permission

```typescript
'use client';

import { useAuth } from '@repo/auth-client';

export function StudentList() {
  const { hasPermission } = useAuth();

  if (!hasPermission('students.read')) {
    return <div>Access denied</div>;
  }

  return <div>Student list...</div>;
}
```

---

## 🔗 Dependencies

- **Depends on**: Phase 0, STORY-022
- **Blocks**: STORY-024 (Middleware uses auth-client)

---

## 📚 Resources

- [React Context API](https://react.dev/reference/react/createContext)
- [Jose JWT Library](https://github.com/panva/jose)
- [js-cookie](https://github.com/js-cookie/js-cookie)

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] package.json configured with dependencies
- [ ] TypeScript configured
- [ ] JWT utilities implemented and tested
- [ ] Auth Provider and hooks working
- [ ] Types exported
- [ ] pnpm install works
- [ ] pnpm type-check passes
- [ ] Usage examples documented
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
