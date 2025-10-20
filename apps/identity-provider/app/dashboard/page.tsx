import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/signout-button';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Identity Provider
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border-4 border-dashed border-gray-200 p-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  User Information
                </h3>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="inline font-medium text-gray-600">Email:</dt>
                    <dd className="inline ml-2 text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-600">
                      User ID:
                    </dt>
                    <dd className="inline ml-2 text-gray-900">{user.id}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  🎉 Authentication is working! This is a protected page that
                  requires authentication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
