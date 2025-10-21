import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import {
  getOAuthClients,
  createOAuthClient,
  type CreateOAuthClientInput,
} from '@repo/database-identity';
import { logAudit } from '@repo/database-identity';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  homepage_url: z.string().url().optional().or(z.literal('')),
  redirect_uris: z.array(z.string().url()).min(1),
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
  is_confidential: z.boolean().optional(),
});

/**
 * GET /api/oauth-clients
 * List all OAuth clients with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('is_active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const { clients, total } = await getOAuthClients({
      search,
      isActive: isActive ? isActive === 'true' : undefined,
      limit,
      offset: (page - 1) * limit,
    });

    // Remove sensitive data
    const sanitized = clients.map((client) => ({
      ...client,
      client_secret_hash: undefined,
    }));

    return NextResponse.json({
      clients: sanitized,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error('Get OAuth clients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oauth-clients
 * Create new OAuth client with auto-generated credentials
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createClientSchema.parse(body);

    // Create client with auto-generated secret
    const clientInput: CreateOAuthClientInput = {
      ...validated,
      created_by: user.id,
    };

    const clientWithSecret = await createOAuthClient(clientInput);

    // Audit log
    await logAudit({
      user_id: user.id,
      action: 'oauth_client.created',
      resource_type: 'oauth_client',
      resource_id: clientWithSecret.id,
      details: {
        client_id: clientWithSecret.client_id,
        name: clientWithSecret.name,
      },
    });

    // Return client with secret (ONLY shown once!)
    return NextResponse.json(
      {
        client: {
          ...clientWithSecret,
          client_secret_hash: undefined, // Never expose hash
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create OAuth client error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
