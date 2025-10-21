export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  schoolId?: string;
  iat: number;
  exp: number;
  aud: string;
}

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
        Authorization: `Bearer ${token}`,
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
