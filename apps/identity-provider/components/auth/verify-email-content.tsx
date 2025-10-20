'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      // TODO: Implement resend verification email API
      console.log('Resending verification email to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We&apos;ve sent a verification link to
          {email && <span className="block font-medium mt-1">{email}</span>}
        </p>
      </div>

      <div className="space-y-4 rounded-lg bg-blue-50 p-4 text-sm">
        <p className="text-blue-800">
          Click the link in the email to verify your account
        </p>
        <p className="text-blue-700">
          Didn&apos;t receive the email? Check your spam folder
        </p>
      </div>

      {resent && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          Verification email sent successfully!
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={resending}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-100 flex items-center justify-center"
      >
        {resending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Resend verification email'
        )}
      </button>

      <Link
        href="/login"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}
