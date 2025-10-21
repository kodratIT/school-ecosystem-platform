import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import {
  getOAuthClientById,
  updateOAuthClient,
  deleteOAuthClient,
  type CreateOAuthClientInput,
} from '@repo/database-identity';
import { logAudit } from '@repo/database-identity';
import { z } from 'zod';

const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  homepage_url: z.string().url().optional().or(z.literal('')),
  redirect_uris: z.array(z.string().url()).optional(),
  post_logout_redirect_uris: z.array(z.string().url()).optional(),
  allowed_scopes: z.array(z.string()).optional(),
  grant_types: z.array(z.string()).optional(),
  response_types: z.array(z.string()).optional(),
  access_token_lifetime: z.number().int().positive().optional(),
  refresh_token_lifetime: z.number().int().positive().optional(),
  id_token_lifetime: z.number().int().positive().optional(),
  require_pkce: z.boolean().optional(),
  require_consent: z.boolean().optional(),
  trusted: z.boolean().optional(),
});

/**
 * GET /api/oauth-clients/:id
 * Get single OAuth client by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await getOAuthClientById(params.id);

    return NextResponse.json({
      ...client,
      client_secret_hash: undefined, // Never expose hash
    });
  } catch (error: unknown) {
    console.error('Get OAuth client error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/oauth-clients/:id
 * Update OAuth client configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateClientSchema.parse(body);

    const updated = await updateOAuthClient(
      params.id,
      validated as Partial<CreateOAuthClientInput>
    );

    await logAudit({
      user_id: user.id,
      action: 'oauth_client.updated',
      resource_type: 'oauth_client',
      resource_id: updated.id,
      details: {
        client_id: updated.client_id,
        changes: validated,
      },
    });

    return NextResponse.json({
      ...updated,
      client_secret_hash: undefined,
    });
  } catch (error: unknown) {
    console.error('Update OAuth client error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/oauth-clients/:id
 * Delete OAuth client permanently
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get client info before deletion
    const client = await getOAuthClientById(params.id);

    await deleteOAuthClient(params.id);

    await logAudit({
      user_id: user.id,
      action: 'oauth_client.deleted',
      resource_type: 'oauth_client',
      resource_id: client.id,
      details: {
        client_id: client.client_id,
        name: client.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete OAuth client error:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
