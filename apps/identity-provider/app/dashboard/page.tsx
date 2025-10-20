import { getCurrentUser } from '@/lib/auth-utils';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full rounded-lg border border-gray-300 py-3 text-left px-4 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Create New User</p>
              <p className="text-sm text-gray-600">
                Add a new user to the system
              </p>
            </button>
            <button className="w-full rounded-lg border border-gray-300 py-3 text-left px-4 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Manage Roles</p>
              <p className="text-sm text-gray-600">
                Configure roles and permissions
              </p>
            </button>
            <button className="w-full rounded-lg border border-gray-300 py-3 text-left px-4 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">
                Access system reports and analytics
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
