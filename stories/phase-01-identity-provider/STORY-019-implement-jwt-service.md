# STORY-019: Implement JWT Service

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 5  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **implement a JWT service for issuing and validating tokens** so that **Service Provider applications can authenticate users via SSO with secure, verifiable tokens**.

This JWT service is critical for the federated identity architecture.

---

## 🎯 Goals

- Create JWT service package
- Implement token generation
- Implement token validation
- Support token refresh
- Add claims management
- Implement token revocation
- Create API endpoints for Service Providers
- Full type safety

---

## ✅ Acceptance Criteria

- [ ] JWT service created
- [ ] Token generation working
- [ ] Token validation working
- [ ] Refresh tokens supported
- [ ] Claims properly embedded
- [ ] Token revocation implemented
- [ ] API endpoints created
- [ ] Type-safe interfaces
- [ ] Tests with >85% coverage

---

## 📋 Tasks

### Task 1: Create JWT Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

mkdir -p packages/jwt/src/{core,types,utils}
mkdir -p packages/jwt/__tests__

ls -R packages/jwt/
```

---

### Task 2: Create package.json

**File:** `packages/jwt/package.json`

```json
{
  "name": "@repo/jwt",
  "version": "0.1.0",
  "private": true,
  "description": "JWT service for SSO authentication",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "@repo/types": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

---

### Task 3: Create JWT Types

**File:** `packages/jwt/src/types/index.ts`

```typescript
export interface JWTPayload {
  // Standard JWT claims
  sub: string; // User ID
  iss: string; // Issuer (IdP URL)
  aud: string | string[]; // Audience (Service Provider URLs)
  exp: number; // Expiration time
  iat: number; // Issued at
  nbf?: number; // Not before
  jti?: string; // JWT ID
  
  // Custom claims
  email: string;
  name: string;
  role: string;
  schoolId?: string;
  permissions?: string[];
  
  // Additional metadata
  metadata?: Record<string, unknown>;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTOptions {
  secret: string;
  expiresIn?: string | number;
  audience?: string | string[];
  issuer?: string;
  algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256';
}

export interface VerifyOptions {
  secret: string;
  audience?: string | string[];
  issuer?: string;
  algorithms?: string[];
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  jti: string; // Token ID
  type: 'refresh';
  exp: number;
  iat: number;
}
```

---

### Task 4: Create JWT Service Core

**File:** `packages/jwt/src/core/jwt-service.ts`

```typescript
import jwt from 'jsonwebtoken';
import type { JWTPayload, TokenPair, JWTOptions, VerifyOptions, RefreshTokenPayload } from '../types';

export class JWTService {
  private secret: string;
  private defaultOptions: Partial<JWTOptions>;

  constructor(secret: string, defaultOptions: Partial<JWTOptions> = {}) {
    if (!secret || secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters');
    }
    
    this.secret = secret;
    this.defaultOptions = {
      expiresIn: '15m', // 15 minutes for access token
      algorithm: 'HS256',
      issuer: process.env.BETTER_AUTH_URL || 'https://idp.school-ecosystem.com',
      ...defaultOptions,
    };
  }

  /**
   * Generate access token
   */
  generateAccessToken(
    payload: Omit<JWTPayload, 'exp' | 'iat' | 'iss'>,
    options?: Partial<JWTOptions>
  ): string {
    const mergedOptions = { ...this.defaultOptions, ...options };

    const fullPayload: Partial<JWTPayload> = {
      ...payload,
      iss: mergedOptions.issuer,
    };

    return jwt.sign(fullPayload, this.secret, {
      expiresIn: mergedOptions.expiresIn,
      audience: mergedOptions.audience,
      algorithm: mergedOptions.algorithm,
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId: string, tokenId: string): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti: tokenId,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(
    payload: Omit<JWTPayload, 'exp' | 'iat' | 'iss'>,
    tokenId: string,
    options?: Partial<JWTOptions>
  ): TokenPair {
    const accessToken = this.generateAccessToken(payload, options);
    const refreshToken = this.generateRefreshToken(payload.sub, tokenId);

    // Get expiration from token
    const decoded = jwt.decode(accessToken) as JWTPayload;
    const expiresIn = decoded.exp - decoded.iat;

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string, options?: VerifyOptions): JWTPayload {
    const verifyOptions = {
      ...this.defaultOptions,
      ...options,
    };

    try {
      const decoded = jwt.verify(token, options?.secret || this.secret, {
        audience: verifyOptions.audience,
        issuer: verifyOptions.issuer,
        algorithms: verifyOptions.algorithms || [verifyOptions.algorithm!],
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decode(token: string): JWTPayload | null {
    return jwt.decode(token) as JWTPayload | null;
  }

  /**
   * Check if token is expired (without verification)
   */
  isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    return decoded.exp < Math.floor(Date.now() / 1000);
  }

  /**
   * Get token expiration date
   */
  getExpirationDate(token: string): Date | null {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  }

  /**
   * Get time until expiration (in seconds)
   */
  getTimeUntilExpiration(token: string): number | null {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return decoded.exp - Math.floor(Date.now() / 1000);
  }
}
```

---

### Task 5: Create Token Manager

**File:** `packages/jwt/src/core/token-manager.ts`

```typescript
import { JWTService } from './jwt-service';
import type { JWTPayload, TokenPair } from '../types';

/**
 * Token manager with revocation support
 */
export class TokenManager {
  private jwtService: JWTService;
  private revokedTokens: Set<string> = new Set();

  constructor(secret: string) {
    this.jwtService = new JWTService(secret);
  }

  /**
   * Issue new token pair
   */
  issueTokens(
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      schoolId?: string;
      permissions?: string[];
    },
    audience?: string | string[]
  ): TokenPair {
    const tokenId = crypto.randomUUID();

    const payload: Omit<JWTPayload, 'exp' | 'iat' | 'iss'> = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      permissions: user.permissions,
    };

    return this.jwtService.generateTokenPair(payload, tokenId, { audience });
  }

  /**
   * Verify token
   */
  verifyToken(token: string, audience?: string | string[]): JWTPayload {
    // Check if token is revoked
    if (this.isRevoked(token)) {
      throw new Error('Token has been revoked');
    }

    return this.jwtService.verifyAccessToken(token, { 
      secret: this.jwtService['secret'],
      audience,
    });
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(
    refreshToken: string,
    audience?: string | string[]
  ): Promise<TokenPair> {
    // Verify refresh token
    const decoded = this.jwtService.verifyRefreshToken(refreshToken);

    // Check if refresh token is revoked
    if (this.isRevoked(refreshToken)) {
      throw new Error('Refresh token has been revoked');
    }

    // TODO: Get user from database
    // For now, throw error
    throw new Error('Token refresh not implemented - requires database integration');
  }

  /**
   * Revoke token
   */
  revokeToken(token: string): void {
    this.revokedTokens.add(token);
  }

  /**
   * Check if token is revoked
   */
  isRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  /**
   * Revoke all tokens for user
   */
  revokeUserTokens(userId: string): void {
    // TODO: Implement proper token revocation with database
    // This is a simplified version
    console.log('Revoking all tokens for user:', userId);
  }

  /**
   * Clean up expired revoked tokens
   */
  cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);
    
    for (const token of this.revokedTokens) {
      const decoded = this.jwtService.decode(token);
      if (decoded && decoded.exp && decoded.exp < now) {
        this.revokedTokens.delete(token);
      }
    }
  }
}
```

---

### Task 6: Create Utility Functions

**File:** `packages/jwt/src/utils/helpers.ts`

```typescript
import type { JWTPayload } from '../types';

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Create Authorization header value
 */
export function createAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Check if user has permission
 */
export function hasPermission(payload: JWTPayload, permission: string): boolean {
  if (!payload.permissions) return false;
  return payload.permissions.includes(permission);
}

/**
 * Check if user has any of permissions
 */
export function hasAnyPermission(payload: JWTPayload, permissions: string[]): boolean {
  if (!payload.permissions) return false;
  return permissions.some(p => payload.permissions!.includes(p));
}

/**
 * Check if user has all permissions
 */
export function hasAllPermissions(payload: JWTPayload, permissions: string[]): boolean {
  if (!payload.permissions) return false;
  return permissions.every(p => payload.permissions!.includes(p));
}

/**
 * Check if user has role
 */
export function hasRole(payload: JWTPayload, role: string | string[]): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(payload.role);
}

/**
 * Get user ID from payload
 */
export function getUserId(payload: JWTPayload): string {
  return payload.sub;
}

/**
 * Get school ID from payload
 */
export function getSchoolId(payload: JWTPayload): string | undefined {
  return payload.schoolId;
}
```

---

### Task 7: Create API Routes

**File:** `apps/identity-provider/app/api/jwt/issue/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from '@repo/jwt';
import { getCurrentUser } from '@/lib/auth-utils';

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

/**
 * POST /api/jwt/issue
 * Issue JWT token for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { audience } = body;

    // Issue tokens
    const tokens = tokenManager.issueTokens(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId || undefined,
      },
      audience
    );

    return NextResponse.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('JWT issue error:', error);
    return NextResponse.json(
      { error: 'Failed to issue token' },
      { status: 500 }
    );
  }
}
```

**File:** `apps/identity-provider/app/api/jwt/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from '@repo/jwt';
import { extractToken } from '@repo/jwt';

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

/**
 * POST /api/jwt/verify
 * Verify JWT token (for Service Providers)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = tokenManager.verifyToken(token);

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        payload,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      },
    }, { status: 401 });
  }
}
```

**File:** `apps/identity-provider/app/api/jwt/refresh/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from '@repo/jwt';

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

/**
 * POST /api/jwt/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, audience } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Refresh tokens
    const tokens = await tokenManager.refreshTokens(refreshToken, audience);

    return NextResponse.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh token' },
      { status: 401 }
    );
  }
}
```

---

### Task 8: Create Main Exports

**File:** `packages/jwt/src/index.ts`

```typescript
// Core
export { JWTService } from './core/jwt-service';
export { TokenManager } from './core/token-manager';

// Types
export type {
  JWTPayload,
  TokenPair,
  JWTOptions,
  VerifyOptions,
  RefreshTokenPayload,
} from './types';

// Utils
export {
  extractToken,
  createAuthHeader,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  getUserId,
  getSchoolId,
} from './utils/helpers';
```

---

### Task 9: Create Tests

**File:** `packages/jwt/__tests__/jwt-service.test.ts`

```typescript
import { JWTService } from '../src/core/jwt-service';

describe('JWTService', () => {
  const secret = 'test-secret-key-at-least-32-characters-long';
  let jwtService: JWTService;

  beforeEach(() => {
    jwtService = new JWTService(secret);
  });

  it('should generate access token', () => {
    const token = jwtService.generateAccessToken({
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'teacher',
    });

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should verify valid token', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'teacher',
    };

    const token = jwtService.generateAccessToken(payload);
    const decoded = jwtService.verifyAccessToken(token);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
  });

  it('should reject expired token', () => {
    const token = jwtService.generateAccessToken(
      {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'teacher',
      },
      { expiresIn: '1ms' }
    );

    // Wait for token to expire
    return new Promise(resolve => {
      setTimeout(() => {
        expect(() => {
          jwtService.verifyAccessToken(token);
        }).toThrow('Token has expired');
        resolve(undefined);
      }, 10);
    });
  });

  it('should decode token without verification', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'teacher',
    };

    const token = jwtService.generateAccessToken(payload);
    const decoded = jwtService.decode(token);

    expect(decoded).toBeTruthy();
    expect(decoded!.sub).toBe(payload.sub);
  });

  it('should check if token is expired', () => {
    const token = jwtService.generateAccessToken({
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'teacher',
    });

    expect(jwtService.isExpired(token)).toBe(false);
  });
});
```

---

### Task 10: Create README

**File:** `packages/jwt/README.md`

```markdown
# @repo/jwt

JWT service for SSO authentication in the school ecosystem.

## Installation

\`\`\`typescript
import { JWTService, TokenManager } from '@repo/jwt';
\`\`\`

## Usage

### Generate Token

\`\`\`typescript
import { TokenManager } from '@repo/jwt';

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

const tokens = tokenManager.issueTokens({
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'teacher',
  schoolId: 'school-456',
});

console.log(tokens.accessToken);
console.log(tokens.refreshToken);
\`\`\`

### Verify Token

\`\`\`typescript
import { TokenManager } from '@repo/jwt';

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

try {
  const payload = tokenManager.verifyToken(token);
  console.log('User:', payload.sub);
  console.log('Role:', payload.role);
} catch (error) {
  console.error('Invalid token');
}
\`\`\`

### Extract from Header

\`\`\`typescript
import { extractToken } from '@repo/jwt';

const token = extractToken(request.headers.get('authorization'));
\`\`\`

### Check Permissions

\`\`\`typescript
import { hasPermission, hasRole } from '@repo/jwt';

if (hasRole(payload, 'super_admin')) {
  // User is super admin
}

if (hasPermission(payload, 'users.create')) {
  // User can create users
}
\`\`\`

## API Endpoints

### Issue Token
\`\`\`
POST /api/jwt/issue
Authorization: Bearer <session-token>

{
  "audience": "https://ppdb.example.com"
}
\`\`\`

### Verify Token
\`\`\`
POST /api/jwt/verify
Authorization: Bearer <jwt-token>
\`\`\`

### Refresh Token
\`\`\`
POST /api/jwt/refresh

{
  "refreshToken": "...",
  "audience": "https://ppdb.example.com"
}
\`\`\`

## Security

- Use strong secret (32+ characters)
- Store secret in environment variables
- Short-lived access tokens (15 minutes)
- Longer refresh tokens (7 days)
- Implement token revocation
- Validate audience claim
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Generate and Verify Token

```typescript
import { JWTService } from '@repo/jwt';

const service = new JWTService(process.env.JWT_SECRET!);

const token = service.generateAccessToken({
  sub: 'user-123',
  email: 'test@example.com',
  name: 'Test',
  role: 'teacher',
});

const payload = service.verifyAccessToken(token);
console.log('Verified:', payload);
```

---

### Test 2: Test API Endpoints

```bash
# Issue token
curl -X POST http://localhost:3000/api/jwt/issue \
  -H "Authorization: Bearer <session-token>" \
  -H "Content-Type: application/json" \
  -d '{"audience": "http://localhost:3001"}'

# Verify token
curl -X POST http://localhost:3000/api/jwt/verify \
  -H "Authorization: Bearer <jwt-token>"
```

---

## 📸 Expected Results

```
packages/jwt/
├── src/
│   ├── core/
│   │   ├── jwt-service.ts      ✅ JWT operations
│   │   └── token-manager.ts    ✅ Token management
│   ├── types/index.ts          ✅ Type definitions
│   ├── utils/helpers.ts        ✅ Utility functions
│   └── index.ts                ✅ Main export
├── __tests__/                  ✅ Tests
└── README.md                   ✅ Documentation

API Endpoints:
✅ POST /api/jwt/issue
✅ POST /api/jwt/verify
✅ POST /api/jwt/refresh
```

---

## ❌ Common Errors & Solutions

### Error: "JWT secret must be at least 32 characters"

**Solution:**
```bash
openssl rand -base64 32
# Add to .env.local
```

---

### Error: "Token has expired"

**Cause:** Token expired

**Solution:** Use refresh token to get new access token

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-002 (TypeScript)
  - STORY-009 (Types package)
- **Blocks**: STORY-021 (SSO implementation)

---

## 💡 Tips

1. **Strong secrets** - Use openssl rand
2. **Short-lived tokens** - 15 minutes for access
3. **Validate audience** - Prevent token misuse
4. **Implement revocation** - For security
5. **Monitor token usage** - Track suspicious activity

---

## ✏️ Definition of Done

- [ ] JWT package created
- [ ] Token generation working
- [ ] Token verification working
- [ ] API endpoints created
- [ ] Tests >85% coverage
- [ ] Documentation complete
- [ ] Can be used by Service Providers

---

**Created**: 2024  
**Story Owner**: Development Team
