import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { toggleClientStatus } from '@repo/database-identity';
import { logAudit } from '@repo/database-identity';

/**
 * POST /api/oauth-clients/:id/toggle
 * Toggle client active status (enable/disable)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await toggleClientStatus(params.id);

    await logAudit({
      user_id: user.id,
      action: updated.is_active
        ? 'oauth_client.activated'
        : 'oauth_client.deactivated',
      resource_type: 'oauth_client',
      resource_id: updated.id,
      details: {
        client_id: updated.client_id,
        is_active: updated.is_active,
      },
    });

    return NextResponse.json({
      ...updated,
      client_secret_hash: undefined,
    });
  } catch (error: unknown) {
    console.error('Toggle client status error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle status' },
      { status: 500 }
    );
  }
}
