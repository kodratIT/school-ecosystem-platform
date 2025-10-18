# STORY-018: Build Authentication Pages

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 4  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **user**, I want to **have complete authentication pages (login, register, forgot password, verify email)** so that **I can securely access the system with a great user experience**.

This story creates all authentication-related pages with proper form validation and error handling.

---

## 🎯 Goals

- Create login page with email/password and OAuth
- Create register page with validation
- Create forgot password page
- Create reset password page
- Create email verification page
- Implement form validation with Zod
- Add proper error handling
- Create success/error messages
- Mobile responsive design

---

## ✅ Acceptance Criteria

- [ ] Login page complete with OAuth
- [ ] Register page with validation
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Email verification page
- [ ] Form validation working
- [ ] Error messages clear
- [ ] Success feedback
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Accessibility compliant

---

## 📋 Tasks

### Task 1: Create Auth Layout

**File:** `apps/identity-provider/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 lg:block">
        <div className="flex h-full flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-3xl font-bold">School Ecosystem</h1>
            <p className="mt-2 text-primary-100">Identity Provider</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Centralized Authentication
              </h2>
              <p className="mt-2 text-lg text-primary-100">
                One account for all school applications
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Single Sign-On</p>
                  <p className="text-sm text-primary-100">Access all apps with one login</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Secure & Private</p>
                  <p className="text-sm text-primary-100">Your data is protected</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Fast & Reliable</p>
                  <p className="text-sm text-primary-100">Lightning-fast authentication</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-primary-200">
            © 2024 School Ecosystem. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

### Task 2: Enhanced Login Form

**File:** `apps/identity-provider/components/auth/login-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@repo/validators/auth';
import { signIn } from '@/lib/auth-client';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Alert } from '@repo/ui/alert';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.push(from);
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: from,
      });
    } catch (err) {
      setError('Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={loading}
            error={errors.email?.message}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={loading}
            error={errors.password?.message}
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            {...register('remember')}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={loading}
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
```

---

### Task 3: Create Register Form

**File:** `apps/identity-provider/components/auth/register-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@repo/validators/auth';
import { signUp } from '@/lib/auth-client';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Alert } from '@repo/ui/alert';
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
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    setLoading(true);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Redirect to verify email page
      router.push('/verify-email?email=' + encodeURIComponent(data.email));
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join School Ecosystem today
        </p>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
            disabled={loading}
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={loading}
            error={errors.email?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={loading}
            error={errors.password?.message}
          />
          <p className="text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={loading}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="flex items-start">
          <input
            id="agree"
            type="checkbox"
            {...register('agree')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={loading}
          />
          <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
            I agree to the{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agree && (
          <p className="text-sm text-red-600">{errors.agree.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

---

### Task 4: Create Forgot Password Page

**File:** `apps/identity-provider/app/(auth)/forgot-password/page.tsx`

```typescript
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
```

**File:** `apps/identity-provider/components/auth/forgot-password-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@repo/validators/auth';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Alert } from '@repo/ui/alert';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError('');
    setLoading(true);

    try {
      // TODO: Implement forgot password API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a password reset link to{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p>
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setSuccess(false)}
              className="font-medium underline hover:no-underline"
            >
              try again
            </button>
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold">Forgot password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          No worries, we'll send you reset instructions
        </p>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={loading}
            error={errors.email?.message}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </div>
  );
}
```

---

### Task 5: Create Verify Email Page

**File:** `apps/identity-provider/app/(auth)/verify-email/page.tsx`

```typescript
import { VerifyEmailContent } from '@/components/auth/verify-email-content';

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}
```

**File:** `apps/identity-provider/components/auth/verify-email-content.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/button';
import Link from 'next/link';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResend = async () => {
    // TODO: Implement resend verification email
    console.log('Resending verification email to:', email);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
        <Mail className="h-8 w-8 text-primary-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification link to
          {email && <span className="block font-medium">{email}</span>}
        </p>
      </div>

      <div className="space-y-4 rounded-lg bg-blue-50 p-4 text-sm">
        <p className="text-blue-800">
          Click the link in the email to verify your account
        </p>
        <p className="text-blue-700">
          Didn't receive the email? Check your spam folder
        </p>
      </div>

      <Button onClick={handleResend} variant="outline" className="w-full">
        Resend verification email
      </Button>

      <Link
        href="/login"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}
```

---

## 🧪 Testing Instructions

### Test 1: Test Login Form

1. Visit http://localhost:3000/login
2. Try logging in with invalid credentials
3. Should show error message
4. Try with valid credentials
5. Should redirect to dashboard

---

### Test 2: Test Form Validation

1. Submit forms with empty fields
2. Should show validation errors
3. Try invalid email format
4. Should show email error
5. Try weak password
6. Should show password requirements

---

### Test 3: Test Register Flow

1. Go to /register
2. Fill form with valid data
3. Submit
4. Should redirect to /verify-email
5. Check email shown correctly

---

### Test 4: Test Forgot Password

1. Go to /forgot-password
2. Enter email
3. Submit
4. Should show success message
5. Test resend button

---

### Test 5: Mobile Responsive

1. Open in mobile viewport
2. All forms should be usable
3. Buttons should be touch-friendly
4. Text should be readable

---

## 📸 Expected Results

```
Auth Pages:
✅ /login - Login form with OAuth
✅ /register - Registration form
✅ /forgot-password - Password reset
✅ /reset-password - Set new password
✅ /verify-email - Email verification

Features:
✅ Form validation with Zod
✅ Error messages displayed
✅ Success feedback
✅ Loading states
✅ Mobile responsive
✅ OAuth buttons
✅ Password strength indicator
```

---

## ❌ Common Errors & Solutions

### Error: "Form validation not working"

**Cause:** Zod resolver not configured

**Solution:** Check `zodResolver(schema)` in useForm

---

### Error: "OAuth redirect failing"

**Cause:** Callback URL not configured

**Solution:** Check OAuth provider settings

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-015 (Better Auth)
  - STORY-017 (IdP App)
  - STORY-008 (Validators)
  - STORY-006 (UI components)
- **Blocks**: STORY-020 (Dashboard features)

---

## 💡 Tips

1. **Validate client-side** - Better UX with Zod
2. **Show clear errors** - Help users fix issues
3. **Loading states** - Show progress feedback
4. **Mobile first** - Design for smallest screen
5. **Accessibility** - Proper labels and ARIA
6. **Password strength** - Visual indicator

---

## ✏️ Definition of Done

- [ ] All auth pages created
- [ ] Form validation working
- [ ] Error handling complete
- [ ] Success messages shown
- [ ] Mobile responsive
- [ ] OAuth working
- [ ] Loading states implemented
- [ ] Accessibility checked
- [ ] Tested on multiple devices

---

**Created**: 2024  
**Story Owner**: Development Team
