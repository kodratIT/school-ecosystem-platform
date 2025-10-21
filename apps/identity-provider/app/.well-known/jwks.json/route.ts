import { NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

let tokenManager: OIDCTokenManager;

/**
 * GET /.well-known/jwks.json
 *
 * JSON Web Key Set endpoint
 * Returns public keys for token verification
 */
export async function GET() {
  try {
    // Initialize token manager (lazy)
    if (!tokenManager) {
      tokenManager = new OIDCTokenManager();
    }

    // Get JWKS
    const jwks = tokenManager.getJWKS();

    return NextResponse.json(jwks, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('JWKS endpoint error:', error);

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Failed to generate JWKS',
      },
      { status: 500 }
    );
  }
}
