import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth-utils';
import { UsersTable } from '@/components/users/users-table';
import { UsersFilters } from '@/components/users/users-filters';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/db';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; page?: string };
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  // Fetch users from database
  const supabase = getSupabaseClient();
  let query = supabase
    .from('users')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Filter by school if not super_admin
  // Note: currentUser from auth doesn't have school_id yet
  // This will be fixed in future when session includes school data

  // Filter by role
  if (searchParams.role) {
    query = query.eq('role', searchParams.role);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

  // Filter by search
  const filteredUsers = searchParams.search
    ? (users || []).filter(
        (u) =>
          u.name.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
          u.email.toLowerCase().includes(searchParams.search!.toLowerCase())
      )
    : users || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <UsersFilters />

      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable users={filteredUsers} />
      </Suspense>
    </div>
  );
}
