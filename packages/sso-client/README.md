# @repo/sso-client

SSO client package for Service Provider applications in the School Ecosystem.

## Installation

```bash
pnpm add @repo/sso-client
```

## Usage

```typescript
import { SSOClient } from '@repo/sso-client';

// Initialize SSO client
const ssoClient = new SSOClient({
  idpUrl: process.env.IDP_URL!,
  clientId: process.env.SSO_CLIENT_ID!,
  clientSecret: process.env.SSO_CLIENT_SECRET!,
  redirectUri: process.env.SSO_REDIRECT_URI!,
});

// Get authorization URL
const authUrl = ssoClient.getAuthorizationUrl();

// Exchange code for tokens
const tokens = await ssoClient.exchangeCode(code);

// Verify token
const payload = await ssoClient.verifyToken(tokens.accessToken);

// Refresh token
const newTokens = await ssoClient.refreshToken(tokens.refreshToken);

// Get logout URL
const logoutUrl = ssoClient.getLogoutUrl('https://myapp.com');
```

## Methods

### `getAuthorizationUrl(state?: string): string`

Returns the SSO authorization URL to redirect users for login.

### `exchangeCode(code: string): Promise<Tokens>`

Exchanges authorization code for access and refresh tokens.

### `verifyToken(token: string): Promise<JWTPayload>`

Verifies JWT token with the Identity Provider.

### `refreshToken(refreshToken: string): Promise<Tokens>`

Refreshes expired access token using refresh token.

### `getLogoutUrl(returnTo?: string): string`

Returns SSO logout URL for Single Sign-Out.

## License

Private
