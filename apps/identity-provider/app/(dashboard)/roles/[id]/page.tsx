import { getSupabaseClient } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RoleForm } from '@/components/roles/role-form';
import { PermissionsManager } from '@/components/roles/permissions-manager';

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseClient();

  // Fetch role (no soft delete - roles are hard deleted)
  const { data: role, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !role) {
    notFound();
  }

  // Fetch all permissions (no soft delete - permissions are hard deleted)
  const { data: allPermissions } = await supabase
    .from('permissions')
    .select('*')
    .order('resource');

  // Fetch role's current permissions
  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('permission_id')
    .eq('role_id', id);

  const assignedPermissionIds =
    rolePermissions?.map((rp) => rp.permission_id) || [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/roles"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to roles
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Role</h1>
        <p className="text-gray-600">Update role information and permissions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Role Information</h2>
          <RoleForm
            initialData={{
              name: role.name,
              description: role.description || undefined,
              is_system: role.is_system,
            }}
            roleId={role.id}
          />
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Permissions</h2>
          <PermissionsManager
            roleId={role.id}
            allPermissions={allPermissions || []}
            assignedPermissionIds={assignedPermissionIds}
          />
        </div>
      </div>
    </div>
  );
}
