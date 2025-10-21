import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import {
  rotateClientSecret,
  getOAuthClientById,
} from '@repo/database-identity';
import { logAudit } from '@repo/database-identity';

/**
 * POST /api/oauth-clients/:id/rotate-secret
 * Rotate (regenerate) client secret
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

    // Get client info before rotation
    const clientBefore = await getOAuthClientById(params.id);

    // Rotate secret
    const { client, client_secret } = await rotateClientSecret(params.id);

    await logAudit({
      user_id: user.id,
      action: 'oauth_client.secret_rotated',
      resource_type: 'oauth_client',
      resource_id: client.id,
      details: {
        client_id: client.client_id,
        name: clientBefore.name,
      },
    });

    return NextResponse.json({
      success: true,
      client_secret, // Show new secret ONCE
      client: {
        ...client,
        client_secret_hash: undefined,
      },
    });
  } catch (error: unknown) {
    console.error('Rotate client secret error:', error);
    return NextResponse.json(
      { error: 'Failed to rotate secret' },
      { status: 500 }
    );
  }
}
