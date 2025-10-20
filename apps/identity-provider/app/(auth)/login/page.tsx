import { LoginForm } from '@/components/auth/login-form';
import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
