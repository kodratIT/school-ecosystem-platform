# STORY-026: Create Service Provider App Template

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 4 (Day 1-2)  
**Story Points**: 8  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a Next.js application template for Service Providers** so that **new Service Provider apps can be bootstrapped quickly with pre-configured authentication, middleware, and folder structure**.

---

## 🎯 Goals

- Create Next.js 14+ app template with App Router
- Pre-configure middleware chain (auth + tenant)
- Setup AuthProvider in root layout
- Create standard folder structure
- Environment configuration template
- Package configuration with workspace dependencies
- README with bootstrap instructions

---

## ✅ Acceptance Criteria

- [ ] Next.js app template created in packages/templates/
- [ ] Middleware chain configured
- [ ] AuthProvider integrated in root layout
- [ ] Folder structure established (app, components, lib, types)
- [ ] .env.example with all required variables
- [ ] package.json with workspace dependencies
- [ ] README.md with bootstrap guide
- [ ] Template can be copied to create new SP
- [ ] pnpm install and pnpm dev work
- [ ] TypeScript configured

---

## 🔗 Prerequisites

```bash
# Verify all packages ready
test -d packages/auth-client && echo "✅ Auth client"
test -d packages/middleware && echo "✅ Middleware"
test -d packages/api-client && echo "✅ API client"
test -d packages/ui && echo "✅ UI package"

# All should show ✅
```

---

## 📋 Tasks

### Task 1: Create Template Directory

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create template directory
mkdir -p packages/templates/service-provider

cd packages/templates/service-provider
```

**Verify:**
```bash
pwd
# Should show: .../packages/templates/service-provider
```

---

### Task 2: Initialize Next.js App

```bash
# Initialize Next.js 14+ with TypeScript and Tailwind
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

**Answer prompts:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: Yes (@/*)

---

### Task 3: Create Folder Structure

```bash
# Create app routes
mkdir -p app/{(auth)/login,(dashboard)/dashboard,api/health}

# Create component directories
mkdir -p components/{ui,forms,layouts}

# Create lib directories
mkdir -p lib/{utils,constants}

# Create types directory
mkdir -p types

# Create public assets
mkdir -p public/{images,icons}
```

**Verify structure:**
```bash
tree -L 2 -d
```

Expected:
```
.
├── app
│   ├── (auth)
│   ├── (dashboard)
│   └── api
├── components
│   ├── forms
│   ├── layouts
│   └── ui
├── lib
│   ├── constants
│   └── utils
├── public
│   ├── icons
│   └── images
└── types
```

---

### Task 4: Configure package.json

**File**: `package.json`

```json
{
  "name": "service-provider-template",
  "version": "0.0.0",
  "private": true,
  "description": "Template for Service Provider applications",
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

### Task 5: Create Environment Template

**File**: `.env.example`

```bash
# ============================================
# Service Provider Configuration
# ============================================

# Service Database (Supabase)
# Get these from your Supabase project settings
NEXT_PUBLIC_SERVICE_DB_URL=https://xxxxxxxxxxxxx.supabase.co
SERVICE_DB_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SERVICE_DB_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# Identity Provider
# ============================================

# Identity Provider URL (where users login)
NEXT_PUBLIC_IDP_URL=http://localhost:3000

# JWT Secret (MUST match Identity Provider secret)
NEXT_PUBLIC_JWT_SECRET=your-secret-key-min-32-characters

# ============================================
# Application Configuration
# ============================================

# Application name (shown in UI)
NEXT_PUBLIC_APP_NAME=Service Provider

# Application URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Environment
NODE_ENV=development

# ============================================
# Optional: Feature Flags
# ============================================

# Enable debug mode
NEXT_PUBLIC_DEBUG=false
```

**Create .env.local:**
```bash
cp .env.example .env.local
echo ".env.local" >> .gitignore
```

---

### Task 6: Configure Middleware

**File**: `middleware.ts`

```typescript
import { 
  chain, 
  createAuthMiddleware, 
  createTenantMiddleware 
} from '@repo/middleware';

/**
 * Middleware chain for Service Provider
 * 
 * Order is important:
 * 1. Auth - Verifies JWT token
 * 2. Tenant - Sets school context
 */
export default chain(
  // Verify JWT and authenticate user
  createAuthMiddleware({
    publicPaths: [
      '/login',           // Login page
      '/api/health',      // Health check endpoint
      '/favicon.ico',     // Favicon
      '/_next',           // Next.js internal
    ],
    redirectTo: '/login',
  }),
  
  // Set school context for multi-tenancy
  createTenantMiddleware()
);

/**
 * Matcher configuration
 * Applies middleware to all routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

### Task 7: Setup Root Layout

**File**: `app/layout.tsx`

```typescript
import { AuthProvider } from '@repo/auth-client';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Service Provider - Ekosistem Sekolah',
    template: '%s | Service Provider',
  },
  description: 'Service Provider application for Ekosistem Sekolah',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 
          AuthProvider provides authentication state to entire app
          - Checks JWT token on mount
          - Provides useAuth hook
          - Handles login/logout
        */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Task 8: Create Home Page

**File**: `app/page.tsx`

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Service Provider
          </h1>
          <p className="text-gray-600 mb-8">
            Ekosistem Sekolah
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 9: Create Utility Functions

**File**: `lib/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conflicts properly with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**File**: `lib/constants/index.ts`

```typescript
/**
 * Application constants
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Service Provider';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
export const IDP_URL = process.env.NEXT_PUBLIC_IDP_URL || 'http://localhost:3000';

/**
 * Navigation routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
} as const;
```

---

### Task 10: Create API Health Check

**File**: `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Used by monitoring tools to check if service is running
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'service-provider',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
```

---

### Task 11: Create TypeScript Types

**File**: `types/index.ts`

```typescript
/**
 * Common types for Service Provider
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Common entity fields
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  school_id: string;
}
```

---

### Task 12: Configure TypeScript

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Task 13: Create README

**File**: `README.md`

````markdown
# Service Provider Template

Next.js template for creating Service Provider applications in Ekosistem Sekolah.

## Features

- ✅ Next.js 14+ with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS for styling
- ✅ Pre-configured authentication (SSO)
- ✅ Middleware chain (Auth + Tenant)
- ✅ Multi-tenant support
- ✅ RBAC with permissions
- ✅ Type-safe API client

## Quick Start

### 1. Copy Template

\`\`\`bash
# Copy template to new service
cp -r packages/templates/service-provider apps/[your-service-name]

# Navigate to new service
cd apps/[your-service-name]
\`\`\`

### 2. Configure Package

Edit `package.json`:
\`\`\`json
{
  "name": "your-service-name",
  ...
}
\`\`\`

### 3. Setup Environment

\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
\`\`\`

**Required environment variables:**
- `NEXT_PUBLIC_SERVICE_DB_URL` - Your service database URL
- `SERVICE_DB_SERVICE_KEY` - Service role key
- `NEXT_PUBLIC_SERVICE_DB_ANON_KEY` - Anon key
- `NEXT_PUBLIC_IDP_URL` - Identity Provider URL
- `NEXT_PUBLIC_JWT_SECRET` - JWT secret (must match IdP)

### 4. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 5. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Visit http://localhost:3001

## Project Structure

\`\`\`
.
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (public)
│   │   └── login/
│   ├── (dashboard)/         # Dashboard routes (protected)
│   │   └── dashboard/
│   ├── api/                 # API routes
│   │   └── health/
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── forms/               # Form components
│   └── layouts/             # Layout components
├── lib/                     # Utilities and constants
│   ├── utils/
│   └── constants/
├── types/                   # TypeScript types
├── public/                  # Static assets
├── middleware.ts            # Middleware chain
├── .env.example             # Environment template
└── README.md
\`\`\`

## Development

### Add New Page

1. Create file in `app/` directory:
\`\`\`typescript
// app/students/page.tsx
export default function StudentsPage() {
  return <div>Students</div>;
}
\`\`\`

2. Protected by default (middleware applies)

### Add Public Page

1. Create in `app/(auth)/` group
2. Or add to `publicPaths` in middleware.ts

### Add API Route

\`\`\`typescript
// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const schoolId = headers().get('x-school-id');
  
  // Query database with schoolId
  // ...
  
  return NextResponse.json({ data: [] });
}
\`\`\`

### Use Authentication

\`\`\`typescript
'use client';

import { useAuth } from '@repo/auth-client';

export default function MyComponent() {
  const { user, isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  if (!hasPermission('students.read')) {
    return <div>No permission</div>;
  }

  return <div>Welcome {user.name}</div>;
}
\`\`\`

## Scripts

\`\`\`bash
# Development
pnpm dev          # Start dev server on port 3001

# Build
pnpm build        # Build for production
pnpm start        # Start production server

# Quality
pnpm lint         # Run ESLint
pnpm type-check   # Check TypeScript types
\`\`\`

## Middleware

The middleware chain runs on every request:

1. **Auth Middleware** - Verifies JWT token
2. **Tenant Middleware** - Sets school context

Public paths (no auth required):
- `/login`
- `/api/health`
- Static files

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SERVICE_DB_URL` | Service database URL | Yes |
| `SERVICE_DB_SERVICE_KEY` | Service role key (server) | Yes |
| `NEXT_PUBLIC_SERVICE_DB_ANON_KEY` | Anon key (client) | Yes |
| `NEXT_PUBLIC_IDP_URL` | Identity Provider URL | Yes |
| `NEXT_PUBLIC_JWT_SECRET` | JWT secret | Yes |
| `NEXT_PUBLIC_APP_NAME` | App name for UI | No |
| `NEXT_PUBLIC_APP_URL` | App URL for callbacks | No |

## Troubleshooting

### "Cannot find module '@repo/...'"

\`\`\`bash
# Reinstall dependencies
pnpm install

# Rebuild workspace
turbo build
\`\`\`

### "Redirect loop" or "Too many redirects"

Check:
1. `/login` is in middleware `publicPaths`
2. JWT_SECRET matches Identity Provider
3. Cookie settings are correct

### "Unauthorized" or "401 errors"

Check:
1. Identity Provider is running
2. JWT token is valid
3. User is logged in

## Best Practices

1. **Always filter by school_id** in queries
2. **Check permissions** before sensitive operations
3. **Use useAuth hook** for authentication state
4. **Handle errors** gracefully
5. **Type everything** - no `any` types

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Ekosistem Sekolah Docs](../../docs/)
- [Phase 2 Guide](../../phases/phase-02-service-provider-foundation/)
````

---

## 🧪 Testing Instructions

### Test 1: Template Structure

```bash
cd packages/templates/service-provider

# Check all directories exist
test -d app && echo "✅ app/"
test -d components && echo "✅ components/"
test -d lib && echo "✅ lib/"
test -d types && echo "✅ types/"
test -f middleware.ts && echo "✅ middleware.ts"
test -f .env.example && echo "✅ .env.example"
test -f README.md && echo "✅ README.md"

# All should show ✅
```

### Test 2: Dependencies Install

```bash
cd packages/templates/service-provider

pnpm install

# Should install without errors
```

### Test 3: Type Check

```bash
pnpm type-check

# Should pass with 0 errors
```

### Test 4: Build Test

```bash
pnpm build

# Should build successfully
```

### Test 5: Dev Server

```bash
pnpm dev

# Should start on http://localhost:3001
# Open browser and check:
# - Home page loads
# - Can navigate to /login
# - Can navigate to /dashboard (should redirect to login)
```

---

## 📸 Expected Results

```
packages/templates/service-provider/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   └── dashboard/
│   ├── api/
│   │   └── health/
│   │       └── route.ts         ✅
│   ├── layout.tsx               ✅
│   ├── page.tsx                 ✅
│   └── globals.css              ✅
├── components/
│   ├── ui/                      ✅
│   ├── forms/                   ✅
│   └── layouts/                 ✅
├── lib/
│   ├── utils/
│   │   └── cn.ts                ✅
│   └── constants/
│       └── index.ts             ✅
├── types/
│   └── index.ts                 ✅
├── public/                      ✅
├── middleware.ts                ✅
├── .env.example                 ✅
├── package.json                 ✅
├── tsconfig.json                ✅
├── tailwind.config.ts           ✅
├── postcss.config.js            ✅
├── next.config.js               ✅
└── README.md                    ✅
```

**Terminal Output:**
```bash
$ pnpm dev
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3001
  - Ready in 2.3s

$ pnpm type-check
✓ Type check passed

$ pnpm build
✓ Compiled successfully
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/auth-client'"

**Cause:** Workspace packages not installed

**Solution:**
```bash
# From project root
pnpm install
turbo build
```

### Error: "Module not found: Can't resolve './globals.css'"

**Cause:** Missing CSS file

**Solution:**
```bash
# Next.js should create this automatically
# If missing, create basic globals.css:
echo "@tailwind base;
@tailwind components;
@tailwind utilities;" > app/globals.css
```

### Error: "Port 3001 already in use"

**Solution:**
```bash
# Change port in package.json
"dev": "next dev -p 3002"

# Or kill process on port 3001
lsof -ti:3001 | xargs kill
```

---

## 💡 Usage Examples

### Example 1: Bootstrap New Service

```bash
# Copy template
cp -r packages/templates/service-provider apps/ppdb

# Configure
cd apps/ppdb
cp .env.example .env.local
# Edit .env.local

# Update package.json name to "ppdb"

# Install and run
pnpm install
pnpm dev
```

### Example 2: Add Protected Page

```typescript
// apps/your-service/app/students/page.tsx
'use client';

import { useAuth } from '@repo/auth-client';

export default function StudentsPage() {
  const { user, hasPermission } = useAuth();

  if (!hasPermission('students.read')) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Students</h1>
      <p>School: {user.school_name}</p>
    </div>
  );
}
```

### Example 3: API Route with School Context

```typescript
// app/api/students/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Get school context from middleware
  const schoolId = headers().get('x-school-id');
  const userId = headers().get('x-user-id');

  if (!schoolId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Query database with school filter
  // const students = await getStudents(schoolId);

  return NextResponse.json({
    data: [],
    meta: { school_id: schoolId }
  });
}
```

---

## 🔗 Dependencies

- **Depends on**: STORY-023, STORY-024, STORY-025
- **Blocks**: STORY-027, STORY-029

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] Folder structure established
- [ ] package.json configured
- [ ] Middleware configured
- [ ] Root layout with AuthProvider
- [ ] Environment template created
- [ ] TypeScript configured
- [ ] README complete
- [ ] pnpm install works
- [ ] pnpm dev starts server
- [ ] pnpm type-check passes
- [ ] pnpm build succeeds
- [ ] Template can be copied to create new SP
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
