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

```bash
pnpm add @repo/sso-client
```

### 2. Configure SSO Client

```typescript
import { SSOClient } from '@repo/sso-client';

const ssoClient = new SSOClient({
  idpUrl: process.env.IDP_URL!,
  clientId: process.env.SSO_CLIENT_ID!,
  clientSecret: process.env.SSO_CLIENT_SECRET!,
  redirectUri: process.env.SSO_REDIRECT_URI!,
});
```

### 3. Implement Login Route

```typescript
// app/login/page.tsx
export default function LoginPage() {
  const authUrl = ssoClient.getAuthorizationUrl();

  return <a href={authUrl}>Login with SSO</a>;
}
```

### 4. Implement Callback Route

```typescript
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
```

### 5. Protect Routes

```typescript
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
```

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

```
GET /api/sso/authorize
  ?client_id=ppdb-app
  &redirect_uri=https://ppdb.example.com/callback
  &response_type=code
  &state=random-state
```

### Token Exchange

```
POST /api/sso/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "...",
  "client_id": "ppdb-app",
  "client_secret": "...",
  "redirect_uri": "https://ppdb.example.com/callback"
}
```

### Token Verification

```
POST /api/jwt/verify
Authorization: Bearer <token>
```

### Logout

```
GET /api/sso/logout
  ?returnTo=https://ppdb.example.com
```

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
