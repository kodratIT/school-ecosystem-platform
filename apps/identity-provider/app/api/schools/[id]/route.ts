import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

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
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = getSupabaseClient();

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/schools/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
