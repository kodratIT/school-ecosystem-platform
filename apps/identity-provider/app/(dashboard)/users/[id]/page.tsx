import { UserForm } from '@/components/users/user-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !user) {
    notFound();
  }

  // Map role to proper type
  type UserRole =
    | 'super_admin'
    | 'school_admin'
    | 'teacher'
    | 'student'
    | 'parent'
    | 'finance_staff'
    | 'staff';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/users"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to users
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-gray-600">Update user information</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <UserForm
          initialData={{
            name: user.name,
            email: user.email,
            phone: user.phone || undefined,
            role: (user.role as UserRole) || 'student',
            is_active: user.is_active,
          }}
          userId={user.id}
        />
      </div>
    </div>
  );
}
