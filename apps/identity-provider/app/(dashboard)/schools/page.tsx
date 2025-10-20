import { getCurrentUser } from '@/lib/auth-utils';
import { getSupabaseClient } from '@/lib/db';
import { SchoolsGrid } from '@/components/schools/schools-grid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SchoolsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Only super_admin can access
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  const { data: schools, error } = await supabase
    .from('schools')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching schools:', error);
    throw new Error('Failed to fetch schools');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-gray-600">Manage schools in the ecosystem</p>
        </div>

        <Link href="/schools/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>

      <SchoolsGrid schools={schools || []} />
    </div>
  );
}
