import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
type Json = Database['public']['Tables']['audit_logs']['Row']['metadata'];

/**
 * Log audit event using database function
 */
export async function logAudit(params: {
  action: string;
  resourceType: string;
  resourceId?: string;
  description?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('log_audit', {
    p_action: params.action,
    p_resource_type: params.resourceType,
    p_resource_id: params.resourceId || null,
    p_description: params.description || null,
    p_old_values: (params.oldValues as Json) || null,
    p_new_values: (params.newValues as Json) || null,
    p_metadata: (params.metadata as Json) || null,
  });

  if (error) handleDatabaseError(error);
  return data as string;
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
  userId?: string;
  schoolId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.schoolId) {
    query = query.eq('school_id', filters.schoolId);
  }
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  if (filters?.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }
  if (filters?.resourceId) {
    query = query.eq('resource_id', filters.resourceId);
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 50) - 1
    );
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50
): Promise<AuditLog[]> {
  return getAuditLogs({ userId, limit });
}

/**
 * Get audit logs for a specific school
 */
export async function getSchoolAuditLogs(
  schoolId: string,
  limit = 50
): Promise<AuditLog[]> {
  return getAuditLogs({ schoolId, limit });
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit = 50
): Promise<AuditLog[]> {
  return getAuditLogs({ resourceType, resourceId, limit });
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit = 100): Promise<AuditLog[]> {
  return getAuditLogs({ limit });
}

/**
 * Count audit logs by action
 */
export async function countAuditLogsByAction(
  schoolId?: string
): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();

  let query = supabase.from('audit_logs').select('action');

  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);

  // Count by action
  const counts: Record<string, number> = {};

  data?.forEach((log) => {
    counts[log.action] = (counts[log.action] || 0) + 1;
  });

  return counts;
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(schoolId?: string): Promise<{
  totalLogs: number;
  byAction: Record<string, number>;
  byResourceType: Record<string, number>;
  recentLogs: AuditLog[];
}> {
  const supabase = getSupabaseClient();

  // Get all logs for school
  let query = supabase.from('audit_logs').select('*');

  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);

  const logs = data || [];

  // Count by action
  const byAction: Record<string, number> = {};
  const byResourceType: Record<string, number> = {};

  logs.forEach((log) => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byResourceType[log.resource_type] =
      (byResourceType[log.resource_type] || 0) + 1;
  });

  // Get recent logs
  const recentLogs = logs
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  return {
    totalLogs: logs.length,
    byAction,
    byResourceType,
    recentLogs,
  };
}

/**
 * Helper: Log user action
 */
export async function logUserAction(
  action: string,
  userId: string,
  details?: string
): Promise<string> {
  return logAudit({
    action,
    resourceType: 'users',
    resourceId: userId,
    description: details,
  });
}

/**
 * Helper: Log school action
 */
export async function logSchoolAction(
  action: string,
  schoolId: string,
  details?: string
): Promise<string> {
  return logAudit({
    action,
    resourceType: 'schools',
    resourceId: schoolId,
    description: details,
  });
}

/**
 * Helper: Log authentication event
 */
export async function logAuthEvent(
  action: 'login' | 'logout' | 'register' | 'password_reset',
  userId: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  return logAudit({
    action: `auth.${action}`,
    resourceType: 'users',
    resourceId: userId,
    metadata,
  });
}
