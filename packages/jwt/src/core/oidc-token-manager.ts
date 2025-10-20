import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  IDTokenPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
  OIDCTokenPair,
  JWKS,
  JWK,
  TokenGenerationOptions,
} from '../types/oidc';

export class OIDCTokenManager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;
  private issuer: string;

  constructor() {
    // Load keys from environment or files
    if (process.env.OIDC_PRIVATE_KEY && process.env.OIDC_PUBLIC_KEY) {
      // Production: from environment variables
      this.privateKey = process.env.OIDC_PRIVATE_KEY.replace(/\\n/g, '\n');
      this.publicKey = process.env.OIDC_PUBLIC_KEY.replace(/\\n/g, '\n');
      this.keyId = process.env.OIDC_KEY_ID || 'default-key';
    } else {
      // Development: from files
      const keysDir = join(__dirname, '../keys');
      this.privateKey = readFileSync(join(keysDir, 'private.pem'), 'utf8');
      this.publicKey = readFileSync(join(keysDir, 'public.pem'), 'utf8');
      this.keyId = readFileSync(join(keysDir, 'key-id.txt'), 'utf8').trim();
    }

    this.issuer = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  }

  /**
   * Generate ID Token (OIDC)
   */
  generateIdToken(
    payload: Omit<IDTokenPayload, 'iss' | 'exp' | 'iat'>,
    options?: TokenGenerationOptions
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const { sub, aud, auth_time, ...rest } = payload;

    const idTokenPayload: IDTokenPayload = {
      // Standard claims
      iss: options?.issuer || this.issuer,
      sub,
      aud,
      exp: this.calculateExpiration(options?.expiresIn || '1h', now),
      iat: now,
      auth_time: auth_time || now,
      nonce: options?.nonce,

      // Profile claims
      ...rest,
    };

    return jwt.sign(idTokenPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Generate Access Token
   */
  generateAccessToken(
    payload: Omit<AccessTokenPayload, 'iss' | 'exp' | 'iat'>,
    options?: TokenGenerationOptions
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenPayload: AccessTokenPayload = {
      iss: options?.issuer || this.issuer,
      sub: payload.sub,
      aud: payload.aud,
      exp: this.calculateExpiration(options?.expiresIn || '15m', now),
      iat: now,
      scope: payload.scope,
      client_id: payload.client_id,
      permissions: payload.permissions,
      role: payload.role,
      school_id: payload.school_id,
    };

    return jwt.sign(accessTokenPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Generate Refresh Token
   */
  generateRefreshToken(
    payload: Omit<RefreshTokenPayload, 'jti' | 'type' | 'exp' | 'iat'>
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: payload.sub,
      jti: crypto.randomUUID(),
      type: 'refresh',
      exp: now + 30 * 24 * 60 * 60, // 30 days
      iat: now,
      client_id: payload.client_id,
    };

    return jwt.sign(refreshTokenPayload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /**
   * Issue complete OIDC token set
   */
  issueTokens(
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      name: string;
      givenName?: string;
      familyName?: string;
      picture?: string;
      role: string;
      schoolId?: string;
      permissions: string[];
    },
    clientId: string,
    scope: string,
    nonce?: string
  ): OIDCTokenPair {
    const audience = clientId;

    // Generate ID token
    const idToken = this.generateIdToken(
      {
        sub: user.id,
        aud: audience,
        email: user.email,
        email_verified: user.emailVerified,
        name: user.name,
        given_name: user.givenName,
        family_name: user.familyName,
        picture: user.picture,
        locale: 'id_ID',
        role: user.role,
        school_id: user.schoolId,
      },
      { expiresIn: '1h', nonce }
    );

    // Generate access token
    const accessToken = this.generateAccessToken({
      sub: user.id,
      aud: ['https://api.school-ecosystem.com'],
      scope,
      client_id: clientId,
      permissions: user.permissions,
      role: user.role,
      school_id: user.schoolId,
    });

    // Generate refresh token
    const refreshToken = this.generateRefreshToken({
      sub: user.id,
      client_id: clientId,
    });

    return {
      idToken,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
      scope,
    };
  }

  /**
   * Verify and decode token
   */
  verifyToken<T = IDTokenPayload | AccessTokenPayload>(token: string): T {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
      issuer: this.issuer,
    }) as T;
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken<T = IDTokenPayload | AccessTokenPayload>(
    token: string
  ): T | null {
    return jwt.decode(token) as T | null;
  }

  /**
   * Get JWKS (JSON Web Key Set) for public key distribution
   */
  getJWKS(): JWKS {
    const publicKeyObject = crypto.createPublicKey(this.publicKey);
    const jwk = publicKeyObject.export({ format: 'jwk' }) as Record<
      string,
      string | number
    >;

    if (!jwk.n || !jwk.e) {
      throw new Error('Invalid JWK: missing n or e components');
    }

    const key: JWK = {
      kty: 'RSA',
      use: 'sig',
      kid: this.keyId,
      alg: 'RS256',
      n: jwk.n as string,
      e: jwk.e as string,
    };

    return {
      keys: [key],
    };
  }

  /**
   * Calculate expiration time
   */
  private calculateExpiration(expiresIn: string | number, now: number): number {
    if (typeof expiresIn === 'number') {
      return now + expiresIn;
    }

    // Parse string like "15m", "1h", "30d"
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2] as 's' | 'm' | 'h' | 'd';

    const multipliers: Record<'s' | 'm' | 'h' | 'd', number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return now + value * multipliers[unit];
  }
}
