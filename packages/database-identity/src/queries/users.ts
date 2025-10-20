import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }

  return data;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }

  return data;
}

/**
 * Get users by school
 */
export async function getUsersBySchool(
  schoolId: string,
  role?:
    | 'super_admin'
    | 'school_admin'
    | 'teacher'
    | 'student'
    | 'parent'
    | 'finance_staff'
    | 'staff'
): Promise<User[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('users')
    .select('*')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role:
    | 'super_admin'
    | 'school_admin'
    | 'teacher'
    | 'student'
    | 'parent'
    | 'finance_staff'
    | 'staff'
): Promise<User[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Get all super admins
 */
export async function getSuperAdmins(): Promise<User[]> {
  return getUsersByRole('super_admin');
}

/**
 * Create user
 */
export async function createUser(user: UserInsert): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .insert({
      ...user,
      email: user.email.toLowerCase(),
    })
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: UserUpdate
): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Soft delete user
 */
export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('id', id);

  if (error) handleDatabaseError(error);
}

/**
 * Update last login
 */
export async function updateLastLogin(
  userId: string,
  ip: string
): Promise<void> {
  const supabase = getSupabaseClient();

  // Get current user to increment login count
  const { data: user } = await supabase
    .from('users')
    .select('login_count')
    .eq('id', userId)
    .single();

  const { error } = await supabase
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
      last_login_ip: ip,
      login_count: (user?.login_count || 0) + 1,
    })
    .eq('id', userId);

  if (error) handleDatabaseError(error);
}

/**
 * Verify user email
 */
export async function verifyUserEmail(userId: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Ban user
 */
export async function banUser(
  userId: string,
  reason: string,
  bannedBy: string
): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      is_banned: true,
      banned_reason: reason,
      banned_at: new Date().toISOString(),
      banned_by: bannedBy,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Unban user
 */
export async function unbanUser(userId: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      is_banned: false,
      banned_reason: null,
      banned_at: null,
      banned_by: null,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Activate user
 */
export async function activateUser(userId: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update user password hash
 */
export async function updateUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) handleDatabaseError(error);
}

/**
 * Search users by name or email
 */
export async function searchUsers(
  query: string,
  schoolId?: string
): Promise<User[]> {
  const supabase = getSupabaseClient();

  let dbQuery = supabase
    .from('users')
    .select('*')
    .is('deleted_at', null)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name', { ascending: true })
    .limit(50);

  if (schoolId) {
    dbQuery = dbQuery.eq('school_id', schoolId);
  }

  const { data, error } = await dbQuery;

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Count users by role
 */
export async function countUsersByRole(
  schoolId?: string
): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();

  let query = supabase.from('users').select('role').is('deleted_at', null);

  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);

  // Count by role
  const counts: Record<string, number> = {};

  data?.forEach((user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
  });

  return counts;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null;
}
