import { getSupabaseClient } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SchoolForm } from '@/components/schools/school-form';

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseClient();

  // Fetch school
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !school) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/schools"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to schools
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit School</h1>
        <p className="text-gray-600">Update school information</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SchoolForm
          initialData={{
            name: school.name,
            npsn: school.npsn || undefined,
            address: school.address || undefined,
            city: school.city || undefined,
            province: school.province || undefined,
            postal_code: school.postal_code || undefined,
            phone: school.phone || undefined,
            email: school.email || undefined,
            website: school.website || undefined,
            is_active: school.is_active,
          }}
          schoolId={school.id}
        />
      </div>
    </div>
  );
}
