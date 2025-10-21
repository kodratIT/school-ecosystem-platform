import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { z } from 'zod';

const grantSchema = z.object({
  client_id: z.string(),
  scopes: z.array(z.string()).optional(),
  approved: z.boolean(),
});

/**
 * POST /api/consent/grant
 * Grant or deny consent for OAuth client
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = grantSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { client_id, scopes, approved } = validation.data;

    const cookieStore = await cookies();
    const consentData = cookieStore.get('consent_request')?.value;

    if (!consentData) {
      return NextResponse.json(
        { error: 'No consent request found' },
        { status: 404 }
      );
    }

    const consentRequest = JSON.parse(consentData);

    if (consentRequest.client_id !== client_id) {
      return NextResponse.json(
        { error: 'Client ID mismatch' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    if (approved && scopes) {
      // Grant consent
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const { error } = await supabase.rpc('grant_user_consent', {
        p_user_id: session.user.id,
        p_client_id: client_id,
        p_scopes: scopes,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
      });

      if (error) {
        console.error('Failed to grant consent:', error);
        return NextResponse.json(
          { error: 'Failed to grant consent' },
          { status: 500 }
        );
      }
    }

    // Build redirect URL with authorization result
    const redirectUrl = new URL(consentRequest.authorization_url);

    if (!approved) {
      // User denied consent
      redirectUrl.searchParams.delete('code');
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'User denied consent');
    }

    // Clear consent request cookie
    const response = NextResponse.json({ redirectUrl: redirectUrl.toString() });
    response.cookies.delete('consent_request');

    return response;
  } catch (error) {
    console.error('Grant consent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
