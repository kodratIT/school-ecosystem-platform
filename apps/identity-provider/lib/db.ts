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
  role?:
    | 'super_admin'
    | 'school_admin'
    | 'teacher'
    | 'student'
    | 'parent'
    | 'finance_staff'
    | 'staff';
  is_active: boolean;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      name: userData.name,
      password_hash: userData.password_hash,
      role: userData.role || 'student',
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

/**
 * Create audit log entry
 */
export async function createAuditLog(params: {
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  school_id?: string | null;
}) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: params.user_id,
    action: params.action,
    resource_type: params.resource_type,
    resource_id: params.resource_id || null,
    old_values: params.old_values || null,
    new_values: params.new_values || null,
    ip_address: params.ip_address || null,
    user_agent: params.user_agent || null,
    metadata: params.metadata || null,
    school_id: params.school_id || null,
  });

  if (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}
