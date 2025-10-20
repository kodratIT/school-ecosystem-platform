import type { IDTokenPayload, AccessTokenPayload } from '../types/oidc';

/**
 * Extract user info from ID token
 */
export function extractUserFromIdToken(idToken: IDTokenPayload) {
  return {
    id: idToken.sub,
    email: idToken.email,
    emailVerified: idToken.email_verified,
    name: idToken.name,
    givenName: idToken.given_name,
    familyName: idToken.family_name,
    picture: idToken.picture,
    locale: idToken.locale,
    role: idToken.role,
    schoolId: idToken.school_id,
  };
}

/**
 * Extract permissions from access token
 */
export function extractPermissionsFromAccessToken(
  accessToken: AccessTokenPayload
) {
  return {
    userId: accessToken.sub,
    clientId: accessToken.client_id,
    scope: accessToken.scope,
    permissions: accessToken.permissions,
    role: accessToken.role,
    schoolId: accessToken.school_id,
  };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: { exp: number }): boolean {
  const now = Math.floor(Date.now() / 1000);
  return token.exp < now;
}

/**
 * Get token expiration time remaining (in seconds)
 */
export function getTokenExpiresIn(token: { exp: number }): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, token.exp - now);
}

/**
 * Validate ID token nonce
 */
export function validateNonce(
  idToken: IDTokenPayload,
  expectedNonce: string
): boolean {
  return idToken.nonce === expectedNonce;
}
