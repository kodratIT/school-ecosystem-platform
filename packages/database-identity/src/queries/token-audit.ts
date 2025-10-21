import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';

/**
 * Token Audit Log Entry
 */
export interface TokenAuditLog {
  user_id?: string;
  client_id: string;
  grant_type: string;
  scopes?: string[];
  ip_address?: string;
  user_agent?: string;
  error?: string;
}

/**
 * Token Statistics
 */
export interface TokenStats {
  total_issued: number;
  total_refreshed: number;
  total_failed: number;
  total_userinfo_accessed: number;
  unique_users: number;
  unique_clients: number;
}

/**
 * Token by Grant Type
 */
export interface TokenByGrantType {
  grant_type: string;
  count: number;
}

/**
 * Token by Client
 */
export interface TokenByClient {
  client_id: string;
  client_name: string | null;
  token_count: number;
  unique_users: number;
  last_used: string;
}

/**
 * Failed Token Attempt
 */
export interface FailedTokenAttempt {
  created_at: string;
  action: string;
  client_id: string;
  user_id: string | null;
  error: string;
  ip_address: string | null;
  user_agent: string | null;
}

/**
 * Token Activity Timeline
 */
export interface TokenActivityTimeline {
  time_bucket: string;
  issued_count: number;
  refreshed_count: number;
  failed_count: number;
}

/**
 * Most Active User
 */
export interface MostActiveUser {
  user_id: string;
  user_email: string;
  user_name: string;
  token_count: number;
  unique_clients: number;
  last_active: string;
}

/**
 * Suspicious Activity
 */
export interface SuspiciousActivity {
  ip_address: string;
  client_id: string;
  failed_attempts: number;
  unique_users: number;
  first_attempt: string;
  last_attempt: string;
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Log token issuance
 */
export async function logTokenIssued(data: TokenAuditLog): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: `token.issued.${data.grant_type}`,
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    metadata: {
      client_id: data.client_id,
      grant_type: data.grant_type,
      scopes: data.scopes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    } as Record<string, unknown>,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  if (error) handleDatabaseError(error);
}

/**
 * Log token refresh
 */
export async function logTokenRefreshed(data: TokenAuditLog): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: 'token.refreshed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    metadata: {
      client_id: data.client_id,
      scopes: data.scopes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    } as Record<string, unknown>,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  if (error) handleDatabaseError(error);
}

/**
 * Log UserInfo endpoint access
 */
export async function logUserInfoAccessed(data: TokenAuditLog): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: 'token.userinfo_accessed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    metadata: {
      client_id: data.client_id,
      scopes: data.scopes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    } as Record<string, unknown>,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  if (error) handleDatabaseError(error);
}

/**
 * Log token validation failure
 */
export async function logTokenValidationFailed(
  data: TokenAuditLog
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: 'token.validation_failed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    metadata: {
      client_id: data.client_id,
      grant_type: data.grant_type,
      error: data.error,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    } as Record<string, unknown>,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  if (error) handleDatabaseError(error);
}

/**
 * Log PKCE verification failure
 */
export async function logPKCEVerificationFailed(
  data: TokenAuditLog
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: 'token.pkce_failed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    metadata: {
      client_id: data.client_id,
      error: data.error,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    } as Record<string, unknown>,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  if (error) handleDatabaseError(error);
}

/**
 * Log expired token attempt
 */
export async function logTokenExpired(data: TokenAuditLog): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: 'token.expired',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    metadata: {
      client_id: data.client_id,
      error: data.error,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    } as Record<string, unknown>,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  if (error) handleDatabaseError(error);
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Get token statistics for a date range
 */
export async function getTokenStats(
  startDate: Date,
  endDate: Date,
  clientId?: string
): Promise<TokenStats> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_token_stats', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_client_id: clientId || null,
  });

  if (error) handleDatabaseError(error);

  return (
    (data?.[0] as TokenStats) || {
      total_issued: 0,
      total_refreshed: 0,
      total_failed: 0,
      total_userinfo_accessed: 0,
      unique_users: 0,
      unique_clients: 0,
    }
  );
}

/**
 * Get tokens grouped by grant type
 */
export async function getTokensByGrantType(
  startDate: Date,
  endDate: Date,
  clientId?: string
): Promise<TokenByGrantType[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_tokens_by_grant_type', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_client_id: clientId || null,
  });

  if (error) handleDatabaseError(error);

  return (data as TokenByGrantType[]) || [];
}

/**
 * Get tokens grouped by client (top N)
 */
export async function getTokensByClient(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<TokenByClient[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_tokens_by_client', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_limit: limit,
  });

  if (error) handleDatabaseError(error);

  return (data as TokenByClient[]) || [];
}

/**
 * Get recent failed token attempts
 */
export async function getFailedTokenAttempts(
  startDate: Date,
  endDate: Date,
  limit: number = 50
): Promise<FailedTokenAttempt[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_failed_token_attempts', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_limit: limit,
  });

  if (error) handleDatabaseError(error);

  return (data as FailedTokenAttempt[]) || [];
}

/**
 * Get token activity timeline (time-series data)
 */
export async function getTokenActivityTimeline(
  startDate: Date,
  endDate: Date,
  interval: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<TokenActivityTimeline[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_token_activity_timeline', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_interval: interval,
  });

  if (error) handleDatabaseError(error);

  return (data as TokenActivityTimeline[]) || [];
}

/**
 * Get most active users by token operations
 */
export async function getMostActiveUsers(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<MostActiveUser[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_most_active_users', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_limit: limit,
  });

  if (error) handleDatabaseError(error);

  return (data as MostActiveUser[]) || [];
}

/**
 * Detect suspicious token activity patterns
 */
export async function detectSuspiciousTokenActivity(
  lookbackHours: number = 1,
  failedThreshold: number = 5
): Promise<SuspiciousActivity[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc(
    'detect_suspicious_token_activity',
    {
      p_lookback_hours: lookbackHours,
      p_failed_threshold: failedThreshold,
    }
  );

  if (error) handleDatabaseError(error);

  return (data as SuspiciousActivity[]) || [];
}
