import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, createAuditLog } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: 'permissionIds must be an array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get old permissions for audit
    const { data: oldPerms } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', params.id);

    const oldPermissionIds = oldPerms?.map((p) => p.permission_id) || [];

    // Delete existing permissions
    await supabase.from('role_permissions').delete().eq('role_id', params.id);

    // Insert new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map((permissionId) => ({
        role_id: params.id,
        permission_id: permissionId,
      }));

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (insertError) {
        console.error('Error inserting permissions:', insertError);
        return NextResponse.json(
          { error: 'Failed to update permissions' },
          { status: 500 }
        );
      }
    }

    // Audit log
    const session = await getSession();
    const added = permissionIds.filter((id) => !oldPermissionIds.includes(id));
    const removed = oldPermissionIds.filter(
      (id) => !permissionIds.includes(id)
    );

    if (added.length > 0 || removed.length > 0) {
      await createAuditLog({
        user_id: session?.user?.id || null,
        action: 'role.permissions.update',
        resource_type: 'role',
        resource_id: params.id,
        old_values: { permissionIds: oldPermissionIds },
        new_values: { permissionIds },
        metadata: {
          added,
          removed,
          addedCount: added.length,
          removedCount: removed.length,
        },
        ip_address:
          request.headers.get('x-forwarded-for')?.split(',')[0] || null,
        user_agent: request.headers.get('user-agent') || null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/roles/[id]/permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
