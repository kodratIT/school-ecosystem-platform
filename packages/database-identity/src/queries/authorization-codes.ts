import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';

/**
 * Authorization Code structure
 * Note: Types will be properly generated after running supabase gen types
 */
export interface AuthorizationCode {
  id: string;
  code: string;
  client_id: string;
  user_id: string;
  redirect_uri: string;
  scope: string[];
  code_challenge: string | null;
  code_challenge_method: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAuthorizationCodeInput {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  expiresInSeconds?: number;
}

/**
 * Create a new authorization code
 */
export async function createAuthorizationCode(
  input: CreateAuthorizationCodeInput
): Promise<AuthorizationCode> {
  const supabase = getSupabaseClient();
  const {
    code,
    clientId,
    userId,
    redirectUri,
    scope = [],
    codeChallenge,
    codeChallengeMethod = 'S256',
    expiresInSeconds = 60, // Default 1 minute
  } = input;

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

  const { data, error } = await supabase
    .from('authorization_codes')
    .insert({
      code,
      client_id: clientId,
      user_id: userId,
      redirect_uri: redirectUri,
      scope,
      code_challenge: codeChallenge || null,
      code_challenge_method: codeChallenge ? codeChallengeMethod : null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) handleDatabaseError(error);

  return data as AuthorizationCode;
}

/**
 * Get authorization code by code value
 */
export async function getAuthorizationCodeByCode(
  code: string
): Promise<AuthorizationCode | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('authorization_codes')
    .select('*')
    .eq('code', code)
    .is('used_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }

  return data as AuthorizationCode;
}

/**
 * Mark authorization code as used
 */
export async function markAuthorizationCodeUsed(code: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('authorization_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('code', code);

  if (error) handleDatabaseError(error);
}

/**
 * Delete authorization code
 */
export async function deleteAuthorizationCode(code: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('authorization_codes')
    .delete()
    .eq('code', code);

  if (error) handleDatabaseError(error);
}

/**
 * Cleanup expired authorization codes
 */
export async function cleanupExpiredAuthorizationCodes(): Promise<number> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc(
    'cleanup_expired_authorization_codes'
  );

  if (error) handleDatabaseError(error);

  return (data as number) ?? 0;
}

/**
 * Get active authorization codes for a user
 */
export async function getActiveAuthorizationCodesForUser(
  userId: string
): Promise<AuthorizationCode[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('authorization_codes')
    .select('*')
    .eq('user_id', userId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) handleDatabaseError(error);

  return (data as AuthorizationCode[]) ?? [];
}

/**
 * Validate and consume authorization code
 * Returns the code data if valid, throws error if invalid
 */
export async function validateAndConsumeAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<AuthorizationCode> {
  const authCode = await getAuthorizationCodeByCode(code);

  if (!authCode) {
    throw new Error('Invalid authorization code');
  }

  // Check if expired
  const now = new Date();
  const expiresAt = new Date(authCode.expires_at);
  if (expiresAt < now) {
    throw new Error('Authorization code has expired');
  }

  // Check client_id match
  if (authCode.client_id !== clientId) {
    throw new Error('Client ID mismatch');
  }

  // Check redirect_uri match
  if (authCode.redirect_uri !== redirectUri) {
    throw new Error('Redirect URI mismatch');
  }

  // Mark as used
  await markAuthorizationCodeUsed(code);

  return authCode;
}
