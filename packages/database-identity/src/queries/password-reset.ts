import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type PasswordResetToken =
  Database['public']['Tables']['password_reset_tokens']['Row'];
type PasswordResetTokenInsert =
  Database['public']['Tables']['password_reset_tokens']['Insert'];

export interface CreateResetTokenInput {
  userId: string;
  expiresInMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ValidateTokenResult {
  valid: boolean;
  token?: PasswordResetToken;
  reason?: 'not_found' | 'expired' | 'already_used';
}

/**
 * Create a new password reset token
 * Invalidates any existing unused tokens for the user
 */
export async function createResetToken(
  input: CreateResetTokenInput
): Promise<PasswordResetToken> {
  const supabase = getSupabaseClient();
  const { userId, expiresInMinutes = 60, ipAddress, userAgent } = input;

  // Calculate expiration time (default 1 hour)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  // First, invalidate any existing unused tokens for this user
  // We do this by marking them as "used" even though they weren't
  await supabase
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('used_at', null);

  // Create new token
  const tokenData: PasswordResetTokenInsert = {
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    ip_address: ipAddress,
    user_agent: userAgent,
  };

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .insert(tokenData)
    .select()
    .single();

  if (error) handleDatabaseError(error);

  return data;
}

/**
 * Validate a password reset token
 * Checks if token exists, not expired, and not used
 */
export async function validateToken(
  token: string
): Promise<ValidateTokenResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { valid: false, reason: 'not_found' };
    }
    handleDatabaseError(error);
  }

  // Check if token is already used
  if (data.used_at) {
    return { valid: false, token: data, reason: 'already_used' };
  }

  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < now) {
    return { valid: false, token: data, reason: 'expired' };
  }

  return { valid: true, token: data };
}

/**
 * Mark a token as used
 */
export async function markTokenUsed(token: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token);

  if (error) handleDatabaseError(error);
}

export interface TokenWithUser extends PasswordResetToken {
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

/**
 * Get token with user information
 * Useful for displaying masked email in UI
 */
export async function getTokenWithUser(
  token: string
): Promise<TokenWithUser | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select(
      `
      *,
      user:users (
        id,
        email,
        name
      )
    `
    )
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }

  return data as TokenWithUser;
}

/**
 * Cleanup expired and used tokens
 * Returns count of deleted tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const supabase = getSupabaseClient();

  // Call the database function
  const { data, error } = await supabase.rpc(
    'cleanup_expired_password_reset_tokens'
  );

  if (error) handleDatabaseError(error);

  return data ?? 0;
}

/**
 * Get all active reset tokens for a user
 * (unused and not expired)
 */
export async function getActiveTokensForUser(
  userId: string
): Promise<PasswordResetToken[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('user_id', userId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) handleDatabaseError(error);

  return data ?? [];
}

/**
 * Count reset token requests by user in time period
 * Used for rate limiting
 */
export async function countRecentResetRequests(
  userId: string,
  minutesAgo: number
): Promise<number> {
  const supabase = getSupabaseClient();

  const since = new Date();
  since.setMinutes(since.getMinutes() - minutesAgo);

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  if (error) handleDatabaseError(error);

  return data ?? 0;
}

/**
 * Count reset token requests by IP address in time period
 * Used for rate limiting
 */
export async function countRecentResetRequestsByIP(
  ipAddress: string,
  minutesAgo: number
): Promise<number> {
  const supabase = getSupabaseClient();

  const since = new Date();
  since.setMinutes(since.getMinutes() - minutesAgo);

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', since.toISOString());

  if (error) handleDatabaseError(error);

  return data ?? 0;
}

/**
 * Delete all tokens for a user
 * Use when user requests to revoke all reset attempts
 */
export async function deleteUserResetTokens(userId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) handleDatabaseError(error);
}
