# STORY-027: Implement SSO Flow in Template

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 4 (Day 3)  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **implement complete SSO authentication flow in the Service Provider template** so that **users can seamlessly login via Identity Provider and access protected pages**.

---

## 🎯 Goals

- Implement login page with auto-redirect to IdP
- Create protected dashboard page
- Handle SSO callback
- Implement logout functionality
- Add loading states
- Create unauthorized page

---

## ✅ Acceptance Criteria

- [ ] Login page redirects to IdP
- [ ] SSO callback handled correctly
- [ ] Protected pages require authentication
- [ ] Dashboard shows user info
- [ ] Logout works correctly
- [ ] Loading states implemented
- [ ] Unauthorized page created
- [ ] Error handling implemented
- [ ] Works end-to-end with IdP

---

## 🔗 Prerequisites

```bash
# Verify STORY-026 complete
test -d packages/templates/service-provider && echo "✅ Template exists"
test -f packages/templates/service-provider/middleware.ts && echo "✅ Middleware configured"

# Verify Identity Provider running
curl http://localhost:3000/api/health || echo "⚠️  Start IdP first"
```

---

## 📋 Tasks

### Task 1: Create Login Page

**File**: `packages/templates/service-provider/app/(auth)/login/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@repo/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Login Page
 * 
 * Flow:
 * 1. Check if user is already authenticated
 * 2. If yes, redirect to intended destination
 * 3. If no, redirect to Identity Provider login
 * 
 * URL params:
 * - redirect: Where to go after login (default: /dashboard)
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Don't do anything while checking auth status
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      // User is already logged in, redirect to intended page
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } else {
      // User not logged in, redirect to Identity Provider
      // The IdP URL is configured in AuthProvider
      login();
    }
  }, [isAuthenticated, isLoading, login, router, searchParams]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        
        {/* Loading text */}
        <p className="text-gray-600 text-lg">
          {isLoading ? 'Checking authentication...' : 'Redirecting to login...'}
        </p>
        
        {/* Small hint */}
        <p className="text-gray-400 text-sm mt-2">
          You will be redirected to the Identity Provider
        </p>
      </div>
    </div>
  );
}
```

---

### Task 2: Create Auth Layout

**File**: `packages/templates/service-provider/app/(auth)/layout.tsx`

```typescript
import type { ReactNode } from 'react';

/**
 * Auth Layout
 * Wrapper for authentication pages (login, register, etc.)
 * 
 * Features:
 * - Centered layout
 * - Branded background
 * - No navigation (clean UI)
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Optional: Logo/Branding */}
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {process.env.NEXT_PUBLIC_APP_NAME || 'Service Provider'}
        </h2>
      </div>

      {/* Main content */}
      <main className="flex items-center justify-center min-h-screen p-4">
        {children}
      </main>
    </div>
  );
}
```

---

### Task 3: Create Dashboard Page

**File**: `packages/templates/service-provider/app/(dashboard)/dashboard/page.tsx`

```typescript
'use client';

import { useAuth } from '@repo/auth-client';

/**
 * Dashboard Page
 * Protected page - requires authentication
 * 
 * Features:
 * - Shows user information
 * - Shows school context
 * - Shows roles and permissions
 * - Logout button
 */
export default function DashboardPage() {
  const { user, logout, hasPermission, hasRole } = useAuth();

  // This should never happen due to middleware
  // But good to have as fallback
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user.name || user.email}!
              </p>
            </div>
            
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Information
          </h2>
          
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.name || 'Not set'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
                {user.id}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">School</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.school_name}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">School ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
                {user.school_id}
              </dd>
            </div>
          </dl>
        </div>

        {/* Roles Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Roles</h2>
          
          {user.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No roles assigned</p>
          )}
        </div>

        {/* Permissions Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Permissions
          </h2>
          
          {user.permissions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-800"
                >
                  ✓ {permission}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No permissions assigned</p>
          )}
        </div>

        {/* Example: Permission-based Content */}
        {hasPermission('students.read') && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              ✓ You have permission to read students
            </p>
          </div>
        )}

        {/* Example: Role-based Content */}
        {hasRole('admin') && (
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-sm">
              ✓ You have admin role - additional features available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Task 4: Create Dashboard Layout

**File**: `packages/templates/service-provider/app/(dashboard)/layout.tsx`

```typescript
'use client';

import { useAuth } from '@repo/auth-client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Dashboard Layout
 * Layout for protected pages
 * 
 * Features:
 * - Navigation bar
 * - User menu
 * - Loading state
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (shouldn't happen due to middleware)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/dashboard"
                  className="text-xl font-bold text-gray-900"
                >
                  {process.env.NEXT_PUBLIC_APP_NAME || 'Service Provider'}
                </Link>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                
                {/* Add more navigation items here */}
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                {/* School Badge */}
                <span className="hidden md:block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {user.school_name}
                </span>
                
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.roles[0] || 'User'}
                    </p>
                  </div>
                  
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
```

---

### Task 5: Create Unauthorized Page

**File**: `packages/templates/service-provider/app/unauthorized/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@repo/auth-client';

/**
 * Unauthorized Page
 * Shown when user doesn't have required permissions
 */
export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  
  const reason = searchParams.get('reason');
  const required = searchParams.get('required');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {reason === 'missing_permission'
            ? `You don't have the required permission${required ? `: ${required}` : ''}`
            : reason === 'missing_role'
            ? `You don't have the required role${required ? `: ${required}` : ''}`
            : 'You are not authorized to access this resource'}
        </p>

        {/* User Info */}
        {user && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">Current user:</p>
            <p className="text-sm font-medium text-gray-900">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Roles: {user.roles.join(', ') || 'None'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          
          <button
            onClick={logout}
            className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Logout and Switch Account
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
```

---

### Task 6: Create Loading Component

**File**: `packages/templates/service-provider/components/ui/loading-spinner.tsx`

```typescript
/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * Full Page Loading
 * Loading state that covers entire page
 */
export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Instructions

### Test 1: SSO Flow End-to-End

**Prerequisites:**
```bash
# Terminal 1: Start Identity Provider
cd apps/identity-provider
pnpm dev  # Port 3000

# Terminal 2: Start Service Provider Template
cd packages/templates/service-provider
cp .env.example .env.local
# Edit .env.local with correct values
pnpm dev  # Port 3001
```

**Test Flow:**
1. Open http://localhost:3001
2. Should show home page
3. Click "Go to Dashboard"
4. Should redirect to login page
5. Login page should redirect to http://localhost:3000/auth/login
6. Login with test credentials
7. Should redirect back to http://localhost:3001/dashboard
8. Dashboard should show user info
9. Verify logout button works

### Test 2: Direct Dashboard Access

1. Clear cookies/logout
2. Go directly to http://localhost:3001/dashboard
3. Should redirect to login
4. Should redirect to IdP
5. After login, should return to dashboard

### Test 3: Unauthorized Page

1. Create test route with permission check
2. Access without permission
3. Should show unauthorized page
4. Verify reason displays correctly

---

## 📸 Expected Results

**Login Flow:**
```
User visits /dashboard (not authenticated)
  ↓
Middleware redirects to /login
  ↓
Login page redirects to IdP (http://localhost:3000/auth/login)
  ↓
User logs in at IdP
  ↓
IdP redirects back with JWT in cookie
  ↓
Middleware verifies JWT ✓
  ↓
User lands on /dashboard (authenticated)
```

**Dashboard View:**
- User information displayed
- School name shown
- Roles listed
- Permissions listed
- Logout button works

---

## ❌ Common Errors & Solutions

### Error: "Redirect loop"

**Symptoms:** Browser shows "too many redirects"

**Causes:**
- `/login` not in publicPaths
- JWT not being saved
- Cookie domain mismatch

**Solutions:**
1. Check middleware.ts has `/login` in publicPaths
2. Verify JWT_SECRET matches IdP
3. Check cookie settings in auth-client

### Error: "User undefined on dashboard"

**Cause:** JWT verification failing

**Solutions:**
1. Check JWT_SECRET matches IdP
2. Verify token not expired
3. Check middleware order (auth before tenant)

### Error: "Cannot GET /login"

**Cause:** Login page not created

**Solution:** Verify file exists at `app/(auth)/login/page.tsx`

---

## 💡 Usage Examples

### Example 1: Protect Page with Permission

```typescript
'use client';

import { useRequirePermission } from '@repo/auth-client';

export default function StudentsPage() {
  // Auto-redirects if no permission
  useRequirePermission('students.read');

  return <div>Students List</div>;
}
```

### Example 2: Conditional UI

```typescript
'use client';

import { useAuth } from '@repo/auth-client';

export default function MyPage() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <h1>My Page</h1>
      
      {hasPermission('students.edit') && (
        <button>Edit Students</button>
      )}
    </div>
  );
}
```

### Example 3: Custom Loading

```typescript
'use client';

import { useAuth } from '@repo/auth-client';
import { LoadingPage } from '@/components/ui/loading-spinner';

export default function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage message="Loading user data..." />;
  }

  return <div>Welcome {user?.name}</div>;
}
```

---

## 🔗 Dependencies

- **Depends on**: STORY-023, STORY-024, STORY-026
- **Blocks**: STORY-029

---

## 📚 Resources

- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [useRouter Hook](https://nextjs.org/docs/app/api-reference/functions/use-router)

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] Login page implemented
- [ ] Dashboard page implemented
- [ ] Unauthorized page implemented
- [ ] Loading states added
- [ ] SSO flow tested end-to-end
- [ ] Logout works correctly
- [ ] Permission checks work
- [ ] Role checks work
- [ ] Error handling tested
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
