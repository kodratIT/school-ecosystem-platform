import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, action, description } = body;

    if (!resource || !action) {
      return NextResponse.json(
        { error: 'Resource and action are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if permission already exists
    const { data: existing } = await supabase
      .from('permissions')
      .select('id')
      .eq('resource', resource)
      .eq('action', action)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Permission already exists' },
        { status: 400 }
      );
    }

    // Create permission
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        resource,
        action,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating permission:', error);
      return NextResponse.json(
        { error: 'Failed to create permission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
