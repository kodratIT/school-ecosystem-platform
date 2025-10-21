import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/db';

/**
 * DELETE /api/user/consents/[id]
 * Revoke a user consent
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

    // Get consent to verify ownership
    const { data: consent, error: fetchError } = await supabase.rpc(
      'get_consent_by_id',
      {
        p_consent_id: id,
      }
    );

    if (fetchError || !consent || consent.length === 0) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
    }

    // Verify ownership
    if (consent[0].user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Revoke consent
    const { data, error } = await supabase.rpc('revoke_user_consent', {
      p_user_id: session.user.id,
      p_client_id: consent[0].client_id,
    });

    if (error) {
      console.error('Failed to revoke consent:', error);
      return NextResponse.json(
        { error: 'Failed to revoke consent' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Consent not found or already revoked' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke consent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
