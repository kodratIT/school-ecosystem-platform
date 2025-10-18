# STORY-015: Setup Better Auth

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **integrate Better Auth for authentication** so that **users can securely login with email/password and OAuth providers (Google, Microsoft)**.

Better Auth provides modern authentication with TypeScript support, built-in OAuth, and seamless Next.js integration.

---

## 🎯 Goals

- Install and configure Better Auth
- Setup email/password authentication
- Configure Google OAuth
- Configure Microsoft OAuth (optional)
- Implement session management
- Setup password reset flow
- Configure email verification

---

## ✅ Acceptance Criteria

- [ ] Better Auth installed
- [ ] Auth configuration complete
- [ ] Email/password auth working
- [ ] Google OAuth configured
- [ ] Microsoft OAuth configured (optional)
- [ ] Session management working
- [ ] Password reset flow
- [ ] Email verification
- [ ] Auth API routes created
- [ ] Type-safe auth utilities

---

## 📋 Tasks

### Task 1: Install Better Auth

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create IdP app if not exists
mkdir -p apps/identity-provider

cd apps/identity-provider

# Install Better Auth
pnpm add better-auth
pnpm add -D @better-auth/cli
```

---

### Task 2: Configure Better Auth

**File:** `apps/identity-provider/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getSupabaseClient } from "@repo/database-identity";

export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.IDENTITY_DB_URL!,
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/microsoft`,
      enabled: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  
  advanced: {
    cookiePrefix: "idp",
    generateId: () => crypto.randomUUID(),
  },
  
  plugins: [
    nextCookies(),
  ],
  
  callbacks: {
    async onSignUp(user) {
      // Send welcome email
      console.log('New user signed up:', user.email);
      // TODO: Send welcome email
    },
    
    async onSignIn(user, session) {
      // Update last login
      const supabase = getSupabaseClient();
      await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    },
  },
});

export type Auth = typeof auth;
```

---

### Task 3: Create Auth API Routes

**File:** `apps/identity-provider/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

---

### Task 4: Create Auth Client

**File:** `apps/identity-provider/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL!,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
```

---

### Task 5: Create Auth Utilities

**File:** `apps/identity-provider/lib/auth-utils.ts`

```typescript
import { auth } from "./auth";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Get current session (server-side)
 * Cached per request
 */
export const getCurrentSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await cookies(),
  });
  
  return session;
});

/**
 * Get current user (server-side)
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

/**
 * Require specific role
 */
export async function requireRole(role: string | string[]) {
  const session = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(session.user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return session;
}

/**
 * Check if user has role
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getCurrentSession();
  return session?.user.role === role;
}
```

---

### Task 6: Create Login Page

**File:** `apps/identity-provider/app/(auth)/login/page.tsx`

```typescript
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getCurrentSession();
  
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            School Ecosystem Identity Provider
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
```

---

### Task 7: Create Login Form Component

**File:** `apps/identity-provider/components/auth/login-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.push('/dashboard');
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
        callbackURL: '/dashboard',
      });
    } catch (err) {
      setError('Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
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
    </div>
  );
}
```

---

### Task 8: Create Register Page

**File:** `apps/identity-provider/app/(auth)/register/page.tsx`

```typescript
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getCurrentSession();
  
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join School Ecosystem
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
}
```

---

### Task 9: Update Environment Variables

**File:** `.env.local` (update)

```bash
# Better Auth
AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth (optional)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

---

### Task 10: Configure OAuth Providers

#### Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env.local`

#### Microsoft OAuth Setup (Optional)

1. Go to https://portal.azure.com
2. Azure Active Directory → App registrations → New registration
3. Add redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
4. Certificates & secrets → New client secret
5. Copy Application (client) ID and secret to `.env.local`

---

## 🧪 Testing Instructions

### Test 1: Email/Password Login

```bash
cd apps/identity-provider
pnpm dev

# Visit http://localhost:3000/login
# Try login with test credentials
```

---

### Test 2: Google OAuth

1. Click "Sign in with Google"
2. Select Google account
3. Should redirect to `/dashboard`
4. Check session is created

---

### Test 3: Test Auth Utilities

```typescript
// In a server component
import { getCurrentUser, requireAuth } from '@/lib/auth-utils';

export default async function Dashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Welcome {user.name}</div>;
}
```

---

### Test 4: Test Session Persistence

1. Login
2. Refresh page
3. Should stay logged in
4. Check session cookie exists

---

## 📸 Expected Results

```
apps/identity-provider/
├── lib/
│   ├── auth.ts              ✅ Better Auth config
│   ├── auth-client.ts       ✅ Client utilities
│   └── auth-utils.ts        ✅ Server utilities
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts ✅ Auth API
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx    ✅ Login page
│   │   └── register/
│   │       └── page.tsx    ✅ Register page
│   └── dashboard/
│       └── page.tsx         ✅ Protected page
└── components/
    └── auth/
        ├── login-form.tsx   ✅ Login form
        └── register-form.tsx ✅ Register form
```

**Features working:**
- ✅ Email/password authentication
- ✅ Google OAuth
- ✅ Session management
- ✅ Protected routes
- ✅ Type-safe auth utilities

---

## ❌ Common Errors & Solutions

### Error: "Invalid client credentials"

**Cause:** Wrong OAuth credentials

**Solution:** Check `.env.local` has correct Client ID and Secret

---

### Error: "Redirect URI mismatch"

**Cause:** OAuth redirect URI not configured

**Solution:** Add `http://localhost:3000/api/auth/callback/google` to OAuth console

---

### Error: "Session not found"

**Cause:** Cookies not working

**Solution:** Check cookies are enabled, not blocked by extensions

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-013 (Database schema)
  - STORY-014 (Database package)
- **Blocks**: 
  - STORY-017 (IdP App)
  - STORY-018 (Auth Pages)

---

## 📚 Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Google OAuth Setup](https://console.cloud.google.com)
- [Microsoft OAuth Setup](https://portal.azure.com)

---

## 💡 Tips

1. **Use AUTH_SECRET** - Generate strong 32+ char secret
2. **Test OAuth in incognito** - Avoid cached sessions
3. **Check redirect URIs** - Must match exactly
4. **Use HTTPS in production** - Required for OAuth
5. **Handle errors gracefully** - Show user-friendly messages

---

## ✏️ Definition of Done

- [ ] Better Auth installed and configured
- [ ] Email/password auth working
- [ ] Google OAuth working
- [ ] Session management working
- [ ] Login page created
- [ ] Register page created
- [ ] Auth utilities created
- [ ] Protected routes working
- [ ] Tests passing
- [ ] Documentation complete

---

**Created**: 2024  
**Story Owner**: Development Team
