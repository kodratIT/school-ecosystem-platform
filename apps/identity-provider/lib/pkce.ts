/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * RFC 7636: https://tools.ietf.org/html/rfc7636
 *
 * PKCE protects OAuth authorization code flow from interception attacks,
 * particularly important for public clients (SPAs, mobile apps).
 */

import crypto from 'crypto';

/**
 * Validate code_verifier format
 *
 * Requirements per RFC 7636:
 * - Length: 43-128 characters
 * - Characters: A-Z, a-z, 0-9, -, _, ., ~  (base64url unreserved characters)
 * - Must be base64url encoded (no padding)
 */
export function validateCodeVerifier(verifier: string): boolean {
  if (typeof verifier !== 'string') return false;
  if (verifier.length < 43 || verifier.length > 128) return false;

  // Check for valid base64url characters (unreserved set)
  const base64urlPattern = /^[A-Za-z0-9_~.-]+$/;
  return base64urlPattern.test(verifier);
}

/**
 * Validate code_challenge format
 *
 * Requirements:
 * - Length: 43-128 characters (matching verifier)
 * - Base64url encoded string
 * - No padding (=)
 */
export function validateCodeChallenge(challenge: string): boolean {
  if (typeof challenge !== 'string') return false;
  if (challenge.length < 43 || challenge.length > 128) return false;

  // Check for valid base64url characters
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  return base64urlPattern.test(challenge);
}

/**
 * Validate code_challenge_method
 *
 * Supported methods:
 * - S256: SHA-256 hash (REQUIRED, RECOMMENDED)
 * - plain: No transformation (OPTIONAL, less secure)
 */
export function validateCodeChallengeMethod(method: string): boolean {
  return method === 'S256' || method === 'plain';
}

/**
 * Generate code_challenge from code_verifier
 *
 * @param verifier - The code_verifier
 * @param method - Challenge method ('S256' or 'plain')
 * @returns The code_challenge
 */
export function generateCodeChallenge(
  verifier: string,
  method: 'S256' | 'plain' = 'S256'
): string {
  if (!validateCodeVerifier(verifier)) {
    throw new Error('Invalid code_verifier format');
  }

  if (method === 'plain') {
    return verifier;
  }

  // S256: BASE64URL(SHA256(code_verifier))
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Verify code_verifier against code_challenge
 *
 * @param verifier - The code_verifier from client
 * @param challenge - The stored code_challenge
 * @param method - The challenge method used
 * @returns True if verifier matches challenge
 */
export function verifyCodeChallenge(
  verifier: string,
  challenge: string,
  method: 'S256' | 'plain' = 'S256'
): boolean {
  if (!validateCodeVerifier(verifier)) return false;
  if (!validateCodeChallenge(challenge)) return false;

  const computedChallenge = generateCodeChallenge(verifier, method);

  // Use timing-safe comparison to prevent timing attacks
  return timingSafeEqual(computedChallenge, challenge);
}

/**
 * Base64URL encode a buffer
 *
 * Base64URL is standard base64 with:
 * - Replace + with -
 * - Replace / with _
 * - Remove padding (=)
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks by ensuring comparison takes constant time
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  try {
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    // Fallback for non-matching lengths (though checked above)
    return false;
  }
}

/**
 * Generate a cryptographically secure code_verifier
 *
 * @param length - Length in characters (43-128), default 128
 * @returns A random code_verifier
 */
export function generateCodeVerifier(length: number = 128): string {
  if (length < 43 || length > 128) {
    throw new Error('Code verifier length must be between 43 and 128');
  }

  // Generate random bytes and convert to base64url
  // For 128 chars, need ~96 bytes (128 * 6/8)
  const byteLength = Math.ceil((length * 6) / 8);
  const randomBytes = crypto.randomBytes(byteLength);
  const verifier = base64UrlEncode(randomBytes);

  // Trim to exact length
  return verifier.slice(0, length);
}

/**
 * PKCE Error types
 */
export class PKCEError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'PKCEError';
  }
}

/**
 * Validate PKCE parameters for authorization request
 *
 * @param params - Authorization request parameters
 * @returns Validation result with errors if any
 */
export interface PKCEAuthParams {
  code_challenge?: string;
  code_challenge_method?: string;
}

export interface PKCEValidationResult {
  valid: boolean;
  error?: string;
  errorDescription?: string;
}

export function validatePKCEAuthParams(
  params: PKCEAuthParams,
  requirePKCE: boolean = false
): PKCEValidationResult {
  const { code_challenge, code_challenge_method } = params;

  // If PKCE is required but not provided
  if (requirePKCE && !code_challenge) {
    return {
      valid: false,
      error: 'invalid_request',
      errorDescription: 'code_challenge is required for this client',
    };
  }

  // If code_challenge is provided, validate it
  if (code_challenge) {
    if (!validateCodeChallenge(code_challenge)) {
      return {
        valid: false,
        error: 'invalid_request',
        errorDescription: 'code_challenge must be 43-128 base64url characters',
      };
    }

    // Validate method if provided
    const method = code_challenge_method || 'S256';
    if (!validateCodeChallengeMethod(method)) {
      return {
        valid: false,
        error: 'invalid_request',
        errorDescription: 'code_challenge_method must be S256 or plain',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate PKCE parameters for token request
 *
 * @param verifier - code_verifier from request
 * @param challenge - stored code_challenge
 * @param method - stored code_challenge_method
 * @returns Validation result
 */
export function validatePKCETokenParams(
  verifier: string | undefined,
  challenge: string | null,
  method: string | null
): PKCEValidationResult {
  // If challenge was used, verifier is required
  if (challenge && !verifier) {
    return {
      valid: false,
      error: 'invalid_grant',
      errorDescription: 'code_verifier is required',
    };
  }

  // If verifier provided but no challenge stored
  if (verifier && !challenge) {
    return {
      valid: false,
      error: 'invalid_grant',
      errorDescription: 'code_challenge was not used in authorization',
    };
  }

  // If both present, verify
  if (verifier && challenge) {
    if (!validateCodeVerifier(verifier)) {
      return {
        valid: false,
        error: 'invalid_grant',
        errorDescription: 'Invalid code_verifier format',
      };
    }

    const challengeMethod = (method as 'S256' | 'plain') || 'S256';

    if (!verifyCodeChallenge(verifier, challenge, challengeMethod)) {
      return {
        valid: false,
        error: 'invalid_grant',
        errorDescription: 'code_verifier does not match code_challenge',
      };
    }
  }

  return { valid: true };
}
