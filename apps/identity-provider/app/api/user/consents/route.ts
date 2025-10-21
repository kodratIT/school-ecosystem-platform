import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/db';

/**
 * GET /api/user/consents
 * Get all active consents for the authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('get_user_consents', {
      p_user_id: session.user.id,
      p_include_revoked: false,
    });

    if (error) {
      console.error('Failed to get user consents:', error);
      return NextResponse.json(
        { error: 'Failed to load consents' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Get user consents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
