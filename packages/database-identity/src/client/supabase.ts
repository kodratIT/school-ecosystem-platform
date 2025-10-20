import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client instance (singleton)
 * For server-side usage with service role key
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.IDENTITY_DB_URL;
  const supabaseKey =
    process.env.IDENTITY_DB_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Check IDENTITY_DB_URL and IDENTITY_DB_SERVICE_KEY'
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Server-side, no session storage
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Create client with custom auth token
 * For making authenticated requests on behalf of a user
 */
export function createAuthClient(
  accessToken: string
): SupabaseClient<Database> {
  const supabaseUrl = process.env.IDENTITY_DB_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Get client for browser (uses anon key)
 * For client-side usage with RLS
 */
export function getBrowserClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_IDENTITY_DB_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing public Supabase credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Reset client instance (useful for testing)
 */
export function resetClient(): void {
  supabaseClient = null;
}
