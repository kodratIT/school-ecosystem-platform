import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';

/**
 * Email Verification structure
 */
export interface EmailVerification {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailVerificationInput {
  userId: string;
  email: string;
  expiresInHours?: number;
}

export interface EmailResendAttempt {
  id: string;
  email: string;
  ip_address: string;
  attempted_at: string;
}

/**
 * Create a new email verification token
 */
export async function createEmailVerification(
  input: CreateEmailVerificationInput
): Promise<EmailVerification> {
  const supabase = getSupabaseClient();
  const { userId, email, expiresInHours = 48 } = input;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const { data, error } = await supabase
    .from('email_verifications')
    .insert({
      user_id: userId,
      email: email.toLowerCase(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) handleDatabaseError(error);

  return data as EmailVerification;
}

/**
 * Get email verification by token
 */
export async function getEmailVerificationByToken(
  token: string
): Promise<EmailVerification | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('email_verifications')
    .select('*')
    .eq('token', token)
    .is('verified_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    handleDatabaseError(error);
  }

  return data as EmailVerification;
}

/**
 * Mark email verification as verified
 */
export async function markEmailVerificationVerified(
  token: string
): Promise<EmailVerification> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('email_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('token', token)
    .is('verified_at', null)
    .select()
    .single();

  if (error) handleDatabaseError(error);

  return data as EmailVerification;
}

/**
 * Invalidate all pending email verification tokens for a user
 */
export async function invalidateUserEmailVerifications(
  userId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  // Set expires_at to now to invalidate tokens
  const { error } = await supabase
    .from('email_verifications')
    .update({ expires_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('verified_at', null);

  if (error) handleDatabaseError(error);
}

/**
 * Get active (unused, not expired) verification token for user
 */
export async function getActiveVerificationToken(
  userId: string
): Promise<EmailVerification | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('email_verifications')
    .select('*')
    .eq('user_id', userId)
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    handleDatabaseError(error);
  }

  return data as EmailVerification;
}

/**
 * Record email resend attempt
 */
export async function recordEmailResendAttempt(
  email: string,
  ipAddress: string
): Promise<EmailResendAttempt> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('email_resend_attempts')
    .insert({
      email: email.toLowerCase(),
      ip_address: ipAddress,
    })
    .select()
    .single();

  if (error) handleDatabaseError(error);

  return data as EmailResendAttempt;
}

/**
 * Count recent resend attempts by email (within specified minutes)
 */
export async function countRecentResendAttemptsByEmail(
  email: string,
  withinMinutes: number = 5
): Promise<number> {
  const supabase = getSupabaseClient();

  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - withinMinutes);

  const { data, error } = await supabase
    .from('email_resend_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .gte('attempted_at', cutoffTime.toISOString());

  if (error) handleDatabaseError(error);

  return data ? (data as unknown as { count: number }).count || 0 : 0;
}

/**
 * Count recent resend attempts by IP address (within specified minutes)
 */
export async function countRecentResendAttemptsByIP(
  ipAddress: string,
  withinMinutes: number = 60
): Promise<number> {
  const supabase = getSupabaseClient();

  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - withinMinutes);

  const { data, error } = await supabase
    .from('email_resend_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('attempted_at', cutoffTime.toISOString());

  if (error) handleDatabaseError(error);

  return data ? (data as unknown as { count: number }).count || 0 : 0;
}

/**
 * Get most recent resend attempt for email
 */
export async function getLastResendAttempt(
  email: string
): Promise<EmailResendAttempt | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('email_resend_attempts')
    .select('*')
    .eq('email', email.toLowerCase())
    .order('attempted_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    handleDatabaseError(error);
  }

  return data as EmailResendAttempt;
}

/**
 * Cleanup expired email verifications (older than specified days)
 */
export async function cleanupExpiredEmailVerifications(
  olderThanDays: number = 7
): Promise<number> {
  const supabase = getSupabaseClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const { data, error } = await supabase
    .from('email_verifications')
    .delete()
    .lt('expires_at', cutoffDate.toISOString())
    .select('id');

  if (error) handleDatabaseError(error);

  return data?.length || 0;
}

/**
 * Cleanup old email resend attempts (older than specified hours)
 */
export async function cleanupOldResendAttempts(
  olderThanHours: number = 24
): Promise<number> {
  const supabase = getSupabaseClient();

  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

  const { data, error } = await supabase
    .from('email_resend_attempts')
    .delete()
    .lt('attempted_at', cutoffDate.toISOString())
    .select('id');

  if (error) handleDatabaseError(error);

  return data?.length || 0;
}
