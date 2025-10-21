import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const authorizeSchema = z.object({
  client_id: z.string(),
  redirect_uri: z.string().url(),
  response_type: z.literal('code'),
  state: z.string().optional(),
  scope: z.string().optional(),
});

/**
 * GET /api/sso/authorize
 * SSO authorization endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Validate parameters
    const params = authorizeSchema.parse({
      client_id: searchParams.get('client_id'),
      redirect_uri: searchParams.get('redirect_uri'),
      response_type: searchParams.get('response_type'),
      state: searchParams.get('state'),
      scope: searchParams.get('scope'),
    });

    // Check if user is authenticated
    const session = await getSession();

    if (!session) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify client_id (Service Provider)
    // TODO: Implement proper SP registration
    const validClientIds = process.env.VALID_CLIENT_IDS?.split(',') || [];

    if (!validClientIds.includes(params.client_id)) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Unknown client_id' },
        { status: 400 }
      );
    }

    // Generate authorization code
    const code = crypto.randomUUID();

    // Store authorization code (in production, use Redis)
    // For now, store in cookie with short expiration
    const codeData = {
      code,
      userId: session.user.id,
      clientId: params.client_id,
      redirectUri: params.redirect_uri,
      expiresAt: Date.now() + 60000, // 1 minute
    };

    // Redirect to Service Provider with code
    const redirectUrl = new URL(params.redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (params.state) {
      redirectUrl.searchParams.set('state', params.state);
    }

    const response = NextResponse.redirect(redirectUrl);

    // Store code in cookie for token exchange
    response.cookies.set('sso_code_' + code, JSON.stringify(codeData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute
    });

    return response;
  } catch (error) {
    console.error('SSO authorize error:', error);

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
