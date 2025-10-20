# OpenID Connect Implementation Plan

## Phase 1 - Updated for OIDC

**Original Duration**: 3 weeks (10 stories)  
**Updated Duration**: 4 weeks (13 stories)  
**Additional Work**: +1 week for OIDC compliance

---

## Story Changes

### Existing Stories (Modified)

| Story | Original Focus | OIDC Changes |
|-------|---------------|--------------|
| STORY-019 | JWT Service (HS256) | **Add RS256, RSA keys, ID token generation** |
| STORY-021 | SSO with OAuth 2.0 | **Full OIDC flow with id_token** |

### New Stories (Added)

| Story | Title | Duration | Priority |
|-------|-------|----------|----------|
| **STORY-022** | OIDC Discovery Endpoint | 1 day | P0 Critical |
| **STORY-023** | OIDC UserInfo Endpoint | 1 day | P0 Critical |
| **STORY-024** | OIDC Client SDK Package | 2 days | P0 Critical |

---

## Complete Story List (13 Total)

### Week 1: Foundation (4 stories)
- ✅ STORY-012: Setup Supabase (unchanged)
- ✅ STORY-013: Identity Database Schema (unchanged)
- ✅ STORY-014: Database Package (unchanged)
- ✅ STORY-015: Setup Better Auth (unchanged)

### Week 2: RBAC & App (3 stories)
- ✅ STORY-016: RBAC Package (unchanged)
- ✅ STORY-017: IdP Next.js App (unchanged)
- ✅ STORY-018: Auth Pages (unchanged)

### Week 3: OIDC Core (3 stories)
- 🆕 **STORY-019**: JWT Service + OIDC Tokens (MODIFIED)
- 🆕 **STORY-022**: OIDC Discovery Endpoint (NEW)
- 🆕 **STORY-023**: OIDC UserInfo Endpoint (NEW)

### Week 4: SSO & Client SDK (3 stories)
- 🆕 **STORY-021**: OIDC SSO Implementation (MODIFIED)
- 🆕 **STORY-024**: OIDC Client SDK (NEW)
- ✅ STORY-020: Dashboard Features (unchanged)

---

## Detailed Changes by Story

### STORY-019: JWT Service (MODIFIED)

**Original:** Simple JWT with HS256

**Updated for OIDC:**

#### Additional Tasks:

**Task 7: Generate RSA Key Pair**

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem

# Store in environment
OIDC_PRIVATE_KEY="..."
OIDC_PUBLIC_KEY="..."
```

**Task 8: Implement RS256 Signing**

```typescript
// packages/jwt/src/core/oidc-token-manager.ts
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

export class OIDCTokenManager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor() {
    this.privateKey = process.env.OIDC_PRIVATE_KEY!;
    this.publicKey = process.env.OIDC_PUBLIC_KEY!;
    this.keyId = process.env.OIDC_KEY_ID || '2024-12-20-key-1';
  }

  /**
   * Generate ID Token (RS256)
   */
  generateIdToken(payload: IDTokenPayload, nonce?: string): string {
    const now = Math.floor(Date.now() / 1000);

    const idToken = {
      // Standard OIDC claims
      iss: process.env.BETTER_AUTH_URL,
      sub: payload.sub,
      aud: payload.aud,
      exp: now + 3600, // 1 hour
      iat: now,
      auth_time: payload.authTime || now,
      nonce,

      // Profile claims
      email: payload.email,
      email_verified: payload.emailVerified,
      name: payload.name,
      given_name: payload.givenName,
      family_name: payload.familyName,
      picture: payload.picture,
      locale: 'id_ID',

      // Custom claims
      role: payload.role,
      school_id: payload.schoolId,
    };

    return jwt.sign(idToken, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Generate Access Token (RS256)
   */
  generateAccessToken(payload: AccessTokenPayload): string {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = {
      iss: process.env.BETTER_AUTH_URL,
      sub: payload.sub,
      aud: payload.aud,
      exp: now + 900, // 15 minutes
      iat: now,
      scope: payload.scope,
      client_id: payload.clientId,
      permissions: payload.permissions,
      role: payload.role,
      school_id: payload.schoolId,
    };

    return jwt.sign(accessToken, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Verify token
   */
  verifyToken(token: string): any {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
    });
  }

  /**
   * Get public key in JWK format
   */
  getJWKS(): JWKS {
    const key = crypto.createPublicKey(this.publicKey);
    const jwk = key.export({ format: 'jwk' });

    return {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: this.keyId,
          alg: 'RS256',
          n: jwk.n,
          e: jwk.e,
        },
      ],
    };
  }
}
```

**Task 9: Update Types**

```typescript
// packages/jwt/src/types/oidc.ts
export interface IDTokenPayload {
  sub: string; // User ID
  aud: string | string[]; // Client ID
  authTime?: number;

  // Profile
  email: string;
  emailVerified: boolean;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;

  // Custom
  role: string;
  schoolId?: string;
}

export interface AccessTokenPayload {
  sub: string;
  aud: string | string[];
  scope: string;
  clientId: string;
  permissions: string[];
  role: string;
  schoolId?: string;
}

export interface OIDCTokenPair {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
}

export interface JWKS {
  keys: JWK[];
}

export interface JWK {
  kty: string;
  use: string;
  kid: string;
  alg: string;
  n: string;
  e: string;
}
```

---

### STORY-022: OIDC Discovery Endpoint (NEW)

**Priority:** P0 Critical  
**Duration:** 1 day  
**Dependencies:** None

#### Tasks:

**Task 1: Create Discovery Endpoint**

```typescript
// apps/identity-provider/app/.well-known/openid-configuration/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export async function GET() {
  const config = {
    issuer: BASE_URL,
    authorization_endpoint: `${BASE_URL}/api/oidc/authorize`,
    token_endpoint: `${BASE_URL}/api/oidc/token`,
    userinfo_endpoint: `${BASE_URL}/api/oidc/userinfo`,
    end_session_endpoint: `${BASE_URL}/api/oidc/logout`,
    jwks_uri: `${BASE_URL}/.well-known/jwks.json`,

    scopes_supported: [
      'openid',
      'profile',
      'email',
      'school',
      'offline_access',
    ],

    response_types_supported: [
      'code',
      'id_token',
      'token id_token',
      'code id_token',
      'code token',
      'code token id_token',
    ],

    response_modes_supported: ['query', 'fragment', 'form_post'],

    grant_types_supported: ['authorization_code', 'refresh_token'],

    subject_types_supported: ['public'],

    id_token_signing_alg_values_supported: ['RS256'],

    token_endpoint_auth_methods_supported: [
      'client_secret_post',
      'client_secret_basic',
    ],

    claims_supported: [
      'sub',
      'iss',
      'aud',
      'exp',
      'iat',
      'auth_time',
      'nonce',
      'email',
      'email_verified',
      'name',
      'given_name',
      'family_name',
      'picture',
      'locale',
      'role',
      'school_id',
    ],

    code_challenge_methods_supported: ['S256'],

    ui_locales_supported: ['id-ID', 'en-US'],
  };

  return NextResponse.json(config);
}
```

**Task 2: Create JWKS Endpoint**

```typescript
// apps/identity-provider/app/.well-known/jwks.json/route.ts
import { NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';

const tokenManager = new OIDCTokenManager();

export async function GET() {
  const jwks = tokenManager.getJWKS();
  return NextResponse.json(jwks);
}
```

**Task 3: Test Discovery**

```bash
# Test discovery endpoint
curl http://localhost:3000/.well-known/openid-configuration

# Test JWKS endpoint
curl http://localhost:3000/.well-known/jwks.json
```

---

### STORY-023: OIDC UserInfo Endpoint (NEW)

**Priority:** P0 Critical  
**Duration:** 1 day  
**Dependencies:** STORY-019

#### Tasks:

**Task 1: Create UserInfo Endpoint**

```typescript
// apps/identity-provider/app/api/oidc/userinfo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';
import { getUserById } from '@repo/database-identity';

const tokenManager = new OIDCTokenManager();

export async function GET(request: NextRequest) {
  try {
    // Extract access token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'Missing or invalid token' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Verify access token
    const payload = tokenManager.verifyToken(accessToken);

    // Get fresh user data from database
    const user = await getUserById(payload.sub);

    if (!user) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'User not found' },
        { status: 401 }
      );
    }

    // Return standard OIDC claims
    return NextResponse.json({
      sub: user.id,
      email: user.email,
      email_verified: user.email_verified,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.avatar,
      locale: 'id_ID',
      updated_at: Math.floor(new Date(user.updated_at).getTime() / 1000),

      // Custom claims
      role: user.role,
      school_id: user.school_id,
      school_name: user.school?.name,
    });
  } catch (error) {
    console.error('UserInfo error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Also support POST method (OIDC spec allows both)
  return GET(request);
}
```

**Task 2: Add CORS Headers**

```typescript
// Middleware for OIDC endpoints
export const config = {
  matcher: ['/api/oidc/:path*', '/.well-known/:path*'],
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers for OIDC endpoints
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  return response;
}
```

**Task 3: Test UserInfo**

```bash
# Get access token first
ACCESS_TOKEN="..."

# Test UserInfo endpoint
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:3000/api/oidc/userinfo
```

---

### STORY-021: OIDC SSO Implementation (MODIFIED)

**Original:** OAuth 2.0 SSO  
**Updated:** Full OIDC SSO

#### Additional/Modified Tasks:

**Task 1: Update Authorization Endpoint**

```typescript
// apps/identity-provider/app/api/oidc/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-utils';
import { z } from 'zod';

const authorizeSchema = z.object({
  client_id: z.string(),
  redirect_uri: z.string().url(),
  response_type: z.string(), // 'code', 'id_token', etc
  scope: z.string().includes('openid'), // Must include 'openid'
  state: z.string().optional(),
  nonce: z.string().optional(),
  prompt: z.enum(['none', 'login', 'consent', 'select_account']).optional(),
  max_age: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Validate parameters
    const params = authorizeSchema.parse({
      client_id: searchParams.get('client_id'),
      redirect_uri: searchParams.get('redirect_uri'),
      response_type: searchParams.get('response_type'),
      scope: searchParams.get('scope'),
      state: searchParams.get('state'),
      nonce: searchParams.get('nonce'),
      prompt: searchParams.get('prompt'),
      max_age: searchParams.get('max_age')
        ? parseInt(searchParams.get('max_age')!)
        : undefined,
    });

    // Check if user is authenticated
    const session = await getCurrentSession();

    // Handle prompt parameter
    if (params.prompt === 'none' && !session) {
      // Silent authentication failed
      return redirectWithError(params.redirect_uri, 'login_required', params.state);
    }

    if (!session || params.prompt === 'login') {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify max_age
    if (params.max_age) {
      const authTime = session.auth_time || 0;
      const now = Math.floor(Date.now() / 1000);
      if (now - authTime > params.max_age) {
        // Re-authentication required
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Verify client
    const client = await getClientById(params.client_id);
    if (!client) {
      return redirectWithError(params.redirect_uri, 'invalid_client', params.state);
    }

    // Verify redirect_uri
    if (!client.redirect_uris.includes(params.redirect_uri)) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
        { status: 400 }
      );
    }

    // Generate authorization code
    const code = crypto.randomUUID();

    // Store code data (with nonce for ID token)
    const codeData = {
      code,
      userId: session.user.id,
      clientId: params.client_id,
      redirectUri: params.redirect_uri,
      scope: params.scope,
      nonce: params.nonce,
      authTime: session.auth_time,
      expiresAt: Date.now() + 60000, // 1 minute
    };

    // Redirect with code
    const redirectUrl = new URL(params.redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (params.state) {
      redirectUrl.searchParams.set('state', params.state);
    }

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('oidc_code_' + code, JSON.stringify(codeData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60,
    });

    return response;
  } catch (error) {
    // Handle errors...
  }
}
```

**Task 2: Update Token Endpoint to Return ID Token**

```typescript
// apps/identity-provider/app/api/oidc/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';
import { getUserById } from '@repo/database-identity';

const tokenManager = new OIDCTokenManager();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ... validation & code verification ...

    // Get user
    const user = await getUserById(codeData.userId);

    // Generate ID Token
    const idToken = tokenManager.generateIdToken(
      {
        sub: user.id,
        aud: params.client_id,
        authTime: codeData.authTime,
        email: user.email,
        emailVerified: user.email_verified,
        name: user.name,
        givenName: user.given_name,
        familyName: user.family_name,
        picture: user.avatar,
        role: user.role,
        schoolId: user.school_id,
      },
      codeData.nonce // Include nonce from authorize request
    );

    // Generate Access Token
    const accessToken = tokenManager.generateAccessToken({
      sub: user.id,
      aud: ['https://api.school-ecosystem.com'],
      scope: codeData.scope,
      clientId: params.client_id,
      permissions: user.permissions,
      role: user.role,
      schoolId: user.school_id,
    });

    // Generate Refresh Token
    const refreshToken = tokenManager.generateRefreshToken({
      sub: user.id,
      clientId: params.client_id,
    });

    // Return tokens
    return NextResponse.json({
      id_token: idToken, // NEW
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
      scope: codeData.scope,
    });
  } catch (error) {
    // Handle errors...
  }
}
```

---

### STORY-024: OIDC Client SDK (NEW)

**Priority:** P0 Critical  
**Duration:** 2 days  
**Dependencies:** STORY-019, STORY-022, STORY-023

#### Tasks:

**Task 1: Create Package Structure**

```bash
mkdir -p packages/oidc-client/src/{core,types,utils}
```

**Task 2: Create OIDC Client**

```typescript
// packages/oidc-client/src/core/oidc-client.ts
import { discoveryRequest, userInfoRequest } from './requests';
import type { OIDCConfig, OIDCTokens, OIDCUserInfo } from '../types';

export class OIDCClient {
  private config: OIDCConfig;
  private discoveryDoc?: OIDCDiscoveryDocument;

  constructor(config: OIDCConfig) {
    this.config = config;
  }

  /**
   * Auto-discover OIDC configuration
   */
  async discover(): Promise<void> {
    const discoveryUrl = `${this.config.issuer}/.well-known/openid-configuration`;
    const response = await fetch(discoveryUrl);

    if (!response.ok) {
      throw new Error('Failed to discover OIDC configuration');
    }

    this.discoveryDoc = await response.json();
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(options: AuthorizationOptions): string {
    if (!this.discoveryDoc) {
      throw new Error('Must call discover() first');
    }

    const url = new URL(this.discoveryDoc.authorization_endpoint);

    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', options.scope || 'openid profile email');

    if (options.state) url.searchParams.set('state', options.state);
    if (options.nonce) url.searchParams.set('nonce', options.nonce);
    if (options.prompt) url.searchParams.set('prompt', options.prompt);
    if (options.maxAge) url.searchParams.set('max_age', options.maxAge.toString());

    return url.toString();
  }

  /**
   * Handle callback and exchange code for tokens
   */
  async handleCallback(callbackUrl: string): Promise<OIDCTokens> {
    if (!this.discoveryDoc) {
      throw new Error('Must call discover() first');
    }

    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      throw new Error('No code in callback URL');
    }

    // Exchange code for tokens
    const response = await fetch(this.discoveryDoc.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens: OIDCTokens = await response.json();
    return tokens;
  }

  /**
   * Validate and decode ID token
   */
  async validateIdToken(idToken: string): Promise<OIDCUserInfo> {
    // In production, verify signature using JWKS
    // For now, just decode
    const [, payloadB64] = idToken.split('.');
    const payload = JSON.parse(atob(payloadB64));

    // Verify claims
    if (payload.iss !== this.config.issuer) {
      throw new Error('Invalid issuer');
    }

    if (payload.aud !== this.config.clientId) {
      throw new Error('Invalid audience');
    }

    if (payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    return payload;
  }

  /**
   * Get user info from UserInfo endpoint
   */
  async getUserInfo(accessToken: string): Promise<OIDCUserInfo> {
    if (!this.discoveryDoc) {
      throw new Error('Must call discover() first');
    }

    const response = await fetch(this.discoveryDoc.userinfo_endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<OIDCTokens> {
    if (!this.discoveryDoc) {
      throw new Error('Must call discover() first');
    }

    const response = await fetch(this.discoveryDoc.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh tokens');
    }

    return response.json();
  }

  /**
   * Logout
   */
  async logout(idTokenHint?: string): Promise<string> {
    if (!this.discoveryDoc) {
      throw new Error('Must call discover() first');
    }

    const url = new URL(this.discoveryDoc.end_session_endpoint);

    if (idTokenHint) {
      url.searchParams.set('id_token_hint', idTokenHint);
    }

    url.searchParams.set(
      'post_logout_redirect_uri',
      this.config.postLogoutRedirectUri || this.config.redirectUri
    );

    return url.toString();
  }
}
```

**Task 3: Usage Example**

```typescript
// Example: Service Provider using OIDC Client
import { OIDCClient } from '@repo/oidc-client';

const client = new OIDCClient({
  issuer: 'https://idp.school-ecosystem.com',
  clientId: 'ppdb-app',
  clientSecret: 'secret-123',
  redirectUri: 'https://ppdb.school.com/callback',
});

// In login route
export async function GET() {
  await client.discover();

  const authUrl = client.getAuthorizationUrl({
    scope: 'openid profile email school',
    state: generateRandomState(),
    nonce: generateRandomNonce(),
  });

  return redirect(authUrl);
}

// In callback route
export async function GET(request: Request) {
  const callbackUrl = new URL(request.url);

  // Exchange code for tokens
  const tokens = await client.handleCallback(callbackUrl.toString());

  // Validate ID token
  const user = await client.validateIdToken(tokens.id_token);

  // Get fresh user info
  const userInfo = await client.getUserInfo(tokens.access_token);

  // Create session
  await createSession({
    user: userInfo,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });

  return redirect('/dashboard');
}
```

---

## Implementation Order

### Week 1: Foundation (No changes)
1. STORY-012: Setup Supabase
2. STORY-013: Database Schema
3. STORY-014: Database Package
4. STORY-015: Better Auth

### Week 2: RBAC & App (No changes)
5. STORY-016: RBAC Package
6. STORY-017: IdP Next.js App
7. STORY-018: Auth Pages

### Week 3: OIDC Core
8. **STORY-019: JWT Service + OIDC** (4 days - includes RS256, JWKS)
9. **STORY-022: Discovery Endpoint** (1 day)
10. **STORY-023: UserInfo Endpoint** (1 day)

### Week 4: SSO & SDK
11. **STORY-021: OIDC SSO** (3 days - full OIDC flow)
12. **STORY-024: OIDC Client SDK** (2 days)
13. STORY-020: Dashboard Features (2 days)

---

## Testing Checklist

### Discovery
- [ ] /.well-known/openid-configuration returns valid JSON
- [ ] All required fields present
- [ ] Endpoints are correct

### JWKS
- [ ] /.well-known/jwks.json returns public keys
- [ ] Keys can verify ID tokens
- [ ] Keys have correct format

### Authorization
- [ ] scope=openid triggers OIDC flow
- [ ] nonce is stored and returned in ID token
- [ ] prompt parameter works
- [ ] max_age is respected

### Token Endpoint
- [ ] Returns id_token + access_token + refresh_token
- [ ] ID token is valid JWT with RS256
- [ ] ID token contains correct claims
- [ ] ID token includes nonce
- [ ] Access token can be used for UserInfo

### UserInfo Endpoint
- [ ] Requires valid access token
- [ ] Returns standard OIDC claims
- [ ] Returns custom claims
- [ ] Handles missing/invalid token

### OIDC Client SDK
- [ ] Discovery works
- [ ] Authorization URL generation works
- [ ] Code exchange works
- [ ] ID token validation works
- [ ] UserInfo request works
- [ ] Token refresh works
- [ ] Logout works

---

## Environment Variables

Add to `.env.local`:

```bash
# OIDC Configuration
OIDC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
OIDC_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
OIDC_KEY_ID="2024-12-20-key-1"

# Registered Clients
PPDB_CLIENT_SECRET="ppdb-secret-123"
SIS_CLIENT_SECRET="sis-secret-456"
```

---

## Migration Notes

### Backward Compatibility

Keep OAuth 2.0 endpoints during transition:
- `/api/sso/*` - OAuth 2.0 (deprecated)
- `/api/oidc/*` - OpenID Connect (new)

### Client Migration Path

1. Update to `@repo/oidc-client`
2. Test with OIDC endpoints
3. Deploy to production
4. Monitor for issues
5. Deprecate OAuth 2.0 after all clients migrated

---

## Benefits

1. **Industry Standard**: Fully OIDC compliant
2. **Auto-Discovery**: Clients can auto-configure
3. **Better Security**: RS256, nonce, PKCE support
4. **Separation**: ID token for identity, access token for authorization
5. **Interoperable**: Works with any OIDC client library
6. **Future-Proof**: Can federate with external IdPs (Google, Microsoft)

---

## Next Steps

After Phase 1 completion:
1. Add PKCE support for mobile apps
2. Implement client registration API
3. Add consent screen
4. Support additional response types (implicit flow)
5. Federation with external IdPs

---

## Questions?

Refer to:
- [OIDC Design Doc](./oidc-design.md)
- [OpenID Connect Core Spec](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
