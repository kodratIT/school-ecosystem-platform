# STORY-022: Implement OIDC Discovery Endpoint

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 1  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **implement OpenID Connect discovery endpoint** so that **Service Provider applications can auto-discover IdP configuration and public keys**.

This enables automatic configuration of OIDC clients without hardcoding URLs.

---

## 🎯 Goals

- Implement `/.well-known/openid-configuration` endpoint
- Implement `/.well-known/jwks.json` endpoint
- Return complete OIDC configuration
- Expose public keys for token verification
- Support auto-discovery for clients

---

## ✅ Acceptance Criteria

- [ ] Discovery endpoint returns valid OIDC configuration
- [ ] JWKS endpoint returns public keys in correct format
- [ ] All required OIDC fields present
- [ ] Endpoints are publicly accessible
- [ ] CORS headers configured correctly
- [ ] Documentation complete

---

## 🔗 Prerequisites

- ✅ STORY-019 complete (JWT + OIDC service)
- ✅ RSA keys generated
- ✅ IdP Next.js app created (STORY-017)

---

## 📋 Tasks

### Task 1: Create Discovery Endpoint

**File:** `apps/identity-provider/app/.well-known/openid-configuration/route.ts`

```typescript
import { NextResponse } from 'next/server';

const BASE_URL =
  process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

/**
 * GET /.well-known/openid-configuration
 * 
 * OpenID Connect Discovery endpoint
 * Returns OIDC Provider configuration
 */
export async function GET() {
  const config = {
    // Required fields
    issuer: BASE_URL,
    authorization_endpoint: `${BASE_URL}/api/oidc/authorize`,
    token_endpoint: `${BASE_URL}/api/oidc/token`,
    jwks_uri: `${BASE_URL}/.well-known/jwks.json`,
    
    // Recommended fields
    userinfo_endpoint: `${BASE_URL}/api/oidc/userinfo`,
    end_session_endpoint: `${BASE_URL}/api/oidc/logout`,
    
    // Supported scopes
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'address',
      'phone',
      'school',
      'offline_access',
    ],
    
    // Supported response types
    response_types_supported: [
      'code',
      'id_token',
      'token id_token',
      'code id_token',
      'code token',
      'code token id_token',
    ],
    
    // Supported response modes
    response_modes_supported: ['query', 'fragment', 'form_post'],
    
    // Supported grant types
    grant_types_supported: [
      'authorization_code',
      'refresh_token',
      'implicit',
    ],
    
    // Subject types
    subject_types_supported: ['public'],
    
    // Signing algorithms
    id_token_signing_alg_values_supported: ['RS256'],
    
    // Token endpoint auth methods
    token_endpoint_auth_methods_supported: [
      'client_secret_post',
      'client_secret_basic',
      'none', // For public clients
    ],
    
    // Supported claims
    claims_supported: [
      // Standard claims
      'sub',
      'iss',
      'aud',
      'exp',
      'iat',
      'auth_time',
      'nonce',
      'acr',
      'amr',
      'azp',
      
      // Profile scope
      'name',
      'given_name',
      'family_name',
      'middle_name',
      'nickname',
      'preferred_username',
      'profile',
      'picture',
      'website',
      'gender',
      'birthdate',
      'zoneinfo',
      'locale',
      'updated_at',
      
      // Email scope
      'email',
      'email_verified',
      
      // Address scope
      'address',
      
      // Phone scope
      'phone_number',
      'phone_number_verified',
      
      // Custom claims (school scope)
      'role',
      'school_id',
      'school_name',
      'department',
      'permissions',
    ],
    
    // PKCE support
    code_challenge_methods_supported: ['S256', 'plain'],
    
    // UI Locales
    ui_locales_supported: ['id-ID', 'en-US'],
    
    // Service documentation
    service_documentation: `${BASE_URL}/docs/oidc`,
    op_policy_uri: `${BASE_URL}/privacy`,
    op_tos_uri: `${BASE_URL}/terms`,
  };

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

---

### Task 2: Create JWKS Endpoint

**File:** `apps/identity-provider/app/.well-known/jwks.json/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

let tokenManager: OIDCTokenManager;

/**
 * GET /.well-known/jwks.json
 * 
 * JSON Web Key Set endpoint
 * Returns public keys for token verification
 */
export async function GET() {
  try {
    // Initialize token manager (lazy)
    if (!tokenManager) {
      tokenManager = new OIDCTokenManager();
    }

    // Get JWKS
    const jwks = tokenManager.getJWKS();

    return NextResponse.json(jwks, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('JWKS endpoint error:', error);
    
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Failed to generate JWKS',
      },
      { status: 500 }
    );
  }
}
```

---

### Task 3: Add CORS Middleware

**File:** `apps/identity-provider/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for OIDC endpoints
  if (
    request.nextUrl.pathname.startsWith('/.well-known') ||
    request.nextUrl.pathname.startsWith('/api/oidc')
  ) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to response
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type'
    );

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/.well-known/:path*', '/api/oidc/:path*'],
};
```

---

### Task 4: Create Discovery Utility

**File:** `apps/identity-provider/lib/oidc/discovery.ts`

```typescript
/**
 * Get OIDC discovery document
 */
export async function getDiscoveryDocument() {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/.well-known/openid-configuration`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch discovery document');
  }
  
  return response.json();
}

/**
 * Get JWKS
 */
export async function getJWKS() {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/.well-known/jwks.json`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch JWKS');
  }
  
  return response.json();
}

/**
 * Validate discovery document
 */
export function validateDiscoveryDocument(doc: any): boolean {
  const requiredFields = [
    'issuer',
    'authorization_endpoint',
    'token_endpoint',
    'jwks_uri',
    'response_types_supported',
    'subject_types_supported',
    'id_token_signing_alg_values_supported',
  ];

  for (const field of requiredFields) {
    if (!doc[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  return true;
}
```

---

### Task 5: Create Test Page

**File:** `apps/identity-provider/app/test-discovery/page.tsx`

```typescript
import { getDiscoveryDocument, getJWKS } from '@/lib/oidc/discovery';

export default async function TestDiscoveryPage() {
  const discovery = await getDiscoveryDocument();
  const jwks = await getJWKS();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">OIDC Discovery Test</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Discovery Document</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(discovery, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">JWKS</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(jwks, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a
                href="/.well-known/openid-configuration"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Discovery Document
              </a>
            </li>
            <li>
              <a
                href="/.well-known/jwks.json"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                JWKS
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Instructions

### Test 1: Test Discovery Endpoint

```bash
# Test locally
curl http://localhost:3000/.well-known/openid-configuration | jq

# Should return complete OIDC configuration
```

**Expected fields:**
- ✅ issuer
- ✅ authorization_endpoint
- ✅ token_endpoint
- ✅ userinfo_endpoint
- ✅ jwks_uri
- ✅ scopes_supported
- ✅ response_types_supported
- ✅ claims_supported

### Test 2: Test JWKS Endpoint

```bash
# Test JWKS
curl http://localhost:3000/.well-known/jwks.json | jq

# Should return public key in JWK format
```

**Expected structure:**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-id",
      "alg": "RS256",
      "n": "base64-modulus",
      "e": "AQAB"
    }
  ]
}
```

### Test 3: Test CORS

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:3000/.well-known/openid-configuration \
  -i

# Should return CORS headers
```

### Test 4: Validate Discovery Document

```bash
# Use online validator
# Visit: https://openid.net/certification/
# Input: http://localhost:3000/.well-known/openid-configuration

# Or use this Node script
node -e "
const https = require('https');
https.get('http://localhost:3000/.well-known/openid-configuration', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const doc = JSON.parse(data);
    console.log('✅ Issuer:', doc.issuer);
    console.log('✅ Authorization:', doc.authorization_endpoint);
    console.log('✅ Token:', doc.token_endpoint);
    console.log('✅ JWKS:', doc.jwks_uri);
    console.log('✅ Scopes:', doc.scopes_supported.join(', '));
  });
});
"
```

### Test 5: Test with OIDC Library

```typescript
// Test auto-discovery with oidc-client library
import { Issuer } from 'openid-client';

const issuer = await Issuer.discover('http://localhost:3000');

console.log('Discovered issuer:', issuer.issuer);
console.log('Authorization endpoint:', issuer.authorization_endpoint);
console.log('Token endpoint:', issuer.token_endpoint);
console.log('JWKS URI:', issuer.jwks_uri);

// Should auto-discover all endpoints ✅
```

---

## 📚 Documentation

### Discovery Document Spec

According to [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html):

**Required Fields:**
- `issuer` - IdP identifier
- `authorization_endpoint` - OAuth 2.0 authorization endpoint
- `token_endpoint` - OAuth 2.0 token endpoint
- `jwks_uri` - Public key set location
- `response_types_supported` - Supported OAuth 2.0 response_type values
- `subject_types_supported` - Subject identifier types (public/pairwise)
- `id_token_signing_alg_values_supported` - JWS signing algorithms

**Recommended Fields:**
- `userinfo_endpoint` - User info endpoint
- `registration_endpoint` - Dynamic registration endpoint
- `scopes_supported` - Supported OAuth 2.0 scope values
- `claims_supported` - Supported claims
- `grant_types_supported` - Supported OAuth 2.0 grant types

### JWKS Spec

According to [JWK RFC 7517](https://tools.ietf.org/html/rfc7517):

**Required JWK Fields (RSA):**
- `kty` - Key type ("RSA")
- `use` - Public key use ("sig" for signature)
- `kid` - Key ID (unique identifier)
- `alg` - Algorithm ("RS256")
- `n` - Modulus (base64url encoded)
- `e` - Exponent (base64url encoded)

---

## ✅ Story Completion Checklist

- [ ] Discovery endpoint created (`/.well-known/openid-configuration`)
- [ ] JWKS endpoint created (`/.well-known/jwks.json`)
- [ ] CORS middleware configured
- [ ] Discovery utility functions created
- [ ] Test page created
- [ ] All required OIDC fields present
- [ ] JWKS returns valid public key
- [ ] CORS headers working
- [ ] Discovery document validates
- [ ] Documentation complete
- [ ] Tests pass
- [ ] Committed to git

---

## 🚀 Next Steps

After completing this story:
- **STORY-023**: Implement OIDC UserInfo Endpoint
- **STORY-021**: Implement full OIDC SSO flow
- **STORY-024**: Create OIDC Client SDK

---

## 📖 References

- [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [JWK RFC 7517](https://tools.ietf.org/html/rfc7517)
- [OIDC Certification](https://openid.net/certification/)
- [Google's .well-known example](https://accounts.google.com/.well-known/openid-configuration)
