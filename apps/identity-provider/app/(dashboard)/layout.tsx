import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-utils';
import { DashboardNav } from '@/components/dashboard/nav';
import { DashboardHeader } from '@/components/dashboard/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Fixed Sidebar */}
      <DashboardNav user={user} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden pl-64">
        {/* Fixed Header */}
        <div className="fixed left-64 right-0 top-0 z-10">
          <DashboardHeader user={user} />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
