import type {
  OIDCConfig,
  DiscoveryDocument,
  AuthorizationOptions,
  TokenSet,
  UserInfo,
  IDTokenPayload,
} from './types';

export * from './types';

export class OIDCClient {
  private config: OIDCConfig;
  private discoveryDoc?: DiscoveryDocument;

  constructor(config: OIDCConfig) {
    this.config = config;
  }

  /**
   * Discover OIDC configuration from issuer
   */
  async discover(): Promise<DiscoveryDocument> {
    const discoveryUrl = `${this.config.issuer}/.well-known/openid-configuration`;

    const response = await fetch(discoveryUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to discover OIDC configuration: ${response.statusText}`
      );
    }

    const doc: DiscoveryDocument = await response.json();
    this.discoveryDoc = doc;
    return doc;
  }

  /**
   * Get authorization URL for redirect
   */
  getAuthorizationUrl(options: AuthorizationOptions = {}): string {
    if (!this.discoveryDoc) {
      throw new Error('Discovery document not loaded. Call discover() first.');
    }

    const {
      state = this.generateRandomString(),
      nonce = this.generateRandomString(),
      scope = this.config.scopes?.join(' ') || 'openid profile email',
      responseType = 'code',
    } = options;

    const url = new URL(this.discoveryDoc.authorization_endpoint);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', responseType);
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);

    return url.toString();
  }

  /**
   * Handle callback and exchange code for tokens
   */
  async handleCallback(callbackUrl: string): Promise<TokenSet> {
    if (!this.discoveryDoc) {
      throw new Error('Discovery document not loaded. Call discover() first.');
    }

    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      const errorDescription = url.searchParams.get('error_description');
      throw new Error(`OIDC Error: ${error} - ${errorDescription}`);
    }

    if (!code) {
      throw new Error('No authorization code in callback');
    }

    // Exchange code for tokens
    const response = await fetch(this.discoveryDoc.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret || '',
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token exchange failed: ${error.error_description || error.error}`
      );
    }

    return response.json();
  }

  /**
   * Validate ID token (basic validation)
   */
  async validateIdToken(idToken: string): Promise<IDTokenPayload> {
    // Parse JWT (basic implementation - decode only)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid ID token format');
    }

    const payload = JSON.parse(atob(parts[1]!));

    // Basic validation
    if (payload.iss !== this.config.issuer) {
      throw new Error('Invalid issuer');
    }

    if (payload.aud !== this.config.clientId) {
      throw new Error('Invalid audience');
    }

    if (payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }

    return payload;
  }

  /**
   * Get user info from userinfo endpoint
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    if (!this.discoveryDoc?.userinfo_endpoint) {
      throw new Error('UserInfo endpoint not available');
    }

    const response = await fetch(this.discoveryDoc.userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenSet> {
    if (!this.discoveryDoc) {
      throw new Error('Discovery document not loaded. Call discover() first.');
    }

    const response = await fetch(this.discoveryDoc.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token refresh failed: ${error.error_description || error.error}`
      );
    }

    return response.json();
  }

  /**
   * Get logout URL
   */
  getLogoutUrl(idToken?: string, postLogoutRedirectUri?: string): string {
    if (!this.discoveryDoc?.end_session_endpoint) {
      // Fallback to issuer logout
      return `${this.config.issuer}/api/oidc/logout`;
    }

    const url = new URL(this.discoveryDoc.end_session_endpoint);

    if (idToken) {
      url.searchParams.set('id_token_hint', idToken);
    }

    if (postLogoutRedirectUri) {
      url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
    }

    return url.toString();
  }

  /**
   * Generate random string for state/nonce
   */
  private generateRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
