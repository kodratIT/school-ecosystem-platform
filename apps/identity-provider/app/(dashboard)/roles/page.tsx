import { getCurrentUser } from '@/lib/auth-utils';
import { getSupabaseClient } from '@/lib/db';
import { RolesTable } from '@/components/roles/roles-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RolesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Only super_admin can manage roles
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to manage roles.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  // Fetch roles (no soft delete - roles are hard deleted)
  const { data: roles, error } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Failed to fetch roles');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-gray-600">Manage roles and their permissions</p>
        </div>

        <Link href="/roles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </Link>
      </div>

      <RolesTable roles={roles || []} />
    </div>
  );
}
