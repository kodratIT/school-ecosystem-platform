import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from '@repo/jwt';
import { getSupabaseClient } from '@/lib/db';
import {
  verifyClientCredentials,
  updateClientLastUsed,
  supportsGrantType,
} from '@repo/database-identity';
import { z } from 'zod';
import { cookies } from 'next/headers';

const tokenSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uri: z.string().url(),
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

    // Retrieve code data from cookie
    const cookieStore = await cookies();
    const codeDataCookie = cookieStore.get('sso_code_' + params.code);

    if (!codeDataCookie) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'Invalid or expired code',
        },
        { status: 400 }
      );
    }

    const codeData = JSON.parse(codeDataCookie.value);

    // Verify code
    if (codeData.code !== params.code) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Code mismatch' },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > codeData.expiresAt) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Code expired' },
        { status: 400 }
      );
    }

    // Verify redirect URI matches
    if (codeData.redirectUri !== params.redirect_uri) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'Redirect URI mismatch',
        },
        { status: 400 }
      );
    }

    // Verify client_id matches
    if (codeData.clientId !== params.client_id) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Client ID mismatch' },
        { status: 400 }
      );
    }

    // Get user from database
    const supabase = getSupabaseClient();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, is_active')
      .eq('id', codeData.userId)
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

    // Delete the code cookie (one-time use)
    const response = NextResponse.json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: tokens.tokenType,
      expires_in: tokens.expiresIn,
    });

    response.cookies.delete('sso_code_' + params.code);

    return response;
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
