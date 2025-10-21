# @repo/oidc-client

OpenID Connect (OIDC) client SDK for Service Provider applications in the School Ecosystem.

## Features

- ✅ Auto-discovery of OIDC configuration
- ✅ Authorization Code Flow
- ✅ Token exchange
- ✅ ID Token validation
- ✅ UserInfo requests
- ✅ Token refresh
- ✅ Logout support
- ✅ Type-safe API

## Installation

```bash
pnpm add @repo/oidc-client
```

## Quick Start

```typescript
import { OIDCClient } from '@repo/oidc-client';

// Initialize client
const client = new OIDCClient({
  issuer: 'http://localhost:3000',
  clientId: 'my-app',
  clientSecret: 'secret',
  redirectUri: 'http://localhost:3001/callback',
  scopes: ['openid', 'profile', 'email'],
});

// Discover OIDC configuration
await client.discover();

// Get authorization URL and redirect user
const authUrl = client.getAuthorizationUrl({
  state: 'random-state',
  nonce: 'random-nonce',
});
// Redirect to authUrl

// Handle callback
const tokens = await client.handleCallback(window.location.href);

// Validate ID token
const user = await client.validateIdToken(tokens.id_token);

// Get user info
const userInfo = await client.getUserInfo(tokens.access_token);

// Refresh tokens
const newTokens = await client.refreshTokens(tokens.refresh_token);

// Logout
const logoutUrl = client.getLogoutUrl(tokens.id_token, 'http://localhost:3001');
```

## API Reference

### Constructor

```typescript
new OIDCClient(config: OIDCConfig)
```

#### OIDCConfig

```typescript
interface OIDCConfig {
  issuer: string;          // IdP URL
  clientId: string;        // Client ID
  clientSecret?: string;   // Client secret (optional)
  redirectUri: string;     // Callback URL
  scopes?: string[];       // Requested scopes
}
```

### Methods

#### `discover(): Promise<DiscoveryDocument>`

Auto-discover OIDC configuration from the issuer's `.well-known/openid-configuration` endpoint.

```typescript
const doc = await client.discover();
console.log(doc.authorization_endpoint);
```

#### `getAuthorizationUrl(options?: AuthorizationOptions): string`

Generate authorization URL for user redirect.

```typescript
const url = client.getAuthorizationUrl({
  state: 'random-state',
  nonce: 'random-nonce',
  scope: 'openid profile email',
});
```

#### `handleCallback(callbackUrl: string): Promise<TokenSet>`

Exchange authorization code for tokens.

```typescript
const tokens = await client.handleCallback(window.location.href);
// Returns: { access_token, refresh_token, id_token, expires_in }
```

#### `validateIdToken(idToken: string): Promise<IDTokenPayload>`

Validate and decode ID token (basic validation).

```typescript
const payload = await client.validateIdToken(tokens.id_token);
console.log(payload.sub, payload.email);
```

#### `getUserInfo(accessToken: string): Promise<UserInfo>`

Get user information from UserInfo endpoint.

```typescript
const userInfo = await client.getUserInfo(tokens.access_token);
```

#### `refreshTokens(refreshToken: string): Promise<TokenSet>`

Refresh access token using refresh token.

```typescript
const newTokens = await client.refreshTokens(tokens.refresh_token);
```

#### `getLogoutUrl(idToken?: string, postLogoutRedirectUri?: string): string`

Get logout URL for Single Sign-Out.

```typescript
const logoutUrl = client.getLogoutUrl(
  tokens.id_token,
  'http://localhost:3001/logged-out'
);
```

## TypeScript Types

### TokenSet

```typescript
interface TokenSet {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}
```

### UserInfo

```typescript
interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  [key: string]: unknown;
}
```

### IDTokenPayload

```typescript
interface IDTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
  [key: string]: unknown;
}
```

## Usage Example

### Next.js App Router

```typescript
// app/login/page.tsx
import { OIDCClient } from '@repo/oidc-client';

const client = new OIDCClient({
  issuer: process.env.OIDC_ISSUER!,
  clientId: process.env.OIDC_CLIENT_ID!,
  clientSecret: process.env.OIDC_CLIENT_SECRET!,
  redirectUri: process.env.OIDC_REDIRECT_URI!,
});

export default async function LoginPage() {
  await client.discover();
  const authUrl = client.getAuthorizationUrl();

  return (
    <div>
      <a href={authUrl}>Login with OIDC</a>
    </div>
  );
}
```

```typescript
// app/api/auth/callback/route.ts
import { OIDCClient } from '@repo/oidc-client';

const client = new OIDCClient({
  issuer: process.env.OIDC_ISSUER!,
  clientId: process.env.OIDC_CLIENT_ID!,
  clientSecret: process.env.OIDC_CLIENT_SECRET!,
  redirectUri: process.env.OIDC_REDIRECT_URI!,
});

export async function GET(request: Request) {
  await client.discover();

  const tokens = await client.handleCallback(request.url);
  const user = await client.validateIdToken(tokens.id_token!);

  // Store tokens in session
  // ...

  return NextResponse.redirect('/dashboard');
}
```

## Security Notes

- Always use HTTPS in production
- Validate ID token signatures (basic validation included)
- Store tokens securely (httpOnly cookies recommended)
- Implement proper session management
- Use state parameter to prevent CSRF
- Use nonce to prevent replay attacks

## License

Private
