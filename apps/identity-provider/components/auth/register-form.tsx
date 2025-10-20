'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@repo/validators/auth';
import { signUp } from '@/lib/auth-client';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '' };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    setLoading(true);

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (!result.success) {
        setTimeout(() => {
          setError(result.error || 'Registration failed');
          setLoading(false);
        }, 0);
        return;
      }

      // Redirect to verify email page
      router.push('/verify-email?email=' + encodeURIComponent(data.email));
    } catch {
      setTimeout(() => {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          key={error}
          className="rounded-md bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            disabled={loading}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            disabled={loading}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            disabled={loading}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength.strength
                        ? passwordStrength.strength <= 2
                          ? 'bg-red-500'
                          : passwordStrength.strength === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength.label && (
                <p className="text-xs text-gray-600">
                  Strength: {passwordStrength.label}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            disabled={loading}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start">
          <input
            id="agree"
            type="checkbox"
            {...register('agree')}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agree && (
          <p className="text-sm text-red-600">{errors.agree.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </div>
  );
}
