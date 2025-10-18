# STORY-029: Create Test Service Provider App (Demo)

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 4 (Day 5)  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a test Service Provider application from the template** so that **we can validate all Phase 2 packages work correctly together in a real application**.

---

## 🎯 Goals

- Bootstrap Service Provider from template
- Configure environment for testing
- Verify SSO flow works end-to-end
- Test all middleware chains
- Validate multi-tenancy
- Test permission checks
- Document any issues found

---

## ✅ Acceptance Criteria

- [ ] Test app created from template
- [ ] Environment configured correctly
- [ ] App starts without errors
- [ ] SSO login flow works
- [ ] Dashboard accessible after login
- [ ] User info displayed correctly
- [ ] Logout works
- [ ] Middleware chain executes correctly
- [ ] Permission checks work
- [ ] Multi-tenant context set
- [ ] API routes work with school context
- [ ] All packages integrated successfully

---

## 🔗 Prerequisites

```bash
# Verify all packages ready
test -d packages/templates/service-provider && echo "✅ Template"
test -d packages/auth-client && echo "✅ Auth client"
test -d packages/middleware && echo "✅ Middleware"
test -d packages/layouts && echo "✅ Layouts"

# Verify Identity Provider running
curl -s http://localhost:3000/api/health || echo "⚠️  Start IdP first: cd apps/identity-provider && pnpm dev"
```

---

## 📋 Tasks

### Task 1: Bootstrap from Template

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Copy template to apps directory
cp -r packages/templates/service-provider apps/test-service

cd apps/test-service
```

**Verify:**
```bash
ls -la
# Should show all template files
```

---

### Task 2: Update Package Configuration

**Edit**: `apps/test-service/package.json`

```json
{
  "name": "test-service",
  "version": "0.0.0",
  "private": true,
  "description": "Test Service Provider for validation",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/auth-client": "workspace:*",
    "@repo/middleware": "workspace:*",
    "@repo/api-client": "workspace:*",
    "@repo/layouts": "workspace:*",
    "@repo/ui": "workspace:*",
    "@repo/types": "workspace:*",
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "14.1.0"
  }
}
```

---

### Task 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env.local
```

**Edit**: `.env.local`

```bash
# Service Database (if you have test database)
# For now, can use placeholder values
NEXT_PUBLIC_SERVICE_DB_URL=https://placeholder.supabase.co
SERVICE_DB_SERVICE_KEY=placeholder-key
NEXT_PUBLIC_SERVICE_DB_ANON_KEY=placeholder-key

# Identity Provider (MUST be correct)
NEXT_PUBLIC_IDP_URL=http://localhost:3000

# JWT Secret (MUST match Identity Provider)
NEXT_PUBLIC_JWT_SECRET=your-secret-key-from-idp

# Application Configuration
NEXT_PUBLIC_APP_NAME=Test Service
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Environment
NODE_ENV=development

# Debug
NEXT_PUBLIC_DEBUG=true
```

**Important:** Get JWT_SECRET from Identity Provider's `.env.local`

---

### Task 4: Install Dependencies

```bash
cd apps/test-service

# Install dependencies
pnpm install
```

**Verify:**
```bash
# Check workspace packages linked
ls -la node_modules/@repo/

# Should show auth-client, middleware, etc.
```

---

### Task 5: Create Test Dashboard with Layouts

**Edit**: `apps/test-service/app/(dashboard)/dashboard/page.tsx`

```typescript
'use client';

import { DashboardLayout } from '@repo/layouts';
import { useAuth } from '@repo/auth-client';

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();

  return (
    <DashboardLayout
      appName="Test Service"
      navItems={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Test Page', href: '/test' },
      ]}
    >
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Test Service Provider
          </h1>
          <p className="text-gray-600">
            Phase 2 validation - All packages working!
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.name || 'Not set'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">School</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.school_name}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Roles</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.roles.join(', ')}
              </dd>
            </div>
          </dl>
        </div>

        {/* Validation Checks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">✓ Validation Checks</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Authentication working (user logged in)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>JWT token verified</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>School context: {user?.school_id}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Permissions loaded: {user?.permissions.length}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Layouts package working</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

### Task 6: Create Test API Route

**File**: `apps/test-service/app/api/test/route.ts`

```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Test API Route
 * Verifies middleware sets school context headers
 */
export async function GET() {
  const headersList = headers();
  
  const schoolId = headersList.get('x-school-id');
  const userId = headersList.get('x-user-id');

  return NextResponse.json({
    success: true,
    message: 'API route working',
    context: {
      schoolId,
      userId,
      hasSchoolContext: !!schoolId,
      hasUserContext: !!userId,
    },
    timestamp: new Date().toISOString(),
  });
}
```

---

### Task 7: Update Home Page

**Edit**: `apps/test-service/app/page.tsx`

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🧪</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Test Service
          </h1>
          <p className="text-gray-600 mb-2">
            Phase 2 Validation App
          </p>
          <p className="text-sm text-gray-500">
            Ekosistem Sekolah - Service Provider Foundation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Test Components:
          </h2>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Auth Client Package</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Middleware Package</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>API Client Package</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Layouts Package</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>SSO Flow</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Test Dashboard →
          </Link>

          <Link
            href="/api/test"
            target="_blank"
            className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Test API Route
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Port 3001 • Requires IdP on port 3000
        </p>
      </div>
    </div>
  );
}
```

---

### Task 8: Create Test Checklist Document

**File**: `apps/test-service/TEST-CHECKLIST.md`

```markdown
# Test Service - Validation Checklist

## Prerequisites

- [ ] Identity Provider running on port 3000
- [ ] Test user created in IdP
- [ ] JWT_SECRET configured correctly

## Installation

- [ ] pnpm install completed
- [ ] No errors in installation
- [ ] All workspace packages linked

## Build & Start

- [ ] pnpm type-check passes
- [ ] pnpm build succeeds
- [ ] pnpm dev starts on port 3001

## SSO Flow

- [ ] Visit http://localhost:3001
- [ ] Home page loads
- [ ] Click "Test Dashboard"
- [ ] Redirects to /login
- [ ] Redirects to IdP (port 3000)
- [ ] Login form appears
- [ ] Can login with test credentials
- [ ] Redirects back to test-service
- [ ] Lands on /dashboard
- [ ] User info displayed

## Dashboard

- [ ] Dashboard layout renders
- [ ] Navigation bar shows
- [ ] User name displayed
- [ ] School name shown
- [ ] Roles displayed
- [ ] Permissions listed
- [ ] Logout button works

## Middleware

- [ ] Protected routes require auth
- [ ] Public routes accessible
- [ ] School context set in headers
- [ ] User context set in headers

## API Routes

- [ ] /api/health returns 200
- [ ] /api/test returns school context
- [ ] Headers include x-school-id
- [ ] Headers include x-user-id

## Packages

- [ ] @repo/auth-client working
- [ ] @repo/middleware working
- [ ] @repo/api-client working
- [ ] @repo/layouts working
- [ ] @repo/ui working

## Error Cases

- [ ] Invalid JWT redirects to login
- [ ] Expired token refreshes or redirects
- [ ] Missing permission shows error
- [ ] Unauthorized page renders

## Performance

- [ ] Page load < 3s
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No lint warnings

## Issues Found

Document any issues found during testing:

1. 
2. 
3. 

## Sign Off

- Tested by: __________
- Date: __________
- Status: ☐ Pass ☐ Fail
- Notes: __________
```

---

## 🧪 Testing Instructions

### Step 1: Start Identity Provider

```bash
# Terminal 1
cd apps/identity-provider
pnpm dev

# Should start on http://localhost:3000
# Verify: curl http://localhost:3000/api/health
```

### Step 2: Start Test Service

```bash
# Terminal 2
cd apps/test-service
pnpm dev

# Should start on http://localhost:3001
```

### Step 3: Test SSO Flow

1. Open browser: http://localhost:3001
2. Click "Test Dashboard"
3. Should redirect to IdP login
4. Login with test user
5. Should return to dashboard
6. Verify user info displayed

### Step 4: Test API Route

1. Open: http://localhost:3001/api/test
2. Should see JSON with school context
3. Verify schoolId and userId present

### Step 5: Test Logout

1. Click logout button
2. Should redirect to IdP logout
3. Try accessing dashboard again
4. Should redirect to login

### Step 6: Complete Test Checklist

```bash
# Open and fill out checklist
code apps/test-service/TEST-CHECKLIST.md
```

---

## 📸 Expected Results

```
apps/test-service/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx     ✅ Updated
│   ├── api/
│   │   ├── health/
│   │   └── test/
│   │       └── route.ts     ✅ New
│   ├── page.tsx             ✅ Updated
│   └── layout.tsx           ✅
├── .env.local               ✅ Configured
├── package.json             ✅ Updated
├── TEST-CHECKLIST.md        ✅ New
└── README.md                ✅

Application Running:
- Port: 3001 ✅
- Health: http://localhost:3001/api/health ✅
- Home: http://localhost:3001 ✅
- Dashboard: http://localhost:3001/dashboard ✅
- API Test: http://localhost:3001/api/test ✅
```

---

## ❌ Common Errors & Solutions

### Error: "Module not found @repo/..."

```bash
# Reinstall from root
cd ../..
pnpm install
turbo build

cd apps/test-service
pnpm dev
```

### Error: "Redirect loop"

**Check:**
1. JWT_SECRET matches IdP
2. /login in middleware publicPaths
3. .env.local has correct values

### Error: "Connection refused to IdP"

**Solution:** Start Identity Provider first

```bash
cd apps/identity-provider
pnpm dev
```

### Error: "schoolId undefined in API"

**Cause:** Middleware not running

**Check:**
1. middleware.ts exists
2. Middleware chain includes tenant
3. User is authenticated

---

## 💡 Validation Success Criteria

Test is successful when:

- [ ] All checklist items pass
- [ ] SSO flow works end-to-end
- [ ] No console errors
- [ ] All packages working
- [ ] Middleware chain executes
- [ ] School context set
- [ ] User can logout
- [ ] Performance acceptable

---

## 🔗 Dependencies

- **Depends on**: ALL Phase 2 stories (022-028)
- **Blocks**: None (validation story)

---

## 📚 Resources

- [Test Checklist](./TEST-CHECKLIST.md)
- [Template README](../../packages/templates/service-provider/README.md)

---

## ✏️ Definition of Done

- [ ] Test app bootstrapped
- [ ] Environment configured
- [ ] Dependencies installed
- [ ] App starts successfully
- [ ] SSO flow tested and working
- [ ] All packages validated
- [ ] Test checklist completed
- [ ] Issues documented
- [ ] Screenshots/recording captured
- [ ] Sign-off obtained
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
