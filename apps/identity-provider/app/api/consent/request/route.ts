import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * GET /api/consent/request
 * Get pending consent request from session
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const consentData = cookieStore.get('consent_request')?.value;

    if (!consentData) {
      return NextResponse.json(
        { error: 'No consent request found' },
        { status: 404 }
      );
    }

    const consent = JSON.parse(consentData);

    return NextResponse.json(consent);
  } catch (error) {
    console.error('Get consent request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
