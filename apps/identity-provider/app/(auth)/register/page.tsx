import { RegisterForm } from '@/components/auth/register-form';
import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RegisterPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join School Ecosystem today
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
