import { getSupabaseClient } from '../client/supabase';
import { hashPassword, comparePassword, generateSecret } from '../utils/hash';
import { handleDatabaseError } from '../utils/errors';

// Temporary type definitions until Supabase types are regenerated
type OAuthClient = {
  id: string;
  client_id: string;
  client_secret_hash: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  homepage_url?: string | null;
  redirect_uris: string[];
  post_logout_redirect_uris?: string[];
  allowed_scopes: string[];
  grant_types: string[];
  response_types: string[];
  access_token_lifetime: number;
  refresh_token_lifetime: number;
  id_token_lifetime: number;
  require_pkce: boolean;
  require_consent: boolean;
  trusted: boolean;
  is_confidential: boolean;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  last_used_at?: string | null;
};

type NewOAuthClient = Omit<
  OAuthClient,
  'id' | 'created_at' | 'updated_at' | 'last_used_at'
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type UpdateOAuthClient = Partial<OAuthClient>;

export interface CreateOAuthClientInput {
  name: string;
  description?: string;
  logo_url?: string;
  homepage_url?: string;
  redirect_uris: string[];
  post_logout_redirect_uris?: string[];
  allowed_scopes?: string[];
  grant_types?: string[];
  response_types?: string[];
  access_token_lifetime?: number;
  refresh_token_lifetime?: number;
  id_token_lifetime?: number;
  require_pkce?: boolean;
  require_consent?: boolean;
  trusted?: boolean;
  is_confidential?: boolean;
  created_by?: string;
}

export interface OAuthClientWithSecret extends OAuthClient {
  client_secret?: string;
}

export interface ListOAuthClientsOptions {
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get all OAuth clients with pagination and filtering
 */
export async function getOAuthClients(options?: ListOAuthClientsOptions) {
  try {
    const supabase = getSupabaseClient();

    let query = supabase.from('oauth_clients').select('*', { count: 'exact' });

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(
        options?.offset || 0,
        (options?.offset || 0) + (options?.limit || 50) - 1
      );

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      clients: (data as OAuthClient[]) || [],
      total: count || 0,
    };
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Get OAuth client by ID
 */
export async function getOAuthClientById(id: string): Promise<OAuthClient> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as OAuthClient;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Get OAuth client by client_id
 */
export async function getOAuthClientByClientId(
  clientId: string
): Promise<OAuthClient | null> {
  try {
    const supabase = getSupabaseClient();

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

    return data as OAuthClient;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Create OAuth client with auto-generated credentials
 */
export async function createOAuthClient(
  input: CreateOAuthClientInput
): Promise<OAuthClientWithSecret> {
  try {
    const supabase = getSupabaseClient();

    // Generate client secret
    const clientSecret = generateSecret(48);

    // Hash client secret
    const clientSecretHash = await hashPassword(clientSecret);

    const clientData: NewOAuthClient = {
      name: input.name,
      description: input.description,
      logo_url: input.logo_url,
      homepage_url: input.homepage_url,
      redirect_uris: input.redirect_uris,
      post_logout_redirect_uris: input.post_logout_redirect_uris,
      allowed_scopes: input.allowed_scopes || ['openid', 'profile', 'email'],
      grant_types: input.grant_types || ['authorization_code', 'refresh_token'],
      response_types: input.response_types || ['code'],
      access_token_lifetime: input.access_token_lifetime || 900,
      refresh_token_lifetime: input.refresh_token_lifetime || 2592000,
      id_token_lifetime: input.id_token_lifetime || 3600,
      require_pkce: input.require_pkce ?? false,
      require_consent: input.require_consent ?? true,
      trusted: input.trusted ?? false,
      is_confidential: input.is_confidential ?? true,
      client_secret_hash: clientSecretHash,
      created_by: input.created_by,
    };

    const { data, error } = await supabase
      .from('oauth_clients')
      .insert(clientData)
      .select()
      .single();

    if (error) throw error;

    // Return client with plain secret (ONLY TIME IT'S RETURNED!)
    return {
      ...(data as OAuthClient),
      client_secret: clientSecret,
    };
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Update OAuth client
 */
export async function updateOAuthClient(
  id: string,
  updates: Partial<CreateOAuthClientInput>
): Promise<OAuthClient> {
  try {
    const supabase = getSupabaseClient();

    const updateData: UpdateOAuthClient = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('oauth_clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OAuthClient;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Delete OAuth client
 */
export async function deleteOAuthClient(id: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('oauth_clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Rotate client secret
 */
export async function rotateClientSecret(
  id: string
): Promise<{ client: OAuthClient; client_secret: string }> {
  try {
    const supabase = getSupabaseClient();

    // Generate new secret
    const newSecret = generateSecret(48);
    const newSecretHash = await hashPassword(newSecret);

    const { data, error } = await supabase
      .from('oauth_clients')
      .update({
        client_secret_hash: newSecretHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      client: data as OAuthClient,
      client_secret: newSecret, // Show new secret once
    };
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Verify client credentials
 */
export async function verifyClientCredentials(
  clientId: string,
  clientSecret: string
): Promise<OAuthClient | null> {
  try {
    const client = await getOAuthClientByClientId(clientId);

    if (!client) return null;
    if (!client.is_active) return null;

    const valid = await comparePassword(
      clientSecret,
      client.client_secret_hash
    );

    return valid ? client : null;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Update last used timestamp
 */
export async function updateClientLastUsed(clientId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    await supabase
      .from('oauth_clients')
      .update({ last_used_at: new Date().toISOString() })
      .eq('client_id', clientId);
  } catch (error) {
    // Silently fail - not critical
    console.error('Failed to update client last used:', error);
  }
}

/**
 * Toggle client active status
 */
export async function toggleClientStatus(id: string): Promise<OAuthClient> {
  try {
    const client = await getOAuthClientById(id);

    const supabase = getSupabaseClient();

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
    return data as OAuthClient;
  } catch (error) {
    throw handleDatabaseError(error);
  }
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
 * Check if client can request specific scopes
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

/**
 * Check if client supports specific grant type
 */
export function supportsGrantType(
  client: OAuthClient,
  grantType: string
): boolean {
  return client.grant_types.includes(grantType);
}

/**
 * Check if client supports specific response type
 */
export function supportsResponseType(
  client: OAuthClient,
  responseType: string
): boolean {
  return client.response_types.includes(responseType);
}

/**
 * Get active OAuth clients count
 */
export async function countActiveClients(): Promise<number> {
  try {
    const supabase = getSupabaseClient();

    const { count, error } = await supabase
      .from('oauth_clients')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

/**
 * Search OAuth clients by name or description
 */
export async function searchOAuthClients(
  query: string,
  limit: number = 10
): Promise<OAuthClient[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('oauth_clients')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit);

    if (error) throw error;
    return (data as OAuthClient[]) || [];
  } catch (error) {
    throw handleDatabaseError(error);
  }
}
