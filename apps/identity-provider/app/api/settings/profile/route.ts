import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient, createAuditLog } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get old values for audit
    const { data: oldUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Check if email is being changed and if it already exists
    if (email !== oldUser?.email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', session.user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update profile
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Audit log
    await createAuditLog({
      user_id: session.user.id,
      action: 'user.profile.update',
      resource_type: 'user',
      resource_id: session.user.id,
      old_values: {
        name: oldUser?.name,
        email: oldUser?.email,
        phone: oldUser?.phone,
      },
      new_values: { name, email, phone },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
      school_id: data.school_id,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/settings/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
