import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, is_system } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if role name already exists
    const { data: existing } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 400 }
      );
    }

    // Create role
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '_');

    const { data, error } = await supabase
      .from('roles')
      .insert({
        name,
        slug,
        description,
        is_system: is_system ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
