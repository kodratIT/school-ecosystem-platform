import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/db';

/**
 * GET /api/user/sessions
 * Get all active sessions for the authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('get_active_sessions', {
      p_user_id: session.user.id,
    });

    if (error) {
      console.error('Failed to get active sessions:', error);
      return NextResponse.json(
        { error: 'Failed to load sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Get user sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
