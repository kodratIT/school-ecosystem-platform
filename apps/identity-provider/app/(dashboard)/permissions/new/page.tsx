import { PermissionForm } from '@/components/permissions/permission-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPermissionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/permissions"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to permissions
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create New Permission</h1>
        <p className="text-gray-600">Define a new system permission</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PermissionForm />
      </div>
    </div>
  );
}
