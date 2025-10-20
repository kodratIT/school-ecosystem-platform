# STORY-023: Implement OIDC UserInfo Endpoint

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 1  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **implement OpenID Connect UserInfo endpoint** so that **Service Provider applications can fetch fresh user data using access tokens**.

This endpoint provides a standard way to get user profile information.

---

## 🎯 Goals

- Implement `/api/oidc/userinfo` endpoint
- Support Bearer token authentication
- Return standard OIDC claims
- Support both GET and POST methods
- Handle scope-based claim filtering
- Error handling for invalid tokens

---

## ✅ Acceptance Criteria

- [ ] UserInfo endpoint accessible at `/api/oidc/userinfo`
- [ ] Accepts Bearer token in Authorization header
- [ ] Returns standard OIDC claims
- [ ] Returns custom claims (role, school, permissions)
- [ ] Filters claims based on scope
- [ ] Supports both GET and POST
- [ ] Proper error responses
- [ ] CORS headers configured
- [ ] Documentation complete

---

## 🔗 Prerequisites

- ✅ STORY-019 complete (JWT + OIDC service)
- ✅ STORY-014 complete (Database package)
- ✅ STORY-022 complete (Discovery endpoint)

---

## 📋 Tasks

### Task 1: Create UserInfo Endpoint

**File:** `apps/identity-provider/app/api/oidc/userinfo/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';
import { getUserById } from '@repo/database-identity';
import type { AccessTokenPayload } from '@repo/jwt';

const tokenManager = new OIDCTokenManager();

/**
 * GET/POST /api/oidc/userinfo
 * 
 * OpenID Connect UserInfo endpoint
 * Returns user claims based on access token
 */
export async function GET(request: NextRequest) {
  return handleUserInfoRequest(request);
}

export async function POST(request: NextRequest) {
  return handleUserInfoRequest(request);
}

async function handleUserInfoRequest(request: NextRequest) {
  try {
    // Extract access token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'Missing or invalid Authorization header',
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
          },
        }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Verify and decode access token
    let payload: AccessTokenPayload;
    try {
      payload = tokenManager.verifyToken<AccessTokenPayload>(accessToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'Token verification failed',
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
          },
        }
      );
    }

    // Get fresh user data from database
    const user = await getUserById(payload.sub);

    if (!user) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'User not found',
        },
        { status: 401 }
      );
    }

    // Build claims based on scope
    const scopes = payload.scope.split(' ');
    const claims = buildUserInfoClaims(user, scopes);

    return NextResponse.json(claims, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('UserInfo endpoint error:', error);
    
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build UserInfo claims based on requested scopes
 */
function buildUserInfoClaims(user: any, scopes: string[]) {
  const claims: Record<string, any> = {
    // Always return sub (required)
    sub: user.id,
  };

  // Profile scope
  if (scopes.includes('profile')) {
    claims.name = user.name;
    claims.given_name = user.given_name;
    claims.family_name = user.family_name;
    claims.middle_name = user.middle_name;
    claims.nickname = user.nickname;
    claims.preferred_username = user.preferred_username;
    claims.profile = user.profile;
    claims.picture = user.avatar;
    claims.website = user.website;
    claims.gender = user.gender;
    claims.birthdate = user.birth_date;
    claims.zoneinfo = user.zoneinfo;
    claims.locale = user.locale || 'id_ID';
    claims.updated_at = Math.floor(
      new Date(user.updated_at).getTime() / 1000
    );
  }

  // Email scope
  if (scopes.includes('email')) {
    claims.email = user.email;
    claims.email_verified = user.email_verified;
  }

  // Address scope
  if (scopes.includes('address') && user.address) {
    claims.address = {
      formatted: user.address.formatted,
      street_address: user.address.street,
      locality: user.address.city,
      region: user.address.province,
      postal_code: user.address.postal_code,
      country: user.address.country || 'ID',
    };
  }

  // Phone scope
  if (scopes.includes('phone')) {
    claims.phone_number = user.phone;
    claims.phone_number_verified = user.phone_verified;
  }

  // Custom school scope
  if (scopes.includes('school')) {
    claims.role = user.role;
    claims.school_id = user.school_id;
    
    if (user.school) {
      claims.school_name = user.school.name;
    }
    
    claims.department = user.department;
    claims.permissions = user.permissions || [];
  }

  // Remove undefined values
  Object.keys(claims).forEach((key) => {
    if (claims[key] === undefined || claims[key] === null) {
      delete claims[key];
    }
  });

  return claims;
}
```

---

### Task 2: Create UserInfo Utility

**File:** `apps/identity-provider/lib/oidc/userinfo.ts`

```typescript
import type { AccessTokenPayload } from '@repo/jwt';

/**
 * Extract user ID from access token
 */
export function extractUserIdFromToken(
  payload: AccessTokenPayload
): string {
  return payload.sub;
}

/**
 * Get requested scopes from access token
 */
export function getRequestedScopes(
  payload: AccessTokenPayload
): string[] {
  return payload.scope.split(' ');
}

/**
 * Check if scope is included
 */
export function hasScope(
  payload: AccessTokenPayload,
  scope: string
): boolean {
  return getRequestedScopes(payload).includes(scope);
}

/**
 * Build minimal claims (only sub)
 */
export function buildMinimalClaims(userId: string) {
  return {
    sub: userId,
  };
}

/**
 * Validate access token for UserInfo request
 */
export function validateUserInfoToken(
  payload: AccessTokenPayload
): { valid: boolean; error?: string } {
  // Check required fields
  if (!payload.sub) {
    return { valid: false, error: 'Missing sub claim' };
  }

  if (!payload.scope) {
    return { valid: false, error: 'Missing scope claim' };
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { valid: false, error: 'Token expired' };
  }

  return { valid: true };
}
```

---

### Task 3: Create UserInfo Test Page

**File:** `apps/identity-provider/app/test-userinfo/page.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function TestUserInfoPage() {
  const [accessToken, setAccessToken] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testUserInfo = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/oidc/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`Error ${res.status}: ${JSON.stringify(data)}`);
      } else {
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        UserInfo Endpoint Test
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Access Token
          </label>
          <textarea
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full p-2 border rounded font-mono text-sm"
            rows={4}
            placeholder="Paste access token here..."
          />
        </div>

        <button
          onClick={testUserInfo}
          disabled={!accessToken || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test UserInfo'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        {response && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">
              UserInfo Response
            </h3>
            <pre className="text-sm bg-white p-4 rounded overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">
            How to get access token
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Complete OIDC authorization flow</li>
            <li>Exchange code for tokens</li>
            <li>Copy the access_token from response</li>
            <li>Paste it above and test</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 4: Add UserInfo to Discovery

Update discovery document to include userinfo_endpoint (already done in STORY-022).

---

### Task 5: Create Integration Test

**File:** `apps/identity-provider/__tests__/api/oidc/userinfo.test.ts`

```typescript
import { GET, POST } from '@/app/api/oidc/userinfo/route';
import { NextRequest } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';

describe('/api/oidc/userinfo', () => {
  let tokenManager: OIDCTokenManager;
  let validAccessToken: string;

  beforeAll(() => {
    tokenManager = new OIDCTokenManager();
    
    // Generate valid access token for testing
    validAccessToken = tokenManager.generateAccessToken({
      sub: 'test-user-123',
      aud: ['https://api.test.com'],
      scope: 'openid profile email school',
      client_id: 'test-client',
      permissions: ['read:students'],
      role: 'teacher',
      school_id: 'school-123',
    });
  });

  describe('GET method', () => {
    it('should return 401 without Authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/oidc/userinfo');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('invalid_token');
    });

    it('should return 401 with invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/oidc/userinfo', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return user claims with valid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/oidc/userinfo', {
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
        },
      });
      
      const response = await GET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.sub).toBe('test-user-123');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('role');
    });
  });

  describe('POST method', () => {
    it('should work with POST method', async () => {
      const request = new NextRequest('http://localhost:3000/api/oidc/userinfo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
        },
      });
      
      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Scope filtering', () => {
    it('should only return profile claims when scope=openid profile', async () => {
      const token = tokenManager.generateAccessToken({
        sub: 'test-user-123',
        aud: ['https://api.test.com'],
        scope: 'openid profile',
        client_id: 'test-client',
        permissions: [],
        role: 'teacher',
      });

      const request = new NextRequest('http://localhost:3000/api/oidc/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data).toHaveProperty('name');
      expect(data).not.toHaveProperty('email'); // email scope not included
    });
  });
});
```

---

## 🧪 Testing Instructions

### Test 1: Test with cURL

```bash
# Get access token first (from SSO flow)
ACCESS_TOKEN="your-access-token-here"

# Test GET
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:3000/api/oidc/userinfo

# Test POST
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:3000/api/oidc/userinfo
```

### Test 2: Test Error Cases

```bash
# Without Authorization header
curl http://localhost:3000/api/oidc/userinfo
# Should return 401

# With invalid token
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:3000/api/oidc/userinfo
# Should return 401

# With expired token
curl -H "Authorization: Bearer expired-token" \
  http://localhost:3000/api/oidc/userinfo
# Should return 401
```

### Test 3: Test Scope Filtering

```bash
# Token with only 'openid profile'
# Should return name, picture, etc but NOT email

# Token with 'openid email'
# Should return email but NOT name
```

### Test 4: Test with Postman

1. Create new request: `GET http://localhost:3000/api/oidc/userinfo`
2. Add header: `Authorization: Bearer {access_token}`
3. Send request
4. Should return user claims

### Test 5: Test Integration

```typescript
// Full OIDC flow test
async function testOIDCUserInfo() {
  // 1. Get authorization code
  const authUrl = client.getAuthorizationUrl({ ... });
  
  // 2. Exchange for tokens
  const tokens = await client.handleCallback(callbackUrl);
  
  // 3. Call UserInfo endpoint
  const response = await fetch('/api/oidc/userinfo', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });
  
  const userInfo = await response.json();
  
  console.log('User info:', userInfo);
  // Should match claims from ID token
}
```

---

## 📚 Documentation

### UserInfo Claims by Scope

| Scope | Claims |
|-------|--------|
| `openid` | `sub` (always returned) |
| `profile` | `name`, `given_name`, `family_name`, `picture`, `gender`, `birthdate`, `locale`, `updated_at` |
| `email` | `email`, `email_verified` |
| `address` | `address` (formatted, street_address, locality, region, postal_code, country) |
| `phone` | `phone_number`, `phone_number_verified` |
| `school` | `role`, `school_id`, `school_name`, `department`, `permissions` |

### Response Format

**Success (200 OK):**
```json
{
  "sub": "user-123",
  "email": "user@school.com",
  "email_verified": true,
  "name": "Budi Santoso",
  "given_name": "Budi",
  "family_name": "Santoso",
  "picture": "https://...",
  "locale": "id_ID",
  "role": "teacher",
  "school_id": "school-456",
  "school_name": "SDN 01 Jakarta"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "invalid_token",
  "error_description": "Token verification failed"
}
```

### Error Codes

| Error | Description |
|-------|-------------|
| `invalid_token` | Missing, invalid, or expired token |
| `insufficient_scope` | Token doesn't have required scope |
| `server_error` | Internal server error |

---

## ✅ Story Completion Checklist

- [ ] UserInfo endpoint created
- [ ] Bearer token authentication working
- [ ] Scope-based claim filtering implemented
- [ ] Both GET and POST supported
- [ ] Error handling implemented
- [ ] CORS configured
- [ ] Utility functions created
- [ ] Test page created
- [ ] Integration tests written
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Committed to git

---

## 🚀 Next Steps

After completing this story:
- **STORY-021**: Implement full OIDC SSO flow
- **STORY-024**: Create OIDC Client SDK
- **STORY-020**: Build Dashboard Features

---

## 📖 References

- [OpenID Connect Core - UserInfo Endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
- [OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)
