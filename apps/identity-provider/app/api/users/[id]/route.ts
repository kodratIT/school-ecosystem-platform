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
    const { name, email, phone, role, is_active } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get old values for audit
    const { data: oldUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single();

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        phone,
        role,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Audit log
    const session = await getSession();
    await createAuditLog({
      user_id: session?.user?.id || null,
      action: 'user.update',
      resource_type: 'user',
      resource_id: data.id,
      old_values: oldUser
        ? {
            name: oldUser.name,
            email: oldUser.email,
            role: oldUser.role,
            is_active: oldUser.is_active,
          }
        : null,
      new_values: { name, email, role, is_active },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
      school_id: data.school_id,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = getSupabaseClient();

    // Get user info for audit
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single();

    // Soft delete
    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Audit log
    const session = await getSession();
    await createAuditLog({
      user_id: session?.user?.id || null,
      action: 'user.delete',
      resource_type: 'user',
      resource_id: params.id,
      old_values: user
        ? { name: user.name, email: user.email, role: user.role }
        : null,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
      school_id: user?.school_id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
