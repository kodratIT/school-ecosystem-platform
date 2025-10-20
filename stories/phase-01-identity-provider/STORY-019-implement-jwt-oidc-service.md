# STORY-019: Implement JWT + OIDC Token Service

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 5 (increased from 3 for OIDC)  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **implement a JWT service with OpenID Connect token support** so that **Service Provider applications can authenticate users via OIDC SSO with secure, verifiable ID tokens and access tokens**.

This service is critical for the OIDC-compliant federated identity architecture.

---

## 🎯 Goals

- Create JWT service package with OIDC support
- Implement RS256 signing (asymmetric keys)
- Generate RSA key pairs
- Implement ID token generation (OIDC)
- Implement access token generation
- Implement token validation
- Support token refresh
- Generate JWKS (JSON Web Key Set)
- Add claims management
- Full type safety

---

## ✅ Acceptance Criteria

- [ ] JWT service package created
- [ ] RS256 signing implemented
- [ ] RSA key pair generated and managed
- [ ] ID token generation working (OIDC-compliant)
- [ ] Access token generation working
- [ ] Token validation with public key working
- [ ] Refresh tokens supported
- [ ] JWKS generation working
- [ ] Claims properly embedded
- [ ] Type-safe interfaces
- [ ] Tests with >85% coverage

---

## 🆕 What's Different from OAuth 2.0?

### Before (OAuth 2.0):
```typescript
// One token for everything (HS256)
{
  access_token: "eyJ...",  // Contains identity + authorization
  token_type: "Bearer"
}
```

### After (OpenID Connect):
```typescript
// Separate tokens with RS256
{
  id_token: "eyJ...",      // Identity token (NEW!)
  access_token: "eyJ...",  // Authorization token
  refresh_token: "...",
  token_type: "Bearer"
}
```

**Key Changes:**
- ✅ **RS256** instead of HS256 (asymmetric encryption)
- ✅ **ID Token** for identity claims
- ✅ **Access Token** for authorization
- ✅ **JWKS** endpoint support for public key distribution

---

## 📋 Tasks

### Task 1: Create JWT Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

mkdir -p packages/jwt/src/{core,types,utils,keys}
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
  "description": "JWT + OIDC token service for federated identity",
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
    "type-check": "tsc --noEmit",
    "generate-keys": "node scripts/generate-rsa-keys.js"
  },
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "@repo/types": "workspace:*"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

---

### Task 3: Generate RSA Key Pair

**File:** `packages/jwt/scripts/generate-rsa-keys.js`

```javascript
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Generate key ID
const keyId = `key-${Date.now()}`;

// Save to keys directory
const keysDir = path.join(__dirname, '../src/keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
fs.writeFileSync(
  path.join(keysDir, 'key-id.txt'),
  keyId
);

console.log('✅ RSA key pair generated!');
console.log(`   Key ID: ${keyId}`);
console.log(`   Location: ${keysDir}`);
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('   1. Add src/keys/ to .gitignore');
console.log('   2. Store private key in environment variables for production');
console.log('   3. Never commit private key to git!');
```

**Run to generate keys:**
```bash
cd packages/jwt
node scripts/generate-rsa-keys.js
```

**Update .gitignore:**
```bash
# Add to root .gitignore
echo "packages/jwt/src/keys/" >> ../../.gitignore
```

---

### Task 4: Create OIDC Types

**File:** `packages/jwt/src/types/oidc.ts`

```typescript
/**
 * OIDC ID Token Payload
 * Standard claims for identity
 */
export interface IDTokenPayload {
  // Standard OIDC claims (REQUIRED)
  iss: string; // Issuer (IdP URL)
  sub: string; // Subject (User ID)
  aud: string | string[]; // Audience (Client ID)
  exp: number; // Expiration time
  iat: number; // Issued at
  auth_time?: number; // When user authenticated
  nonce?: string; // Nonce from authorization request

  // Standard profile claims (scope: profile)
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;

  // Standard email claims (scope: email)
  email?: string;
  email_verified?: boolean;

  // Standard address claims (scope: address)
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };

  // Standard phone claims (scope: phone)
  phone_number?: string;
  phone_number_verified?: boolean;

  // Custom claims (scope: school)
  role?: string;
  school_id?: string;
  school_name?: string;
  department?: string;
  permissions?: string[];
}

/**
 * Access Token Payload
 * Claims for authorization
 */
export interface AccessTokenPayload {
  // Standard claims
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  scope: string;

  // Authorization-specific
  client_id: string;
  permissions: string[];
  role: string;
  school_id?: string;
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string; // Token ID
  type: 'refresh';
  exp: number;
  iat: number;
  client_id: string;
}

/**
 * OIDC Token Pair
 */
export interface OIDCTokenPair {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
}

/**
 * JSON Web Key (JWK)
 */
export interface JWK {
  kty: string; // Key type (RSA)
  use: string; // Usage (sig = signature)
  kid: string; // Key ID
  alg: string; // Algorithm (RS256)
  n: string; // Modulus (base64url)
  e: string; // Exponent (base64url)
}

/**
 * JSON Web Key Set (JWKS)
 */
export interface JWKS {
  keys: JWK[];
}

/**
 * Token Generation Options
 */
export interface TokenGenerationOptions {
  expiresIn?: string | number;
  audience?: string | string[];
  issuer?: string;
  nonce?: string;
}
```

---

### Task 5: Create OIDC Token Manager

**File:** `packages/jwt/src/core/oidc-token-manager.ts`

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  IDTokenPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
  OIDCTokenPair,
  JWKS,
  JWK,
  TokenGenerationOptions,
} from '../types/oidc';

export class OIDCTokenManager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;
  private issuer: string;

  constructor() {
    // Load keys from environment or files
    if (process.env.OIDC_PRIVATE_KEY && process.env.OIDC_PUBLIC_KEY) {
      // Production: from environment variables
      this.privateKey = process.env.OIDC_PRIVATE_KEY.replace(/\\n/g, '\n');
      this.publicKey = process.env.OIDC_PUBLIC_KEY.replace(/\\n/g, '\n');
      this.keyId = process.env.OIDC_KEY_ID || 'default-key';
    } else {
      // Development: from files
      const keysDir = join(__dirname, '../keys');
      this.privateKey = readFileSync(join(keysDir, 'private.pem'), 'utf8');
      this.publicKey = readFileSync(join(keysDir, 'public.pem'), 'utf8');
      this.keyId = readFileSync(join(keysDir, 'key-id.txt'), 'utf8').trim();
    }

    this.issuer = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  }

  /**
   * Generate ID Token (OIDC)
   */
  generateIdToken(
    payload: Omit<IDTokenPayload, 'iss' | 'exp' | 'iat'>,
    options?: TokenGenerationOptions
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const idTokenPayload: IDTokenPayload = {
      // Standard claims
      iss: options?.issuer || this.issuer,
      sub: payload.sub,
      aud: payload.aud,
      exp: this.calculateExpiration(options?.expiresIn || '1h', now),
      iat: now,
      auth_time: payload.auth_time || now,
      nonce: options?.nonce,

      // Profile claims
      ...payload,
    };

    return jwt.sign(idTokenPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Generate Access Token
   */
  generateAccessToken(
    payload: Omit<AccessTokenPayload, 'iss' | 'exp' | 'iat'>,
    options?: TokenGenerationOptions
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenPayload: AccessTokenPayload = {
      iss: options?.issuer || this.issuer,
      sub: payload.sub,
      aud: payload.aud,
      exp: this.calculateExpiration(options?.expiresIn || '15m', now),
      iat: now,
      scope: payload.scope,
      client_id: payload.client_id,
      permissions: payload.permissions,
      role: payload.role,
      school_id: payload.school_id,
    };

    return jwt.sign(accessTokenPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Generate Refresh Token
   */
  generateRefreshToken(
    payload: Omit<RefreshTokenPayload, 'jti' | 'type' | 'exp' | 'iat'>
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: payload.sub,
      jti: crypto.randomUUID(),
      type: 'refresh',
      exp: now + 30 * 24 * 60 * 60, // 30 days
      iat: now,
      client_id: payload.client_id,
    };

    return jwt.sign(refreshTokenPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Issue complete OIDC token set
   */
  issueTokens(
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      name: string;
      givenName?: string;
      familyName?: string;
      picture?: string;
      role: string;
      schoolId?: string;
      permissions: string[];
    },
    clientId: string,
    scope: string,
    nonce?: string
  ): OIDCTokenPair {
    const audience = clientId;

    // Generate ID token
    const idToken = this.generateIdToken(
      {
        sub: user.id,
        aud: audience,
        email: user.email,
        email_verified: user.emailVerified,
        name: user.name,
        given_name: user.givenName,
        family_name: user.familyName,
        picture: user.picture,
        locale: 'id_ID',
        role: user.role,
        school_id: user.schoolId,
      },
      { expiresIn: '1h', nonce }
    );

    // Generate access token
    const accessToken = this.generateAccessToken({
      sub: user.id,
      aud: ['https://api.school-ecosystem.com'],
      scope,
      client_id: clientId,
      permissions: user.permissions,
      role: user.role,
      school_id: user.schoolId,
    });

    // Generate refresh token
    const refreshToken = this.generateRefreshToken({
      sub: user.id,
      client_id: clientId,
    });

    return {
      idToken,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
      scope,
    };
  }

  /**
   * Verify and decode token
   */
  verifyToken<T = any>(token: string): T {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
      issuer: this.issuer,
    }) as T;
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken<T = any>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }

  /**
   * Get JWKS (JSON Web Key Set) for public key distribution
   */
  getJWKS(): JWKS {
    const publicKeyObject = crypto.createPublicKey(this.publicKey);
    const jwk = publicKeyObject.export({ format: 'jwk' }) as any;

    const key: JWK = {
      kty: 'RSA',
      use: 'sig',
      kid: this.keyId,
      alg: 'RS256',
      n: jwk.n,
      e: jwk.e,
    };

    return {
      keys: [key],
    };
  }

  /**
   * Calculate expiration time
   */
  private calculateExpiration(
    expiresIn: string | number,
    now: number
  ): number {
    if (typeof expiresIn === 'number') {
      return now + expiresIn;
    }

    // Parse string like "15m", "1h", "30d"
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return now + value * multipliers[unit];
  }
}
```

---

### Task 6: Create Token Utilities

**File:** `packages/jwt/src/utils/token-utils.ts`

```typescript
import type { IDTokenPayload, AccessTokenPayload } from '../types/oidc';

/**
 * Extract user info from ID token
 */
export function extractUserFromIdToken(idToken: IDTokenPayload) {
  return {
    id: idToken.sub,
    email: idToken.email,
    emailVerified: idToken.email_verified,
    name: idToken.name,
    givenName: idToken.given_name,
    familyName: idToken.family_name,
    picture: idToken.picture,
    locale: idToken.locale,
    role: idToken.role,
    schoolId: idToken.school_id,
  };
}

/**
 * Extract permissions from access token
 */
export function extractPermissionsFromAccessToken(
  accessToken: AccessTokenPayload
) {
  return {
    userId: accessToken.sub,
    clientId: accessToken.client_id,
    scope: accessToken.scope,
    permissions: accessToken.permissions,
    role: accessToken.role,
    schoolId: accessToken.school_id,
  };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: { exp: number }): boolean {
  const now = Math.floor(Date.now() / 1000);
  return token.exp < now;
}

/**
 * Get token expiration time remaining (in seconds)
 */
export function getTokenExpiresIn(token: { exp: number }): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, token.exp - now);
}

/**
 * Validate ID token nonce
 */
export function validateNonce(
  idToken: IDTokenPayload,
  expectedNonce: string
): boolean {
  return idToken.nonce === expectedNonce;
}
```

---

### Task 7: Create Main Exports

**File:** `packages/jwt/src/index.ts`

```typescript
// Core
export { OIDCTokenManager } from './core/oidc-token-manager';

// Types
export type {
  IDTokenPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
  OIDCTokenPair,
  JWKS,
  JWK,
  TokenGenerationOptions,
} from './types/oidc';

// Utils
export {
  extractUserFromIdToken,
  extractPermissionsFromAccessToken,
  isTokenExpired,
  getTokenExpiresIn,
  validateNonce,
} from './utils/token-utils';
```

---

### Task 8: Create TypeScript Config

**File:** `packages/jwt/tsconfig.json`

```json
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

---

### Task 9: Create Tests

**File:** `packages/jwt/__tests__/oidc-token-manager.test.ts`

```typescript
import { OIDCTokenManager } from '../src/core/oidc-token-manager';

describe('OIDCTokenManager', () => {
  let tokenManager: OIDCTokenManager;

  beforeAll(() => {
    // Set up test environment
    process.env.BETTER_AUTH_URL = 'https://idp.test.com';
  });

  beforeEach(() => {
    tokenManager = new OIDCTokenManager();
  });

  describe('ID Token', () => {
    it('should generate valid ID token', () => {
      const idToken = tokenManager.generateIdToken({
        sub: 'user-123',
        aud: 'client-123',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        role: 'teacher',
      });

      expect(idToken).toBeDefined();
      expect(typeof idToken).toBe('string');

      // Decode and verify structure
      const decoded = tokenManager.decodeToken<any>(idToken);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.aud).toBe('client-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.iss).toBe('https://idp.test.com');
    });

    it('should include nonce in ID token', () => {
      const nonce = 'random-nonce-123';
      const idToken = tokenManager.generateIdToken(
        {
          sub: 'user-123',
          aud: 'client-123',
          email: 'test@example.com',
          email_verified: true,
          name: 'Test User',
        },
        { nonce }
      );

      const decoded = tokenManager.decodeToken<any>(idToken);
      expect(decoded.nonce).toBe(nonce);
    });
  });

  describe('Access Token', () => {
    it('should generate valid access token', () => {
      const accessToken = tokenManager.generateAccessToken({
        sub: 'user-123',
        aud: ['https://api.test.com'],
        scope: 'openid profile email',
        client_id: 'client-123',
        permissions: ['read:students'],
        role: 'teacher',
      });

      expect(accessToken).toBeDefined();

      const decoded = tokenManager.decodeToken<any>(accessToken);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.scope).toBe('openid profile email');
      expect(decoded.permissions).toContain('read:students');
    });
  });

  describe('Token Verification', () => {
    it('should verify valid token', () => {
      const idToken = tokenManager.generateIdToken({
        sub: 'user-123',
        aud: 'client-123',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
      });

      const verified = tokenManager.verifyToken(idToken);
      expect(verified.sub).toBe('user-123');
    });

    it('should reject tampered token', () => {
      const idToken = tokenManager.generateIdToken({
        sub: 'user-123',
        aud: 'client-123',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
      });

      // Tamper with token
      const parts = idToken.split('.');
      const tamperedToken = parts[0] + '.eyJzdWIiOiJoYWNrZXIifQ.' + parts[2];

      expect(() => {
        tokenManager.verifyToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('JWKS', () => {
    it('should generate valid JWKS', () => {
      const jwks = tokenManager.getJWKS();

      expect(jwks.keys).toHaveLength(1);
      expect(jwks.keys[0].kty).toBe('RSA');
      expect(jwks.keys[0].use).toBe('sig');
      expect(jwks.keys[0].alg).toBe('RS256');
      expect(jwks.keys[0].n).toBeDefined();
      expect(jwks.keys[0].e).toBeDefined();
    });
  });

  describe('Complete Token Set', () => {
    it('should issue complete OIDC token set', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
        givenName: 'Test',
        familyName: 'User',
        picture: 'https://example.com/avatar.jpg',
        role: 'teacher',
        schoolId: 'school-123',
        permissions: ['read:students', 'write:grades'],
      };

      const tokens = tokenManager.issueTokens(
        user,
        'client-123',
        'openid profile email school',
        'nonce-123'
      );

      expect(tokens.idToken).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.tokenType).toBe('Bearer');
      expect(tokens.expiresIn).toBe(900);
      expect(tokens.scope).toBe('openid profile email school');
    });
  });
});
```

---

### Task 10: Create README

**File:** `packages/jwt/README.md`

```markdown
# @repo/jwt

JWT + OpenID Connect token service for federated identity.

## Features

- 🔐 RS256 signing (asymmetric encryption)
- 🎫 ID Token generation (OIDC-compliant)
- 🔑 Access Token generation
- 🔄 Refresh Token support
- 🔒 JWKS (JSON Web Key Set) support
- ✅ Token validation
- 📋 Standard OIDC claims
- 🎯 Type-safe

## Installation

This is an internal workspace package.

```bash
pnpm add @repo/jwt --filter your-app
```

## Setup

### 1. Generate RSA Keys

```bash
cd packages/jwt
pnpm generate-keys
```

This creates:
- `src/keys/private.pem` - Private key (DO NOT COMMIT!)
- `src/keys/public.pem` - Public key
- `src/keys/key-id.txt` - Key ID

### 2. Set Environment Variables

For production, store keys in environment:

```bash
OIDC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
OIDC_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
OIDC_KEY_ID="key-12345"
BETTER_AUTH_URL="https://idp.school-ecosystem.com"
```

## Usage

### Initialize Token Manager

```typescript
import { OIDCTokenManager } from '@repo/jwt';

const tokenManager = new OIDCTokenManager();
```

### Generate ID Token

```typescript
const idToken = tokenManager.generateIdToken({
  sub: 'user-123',
  aud: 'client-app-id',
  email: 'user@school.com',
  email_verified: true,
  name: 'Budi Santoso',
  given_name: 'Budi',
  family_name: 'Santoso',
  picture: 'https://...',
  role: 'teacher',
  school_id: 'school-456',
});
```

### Generate Access Token

```typescript
const accessToken = tokenManager.generateAccessToken({
  sub: 'user-123',
  aud: ['https://api.school.com'],
  scope: 'openid profile email school',
  client_id: 'client-app-id',
  permissions: ['read:students', 'write:grades'],
  role: 'teacher',
  school_id: 'school-456',
});
```

### Issue Complete Token Set

```typescript
const tokens = tokenManager.issueTokens(
  {
    id: 'user-123',
    email: 'user@school.com',
    emailVerified: true,
    name: 'Budi Santoso',
    givenName: 'Budi',
    familyName: 'Santoso',
    picture: 'https://...',
    role: 'teacher',
    schoolId: 'school-456',
    permissions: ['read:students', 'write:grades'],
  },
  'client-app-id',
  'openid profile email school',
  'random-nonce' // Optional nonce from auth request
);

// Returns:
// {
//   idToken: "eyJ...",
//   accessToken: "eyJ...",
//   refreshToken: "...",
//   tokenType: "Bearer",
//   expiresIn: 900,
//   scope: "openid profile email school"
// }
```

### Verify Token

```typescript
try {
  const payload = tokenManager.verifyToken(idToken);
  console.log('User ID:', payload.sub);
  console.log('Email:', payload.email);
} catch (error) {
  console.error('Invalid token:', error);
}
```

### Get JWKS

```typescript
const jwks = tokenManager.getJWKS();
// Returns:
// {
//   keys: [{
//     kty: "RSA",
//     use: "sig",
//     kid: "key-12345",
//     alg: "RS256",
//     n: "...",
//     e: "AQAB"
//   }]
// }
```

## Token Structure

### ID Token (Identity)

```json
{
  "iss": "https://idp.school.com",
  "sub": "user-123",
  "aud": "client-app-id",
  "exp": 1735516800,
  "iat": 1735513200,
  "auth_time": 1735513200,
  "nonce": "random-nonce",
  "email": "user@school.com",
  "email_verified": true,
  "name": "Budi Santoso",
  "given_name": "Budi",
  "family_name": "Santoso",
  "picture": "https://...",
  "locale": "id_ID",
  "role": "teacher",
  "school_id": "school-456"
}
```

### Access Token (Authorization)

```json
{
  "iss": "https://idp.school.com",
  "sub": "user-123",
  "aud": ["https://api.school.com"],
  "exp": 1735514100,
  "iat": 1735513200,
  "scope": "openid profile email school",
  "client_id": "client-app-id",
  "permissions": ["read:students", "write:grades"],
  "role": "teacher",
  "school_id": "school-456"
}
```

## Utilities

```typescript
import {
  extractUserFromIdToken,
  extractPermissionsFromAccessToken,
  isTokenExpired,
  getTokenExpiresIn,
  validateNonce,
} from '@repo/jwt';

// Extract user from ID token
const user = extractUserFromIdToken(idTokenPayload);

// Extract permissions from access token
const auth = extractPermissionsFromAccessToken(accessTokenPayload);

// Check expiration
if (isTokenExpired(tokenPayload)) {
  console.log('Token expired');
}

// Get remaining time
const remainingSeconds = getTokenExpiresIn(tokenPayload);

// Validate nonce
if (!validateNonce(idTokenPayload, expectedNonce)) {
  throw new Error('Invalid nonce');
}
```

## Security

### Private Key Management

**Development:**
- Keys stored in `src/keys/` (gitignored)
- Generate with `pnpm generate-keys`

**Production:**
- Store in environment variables
- Use secrets management (AWS Secrets Manager, etc)
- Never commit to git
- Rotate keys periodically

### Token Validation

Always verify tokens before trusting:

```typescript
try {
  const payload = tokenManager.verifyToken(token);
  // Token is valid, use payload
} catch (error) {
  // Token is invalid/expired/tampered
  return res.status(401).json({ error: 'Invalid token' });
}
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## License

Private - Internal use only
```

---

## 🧪 Testing Instructions

### Test 1: Generate Keys

```bash
cd packages/jwt
pnpm generate-keys

# Verify
ls -la src/keys/
# Should see: private.pem, public.pem, key-id.txt
```

### Test 2: Build Package

```bash
pnpm build

# Should compile without errors
```

### Test 3: Run Tests

```bash
pnpm test

# Should pass all tests
```

### Test 4: Test Token Generation

```typescript
import { OIDCTokenManager } from '@repo/jwt';

const tokenManager = new OIDCTokenManager();

// Generate tokens
const tokens = tokenManager.issueTokens(
  {
    id: 'test-user',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    role: 'teacher',
    permissions: ['read:students'],
  },
  'test-client',
  'openid profile email'
);

console.log('ID Token:', tokens.idToken);
console.log('Access Token:', tokens.accessToken);

// Verify
const verified = tokenManager.verifyToken(tokens.idToken);
console.log('Verified:', verified);
```

### Test 5: Test JWKS

```typescript
const jwks = tokenManager.getJWKS();
console.log('JWKS:', JSON.stringify(jwks, null, 2));

// Should show public key in JWK format
```

---

## ✅ Story Completion Checklist

- [ ] Package structure created
- [ ] Dependencies installed
- [ ] RSA keys generated
- [ ] Keys added to .gitignore
- [ ] OIDC types defined
- [ ] OIDCTokenManager implemented
- [ ] ID token generation working
- [ ] Access token generation working
- [ ] Refresh token generation working
- [ ] Token verification working
- [ ] JWKS generation working
- [ ] Utilities implemented
- [ ] Tests written (>85% coverage)
- [ ] Tests passing
- [ ] README documentation complete
- [ ] Package builds successfully
- [ ] Committed to git

---

## 🚀 Next Steps

After completing this story:
- **STORY-022**: Implement OIDC Discovery Endpoint
- **STORY-023**: Implement OIDC UserInfo Endpoint
- **STORY-021**: Implement full OIDC SSO flow

---

## 📚 References

- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [JWK RFC 7517](https://tools.ietf.org/html/rfc7517)
- [RS256 vs HS256](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/)
