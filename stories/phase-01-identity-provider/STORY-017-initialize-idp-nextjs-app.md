# STORY-017: Initialize Identity Provider Next.js App

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 4  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **initialize the Identity Provider Next.js application** so that **we have a working foundation for all authentication and user management features**.

This story creates the complete Next.js app structure with all necessary configurations.

---

## 🎯 Goals

- Initialize Next.js 14 app with App Router
- Configure TypeScript and ESLint
- Setup Tailwind CSS
- Integrate shared packages
- Create app layout and structure
- Setup middleware for auth
- Configure environment variables
- Create initial routes

---

## ✅ Acceptance Criteria

- [ ] Next.js app initialized
- [ ] TypeScript configured
- [ ] Tailwind CSS working
- [ ] Shared packages imported
- [ ] App layout created
- [ ] Auth middleware setup
- [ ] Environment variables configured
- [ ] Basic routes created
- [ ] Dev server runs successfully

---

## 📋 Tasks

### Task 1: Initialize Next.js App

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create apps directory if not exists
mkdir -p apps

cd apps

# Create Next.js app
pnpm create next-app identity-provider \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd identity-provider
```

---

### Task 2: Install Dependencies

```bash
cd apps/identity-provider

# Install workspace packages
pnpm add @repo/ui@workspace:*
pnpm add @repo/utils@workspace:*
pnpm add @repo/validators@workspace:*
pnpm add @repo/types@workspace:*
pnpm add @repo/database-identity@workspace:*
pnpm add @repo/rbac@workspace:*

# Install other dependencies
pnpm add better-auth @supabase/supabase-js
pnpm add zustand
pnpm add react-hook-form @hookform/resolvers
pnpm add date-fns
pnpm add lucide-react

# Dev dependencies
pnpm add -D @types/node
```

---

### Task 3: Configure package.json

**File:** `apps/identity-provider/package.json`

```json
{
  "name": "@apps/identity-provider",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*",
    "@repo/validators": "workspace:*",
    "@repo/types": "workspace:*",
    "@repo/database-identity": "workspace:*",
    "@repo/rbac": "workspace:*",
    "better-auth": "latest",
    "@supabase/supabase-js": "^2.39.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.2",
    "@hookform/resolvers": "^3.3.3",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "tailwindcss": "^3.3.0",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

---

### Task 4: Configure TypeScript

**File:** `apps/identity-provider/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Task 5: Configure Tailwind CSS

**File:** `apps/identity-provider/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // Include shared UI components
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Task 6: Create App Layout

**File:** `apps/identity-provider/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Identity Provider - School Ecosystem',
  description: 'Centralized authentication for school ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

**File:** `apps/identity-provider/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

### Task 7: Create Middleware for Auth

**File:** `apps/identity-provider/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
];

// Routes that redirect to dashboard if authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get session from cookie
  const session = request.cookies.get('idp.session_token');

  // If accessing auth pages while authenticated, redirect to dashboard
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing protected route without authentication, redirect to login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

### Task 8: Create Home Page

**File:** `apps/identity-provider/app/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth-utils';

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
```

---

### Task 9: Create Dashboard Layout

**File:** `apps/identity-provider/app/(dashboard)/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-utils';
import { DashboardNav } from '@/components/dashboard/nav';
import { DashboardHeader } from '@/components/dashboard/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <DashboardNav user={user} />

      {/* Main content */}
      <div className="flex-1">
        <DashboardHeader user={user} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### Task 10: Create Dashboard Page

**File:** `apps/identity-provider/app/(dashboard)/dashboard/page.tsx`

```typescript
import { getCurrentUser } from '@/lib/auth-utils';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}
        </p>
      </div>

      <StatsCards />
      
      <RecentActivity />
    </div>
  );
}
```

---

### Task 11: Create Dashboard Components

**File:** `apps/identity-provider/components/dashboard/nav.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, Settings, Shield } from 'lucide-react';
import type { User } from '@repo/types';

interface DashboardNavProps {
  user: User;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/users', label: 'Users', icon: Users, roles: ['super_admin', 'school_admin'] },
  { href: '/schools', label: 'Schools', icon: Building2, roles: ['super_admin'] },
  { href: '/roles', label: 'Roles & Permissions', icon: Shield, roles: ['super_admin', 'school_admin'] },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 border-r bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-bold">Identity Provider</h1>
      </div>

      <nav className="space-y-1 px-3">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**File:** `apps/identity-provider/components/dashboard/header.tsx`

```typescript
'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import type { User } from '@repo/types';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="border-b bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb or page title can go here */}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 hover:bg-gray-100"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
```

**File:** `apps/identity-provider/components/dashboard/stats-cards.tsx`

```typescript
import { Users, Building2, Shield, Activity } from 'lucide-react';

export function StatsCards() {
  // TODO: Fetch real stats from database
  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, change: '+12%' },
    { label: 'Schools', value: '45', icon: Building2, change: '+5%' },
    { label: 'Active Sessions', value: '892', icon: Activity, change: '+8%' },
    { label: 'Roles', value: '8', icon: Shield, change: '0%' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="rounded-full bg-primary-100 p-3">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-green-600">{stat.change} from last month</p>
          </div>
        );
      })}
    </div>
  );
}
```

**File:** `apps/identity-provider/components/dashboard/recent-activity.tsx`

```typescript
export function RecentActivity() {
  // TODO: Fetch real activity from database
  const activities = [
    { user: 'John Doe', action: 'logged in', time: '2 minutes ago' },
    { user: 'Jane Smith', action: 'updated profile', time: '15 minutes ago' },
    { user: 'Admin', action: 'created new role', time: '1 hour ago' },
  ];

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
            <div>
              <p className="font-medium">{activity.user}</p>
              <p className="text-sm text-gray-600">{activity.action}</p>
            </div>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 12: Configure Environment Variables

**File:** `apps/identity-provider/.env.local`

```bash
# Identity Database
IDENTITY_DB_URL=https://xxxxx.supabase.co
IDENTITY_DB_SERVICE_KEY=your-service-key
NEXT_PUBLIC_IDENTITY_DB_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=your-anon-key

# Better Auth
AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_NAME=Identity Provider
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Task 13: Add to Turbo Config

**File:** `turbo.json` (root, update)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Start Development Server

```bash
cd apps/identity-provider
pnpm dev
```

**Expected:** Server starts on http://localhost:3000

---

### Test 2: Visit Pages

1. Go to http://localhost:3000
2. Should redirect to /login
3. After login, should show dashboard

---

### Test 3: Test Middleware

1. Try accessing `/dashboard` without login
2. Should redirect to `/login`
3. Login, then try accessing `/login`
4. Should redirect to `/dashboard`

---

### Test 4: Test Type Safety

```bash
pnpm typecheck
```

**Expected:** No type errors

---

### Test 5: Test Shared Packages

```typescript
import { Button } from '@repo/ui/button';
import { formatCurrency } from '@repo/utils';
import { loginSchema } from '@repo/validators';

// All imports should work
```

---

## 📸 Expected Results

```
apps/identity-provider/
├── app/
│   ├── (auth)/
│   │   ├── login/           ✅ Login page
│   │   └── register/        ✅ Register page
│   ├── (dashboard)/
│   │   ├── dashboard/       ✅ Dashboard
│   │   ├── users/           ✅ User management
│   │   ├── schools/         ✅ School management
│   │   └── layout.tsx       ✅ Dashboard layout
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts ✅ Auth API
│   ├── layout.tsx           ✅ Root layout
│   ├── page.tsx             ✅ Home page
│   └── globals.css          ✅ Global styles
├── components/
│   ├── dashboard/           ✅ Dashboard components
│   └── auth/                ✅ Auth components
├── lib/
│   ├── auth.ts             ✅ Auth config
│   ├── auth-client.ts      ✅ Client utils
│   └── auth-utils.ts       ✅ Server utils
├── middleware.ts            ✅ Auth middleware
├── tailwind.config.ts       ✅ Tailwind config
├── tsconfig.json            ✅ TypeScript config
└── package.json             ✅ Dependencies
```

**Dev server:**
```
✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled in 1.2s
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/ui'"

**Solution:**
```bash
cd packages/ui
pnpm build

cd ../../apps/identity-provider
pnpm install
```

---

### Error: "Middleware not working"

**Cause:** Matcher pattern wrong

**Solution:** Check middleware.ts matcher config

---

### Error: "Tailwind styles not applied"

**Cause:** Content paths wrong in tailwind.config.ts

**Solution:** Ensure paths include shared packages

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-001 (Monorepo)
  - STORY-006 (UI package)
  - STORY-013 (Database)
  - STORY-014 (Database package)
  - STORY-015 (Better Auth)
  - STORY-016 (RBAC)
- **Blocks**: 
  - STORY-018 (Auth Pages)
  - STORY-019 (JWT Service)
  - STORY-020 (Dashboard features)

---

## 📚 Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## 💡 Tips

1. **Use App Router** - Better DX and performance
2. **Server Components default** - Use 'use client' only when needed
3. **Middleware for auth** - Protect routes globally
4. **Type everything** - Full type safety
5. **Shared packages** - Reuse across apps
6. **Environment variables** - Never commit secrets

---

## ✏️ Definition of Done

- [ ] Next.js app initialized
- [ ] All dependencies installed
- [ ] TypeScript configured
- [ ] Tailwind CSS working
- [ ] Middleware setup
- [ ] Basic layouts created
- [ ] Dashboard structure ready
- [ ] Dev server runs
- [ ] No type errors
- [ ] No lint errors
- [ ] Can import shared packages

---

**Created**: 2024  
**Story Owner**: Development Team
