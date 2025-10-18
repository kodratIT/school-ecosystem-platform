# STORY-021: Implement Single Sign-On (SSO)

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 5  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **user**, I want to **use Single Sign-On to access all applications with one login** so that **I don't need to login separately to each application in the ecosystem**.

This is the FINAL story of Phase 1, implementing the core SSO functionality that enables federated identity.

---

## 🎯 Goals

- Implement SSO flow
- Create SSO authorization endpoint
- Create token exchange endpoint
- Implement Service Provider client
- Add SSO callback handling
- Support multiple Service Providers
- Implement logout propagation
- Full security with JWT validation

---

## ✅ Acceptance Criteria

- [ ] SSO authorization endpoint working
- [ ] Token exchange implemented
- [ ] Service Provider client package created
- [ ] SSO callback handling
- [ ] Multi-SP support
- [ ] Logout propagation
- [ ] JWT validation
- [ ] Security measures implemented
- [ ] Documentation complete
- [ ] End-to-end SSO flow working

---

## 📋 Tasks

### Task 1: Create SSO Authorization Endpoint

**File:** `apps/identity-provider/app/api/sso/authorize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-utils';
import { getSchoolBySlug } from '@repo/database-identity';
import { z } from 'zod';

const authorizeSchema = z.object({
  client_id: z.string(),
  redirect_uri: z.string().url(),
  response_type: z.literal('code'),
  state: z.string().optional(),
  scope: z.string().optional(),
});

/**
 * GET /api/sso/authorize
 * SSO authorization endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Validate parameters
    const params = authorizeSchema.parse({
      client_id: searchParams.get('client_id'),
      redirect_uri: searchParams.get('redirect_uri'),
      response_type: searchParams.get('response_type'),
      state: searchParams.get('state'),
      scope: searchParams.get('scope'),
    });

    // Check if user is authenticated
    const session = await getCurrentSession();
    
    if (!session) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify client_id (Service Provider)
    // TODO: Implement proper SP registration
    const validClientIds = process.env.VALID_CLIENT_IDS?.split(',') || [];
    
    if (!validClientIds.includes(params.client_id)) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Unknown client_id' },
        { status: 400 }
      );
    }

    // Generate authorization code
    const code = crypto.randomUUID();
    
    // Store authorization code (in production, use Redis)
    // For now, store in cookie with short expiration
    const codeData = {
      code,
      userId: session.user.id,
      clientId: params.client_id,
      redirectUri: params.redirect_uri,
      expiresAt: Date.now() + 60000, // 1 minute
    };

    // Redirect to Service Provider with code
    const redirectUrl = new URL(params.redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (params.state) {
      redirectUrl.searchParams.set('state', params.state);
    }

    const response = NextResponse.redirect(redirectUrl);
    
    // Store code in cookie for token exchange
    response.cookies.set('sso_code_' + code, JSON.stringify(codeData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute
    });

    return response;
  } catch (error) {
    console.error('SSO authorize error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Task 2: Create Token Exchange Endpoint

**File:** `apps/identity-provider/app/api/sso/token/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from '@repo/jwt';
import { getUserById } from '@repo/database-identity';
import { z } from 'zod';
import { cookies } from 'next/headers';

const tokenSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uri: z.string().url(),
});

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

/**
 * POST /api/sso/token
 * Exchange authorization code for JWT tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const params = tokenSchema.parse(body);

    // Verify client credentials
    // TODO: Implement proper SP registration with secrets
    const validClients: Record<string, string> = {
      'ppdb-app': process.env.PPDB_CLIENT_SECRET || '',
      'sis-app': process.env.SIS_CLIENT_SECRET || '',
    };

    if (validClients[params.client_id] !== params.client_secret) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Invalid client credentials' },
        { status: 401 }
      );
    }

    // Retrieve code data from cookie
    const cookieStore = await cookies();
    const codeDataCookie = cookieStore.get('sso_code_' + params.code);
    
    if (!codeDataCookie) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    const codeData = JSON.parse(codeDataCookie.value);

    // Verify code
    if (codeData.code !== params.code) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Code mismatch' },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > codeData.expiresAt) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Code expired' },
        { status: 400 }
      );
    }

    // Verify redirect URI matches
    if (codeData.redirectUri !== params.redirect_uri) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Redirect URI mismatch' },
        { status: 400 }
      );
    }

    // Verify client_id matches
    if (codeData.clientId !== params.client_id) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Client ID mismatch' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(codeData.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'User not found' },
        { status: 400 }
      );
    }

    // Issue JWT tokens
    const tokens = tokenManager.issueTokens(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.school_id || undefined,
      },
      params.redirect_uri // Use redirect_uri as audience
    );

    // Delete the code cookie (one-time use)
    const response = NextResponse.json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: tokens.tokenType,
      expires_in: tokens.expiresIn,
    });

    response.cookies.delete('sso_code_' + params.code);

    return response;
  } catch (error) {
    console.error('SSO token error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Task 3: Create SSO Client Package

**File:** `packages/sso-client/package.json`

```json
{
  "name": "@repo/sso-client",
  "version": "0.1.0",
  "private": true,
  "description": "SSO client for Service Provider applications",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch"
  },
  "dependencies": {
    "@repo/jwt": "workspace:*",
    "@repo/types": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

**File:** `packages/sso-client/src/index.ts`

```typescript
import { extractToken, type JWTPayload } from '@repo/jwt';

export interface SSOConfig {
  idpUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class SSOClient {
  private config: SSOConfig;

  constructor(config: SSOConfig) {
    this.config = config;
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const url = new URL(`${this.config.idpUrl}/api/sso/authorize`);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', 'code');
    if (state) {
      url.searchParams.set('state', state);
    }
    return url.toString();
  }

  /**
   * Exchange code for tokens
   */
  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch(`${this.config.idpUrl}/api/sso/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Verify token with IdP
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    const response = await fetch(`${this.config.idpUrl}/api/jwt/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    
    if (!data.data.valid) {
      throw new Error('Invalid token');
    }

    return data.data.payload;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch(`${this.config.idpUrl}/api/jwt/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        audience: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    return {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      expiresIn: data.data.expiresIn,
    };
  }

  /**
   * Logout (redirect to IdP logout)
   */
  getLogoutUrl(returnTo?: string): string {
    const url = new URL(`${this.config.idpUrl}/api/sso/logout`);
    if (returnTo) {
      url.searchParams.set('returnTo', returnTo);
    }
    return url.toString();
  }
}
```

---

### Task 4: Create SSO Callback Handler (Example for SP)

**File:** `packages/sso-client/src/callback-handler.ts`

```typescript
import { SSOClient } from './index';

/**
 * Handle SSO callback in Service Provider
 */
export async function handleSSOCallback(
  code: string,
  ssoClient: SSOClient
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  try {
    // Exchange code for tokens
    const tokens = await ssoClient.exchangeCode(code);

    // Verify the access token
    const payload = await ssoClient.verifyToken(tokens.accessToken);

    console.log('SSO login successful:', payload.email);

    return tokens;
  } catch (error) {
    console.error('SSO callback error:', error);
    throw error;
  }
}
```

---

### Task 5: Create SSO Logout Endpoint

**File:** `apps/identity-provider/app/api/sso/logout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth-client';

/**
 * GET /api/sso/logout
 * Logout from IdP and all Service Providers
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const returnTo = searchParams.get('returnTo');

  // Logout from IdP
  await signOut();

  // TODO: Implement logout propagation to all SPs
  // For now, just redirect back

  if (returnTo) {
    return NextResponse.redirect(returnTo);
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
```

---

### Task 6: Create SSO Documentation

**File:** `docs/SSO.md`

```markdown
# Single Sign-On (SSO) Implementation

## Overview

The School Ecosystem uses SSO with JWT tokens for authentication across all applications.

## Flow

1. **User visits Service Provider (SP)**
   - User is not authenticated
   - SP redirects to IdP authorization endpoint

2. **IdP Authorization**
   - User logs in at IdP (if not already)
   - IdP generates authorization code
   - Redirects back to SP with code

3. **Token Exchange**
   - SP exchanges code for JWT tokens
   - SP verifies token with IdP
   - SP creates local session

4. **Authenticated**
   - User can access SP resources
   - Token included in API requests

## Integration Guide for Service Providers

### 1. Install SSO Client

\`\`\`bash
pnpm add @repo/sso-client
\`\`\`

### 2. Configure SSO Client

\`\`\`typescript
import { SSOClient } from '@repo/sso-client';

const ssoClient = new SSOClient({
  idpUrl: process.env.IDP_URL!,
  clientId: process.env.SSO_CLIENT_ID!,
  clientSecret: process.env.SSO_CLIENT_SECRET!,
  redirectUri: process.env.SSO_REDIRECT_URI!,
});
\`\`\`

### 3. Implement Login Route

\`\`\`typescript
// app/login/page.tsx
export default function LoginPage() {
  const authUrl = ssoClient.getAuthorizationUrl();
  
  return (
    <a href={authUrl}>
      Login with SSO
    </a>
  );
}
\`\`\`

### 4. Implement Callback Route

\`\`\`typescript
// app/api/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect('/login?error=no_code');
  }

  try {
    const tokens = await ssoClient.exchangeCode(code);
    
    // Verify token
    const payload = await ssoClient.verifyToken(tokens.accessToken);
    
    // Create session
    // ... store tokens in session
    
    return NextResponse.redirect('/dashboard');
  } catch (error) {
    return NextResponse.redirect('/login?error=auth_failed');
  }
}
\`\`\`

### 5. Protect Routes

\`\`\`typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  if (!token) {
    const authUrl = ssoClient.getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  }

  try {
    await ssoClient.verifyToken(token.value);
    return NextResponse.next();
  } catch {
    // Token invalid, redirect to login
    const authUrl = ssoClient.getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  }
}
\`\`\`

## Security Considerations

1. **Always use HTTPS** in production
2. **Validate redirect_uri** - Prevent open redirects
3. **Short-lived codes** - 1 minute expiration
4. **One-time codes** - Delete after use
5. **Verify client credentials** - Check client_secret
6. **Validate JWT audience** - Ensure token for correct SP
7. **Implement token refresh** - Don't store long-lived tokens

## API Endpoints

### Authorization Endpoint
\`\`\`
GET /api/sso/authorize
  ?client_id=ppdb-app
  &redirect_uri=https://ppdb.example.com/callback
  &response_type=code
  &state=random-state
\`\`\`

### Token Exchange
\`\`\`
POST /api/sso/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "...",
  "client_id": "ppdb-app",
  "client_secret": "...",
  "redirect_uri": "https://ppdb.example.com/callback"
}
\`\`\`

### Token Verification
\`\`\`
POST /api/jwt/verify
Authorization: Bearer <token>
\`\`\`

### Logout
\`\`\`
GET /api/sso/logout
  ?returnTo=https://ppdb.example.com
\`\`\`

## Troubleshooting

### "invalid_client" Error
- Check client_id and client_secret
- Verify client is registered

### "invalid_grant" Error
- Code may have expired (1 minute)
- Code may have been used already
- redirect_uri may not match

### Token Verification Failed
- Token may have expired
- Invalid signature
- Wrong audience

---

For more help, see [Identity Provider Documentation](./IDENTITY_PROVIDER.md)
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Complete SSO Flow

1. Start IdP: `pnpm dev --filter=@apps/identity-provider`
2. Create test Service Provider
3. Visit SP login page
4. Click "Login with SSO"
5. Should redirect to IdP
6. Login at IdP
7. Should redirect back to SP with code
8. SP exchanges code for tokens
9. User authenticated at SP

---

### Test 2: Token Verification

```bash
# Get token from SSO flow
TOKEN="your-jwt-token"

# Verify with IdP
curl -X POST http://localhost:3000/api/jwt/verify \
  -H "Authorization: Bearer $TOKEN"

# Should return valid: true
```

---

### Test 3: Token Refresh

```bash
# Refresh token
curl -X POST http://localhost:3000/api/jwt/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token",
    "audience": "http://localhost:3001"
  }'
```

---

### Test 4: Logout Propagation

1. Login to SP via SSO
2. Click logout
3. Should logout from IdP
4. Try accessing SP
5. Should require login again

---

## 📸 Expected Results

```
SSO Implementation:
✅ Authorization endpoint working
✅ Token exchange working
✅ SSO client package created
✅ Callback handling implemented
✅ Multi-SP support
✅ Logout working
✅ JWT validation
✅ Security measures in place

Complete Flow:
User → SP → IdP Login → Code → SP → Token Exchange → Authenticated
```

---

## ❌ Common Errors & Solutions

### Error: "Code expired"

**Cause:** Authorization code used after 1 minute

**Solution:** Codes expire quickly for security. Get new code.

---

### Error: "Redirect URI mismatch"

**Cause:** redirect_uri in token exchange doesn't match authorization

**Solution:** Use exact same redirect_uri in both steps

---

### Error: "Invalid client credentials"

**Cause:** Wrong client_secret

**Solution:** Check environment variables

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-015 (Better Auth)
  - STORY-019 (JWT Service)
  - STORY-014 (Database package)
- **Blocks**: None - **FINAL STORY OF PHASE 1!** 🎉

---

## 📚 Resources

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OpenID Connect](https://openid.net/connect/)

---

## 💡 Tips

1. **Use HTTPS** - Required for production
2. **Short-lived codes** - 1 minute max
3. **Validate everything** - Never trust input
4. **One-time codes** - Delete after use
5. **Audit all SSO events** - Track usage
6. **Implement rate limiting** - Prevent abuse

---

## ✏️ Definition of Done

- [ ] SSO authorization working
- [ ] Token exchange working
- [ ] SSO client package complete
- [ ] Callback handling implemented
- [ ] Multiple SPs supported
- [ ] Logout implemented
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] End-to-end flow tested
- [ ] Ready for Service Providers

---

## 🎉 Phase 1 Complete!

With this story, **Phase 1 - Identity Provider is COMPLETE!**

### What We've Built:
✅ Complete Identity database with RLS  
✅ Better Auth integration  
✅ RBAC system  
✅ JWT service for SSO  
✅ Identity Provider app  
✅ Authentication pages  
✅ Dashboard features  
✅ **Single Sign-On implementation**

### Next Phase:
Phase 2 will build the first Service Provider: **PPDB Application**

---

**Created**: 2024  
**Story Owner**: Development Team  
**Status**: 🎯 **FINAL STORY OF PHASE 1**
