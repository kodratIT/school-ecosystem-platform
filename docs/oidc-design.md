# OpenID Connect Implementation Design

## Overview

This document outlines the complete OpenID Connect (OIDC) implementation for the School Ecosystem Identity Provider.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│         Identity Provider (IdP) - OIDC Compliant         │
│                                                          │
│  Discovery & Keys:                                       │
│  /.well-known/openid-configuration  → Discovery doc     │
│  /.well-known/jwks.json             → Public keys       │
│                                                          │
│  Core Endpoints:                                         │
│  /api/oidc/authorize    → Authorization endpoint        │
│  /api/oidc/token        → Token endpoint                │
│  /api/oidc/userinfo     → User information endpoint     │
│  /api/oidc/logout       → End session endpoint          │
│                                                          │
│  Tokens: id_token + access_token + refresh_token        │
└──────────────────────────────────────────────────────────┘
```

## Endpoints

### 1. Discovery Endpoint (REQUIRED)

**GET** `/.well-known/openid-configuration`

Returns OIDC configuration for auto-discovery.

**Response:**
```json
{
  "issuer": "https://idp.school-ecosystem.com",
  "authorization_endpoint": "https://idp.school-ecosystem.com/api/oidc/authorize",
  "token_endpoint": "https://idp.school-ecosystem.com/api/oidc/token",
  "userinfo_endpoint": "https://idp.school-ecosystem.com/api/oidc/userinfo",
  "end_session_endpoint": "https://idp.school-ecosystem.com/api/oidc/logout",
  "jwks_uri": "https://idp.school-ecosystem.com/.well-known/jwks.json",
  
  "scopes_supported": [
    "openid",
    "profile", 
    "email",
    "school",
    "offline_access"
  ],
  
  "response_types_supported": [
    "code",
    "id_token",
    "token id_token",
    "code id_token",
    "code token",
    "code token id_token"
  ],
  
  "response_modes_supported": ["query", "fragment", "form_post"],
  
  "grant_types_supported": [
    "authorization_code",
    "refresh_token",
    "implicit"
  ],
  
  "subject_types_supported": ["public"],
  
  "id_token_signing_alg_values_supported": ["RS256", "HS256"],
  
  "token_endpoint_auth_methods_supported": [
    "client_secret_post",
    "client_secret_basic"
  ],
  
  "claims_supported": [
    "sub",
    "iss",
    "aud",
    "exp",
    "iat",
    "auth_time",
    "nonce",
    "email",
    "email_verified",
    "name",
    "given_name",
    "family_name",
    "picture",
    "locale",
    "role",
    "school_id"
  ],
  
  "code_challenge_methods_supported": ["S256"]
}
```

### 2. JWKS Endpoint (REQUIRED)

**GET** `/.well-known/jwks.json`

Returns public keys for token verification.

**Response:**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "2024-12-20-key-1",
      "alg": "RS256",
      "n": "base64-encoded-modulus",
      "e": "AQAB"
    }
  ]
}
```

### 3. Authorization Endpoint (MODIFIED)

**GET** `/api/oidc/authorize`

**Parameters:**
- `client_id` (required): Client identifier
- `redirect_uri` (required): Callback URL
- `response_type` (required): Must include "code" or "id_token"
- `scope` (required): Must include "openid"
- `state` (recommended): State parameter for CSRF protection
- `nonce` (recommended): Nonce for ID token validation
- `prompt` (optional): "none", "login", "consent", "select_account"
- `max_age` (optional): Maximum authentication age
- `ui_locales` (optional): Preferred languages

**Example:**
```
GET /api/oidc/authorize?
  client_id=ppdb-app&
  redirect_uri=https://ppdb.school.com/callback&
  response_type=code&
  scope=openid%20profile%20email%20school&
  state=abc123&
  nonce=xyz789
```

**Flow:**
1. Check if user is authenticated
2. If not, redirect to login with return URL
3. Check if consent is needed
4. Generate authorization code
5. Redirect to Service Provider with code

### 4. Token Endpoint (MODIFIED)

**POST** `/api/oidc/token`

**Parameters:**
- `grant_type`: "authorization_code" or "refresh_token"
- `code`: Authorization code (for authorization_code grant)
- `redirect_uri`: Must match authorize request
- `client_id`: Client identifier
- `client_secret`: Client secret
- `refresh_token`: Refresh token (for refresh_token grant)

**Response:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwMjQtMTItMjAta2V5LTEifQ...",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh-token-value",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "openid profile email school"
}
```

**Key Changes:**
- Returns **id_token** (NEW)
- ID token contains user identity claims
- Access token for API authorization
- Both tokens are JWTs signed with RS256

### 5. UserInfo Endpoint (NEW)

**GET** `/api/oidc/userinfo`

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "sub": "user-123456",
  "email": "guru@sekolah.com",
  "email_verified": true,
  "name": "Budi Santoso",
  "given_name": "Budi",
  "family_name": "Santoso",
  "picture": "https://cdn.school.com/avatars/user-123.jpg",
  "locale": "id_ID",
  "role": "teacher",
  "school_id": "school-456",
  "school_name": "SDN 01 Jakarta",
  "updated_at": 1735513200
}
```

### 6. End Session Endpoint (NEW)

**GET** `/api/oidc/logout`

**Parameters:**
- `id_token_hint` (optional): ID token to identify session
- `post_logout_redirect_uri` (optional): Where to redirect after logout
- `state` (optional): State parameter

**Flow:**
1. Validate id_token_hint
2. Invalidate user session
3. Clear cookies
4. Redirect to post_logout_redirect_uri

## Token Details

### ID Token Structure

```typescript
interface IDToken {
  // Standard OIDC Claims (REQUIRED)
  iss: string;           // Issuer (IdP URL)
  sub: string;           // Subject (User ID)
  aud: string | string[]; // Audience (Client ID)
  exp: number;           // Expiration time
  iat: number;           // Issued at
  auth_time: number;     // Authentication time
  nonce?: string;        // Nonce from request
  
  // Standard Profile Claims (scope: profile)
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
  
  // Standard Email Claims (scope: email)
  email?: string;
  email_verified?: boolean;
  
  // Custom Claims (scope: school)
  role?: string;
  school_id?: string;
  school_name?: string;
  department?: string;
  permissions?: string[];
}
```

### Access Token Structure

```typescript
interface AccessToken {
  // Standard Claims
  iss: string;           // Issuer
  sub: string;           // Subject (User ID)
  aud: string | string[]; // Audience (API URLs)
  exp: number;           // Expiration time
  iat: number;           // Issued at
  scope: string;         // Granted scopes
  
  // Authorization Claims
  client_id: string;
  permissions: string[];
  role: string;
  school_id?: string;
}
```

## Scopes

### Standard OIDC Scopes

- **`openid`** (REQUIRED): Triggers OIDC flow, includes `sub` claim
- **`profile`**: Returns profile claims (name, picture, etc)
- **`email`**: Returns email and email_verified claims
- **`address`**: Returns address claims (not used in school ecosystem)
- **`phone`**: Returns phone_number claims (optional)
- **`offline_access`**: Requests refresh token

### Custom Scopes

- **`school`**: Returns school-specific claims (school_id, role, permissions)
- **`read:students`**: Permission to read student data
- **`write:grades`**: Permission to write grades
- **`manage:classes`**: Permission to manage classes

## Security Features

### 1. PKCE (Proof Key for Code Exchange)

For public clients (mobile apps, SPAs):

**Authorization Request:**
```
GET /api/oidc/authorize?
  client_id=mobile-app&
  code_challenge=BASE64URL(SHA256(code_verifier))&
  code_challenge_method=S256&
  ...
```

**Token Request:**
```
POST /api/oidc/token
{
  "code": "...",
  "code_verifier": "original-random-string",
  ...
}
```

### 2. State Parameter

Prevent CSRF attacks:
```
1. Client generates random state
2. Includes in authorize request
3. IdP returns state in callback
4. Client validates state matches
```

### 3. Nonce Parameter

Prevent replay attacks:
```
1. Client generates random nonce
2. Includes in authorize request
3. IdP includes nonce in ID token
4. Client validates nonce matches
```

### 4. Token Validation

**ID Token Validation Steps:**
1. Verify signature using JWKS
2. Verify `iss` matches IdP URL
3. Verify `aud` matches client_id
4. Verify `exp` is not expired
5. Verify `nonce` matches request
6. Verify `auth_time` if max_age was specified

## Client Registration

Service Providers must register with IdP:

```typescript
interface OIDCClient {
  client_id: string;
  client_secret: string;
  client_name: string;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
  grant_types: ("authorization_code" | "refresh_token")[];
  response_types: ("code" | "id_token" | "token")[];
  scope: string;
  token_endpoint_auth_method: "client_secret_post" | "client_secret_basic";
  logo_uri?: string;
}
```

**Example Clients:**

```typescript
const clients: OIDCClient[] = [
  {
    client_id: "ppdb-app",
    client_secret: "secret-123",
    client_name: "PPDB Application",
    redirect_uris: [
      "https://ppdb.school.com/callback",
      "http://localhost:3001/callback"
    ],
    post_logout_redirect_uris: [
      "https://ppdb.school.com/",
      "http://localhost:3001/"
    ],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: "openid profile email school offline_access",
    token_endpoint_auth_method: "client_secret_post"
  },
  {
    client_id: "sis-app",
    client_secret: "secret-456",
    client_name: "Student Information System",
    redirect_uris: ["https://sis.school.com/callback"],
    post_logout_redirect_uris: ["https://sis.school.com/"],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: "openid profile email school offline_access",
    token_endpoint_auth_method: "client_secret_post"
  }
];
```

## Implementation Packages

### 1. JWT Package Enhancement

**Current:** `@repo/jwt`  
**Changes:**
- Add RS256 support (currently only HS256)
- Generate and manage RSA key pairs
- Implement JWKS generation
- Add ID token generation
- Separate access token and ID token logic

### 2. OIDC Client Package (NEW)

**Package:** `@repo/oidc-client`  
**Purpose:** SDK for Service Providers to integrate with IdP

**Features:**
- Auto-discovery from /.well-known/openid-configuration
- Authorization flow helpers
- Token validation
- Token refresh
- Logout helpers

**Usage:**
```typescript
import { OIDCClient } from '@repo/oidc-client';

const client = new OIDCClient({
  issuer: 'https://idp.school-ecosystem.com',
  clientId: 'ppdb-app',
  clientSecret: 'secret-123',
  redirectUri: 'https://ppdb.school.com/callback'
});

// Auto-discover endpoints
await client.discover();

// Start login
const authUrl = client.getAuthorizationUrl({
  scope: 'openid profile email school',
  state: 'random-state',
  nonce: 'random-nonce'
});

// Handle callback
const tokens = await client.handleCallback(callbackUrl);
// Returns: { idToken, accessToken, refreshToken }

// Validate ID token
const user = await client.validateIdToken(tokens.idToken);

// Get fresh user info
const userInfo = await client.getUserInfo(tokens.accessToken);

// Refresh tokens
const newTokens = await client.refreshTokens(tokens.refreshToken);
```

## Migration from OAuth 2.0

### Phase 1: Add OIDC Endpoints

1. Keep existing `/api/sso/*` endpoints (OAuth 2.0)
2. Add new `/api/oidc/*` endpoints (OIDC)
3. Both work in parallel

### Phase 2: Update JWT Package

1. Add RS256 support
2. Generate RSA key pairs
3. Implement ID token generation
4. Implement JWKS endpoint

### Phase 3: Client Migration

1. Update Service Provider apps one by one
2. Use new `@repo/oidc-client` package
3. Handle both OAuth 2.0 and OIDC sessions during transition

### Phase 4: Deprecate OAuth 2.0

1. All Service Providers migrated to OIDC
2. Mark `/api/sso/*` as deprecated
3. Remove OAuth 2.0 endpoints in future version

## Testing

### 1. Discovery Endpoint
```bash
curl https://idp.school.com/.well-known/openid-configuration
```

### 2. JWKS Endpoint
```bash
curl https://idp.school.com/.well-known/jwks.json
```

### 3. Full OIDC Flow

```typescript
// Test script
async function testOIDCFlow() {
  const client = new OIDCClient({ ... });
  
  // 1. Discovery
  await client.discover();
  console.log('✓ Discovery successful');
  
  // 2. Authorization
  const authUrl = client.getAuthorizationUrl({ ... });
  console.log('✓ Authorization URL generated');
  
  // 3. Manual login and get callback URL
  const callbackUrl = '...'; // From browser
  
  // 4. Token exchange
  const tokens = await client.handleCallback(callbackUrl);
  console.log('✓ Tokens received');
  
  // 5. Validate ID token
  const user = await client.validateIdToken(tokens.idToken);
  console.log('✓ ID token valid:', user);
  
  // 6. Get user info
  const userInfo = await client.getUserInfo(tokens.accessToken);
  console.log('✓ UserInfo retrieved:', userInfo);
  
  // 7. Refresh token
  const newTokens = await client.refreshTokens(tokens.refreshToken);
  console.log('✓ Tokens refreshed');
}
```

## Benefits of OIDC

1. **Standardized**: Industry standard protocol
2. **Interoperable**: Works with any OIDC-compliant client
3. **Secure**: Built-in security features (nonce, state, PKCE)
4. **Discovery**: Auto-configuration for clients
5. **Separation**: ID token for identity, access token for authorization
6. **Extensible**: Can add custom claims and scopes
7. **Future-proof**: Easy integration with external IdPs

## References

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
