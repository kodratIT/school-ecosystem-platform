import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getOAuthClientByClientId,
  validateRedirectUri,
  canRequestScope,
  supportsResponseType,
  createAuthorizationCode,
} from '@repo/database-identity';
import { validatePKCEAuthParams } from '@/lib/pkce';
import { getSupabaseClient } from '@/lib/db';
import { z } from 'zod';

const authorizeSchema = z.object({
  client_id: z.string(),
  redirect_uri: z.string().url(),
  response_type: z.literal('code'),
  state: z.string().optional(),
  scope: z.string().optional(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(['S256', 'plain']).optional(),
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
      code_challenge: searchParams.get('code_challenge'),
      code_challenge_method: searchParams.get('code_challenge_method'),
    });

    // Check if user is authenticated
    const session = await getSession();

    if (!session) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify OAuth client exists and is active
    const client = await getOAuthClientByClientId(params.client_id);

    if (!client) {
      const errorUrl = new URL(params.redirect_uri);
      errorUrl.searchParams.set('error', 'invalid_client');
      errorUrl.searchParams.set('error_description', 'Unknown client');
      if (params.state) errorUrl.searchParams.set('state', params.state);
      return NextResponse.redirect(errorUrl);
    }

    if (!client.is_active) {
      const errorUrl = new URL(params.redirect_uri);
      errorUrl.searchParams.set('error', 'unauthorized_client');
      errorUrl.searchParams.set('error_description', 'Client is inactive');
      if (params.state) errorUrl.searchParams.set('state', params.state);
      return NextResponse.redirect(errorUrl);
    }

    // Validate redirect URI
    if (!validateRedirectUri(client, params.redirect_uri)) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Invalid redirect_uri',
        },
        { status: 400 }
      );
    }

    // Validate response type
    if (!supportsResponseType(client, params.response_type)) {
      const errorUrl = new URL(params.redirect_uri);
      errorUrl.searchParams.set('error', 'unsupported_response_type');
      errorUrl.searchParams.set(
        'error_description',
        'Response type not supported'
      );
      if (params.state) errorUrl.searchParams.set('state', params.state);
      return NextResponse.redirect(errorUrl);
    }

    // Validate scope
    const scope = params.scope || 'openid profile email';
    if (!canRequestScope(client, scope)) {
      const errorUrl = new URL(params.redirect_uri);
      errorUrl.searchParams.set('error', 'invalid_scope');
      errorUrl.searchParams.set(
        'error_description',
        'Requested scope not allowed'
      );
      if (params.state) errorUrl.searchParams.set('state', params.state);
      return NextResponse.redirect(errorUrl);
    }

    // Validate PKCE parameters
    const pkceValidation = validatePKCEAuthParams(
      {
        code_challenge: params.code_challenge,
        code_challenge_method: params.code_challenge_method,
      },
      client.require_pkce || false
    );

    if (!pkceValidation.valid) {
      const errorUrl = new URL(params.redirect_uri);
      errorUrl.searchParams.set(
        'error',
        pkceValidation.error || 'invalid_request'
      );
      errorUrl.searchParams.set(
        'error_description',
        pkceValidation.errorDescription || 'Invalid PKCE parameters'
      );
      if (params.state) errorUrl.searchParams.set('state', params.state);
      return NextResponse.redirect(errorUrl);
    }

    // Check if consent is needed
    const supabase = getSupabaseClient();
    const scopesArray = scope.split(' ');

    const { data: needsConsentData, error: consentError } = await supabase.rpc(
      'needs_consent',
      {
        p_user_id: session.user.id,
        p_client_id: params.client_id,
        p_requested_scopes: scopesArray,
      }
    );

    if (consentError) {
      console.error('Failed to check consent:', consentError);
      const errorUrl = new URL(params.redirect_uri);
      errorUrl.searchParams.set('error', 'server_error');
      errorUrl.searchParams.set(
        'error_description',
        'Failed to process authorization'
      );
      if (params.state) errorUrl.searchParams.set('state', params.state);
      return NextResponse.redirect(errorUrl);
    }

    // If consent is needed, redirect to consent screen
    if (needsConsentData === true) {
      // Generate authorization code for later use
      const code = crypto.randomUUID();

      // Store authorization code
      await createAuthorizationCode({
        code,
        clientId: params.client_id,
        userId: session.user.id,
        redirectUri: params.redirect_uri,
        scope: scopesArray,
        codeChallenge: params.code_challenge,
        codeChallengeMethod: params.code_challenge_method as
          | 'S256'
          | 'plain'
          | undefined,
        expiresInSeconds: 300, // 5 minutes for consent flow
      });

      // Build redirect URL with code
      const redirectUrl = new URL(params.redirect_uri);
      redirectUrl.searchParams.set('code', code);
      if (params.state) {
        redirectUrl.searchParams.set('state', params.state);
      }

      // Store consent request in session/cookie
      const consentRequest = {
        client_id: params.client_id,
        client: {
          client_id: client.client_id,
          name: client.name,
          description: client.description,
          logo_url: client.logo_url,
        },
        scopes: scopesArray,
        authorization_url: redirectUrl.toString(),
        state: params.state,
      };

      const consentUrl = new URL('/consent', request.url);
      const response = NextResponse.redirect(consentUrl);
      response.cookies.set('consent_request', JSON.stringify(consentRequest), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 300, // 5 minutes
        path: '/',
      });

      return response;
    }

    // No consent needed, generate authorization code
    const code = crypto.randomUUID();

    // Store authorization code in database with PKCE support
    await createAuthorizationCode({
      code,
      clientId: params.client_id,
      userId: session.user.id,
      redirectUri: params.redirect_uri,
      scope: scope.split(' '),
      codeChallenge: params.code_challenge,
      codeChallengeMethod: params.code_challenge_method as
        | 'S256'
        | 'plain'
        | undefined,
      expiresInSeconds: 60, // 1 minute
    });

    // Redirect to Service Provider with code
    const redirectUrl = new URL(params.redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (params.state) {
      redirectUrl.searchParams.set('state', params.state);
    }

    return NextResponse.redirect(redirectUrl);
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
