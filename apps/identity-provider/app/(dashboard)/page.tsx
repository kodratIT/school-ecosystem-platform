import { Suspense } from 'react';
import { EnhancedStats } from '@/components/dashboard/enhanced-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser.name}!</p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        }
      >
        <EnhancedStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
          }
        >
          <RecentActivity />
        </Suspense>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a
              href="/users/new"
              className="block rounded-lg border p-4 transition hover:bg-gray-50"
            >
              <p className="font-medium text-gray-900">Add New User</p>
              <p className="text-sm text-gray-600">Create a new user account</p>
            </a>
            {currentUser.role === 'super_admin' && (
              <>
                <a
                  href="/schools/new"
                  className="block rounded-lg border p-4 transition hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-900">Add New School</p>
                  <p className="text-sm text-gray-600">Register a new school</p>
                </a>
                <a
                  href="/roles"
                  className="block rounded-lg border p-4 transition hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-900">Manage Roles</p>
                  <p className="text-sm text-gray-600">
                    Configure roles and permissions
                  </p>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
