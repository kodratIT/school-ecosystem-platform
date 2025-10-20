/**
 * Database wrapper for Identity Provider
 * Explicitly configures Supabase client with env vars
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database-identity';

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get configured Supabase client for identity provider
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.IDENTITY_DB_URL;
  const supabaseKey = process.env.IDENTITY_DB_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase credentials. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .is('deleted_at', null)
    .single();

  return !!data;
}

/**
 * Create new user
 */
export async function createUser(userData: {
  email: string;
  name: string;
  password_hash: string;
  role: string;
  is_active: boolean;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      name: userData.name,
      password_hash: userData.password_hash,
      role: userData.role,
      is_active: userData.is_active,
      email_verified: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
