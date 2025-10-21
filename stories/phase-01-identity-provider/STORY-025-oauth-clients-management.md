# STORY-025: OAuth Clients Management

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 5 (Extension)  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 PLANNED

---

## 📖 Description

As a **Super Admin**, I want to **manage OAuth clients (Service Providers)** so that **I can register, configure, and monitor applications that integrate with the Identity Provider**.

Currently, SSO endpoints exist but there's NO WAY to register new clients via UI. Client validation is hard-coded. This story fixes that gap.

---

## 🎯 Goals

- Create `oauth_clients` database table
- Build CRUD API for client management
- Create dashboard UI for client registration
- Implement client secret generation & rotation
- Add redirect URI validation
- Support scope configuration per client
- Enable/disable clients
- Track client usage

---

## ✅ Acceptance Criteria

### Database
- [ ] `oauth_clients` table created with proper columns
- [ ] RLS policies configured for security
- [ ] Indexes added for performance
- [ ] Migration tested

### API
- [ ] POST `/api/oauth-clients` - Create client
- [ ] GET `/api/oauth-clients` - List clients (paginated)
- [ ] GET `/api/oauth-clients/:id` - Get client details
- [ ] PUT `/api/oauth-clients/:id` - Update client
- [ ] DELETE `/api/oauth-clients/:id` - Delete client
- [ ] POST `/api/oauth-clients/:id/rotate-secret` - Rotate secret
- [ ] POST `/api/oauth-clients/:id/toggle` - Enable/disable
- [ ] Proper validation & error handling
- [ ] RBAC enforcement (super_admin only)

### UI
- [ ] `/oauth-clients` - List page with table
- [ ] `/oauth-clients/new` - Create form
- [ ] `/oauth-clients/:id` - Edit form
- [ ] Client secret modal (show once on creation)
- [ ] Secret rotation confirmation
- [ ] Delete confirmation dialog
- [ ] Search & filter functionality
- [ ] Status badges (active/inactive)

### Security
- [ ] Client secrets hashed (bcrypt)
- [ ] Client ID is UUID v4
- [ ] Redirect URIs validated
- [ ] Only super_admin can manage
- [ ] Audit logging for all actions

---

## 🔗 Prerequisites

- ✅ STORY-013 complete (Database schema)
- ✅ STORY-016 complete (RBAC package)
- ✅ STORY-020 complete (Dashboard foundation)
- ✅ STORY-021 complete (SSO implementation)

---

## 📋 Tasks

### Task 1: Create Database Migration

**File:** `supabase/identity/migrations/20250121_oauth_clients.sql`

```sql
-- OAuth Clients Table
CREATE TABLE IF NOT EXISTS oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Client credentials
  client_id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'client_' || gen_random_uuid()::text,
  client_secret_hash VARCHAR(255) NOT NULL, -- bcrypt hashed
  
  -- Client information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  homepage_url TEXT,
  
  -- OAuth configuration
  redirect_uris TEXT[] NOT NULL DEFAULT '{}',
  post_logout_redirect_uris TEXT[] DEFAULT '{}',
  allowed_scopes TEXT[] DEFAULT '{openid,profile,email}',
  grant_types TEXT[] DEFAULT '{authorization_code,refresh_token}',
  response_types TEXT[] DEFAULT '{code}',
  
  -- Token settings
  access_token_lifetime INTEGER DEFAULT 900, -- 15 minutes in seconds
  refresh_token_lifetime INTEGER DEFAULT 2592000, -- 30 days
  id_token_lifetime INTEGER DEFAULT 3600, -- 1 hour
  
  -- Security
  require_pkce BOOLEAN DEFAULT false,
  require_consent BOOLEAN DEFAULT true,
  trusted BOOLEAN DEFAULT false, -- Skip consent if true
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_confidential BOOLEAN DEFAULT true, -- Public vs Confidential client
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_redirect_uris CHECK (array_length(redirect_uris, 1) > 0),
  CONSTRAINT valid_token_lifetime CHECK (
    access_token_lifetime > 0 AND
    refresh_token_lifetime > 0 AND
    id_token_lifetime > 0
  )
);

-- Indexes
CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_is_active ON oauth_clients(is_active);
CREATE INDEX idx_oauth_clients_created_by ON oauth_clients(created_by);
CREATE INDEX idx_oauth_clients_created_at ON oauth_clients(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_oauth_clients_updated_at
  BEFORE UPDATE ON oauth_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY oauth_clients_super_admin_all
  ON oauth_clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- All authenticated users can read active clients (for SSO flow)
CREATE POLICY oauth_clients_read_active
  ON oauth_clients
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Comments
COMMENT ON TABLE oauth_clients IS 'OAuth 2.0 / OIDC registered clients (Service Providers)';
COMMENT ON COLUMN oauth_clients.client_id IS 'Public client identifier';
COMMENT ON COLUMN oauth_clients.client_secret_hash IS 'Bcrypt hashed client secret';
COMMENT ON COLUMN oauth_clients.redirect_uris IS 'Allowed redirect URIs for OAuth flow';
COMMENT ON COLUMN oauth_clients.allowed_scopes IS 'Scopes this client can request';
COMMENT ON COLUMN oauth_clients.is_confidential IS 'True for server-side apps, false for SPA/mobile';
COMMENT ON COLUMN oauth_clients.trusted IS 'If true, skip consent screen';
```

---

### Task 2: Add Database Functions

**File:** `packages/database-identity/src/oauth-clients.ts`

```typescript
import { createClient } from './client';
import { hashPassword, comparePassword } from './utils/hash';
import type { Database } from './types/database';

type OAuthClient = Database['public']['Tables']['oauth_clients']['Row'];
type NewOAuthClient = Database['public']['Tables']['oauth_clients']['Insert'];
type UpdateOAuthClient = Database['public']['Tables']['oauth_clients']['Update'];

/**
 * Get all OAuth clients
 */
export async function getOAuthClients(options?: {
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  
  let query = supabase
    .from('oauth_clients')
    .select('*', { count: 'exact' });

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(
      options?.offset || 0,
      (options?.offset || 0) + (options?.limit || 50) - 1
    );

  const { data, error, count } = await query;

  if (error) throw error;

  return { clients: data || [], total: count || 0 };
}

/**
 * Get OAuth client by ID
 */
export async function getOAuthClientById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oauth_clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get OAuth client by client_id
 */
export async function getOAuthClientByClientId(clientId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oauth_clients')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
}

/**
 * Create OAuth client
 */
export async function createOAuthClient(
  client: Omit<NewOAuthClient, 'id' | 'client_id' | 'client_secret_hash'> & {
    client_secret: string;
  }
) {
  const supabase = createClient();
  
  // Hash client secret
  const client_secret_hash = await hashPassword(client.client_secret);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { client_secret, ...clientData } = client;
  
  const { data, error } = await supabase
    .from('oauth_clients')
    .insert({
      ...clientData,
      client_secret_hash,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update OAuth client
 */
export async function updateOAuthClient(
  id: string,
  updates: UpdateOAuthClient
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oauth_clients')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete OAuth client
 */
export async function deleteOAuthClient(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('oauth_clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Rotate client secret
 */
export async function rotateClientSecret(id: string, newSecret: string) {
  const supabase = createClient();
  
  const client_secret_hash = await hashPassword(newSecret);
  
  const { data, error } = await supabase
    .from('oauth_clients')
    .update({
      client_secret_hash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Verify client credentials
 */
export async function verifyClientCredentials(
  clientId: string,
  clientSecret: string
): Promise<OAuthClient | null> {
  const client = await getOAuthClientByClientId(clientId);
  
  if (!client) return null;
  if (!client.is_active) return null;
  
  const valid = await comparePassword(clientSecret, client.client_secret_hash);
  
  return valid ? client : null;
}

/**
 * Update last used timestamp
 */
export async function updateClientLastUsed(clientId: string) {
  const supabase = createClient();
  
  await supabase
    .from('oauth_clients')
    .update({ last_used_at: new Date().toISOString() })
    .eq('client_id', clientId);
}

/**
 * Toggle client active status
 */
export async function toggleClientStatus(id: string) {
  const supabase = createClient();
  
  const client = await getOAuthClientById(id);
  
  const { data, error } = await supabase
    .from('oauth_clients')
    .update({
      is_active: !client.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Validate redirect URI against client configuration
 */
export function validateRedirectUri(
  client: OAuthClient,
  redirectUri: string
): boolean {
  return client.redirect_uris.includes(redirectUri);
}

/**
 * Check if client can request scope
 */
export function canRequestScope(
  client: OAuthClient,
  requestedScope: string
): boolean {
  const requestedScopes = requestedScope.split(' ');
  return requestedScopes.every((scope) =>
    client.allowed_scopes.includes(scope)
  );
}
```

---

### Task 3: Add Hash Utility

**File:** `packages/database-identity/src/utils/hash.ts`

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random secret
 */
export function generateSecret(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

---

### Task 4: Create API Routes

**File:** `apps/identity-provider/app/api/oauth-clients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import {
  getOAuthClients,
  createOAuthClient,
} from '@repo/database-identity';
import { generateSecret } from '@repo/database-identity/utils/hash';
import { createAuditLog } from '@repo/database-identity';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  homepage_url: z.string().url().optional(),
  redirect_uris: z.array(z.string().url()).min(1),
  post_logout_redirect_uris: z.array(z.string().url()).optional(),
  allowed_scopes: z.array(z.string()).optional(),
  is_confidential: z.boolean().default(true),
  require_consent: z.boolean().default(true),
  trusted: z.boolean().default(false),
});

/**
 * GET /api/oauth-clients
 * List all OAuth clients
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
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
  } catch (error: any) {
    console.error('Get OAuth clients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oauth-clients
 * Create new OAuth client
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createClientSchema.parse(body);

    // Generate client secret
    const clientSecret = generateSecret(48);

    const client = await createOAuthClient({
      ...validated,
      client_secret: clientSecret,
      created_by: user.id,
    });

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'oauth_client.created',
      resource_type: 'oauth_client',
      resource_id: client.id,
      details: {
        client_id: client.client_id,
        name: client.name,
      },
    });

    // Return client with secret (ONLY shown once!)
    return NextResponse.json({
      client: {
        ...client,
        client_secret: clientSecret, // Show once
        client_secret_hash: undefined,
      },
    });
  } catch (error: any) {
    console.error('Create OAuth client error:', error);
    
    if (error.name === 'ZodError') {
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
```

**File:** `apps/identity-provider/app/api/oauth-clients/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import {
  getOAuthClientById,
  updateOAuthClient,
  deleteOAuthClient,
} from '@repo/database-identity';
import { createAuditLog } from '@repo/database-identity';
import { z } from 'zod';

const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  homepage_url: z.string().url().optional(),
  redirect_uris: z.array(z.string().url()).optional(),
  post_logout_redirect_uris: z.array(z.string().url()).optional(),
  allowed_scopes: z.array(z.string()).optional(),
  require_consent: z.boolean().optional(),
  trusted: z.boolean().optional(),
});

/**
 * GET /api/oauth-clients/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const client = await getOAuthClientById(params.id);

    return NextResponse.json({
      ...client,
      client_secret_hash: undefined, // Never expose
    });
  } catch (error: any) {
    console.error('Get OAuth client error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/oauth-clients/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateClientSchema.parse(body);

    const updated = await updateOAuthClient(params.id, validated);

    await createAuditLog({
      user_id: user.id,
      action: 'oauth_client.updated',
      resource_type: 'oauth_client',
      resource_id: updated.id,
      details: validated,
    });

    return NextResponse.json({
      ...updated,
      client_secret_hash: undefined,
    });
  } catch (error: any) {
    console.error('Update OAuth client error:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/oauth-clients/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const client = await getOAuthClientById(params.id);

    await deleteOAuthClient(params.id);

    await createAuditLog({
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
  } catch (error: any) {
    console.error('Delete OAuth client error:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
```

**File:** `apps/identity-provider/app/api/oauth-clients/[id]/rotate-secret/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { rotateClientSecret, getOAuthClientById } from '@repo/database-identity';
import { generateSecret } from '@repo/database-identity/utils/hash';
import { createAuditLog } from '@repo/database-identity';

/**
 * POST /api/oauth-clients/:id/rotate-secret
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const client = await getOAuthClientById(params.id);

    // Generate new secret
    const newSecret = generateSecret(48);

    await rotateClientSecret(params.id, newSecret);

    await createAuditLog({
      user_id: user.id,
      action: 'oauth_client.secret_rotated',
      resource_type: 'oauth_client',
      resource_id: client.id,
      details: {
        client_id: client.client_id,
      },
    });

    return NextResponse.json({
      success: true,
      client_secret: newSecret, // Show once
    });
  } catch (error: any) {
    console.error('Rotate client secret error:', error);
    return NextResponse.json(
      { error: 'Failed to rotate secret' },
      { status: 500 }
    );
  }
}
```

**File:** `apps/identity-provider/app/api/oauth-clients/[id]/toggle/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { toggleClientStatus } from '@repo/database-identity';
import { createAuditLog } from '@repo/database-identity';

/**
 * POST /api/oauth-clients/:id/toggle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updated = await toggleClientStatus(params.id);

    await createAuditLog({
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
  } catch (error: any) {
    console.error('Toggle client status error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle status' },
      { status: 500 }
    );
  }
}
```

---

### Task 5: Update SSO Endpoints to Use OAuth Clients

**File:** `apps/identity-provider/app/api/sso/authorize/route.ts` (UPDATE)

```typescript
// Add client validation
import { getOAuthClientByClientId, validateRedirectUri } from '@repo/database-identity';

// In authorize endpoint:
const client = await getOAuthClientByClientId(clientId);

if (!client) {
  return NextResponse.redirect(
    `${redirectUri}?error=invalid_client&error_description=Client+not+found`
  );
}

if (!client.is_active) {
  return NextResponse.redirect(
    `${redirectUri}?error=unauthorized_client&error_description=Client+is+inactive`
  );
}

if (!validateRedirectUri(client, redirectUri)) {
  return NextResponse.json(
    { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
    { status: 400 }
  );
}
```

**File:** `apps/identity-provider/app/api/sso/token/route.ts` (UPDATE)

```typescript
// Add client credential verification
import { verifyClientCredentials, updateClientLastUsed } from '@repo/database-identity';

// In token endpoint:
const client = await verifyClientCredentials(clientId, clientSecret);

if (!client) {
  return NextResponse.json(
    { error: 'invalid_client', error_description: 'Invalid credentials' },
    { status: 401 }
  );
}

// Update last used
await updateClientLastUsed(client.client_id);
```

---

### Task 6: Create UI Components

**File:** `apps/identity-provider/components/oauth-clients/client-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClientFormData {
  name: string;
  description: string;
  homepage_url: string;
  logo_url: string;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
  is_confidential: boolean;
  require_consent: boolean;
  trusted: boolean;
}

export function ClientForm({
  initialData,
  clientId,
}: {
  initialData?: Partial<ClientFormData>;
  clientId?: string;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    homepage_url: initialData?.homepage_url || '',
    logo_url: initialData?.logo_url || '',
    redirect_uris: initialData?.redirect_uris || [''],
    post_logout_redirect_uris: initialData?.post_logout_redirect_uris || [''],
    is_confidential: initialData?.is_confidential ?? true,
    require_consent: initialData?.require_consent ?? true,
    trusted: initialData?.trusted ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRedirectUri = () => {
    setFormData({
      ...formData,
      redirect_uris: [...formData.redirect_uris, ''],
    });
  };

  const removeRedirectUri = (index: number) => {
    setFormData({
      ...formData,
      redirect_uris: formData.redirect_uris.filter((_, i) => i !== index),
    });
  };

  const updateRedirectUri = (index: number, value: string) => {
    const updated = [...formData.redirect_uris];
    updated[index] = value;
    setFormData({ ...formData, redirect_uris: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = clientId
        ? `/api/oauth-clients/${clientId}`
        : '/api/oauth-clients';
      
      const method = clientId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          redirect_uris: formData.redirect_uris.filter((uri) => uri.trim()),
          post_logout_redirect_uris: formData.post_logout_redirect_uris.filter(
            (uri) => uri.trim()
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save client');
      }

      if (!clientId && data.client.client_secret) {
        // Show secret modal for new clients
        // TODO: Implement secret modal
        alert(`Client created!\n\nClient Secret (save this!):\n${data.client.client_secret}`);
      }

      router.push('/oauth-clients');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Application Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Homepage URL
          </label>
          <input
            type="url"
            value={formData.homepage_url}
            onChange={(e) =>
              setFormData({ ...formData, homepage_url: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Redirect URIs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">OAuth Configuration</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Redirect URIs *
          </label>
          {formData.redirect_uris.map((uri, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                required
                value={uri}
                onChange={(e) => updateRedirectUri(index, e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                placeholder="https://example.com/callback"
              />
              {formData.redirect_uris.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRedirectUri(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRedirectUri}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Redirect URI
          </button>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_confidential}
              onChange={(e) =>
                setFormData({ ...formData, is_confidential: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">
              Confidential Client (can keep secrets - server-side apps)
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.require_consent}
              onChange={(e) =>
                setFormData({ ...formData, require_consent: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">Require user consent</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.trusted}
              onChange={(e) =>
                setFormData({ ...formData, trusted: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">
              Trusted (skip consent - use only for first-party apps)
            </span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : clientId ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}
```

**File:** `apps/identity-provider/components/oauth-clients/clients-table.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OAuthClient {
  id: string;
  client_id: string;
  name: string;
  is_active: boolean;
  is_confidential: boolean;
  created_at: string;
  last_used_at: string | null;
}

export function ClientsTable({ clients }: { clients: OAuthClient[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete client "${name}"?\n\nThis cannot be undone!`)) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/oauth-clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/oauth-clients/${id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle');
      }

      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Client ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Last Used
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {client.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {client.client_id}
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {client.is_confidential ? 'Confidential' : 'Public'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    client.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.last_used_at
                  ? new Date(client.last_used_at).toLocaleDateString()
                  : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => router.push(`/oauth-clients/${client.id}`)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(client.id)}
                  className="text-yellow-600 hover:text-yellow-900"
                >
                  {client.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={deleting === client.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deleting === client.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Task 7: Create Dashboard Pages

**File:** `apps/identity-provider/app/(dashboard)/oauth-clients/page.tsx`

```typescript
import { getCurrentUser } from '@/lib/auth-utils';
import { getOAuthClients } from '@repo/database-identity';
import { redirect } from 'next/navigation';
import { ClientsTable } from '@/components/oauth-clients/clients-table';
import Link from 'next/link';

export default async function OAuthClientsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'super_admin') {
    redirect('/');
  }

  const { clients } = await getOAuthClients();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">OAuth Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage Service Provider applications
          </p>
        </div>
        <Link
          href="/oauth-clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Register New Client
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ClientsTable clients={clients} />
      </div>
    </div>
  );
}
```

**File:** `apps/identity-provider/app/(dashboard)/oauth-clients/new/page.tsx`

```typescript
import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/oauth-clients/client-form';

export default async function NewOAuthClientPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'super_admin') {
    redirect('/');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register OAuth Client</h1>
        <p className="text-gray-600 mt-1">
          Register a new Service Provider application
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ClientForm />
      </div>
    </div>
  );
}
```

**File:** `apps/identity-provider/app/(dashboard)/oauth-clients/[id]/page.tsx`

```typescript
import { getCurrentUser } from '@/lib/auth-utils';
import { getOAuthClientById } from '@repo/database-identity';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/oauth-clients/client-form';

export default async function EditOAuthClientPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'super_admin') {
    redirect('/');
  }

  const client = await getOAuthClientById(params.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit OAuth Client</h1>
        <p className="text-gray-600 mt-1">{client.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ClientForm initialData={client} clientId={client.id} />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          Rotate Client Secret
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          Generate a new client secret. The old secret will be invalidated.
        </p>
        <button
          onClick={() => {
            // TODO: Implement rotate secret modal
            alert('Rotate secret feature coming soon');
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Rotate Secret
        </button>
      </div>
    </div>
  );
}
```

---

### Task 8: Add Navigation Link

**File:** `apps/identity-provider/components/sidebar.tsx` (UPDATE)

Add OAuth Clients link for super_admin:

```typescript
{user.role === 'super_admin' && (
  <a
    href="/oauth-clients"
    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
  >
    <svg className="w-5 h-5" ... />
    OAuth Clients
  </a>
)}
```

---

## ✅ Story Completion Checklist

### Database
- [ ] Migration file created
- [ ] oauth_clients table created
- [ ] RLS policies configured
- [ ] Indexes added
- [ ] Migration tested on dev
- [ ] Types generated

### API
- [ ] GET /api/oauth-clients - implemented & tested
- [ ] POST /api/oauth-clients - implemented & tested
- [ ] GET /api/oauth-clients/:id - implemented & tested
- [ ] PUT /api/oauth-clients/:id - implemented & tested
- [ ] DELETE /api/oauth-clients/:id - implemented & tested
- [ ] POST /api/oauth-clients/:id/rotate-secret - implemented & tested
- [ ] POST /api/oauth-clients/:id/toggle - implemented & tested
- [ ] Validation schemas complete
- [ ] Error handling implemented
- [ ] RBAC enforced

### Database Functions
- [ ] getOAuthClients() - implemented & tested
- [ ] getOAuthClientById() - implemented & tested
- [ ] getOAuthClientByClientId() - implemented & tested
- [ ] createOAuthClient() - implemented & tested
- [ ] updateOAuthClient() - implemented & tested
- [ ] deleteOAuthClient() - implemented & tested
- [ ] rotateClientSecret() - implemented & tested
- [ ] verifyClientCredentials() - implemented & tested
- [ ] toggleClientStatus() - implemented & tested
- [ ] validateRedirectUri() - implemented & tested
- [ ] canRequestScope() - implemented & tested

### UI Components
- [ ] ClientForm component - created & tested
- [ ] ClientsTable component - created & tested
- [ ] /oauth-clients page - created & tested
- [ ] /oauth-clients/new page - created & tested
- [ ] /oauth-clients/:id page - created & tested
- [ ] Secret modal - implemented
- [ ] Delete confirmation - implemented
- [ ] Search & filter - implemented

### Integration
- [ ] SSO authorize endpoint updated to use oauth_clients
- [ ] SSO token endpoint updated to verify credentials
- [ ] Client validation working
- [ ] Redirect URI validation working
- [ ] Audit logging working
- [ ] Navigation link added

### Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] E2E test for creating client
- [ ] E2E test for SSO with registered client
- [ ] All tests passing

### Documentation
- [ ] API documentation updated
- [ ] User guide created
- [ ] Migration guide for existing hard-coded clients
- [ ] README updated

### Deployment
- [ ] Migration run on staging
- [ ] Migration run on production
- [ ] Existing clients migrated
- [ ] Feature flagged (if needed)
- [ ] Monitoring configured

---

## 🧪 Testing Plan

### Manual Testing

1. **Create Client**
   - Go to /oauth-clients
   - Click "Register New Client"
   - Fill form
   - Submit
   - Should show client secret ONCE
   - Save secret

2. **Test SSO Flow**
   - Use created client credentials
   - Run authorization flow
   - Exchange code for tokens
   - Should succeed

3. **Update Client**
   - Edit client
   - Change redirect URI
   - Save
   - Try SSO with old URI → should fail
   - Try SSO with new URI → should succeed

4. **Rotate Secret**
   - Click rotate secret
   - Save new secret
   - Try SSO with old secret → should fail
   - Try SSO with new secret → should succeed

5. **Disable Client**
   - Toggle client to inactive
   - Try SSO → should fail with "unauthorized_client"
   - Re-enable → should work

6. **Delete Client**
   - Delete client
   - Try SSO → should fail with "invalid_client"

### Automated Testing

```typescript
describe('OAuth Clients Management', () => {
  describe('CRUD Operations', () => {
    it('should create client with secret');
    it('should list clients');
    it('should get client by ID');
    it('should update client');
    it('should delete client');
  });

  describe('Security', () => {
    it('should hash client secrets');
    it('should verify credentials');
    it('should validate redirect URIs');
    it('should enforce RBAC');
  });

  describe('SSO Integration', () => {
    it('should accept valid client');
    it('should reject invalid client');
    it('should reject inactive client');
    it('should reject invalid redirect URI');
  });
});
```

---

## 📊 Success Metrics

- [ ] All OAuth clients managed via database (no hard-coding)
- [ ] Super admins can CRUD clients via UI
- [ ] Client secrets properly hashed
- [ ] SSO flow validates against oauth_clients table
- [ ] Audit trail complete for all operations
- [ ] Zero production issues after deployment

---

## 🚀 Next Steps

After completing STORY-025:
- **STORY-023**: Implement OIDC UserInfo Endpoint
- **STORY-026**: Implement Consent Screen
- **Phase 2**: Begin Service Provider Foundation

---

## 📖 References

- [OAuth 2.0 Client Registration](https://tools.ietf.org/html/rfc7591)
- [OAuth 2.0 Dynamic Client Registration](https://tools.ietf.org/html/rfc7592)
- [OpenID Connect Core - Client Authentication](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
