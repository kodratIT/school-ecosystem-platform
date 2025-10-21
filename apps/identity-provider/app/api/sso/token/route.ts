import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { TokenManager } from '@repo/jwt';
import { getSupabaseClient } from '@/lib/db';
import {
  verifyClientCredentials,
  updateClientLastUsed,
  supportsGrantType,
  validateAndConsumeAuthorizationCode,
} from '@repo/database-identity';
import { validatePKCETokenParams } from '@/lib/pkce';
import { z } from 'zod';

const tokenSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uri: z.string().url(),
  code_verifier: z.string().optional(),
});

const tokenManager = new TokenManager(process.env.JWT_SECRET!);

/**
 * POST /api/sso/token
 * Exchange authorization code for JWT tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const params = tokenSchema.parse(body);

    // Verify client credentials from database
    const client = await verifyClientCredentials(
      params.client_id,
      params.client_secret
    );

    if (!client) {
      return NextResponse.json(
        {
          error: 'invalid_client',
          error_description: 'Invalid client credentials',
        },
        { status: 401 }
      );
    }

    // Verify grant type is supported
    if (!supportsGrantType(client, params.grant_type)) {
      return NextResponse.json(
        {
          error: 'unsupported_grant_type',
          error_description: 'Grant type not supported by this client',
        },
        { status: 400 }
      );
    }

    // Update last used timestamp
    await updateClientLastUsed(client.client_id);

    // Validate and consume authorization code from database
    let authCode;
    try {
      authCode = await validateAndConsumeAuthorizationCode(
        params.code,
        params.client_id,
        params.redirect_uri
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description:
            error instanceof Error
              ? error.message
              : 'Invalid authorization code',
        },
        { status: 400 }
      );
    }

    // Validate PKCE if code_challenge was used
    const pkceValidation = validatePKCETokenParams(
      params.code_verifier,
      authCode.code_challenge,
      authCode.code_challenge_method
    );

    if (!pkceValidation.valid) {
      return NextResponse.json(
        {
          error: pkceValidation.error || 'invalid_grant',
          error_description:
            pkceValidation.errorDescription || 'PKCE verification failed',
        },
        { status: 400 }
      );
    }

    // Get user from database
    const supabase = getSupabaseClient();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, is_active')
      .eq('id', authCode.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'User not found' },
        { status: 400 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'User is not active' },
        { status: 400 }
      );
    }

    // Get user's school (if any)
    const { data: userSchool } = await supabase
      .from('user_schools')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // Issue JWT tokens
    const tokens = tokenManager.issueTokens(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        schoolId: userSchool?.school_id || undefined,
      },
      params.redirect_uri // Use redirect_uri as audience
    );

    // Return tokens (authorization code already marked as used in database)
    return NextResponse.json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: tokens.tokenType,
      expires_in: tokens.expiresIn,
    });
  } catch (error) {
    console.error('SSO token error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
