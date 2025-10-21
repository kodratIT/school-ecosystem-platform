import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = getSupabaseClient();

    // Delete role_permissions associations first
    await supabase
      .from('role_permissions')
      .delete()
      .eq('permission_id', params.id);

    // Delete permission (hard delete, permissions table doesn't have deleted_at)
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting permission:', error);
      return NextResponse.json(
        { error: 'Failed to delete permission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/permissions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
