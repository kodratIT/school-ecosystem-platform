import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth-utils';
import { UsersTable } from '@/components/users/users-table';
import { UsersFilters } from '@/components/users/users-filters';
import { ExportButton } from '@/components/users/export-button';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/db';
import { Pagination } from '@/components/common/pagination';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  // Pagination
  const page = parseInt(params.page || '1');
  const itemsPerPage = 20;

  // Fetch users from database
  const supabase = getSupabaseClient();

  // Count total
  let countQuery = supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  // Filter count by role
  if (params.role) {
    countQuery = countQuery.eq('role', params.role);
  }

  const { count } = await countQuery;

  // Fetch paginated users
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase
    .from('users')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  // Filter by school if not super_admin
  // Note: currentUser from auth doesn't have school_id yet
  // This will be fixed in future when session includes school data

  // Filter by role
  if (params.role) {
    query = query.eq('role', params.role);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

  // Filter by search
  const filteredUsers = params.search
    ? (users || []).filter(
        (u) =>
          u.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          u.email.toLowerCase().includes(params.search!.toLowerCase())
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
          <ExportButton users={filteredUsers} />
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

      <Pagination
        currentPage={page}
        totalPages={Math.ceil((count || 0) / itemsPerPage)}
        totalItems={count || 0}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
