# STORY-030: Create Service Provider Documentation & Guidelines

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 4 (Day 5)  
**Story Points**: 3  
**Priority**: P1 (High)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create comprehensive documentation and guidelines for Service Provider development** so that **future developers can easily understand and use the Service Provider foundation**.

---

## 🎯 Goals

- Create Service Provider development guide
- Document best practices
- Create troubleshooting guide
- Document code examples
- Create quick start guide
- Document common patterns
- Create FAQ document

---

## ✅ Acceptance Criteria

- [ ] Service Provider guide created
- [ ] Best practices documented
- [ ] Troubleshooting guide complete
- [ ] Code examples provided
- [ ] Quick start guide created
- [ ] FAQ documented
- [ ] All guides reviewed and clear
- [ ] Examples tested and working

---

## 🔗 Prerequisites

```bash
# Verify all Phase 2 stories complete
test -d packages/templates/service-provider && echo "✅ Template"
test -d packages/auth-client && echo "✅ Auth"
test -d packages/middleware && echo "✅ Middleware"
test -d packages/api-client && echo "✅ API Client"
test -d packages/layouts && echo "✅ Layouts"
test -d apps/test-service && echo "✅ Test app"
```

---

## 📋 Tasks

### Task 1: Create Main Documentation Directory

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create docs directory
mkdir -p docs/service-providers
cd docs/service-providers
```

---

### Task 2: Create Development Guide

**File**: `docs/service-providers/development-guide.md`

````markdown
# Service Provider Development Guide

Complete guide for developing Service Provider applications using Phase 2 foundation.

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Development](#development)
5. [Best Practices](#best-practices)
6. [Deployment](#deployment)

---

## Introduction

### What is a Service Provider?

A Service Provider (SP) is an application within the Ekosistem Sekolah ecosystem that:
- Uses centralized authentication via Identity Provider
- Manages its own domain-specific data
- Has its own database
- Follows multi-tenant architecture

### Examples

- PPDB - Student registration
- SIS - Student information system
- Academic - Curriculum and scheduling
- LMS - Learning management
- Finance - Billing and payments

---

## Quick Start

### 1. Bootstrap New Service

\`\`\`bash
# Copy template
cp -r packages/templates/service-provider apps/[service-name]

# Navigate
cd apps/[service-name]

# Configure
cp .env.example .env.local
# Edit .env.local with your values

# Update package.json name
# Change "service-provider-template" to "[service-name]"

# Install and run
pnpm install
pnpm dev
\`\`\`

### 2. Required Environment Variables

\`\`\`bash
NEXT_PUBLIC_SERVICE_DB_URL=https://xxx.supabase.co
SERVICE_DB_SERVICE_KEY=xxx
NEXT_PUBLIC_SERVICE_DB_ANON_KEY=xxx
NEXT_PUBLIC_IDP_URL=http://localhost:3000
NEXT_PUBLIC_JWT_SECRET=your-secret-key
\`\`\`

### 3. Create Your First Page

\`\`\`typescript
// app/students/page.tsx
'use client';

import { DashboardLayout } from '@repo/layouts';
import { useAuth } from '@repo/auth-client';

export default function StudentsPage() {
  const { hasPermission } = useAuth();

  if (!hasPermission('students.read')) {
    return <div>Access denied</div>;
  }

  return (
    <DashboardLayout appName="My Service">
      <h1>Students</h1>
      {/* Your content */}
    </DashboardLayout>
  );
}
\`\`\`

---

## Architecture

### SSO Flow

\`\`\`
User → Service Provider → Not authenticated
  ↓
Redirect to Identity Provider
  ↓
User logs in
  ↓
Identity Provider generates JWT
  ↓
Redirect back to Service Provider
  ↓
Service Provider verifies JWT
  ↓
User authenticated
\`\`\`

### Middleware Chain

\`\`\`
Request
  ↓
[Auth Middleware]
  - Verify JWT token
  - Extract user info
  ↓
[Tenant Middleware]
  - Set school context
  - Add headers
  ↓
Route Handler
  - Access user data
  - Query database
\`\`\`

### Database Pattern

Each Service Provider has its own database:

\`\`\`
Identity Database (shared)
  - Users
  - Schools
  - Roles & Permissions

Service Database (per SP)
  - Service-specific tables
  - All tables have school_id
  - Row Level Security enabled
\`\`\`

---

## Development

### Authentication

#### Protect a Page

\`\`\`typescript
'use client';

import { useRequireAuth } from '@repo/auth-client';

export default function ProtectedPage() {
  const { user } = useRequireAuth();
  
  return <div>Welcome {user.name}</div>;
}
\`\`\`

#### Check Permission

\`\`\`typescript
'use client';

import { useAuth } from '@repo/auth-client';

export default function MyPage() {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission('students.edit') && (
        <button>Edit</button>
      )}
    </div>
  );
}
\`\`\`

#### Require Permission

\`\`\`typescript
'use client';

import { useRequirePermission } from '@repo/auth-client';

export default function AdminPage() {
  useRequirePermission('admin.access');
  
  return <div>Admin content</div>;
}
\`\`\`

### API Routes

#### Get School Context

\`\`\`typescript
// app/api/students/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const schoolId = headers().get('x-school-id');
  
  if (!schoolId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Query with school filter
  const students = await getStudents(schoolId);
  
  return NextResponse.json({ data: students });
}
\`\`\`

#### Create Resource

\`\`\`typescript
export async function POST(request: Request) {
  const schoolId = headers().get('x-school-id');
  const body = await request.json();

  // Always add school_id
  const student = await createStudent({
    ...body,
    school_id: schoolId,
  });

  return NextResponse.json({ data: student });
}
\`\`\`

### Database Queries

#### Always Filter by School

\`\`\`typescript
// ✅ Good
const students = await db
  .from('students')
  .select('*')
  .eq('school_id', schoolId);

// ❌ Bad - missing school filter
const students = await db
  .from('students')
  .select('*');
\`\`\`

#### Use Helpers

\`\`\`typescript
import { buildTenantFilter } from '@repo/database-[service]';

const filter = buildTenantFilter(schoolId, {
  status: 'active'
});

const students = await db
  .from('students')
  .select('*')
  .match(filter);
\`\`\`

### Layouts

#### Use Dashboard Layout

\`\`\`typescript
import { DashboardLayout } from '@repo/layouts';

export default function MyPage() {
  return (
    <DashboardLayout
      appName="My Service"
      navItems={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Students', href: '/students' },
      ]}
    >
      <YourContent />
    </DashboardLayout>
  );
}
\`\`\`

---

## Best Practices

### Security

1. **Always filter by school_id**
   \`\`\`typescript
   // Every query must filter by school
   .eq('school_id', schoolId)
   \`\`\`

2. **Verify ownership before update/delete**
   \`\`\`typescript
   const record = await db
     .from('students')
     .select('school_id')
     .eq('id', id)
     .single();
   
   if (record.school_id !== userSchoolId) {
     throw new Error('Unauthorized');
   }
   \`\`\`

3. **Check permissions before actions**
   \`\`\`typescript
   if (!hasPermission('students.delete')) {
     return <div>Cannot delete</div>;
   }
   \`\`\`

### Performance

1. **Use React Query for caching**
2. **Implement pagination**
3. **Use database indexes**
4. **Lazy load large lists**

### Code Quality

1. **Type everything** - No `any` types
2. **Use shared components** from @repo/ui
3. **Follow existing patterns**
4. **Write tests** for critical paths

---

## Deployment

### Environment Setup

Production environment variables:

\`\`\`bash
NEXT_PUBLIC_SERVICE_DB_URL=production-url
SERVICE_DB_SERVICE_KEY=production-key
NEXT_PUBLIC_SERVICE_DB_ANON_KEY=production-key
NEXT_PUBLIC_IDP_URL=https://idp.ekosistem.school
NEXT_PUBLIC_JWT_SECRET=production-secret
NODE_ENV=production
\`\`\`

### Build

\`\`\`bash
pnpm build
\`\`\`

### Deploy to Vercel

\`\`\`bash
vercel --prod
\`\`\`

---

## Resources

- [Phase 2 Implementation Guide](../../phases/phase-02-service-provider-foundation/IMPLEMENTATION.md)
- [Template README](../../packages/templates/service-provider/README.md)
- [Auth Client Docs](../../packages/auth-client/README.md)
- [Middleware Docs](../../packages/middleware/README.md)
````

---

### Task 3: Create Best Practices Guide

**File**: `docs/service-providers/best-practices.md`

````markdown
# Service Provider Best Practices

## Multi-Tenancy

### Always Filter by School

\`\`\`typescript
// ✅ Good
const data = await db
  .from('table')
  .select('*')
  .eq('school_id', schoolId);

// ❌ Bad
const data = await db
  .from('table')
  .select('*');
\`\`\`

### Verify Ownership

\`\`\`typescript
// Before update/delete
const record = await getRecord(id, schoolId);
if (!record) {
  throw new Error('Not found or unauthorized');
}
\`\`\`

## Authentication

### Use Provided Hooks

\`\`\`typescript
// ✅ Good
const { user, hasPermission } = useAuth();

// ❌ Bad - reimplementing auth logic
const user = parseJWT(getCookie('token'));
\`\`\`

### Protect Routes

\`\`\`typescript
// ✅ Good
useRequirePermission('resource.action');

// ❌ Bad - manual redirect
if (!hasPermission('...')) {
  router.push('/unauthorized');
}
\`\`\`

## API Routes

### Always Get Context

\`\`\`typescript
// ✅ Good
const schoolId = headers().get('x-school-id');
if (!schoolId) return unauthorized();

// ❌ Bad - no validation
const schoolId = headers().get('x-school-id');
// proceed without checking
\`\`\`

### Use TypeScript

\`\`\`typescript
// ✅ Good
export async function POST(request: Request): Promise<NextResponse> {
  const body: CreateStudentInput = await request.json();
  return NextResponse.json({ data: result });
}

// ❌ Bad
export async function POST(request) {
  const body = await request.json();
  return NextResponse.json(result);
}
\`\`\`

## Error Handling

### Graceful Degradation

\`\`\`typescript
// ✅ Good
try {
  const data = await fetchData();
  return <DataView data={data} />;
} catch (error) {
  return <ErrorMessage error={error} />;
}

// ❌ Bad
const data = await fetchData(); // Unhandled error
return <DataView data={data} />;
\`\`\`

### User-Friendly Messages

\`\`\`typescript
// ✅ Good
catch (error) {
  toast.error('Failed to save student. Please try again.');
}

// ❌ Bad
catch (error) {
  alert(error.message); // Technical error shown to user
}
\`\`\`

## Performance

### Pagination

\`\`\`typescript
// ✅ Good
const { data, count } = await db
  .from('students')
  .select('*', { count: 'exact' })
  .eq('school_id', schoolId)
  .range(from, to);

// ❌ Bad - loading all records
const data = await db
  .from('students')
  .select('*')
  .eq('school_id', schoolId);
\`\`\`

### Caching

\`\`\`typescript
// ✅ Good - using React Query
const { data } = useQuery({
  queryKey: ['students', schoolId],
  queryFn: () => getStudents(schoolId),
});

// ❌ Bad - no caching
useEffect(() => {
  getStudents(schoolId).then(setData);
}, []);
\`\`\`

## Code Organization

### Component Structure

\`\`\`
app/students/
├── page.tsx          # Main page
├── loading.tsx       # Loading state
├── error.tsx         # Error boundary
└── components/       # Page-specific components
    ├── student-list.tsx
    └── student-form.tsx
\`\`\`

### Shared Components

\`\`\`typescript
// ✅ Good - reusable
// components/students/student-card.tsx
export function StudentCard({ student }) {
  return <div>...</div>;
}

// ❌ Bad - inline
export default function Page() {
  return (
    <div>
      {students.map(s => (
        <div>...</div> // Complex inline component
      ))}
    </div>
  );
}
\`\`\`
````

---

### Task 4: Create Troubleshooting Guide

**File**: `docs/service-providers/troubleshooting.md`

````markdown
# Service Provider Troubleshooting

## Common Issues

### SSO Redirect Loop

**Symptoms:** Browser shows "too many redirects"

**Causes:**
1. Login page not in publicPaths
2. JWT token not being saved
3. Cookie domain mismatch
4. JWT_SECRET mismatch

**Solutions:**

1. Check middleware.ts:
   \`\`\`typescript
   createAuthMiddleware({
     publicPaths: ['/login', ...], // Ensure /login here
   })
   \`\`\`

2. Verify JWT_SECRET:
   \`\`\`bash
   # In .env.local - must match IdP
   NEXT_PUBLIC_JWT_SECRET=same-as-idp
   \`\`\`

3. Check cookie settings in auth-client

### Cannot Find Module '@repo/...'

**Symptoms:** Import errors for workspace packages

**Solutions:**

\`\`\`bash
# From project root
pnpm install
turbo build

# Restart dev server
cd apps/your-service
pnpm dev
\`\`\`

### School Context Not Set

**Symptoms:** `school_id` undefined in API routes

**Causes:**
1. Middleware not running
2. Wrong middleware order
3. User not authenticated

**Solutions:**

1. Verify middleware.ts exists and exports correctly
2. Check middleware order:
   \`\`\`typescript
   chain(
     createAuthMiddleware(),    // 1. Auth first
     createTenantMiddleware()   // 2. Tenant second
   )
   \`\`\`

3. Verify user is authenticated

### Unauthorized Errors

**Symptoms:** 401 errors on API calls

**Solutions:**

1. Check user is logged in:
   \`\`\`typescript
   const { isAuthenticated } = useAuth();
   console.log('Auth:', isAuthenticated);
   \`\`\`

2. Verify JWT not expired
3. Check API route uses school context

### Permission Denied

**Symptoms:** User can't access certain features

**Solutions:**

1. Check user permissions:
   \`\`\`typescript
   const { permissions } = useAuth();
   console.log('Permissions:', permissions);
   \`\`\`

2. Verify permission name matches exactly
3. Check role assignments in Identity Provider

### Database Connection Failed

**Symptoms:** Supabase errors

**Solutions:**

1. Verify credentials in .env.local
2. Check Supabase project is active
3. Verify network connectivity
4. Check RLS policies are not blocking

## Debugging Tips

### Enable Debug Mode

\`\`\`bash
# In .env.local
NEXT_PUBLIC_DEBUG=true
\`\`\`

### Check Console Logs

Open browser console and look for:
- Auth errors
- API errors
- Network errors

### Verify Middleware

Add logging to middleware:
\`\`\`typescript
createAuthMiddleware({
  publicPaths: ['/login'],
  redirectTo: '/login',
})

// Add after to verify it runs
console.log('Middleware executed');
\`\`\`

### Test API Routes

\`\`\`bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test with auth
curl -H "Cookie: ekosistem_auth_token=..." \
  http://localhost:3001/api/students
\`\`\`

## Getting Help

1. Check documentation
2. Search GitHub issues
3. Ask in team chat
4. Contact tech lead
````

---

### Task 5: Create Quick Reference

**File**: `docs/service-providers/quick-reference.md`

````markdown
# Service Provider Quick Reference

## Common Commands

\`\`\`bash
# Create new service
cp -r packages/templates/service-provider apps/[name]

# Install
pnpm install

# Dev server
pnpm dev

# Type check
pnpm type-check

# Build
pnpm build
\`\`\`

## Auth Hooks

\`\`\`typescript
// Get auth state
const { user, isAuthenticated, isLoading } = useAuth();

// Require auth (auto-redirect)
const { user } = useRequireAuth();

// Require permission
useRequirePermission('resource.action');

// Check permission
if (hasPermission('resource.action')) { ... }

// Check role
if (hasRole('admin')) { ... }

// Logout
logout();
\`\`\`

## API Routes

\`\`\`typescript
// Get context
const schoolId = headers().get('x-school-id');
const userId = headers().get('x-user-id');

// Return JSON
return NextResponse.json({ data });

// Return error
return NextResponse.json(
  { error: 'Message' },
  { status: 400 }
);
\`\`\`

## Layouts

\`\`\`typescript
import { DashboardLayout } from '@repo/layouts';

<DashboardLayout
  appName="My Service"
  navItems={[...]}
>
  {children}
</DashboardLayout>
\`\`\`

## Database

\`\`\`typescript
// Always filter by school
.eq('school_id', schoolId)

// Pagination
.range(from, to)

// Count
.select('*', { count: 'exact' })
\`\`\`
````

---

## 🧪 Testing Instructions

### Test 1: Documentation Review

```bash
# Read each document
cat docs/service-providers/development-guide.md
cat docs/service-providers/best-practices.md
cat docs/service-providers/troubleshooting.md
cat docs/service-providers/quick-reference.md

# Verify clarity and completeness
```

### Test 2: Follow Quick Start

Follow the quick start in development-guide.md and verify:
- Instructions are clear
- No steps missing
- Works as described

### Test 3: Test Code Examples

Copy code examples into test app and verify they work.

---

## 📸 Expected Results

```
docs/service-providers/
├── development-guide.md      ✅
├── best-practices.md         ✅
├── troubleshooting.md        ✅
└── quick-reference.md        ✅
```

---

## ✏️ Definition of Done

- [ ] All documentation files created
- [ ] Development guide complete
- [ ] Best practices documented
- [ ] Troubleshooting guide complete
- [ ] Quick reference created
- [ ] Code examples tested
- [ ] Documentation reviewed
- [ ] No typos or errors
- [ ] Links working
- [ ] Code blocks formatted
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
