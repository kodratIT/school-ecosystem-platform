/**
 * OIDC ID Token Payload
 * Standard claims for identity
 */
export interface IDTokenPayload {
  // Standard OIDC claims (REQUIRED)
  iss: string; // Issuer (IdP URL)
  sub: string; // Subject (User ID)
  aud: string | string[]; // Audience (Client ID)
  exp: number; // Expiration time
  iat: number; // Issued at
  auth_time?: number; // When user authenticated
  nonce?: string; // Nonce from authorization request

  // Standard profile claims (scope: profile)
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;

  // Standard email claims (scope: email)
  email?: string;
  email_verified?: boolean;

  // Standard address claims (scope: address)
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };

  // Standard phone claims (scope: phone)
  phone_number?: string;
  phone_number_verified?: boolean;

  // Custom claims (scope: school)
  role?: string;
  school_id?: string;
  school_name?: string;
  department?: string;
  permissions?: string[];
}

/**
 * Access Token Payload
 * Claims for authorization
 */
export interface AccessTokenPayload {
  // Standard claims
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  scope: string;

  // Authorization-specific
  client_id: string;
  permissions: string[];
  role: string;
  school_id?: string;
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string; // Token ID
  type: 'refresh';
  exp: number;
  iat: number;
  client_id: string;
}

/**
 * OIDC Token Pair
 */
export interface OIDCTokenPair {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
}

/**
 * JSON Web Key (JWK)
 */
export interface JWK {
  kty: string; // Key type (RSA)
  use: string; // Usage (sig = signature)
  kid: string; // Key ID
  alg: string; // Algorithm (RS256)
  n: string; // Modulus (base64url)
  e: string; // Exponent (base64url)
}

/**
 * JSON Web Key Set (JWKS)
 */
export interface JWKS {
  keys: JWK[];
}

/**
 * Token Generation Options
 */
export interface TokenGenerationOptions {
  expiresIn?: string | number;
  audience?: string | string[];
  issuer?: string;
  nonce?: string;
}
