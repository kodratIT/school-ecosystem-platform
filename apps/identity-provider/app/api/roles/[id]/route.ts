import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = getSupabaseClient();

    // Check if role is system role
    const { data: role } = await supabase
      .from('roles')
      .select('is_system')
      .eq('id', params.id)
      .single();

    if (role?.is_system) {
      return NextResponse.json(
        { error: 'System roles cannot be deleted' },
        { status: 400 }
      );
    }

    // Delete role permissions first
    await supabase.from('role_permissions').delete().eq('role_id', params.id);

    // Delete role (hard delete, roles table doesn't have deleted_at)
    const { error } = await supabase.from('roles').delete().eq('id', params.id);

    if (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json(
        { error: 'Failed to delete role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/roles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
