'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email address not found');
      return;
    }

    setResending(true);
    setError(null);
    setResent(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          // Rate limited
          setCountdown(data.retryAfter);
          throw new Error(
            `Please wait ${formatCountdown(data.retryAfter)} before trying again`
          );
        }
        throw new Error(data.message || data.error || 'Failed to resend email');
      }

      // Success
      setResent(true);
      setCountdown(300); // 5 minutes cooldown

      // Clear success message after 5 seconds
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to resend email';
      setError(errorMessage);

      // Clear error after 10 seconds
      setTimeout(() => setError(null), 10000);
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
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Verification email sent!</p>
            <p className="mt-1">
              Check your inbox for the new verification link
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to resend</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={resending || countdown > 0}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center transition-all"
      >
        {resending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : countdown > 0 ? (
          <>Resend available in {formatCountdown(countdown)}</>
        ) : (
          'Resend verification email'
        )}
      </button>

      {countdown > 0 && !resending && (
        <p className="text-xs text-center text-gray-500">
          You can request another verification email after the cooldown period
        </p>
      )}

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
