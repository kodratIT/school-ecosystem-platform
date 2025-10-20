import { getSupabaseClient } from '@/lib/db';
import { Clock, User, Shield, Building2 } from 'lucide-react';

export async function RecentActivity() {
  const supabase = getSupabaseClient();

  // Get recent audit logs
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const getIcon = (action: string) => {
    if (action.includes('user')) return User;
    if (action.includes('role')) return Shield;
    if (action.includes('school')) return Building2;
    return Clock;
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Activity
      </h3>

      {logs && logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log) => {
            const Icon = getIcon(log.action);
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-gray-50"
              >
                <div className="rounded-full bg-gray-100 p-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {formatAction(log.action)}
                  </p>
                  {log.description && (
                    <p className="mt-1 text-xs text-gray-600">
                      {log.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formatTime(log.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <Clock className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
}
