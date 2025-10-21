import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@repo/jwt';
import { getOAuthClientByClientId } from '@repo/database-identity';
import { getSupabaseClient } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * GET/POST /api/oidc/endsession
 * OIDC RP-Initiated Logout (End Session Endpoint)
 *
 * Spec: https://openid.net/specs/openid-connect-rpinitiated-1_0.html
 */
export async function GET(request: NextRequest) {
  return handleEndSession(request);
}

export async function POST(request: NextRequest) {
  return handleEndSession(request);
}

async function handleEndSession(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const id_token_hint = searchParams.get('id_token_hint');
    const post_logout_redirect_uri = searchParams.get(
      'post_logout_redirect_uri'
    );
    const state = searchParams.get('state');

    let client_id: string | undefined;
    let user_id: string | undefined;

    // Verify id_token_hint if provided
    if (id_token_hint) {
      try {
        const payload = await verifyIdToken(id_token_hint);
        client_id = payload.aud as string;
        user_id = payload.sub;
      } catch (error) {
        console.error('Invalid id_token_hint:', error);
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Invalid id_token_hint',
          },
          { status: 400 }
        );
      }
    }

    // Validate post_logout_redirect_uri
    if (post_logout_redirect_uri && client_id) {
      const client = await getOAuthClientByClientId(client_id);
      if (!client) {
        return NextResponse.json(
          {
            error: 'invalid_client',
            error_description: 'Client not found',
          },
          { status: 400 }
        );
      }

      // Check if URI is registered
      const logoutUris = (client.post_logout_redirect_uris as string[]) || [];
      if (!logoutUris.includes(post_logout_redirect_uri)) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'post_logout_redirect_uri not registered',
          },
          { status: 400 }
        );
      }
    }

    // Get current session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    // Terminate IdP session cookie
    const response = NextResponse.redirect(
      getRedirectUrl(request, post_logout_redirect_uri, state)
    );
    response.cookies.delete('session_token');

    // Terminate all user sessions in database
    if (user_id) {
      const supabase = getSupabaseClient();

      // Terminate all sessions
      await supabase.rpc('terminate_user_sessions', {
        p_user_id: user_id,
      });

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id,
        action: 'auth.logout',
        resource_type: 'session',
        resource_id: user_id,
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          client_id,
          method: 'endsession',
          id_token_hint_provided: !!id_token_hint,
          post_logout_redirect_uri,
        },
      });
    } else if (sessionToken) {
      // No id_token_hint but has session token
      const supabase = getSupabaseClient();
      await supabase.rpc('terminate_session', {
        p_session_token: sessionToken,
      });
    }

    return response;
  } catch (error) {
    console.error('End session error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function getRedirectUrl(
  request: NextRequest,
  post_logout_redirect_uri: string | null,
  state: string | null
): string {
  if (post_logout_redirect_uri) {
    const redirectUrl = new URL(post_logout_redirect_uri);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }
    return redirectUrl.toString();
  }

  // Default: redirect to logout confirmation page
  const logoutConfirmUrl = new URL('/logout-confirm', request.url);
  return logoutConfirmUrl.toString();
}
