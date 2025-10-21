import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/db';

/**
 * DELETE /api/user/sessions/[id]
 * Terminate a specific session
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseClient();

    // Terminate session (function verifies ownership)
    const { data, error } = await supabase.rpc('terminate_session_by_id', {
      p_session_id: id,
      p_user_id: session.user.id,
    });

    if (error) {
      console.error('Failed to terminate session:', error);
      return NextResponse.json(
        { error: 'Failed to terminate session' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found or already terminated' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Terminate session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
