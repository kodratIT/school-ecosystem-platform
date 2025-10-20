import { UserForm } from '@/components/users/user-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewUserPage() {
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
        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-gray-600">Add a new user to the system</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <UserForm />
      </div>
    </div>
  );
}
