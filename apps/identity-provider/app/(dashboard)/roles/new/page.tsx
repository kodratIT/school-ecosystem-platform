import { RoleForm } from '@/components/roles/role-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/roles"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to roles
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create New Role</h1>
        <p className="text-gray-600">Define a new role with permissions</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RoleForm />
      </div>
    </div>
  );
}
