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
    const {
      name,
      npsn,
      address,
      city,
      province,
      postal_code,
      phone,
      email,
      website,
      is_active,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get old values for audit
    const { data: oldSchool } = await supabase
      .from('schools')
      .select('*')
      .eq('id', params.id)
      .single();

    // Update school
    const { data, error } = await supabase
      .from('schools')
      .update({
        name,
        npsn,
        address,
        city,
        province,
        postal_code,
        phone,
        email,
        website,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      return NextResponse.json(
        { error: 'Failed to update school' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Audit log
    const session = await getSession();
    await createAuditLog({
      user_id: session?.user?.id || null,
      action: 'school.update',
      resource_type: 'school',
      resource_id: data.id,
      old_values: oldSchool
        ? {
            name: oldSchool.name,
            npsn: oldSchool.npsn,
            is_active: oldSchool.is_active,
          }
        : null,
      new_values: { name, npsn, is_active },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
      school_id: data.id,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/schools/[id]:', error);
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

    // Get school info for audit
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('id', params.id)
      .single();

    // Soft delete
    const { error } = await supabase
      .from('schools')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting school:', error);
      return NextResponse.json(
        { error: 'Failed to delete school' },
        { status: 500 }
      );
    }

    // Audit log
    const session = await getSession();
    await createAuditLog({
      user_id: session?.user?.id || null,
      action: 'school.delete',
      resource_type: 'school',
      resource_id: params.id,
      old_values: school ? { name: school.name, npsn: school.npsn } : null,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
      school_id: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/schools/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
