import { getCurrentUser } from '@/lib/auth-utils';
import { getSupabaseClient } from '@/lib/db';
import { PermissionsTable } from '@/components/permissions/permissions-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string }>;
}) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;

  if (!currentUser) {
    redirect('/login');
  }

  // Only super_admin can manage permissions
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to manage permissions.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  // Build query (no soft delete - permissions are hard deleted)
  let query = supabase.from('permissions').select('*').order('resource');

  // Filter by resource
  if (params.resource) {
    query = query.eq('resource', params.resource);
  }

  const { data: permissions, error } = await query;

  if (error) {
    console.error('Error fetching permissions:', error);
    throw new Error('Failed to fetch permissions');
  }

  // Get unique resources for filter
  const resources = Array.from(
    new Set(permissions?.map((p) => p.resource) || [])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permissions</h1>
          <p className="text-gray-600">Manage system permissions</p>
        </div>

        <Link href="/permissions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </Link>
      </div>

      {resources.length > 0 && (
        <div className="flex gap-2">
          <Link href="/permissions">
            <Button
              variant={!params.resource ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
          </Link>
          {resources.map((resource) => (
            <Link key={resource} href={`/permissions?resource=${resource}`}>
              <Button
                variant={params.resource === resource ? 'default' : 'outline'}
                size="sm"
              >
                {resource}
              </Button>
            </Link>
          ))}
        </div>
      )}

      <PermissionsTable permissions={permissions || []} />
    </div>
  );
}
