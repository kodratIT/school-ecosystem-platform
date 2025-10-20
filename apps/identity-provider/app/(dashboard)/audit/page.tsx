import { getCurrentUser } from '@/lib/auth-utils';
import { getSupabaseClient } from '@/lib/db';
import { AuditLogsTable } from '@/components/audit/audit-logs-table';
import { AuditFilters } from '@/components/audit/audit-filters';
import { redirect } from 'next/navigation';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; user?: string; page?: string }>;
}) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;

  if (!currentUser) {
    redirect('/login');
  }

  // Only super_admin and school_admin can view audit logs
  if (
    currentUser.role !== 'super_admin' &&
    currentUser.role !== 'school_admin'
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to view audit logs.
          </p>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false });

  // Filter by action
  if (params.action) {
    query = query.eq('action', params.action);
  }

  // Filter by user
  if (params.user) {
    query = query.eq('user_id', params.user);
  }

  // Pagination
  const page = parseInt(params.page || '1');
  const limit = 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: logs, error, count } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }

  // Get unique actions for filter
  const { data: actionsData } = await supabase
    .from('audit_logs')
    .select('action')
    .limit(1000);

  const uniqueActions = Array.from(
    new Set(actionsData?.map((a) => a.action) || [])
  );

  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-600">
          Track all important actions and changes in the system
        </p>
      </div>

      <AuditFilters actions={uniqueActions} />

      <AuditLogsTable
        logs={logs || []}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
