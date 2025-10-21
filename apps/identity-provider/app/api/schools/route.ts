import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      npsn,
      education_level,
      address,
      village,
      district,
      city,
      province,
      postal_code,
      phone,
      email,
      website,
      principal_name,
      principal_phone,
      is_active,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Create school
    const { data, error } = await supabase
      .from('schools')
      .insert({
        name,
        slug,
        npsn,
        education_level: education_level || 'sd',
        address,
        village: village || null,
        district: district || null,
        city,
        province,
        postal_code,
        phone,
        email,
        website: website || null,
        principal_name: principal_name || 'TBD',
        principal_phone: principal_phone || '-',
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      return NextResponse.json(
        { error: 'Failed to create school' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/schools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
