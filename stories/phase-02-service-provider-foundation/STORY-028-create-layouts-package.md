# STORY-028: Create Layouts Package

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 4 (Day 4)  
**Story Points**: 5  
**Priority**: P1 (High)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a shared layouts package** so that **Service Provider applications can use consistent navigation, headers, and page layouts across all services**.

---

## 🎯 Goals

- Create layouts package with reusable components
- Dashboard layout with navigation
- Auth layout for login pages
- Responsive navigation bar
- User menu with dropdown
- Sidebar for navigation (optional)

---

## ✅ Acceptance Criteria

- [ ] Package structure created
- [ ] Dashboard layout implemented
- [ ] Auth layout implemented
- [ ] Navigation component created
- [ ] User menu component created
- [ ] Responsive design working
- [ ] TypeScript types exported
- [ ] package.json configured
- [ ] pnpm type-check passes
- [ ] Can be used in SP apps

---

## 🔗 Prerequisites

```bash
# Verify auth client exists
test -d packages/auth-client && echo "✅ Auth client"
test -d packages/ui && echo "✅ UI package"
```

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create directory
mkdir -p packages/layouts/src/components

cd packages/layouts
```

---

### Task 2: Create package.json

**File**: `packages/layouts/package.json`

```json
{
  "name": "@repo/layouts",
  "version": "0.0.0",
  "private": true,
  "description": "Shared layouts for Service Provider applications",
  "main": "./src/index.tsx",
  "types": "./src/index.tsx",
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@repo/auth-client": "workspace:*",
    "@repo/ui": "workspace:*",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "react": "^18.2.0",
    "typescript": "^5.3.3"
  },
  "peerDependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0"
  }
}
```

**Install:**
```bash
pnpm install
```

---

### Task 3: Create TypeScript Config

**File**: `packages/layouts/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Create Navbar Component

**File**: `packages/layouts/src/components/navbar.tsx`

```typescript
'use client';

import { useAuth } from '@repo/auth-client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  permission?: string;
}

interface NavbarProps {
  /**
   * Application name shown in navbar
   */
  appName?: string;
  
  /**
   * Navigation items
   */
  items?: NavItem[];
  
  /**
   * Show user menu
   */
  showUserMenu?: boolean;
}

/**
 * Navbar Component
 * Responsive navigation bar with user menu
 */
export function Navbar({
  appName = 'Service Provider',
  items = [],
  showUserMenu = true,
}: NavbarProps) {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter items by permission
  const visibleItems = items.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo and Nav */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                {appName}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: User Menu */}
          {showUserMenu && user && (
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
          )}

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

### Task 5: Create Dashboard Layout

**File**: `packages/layouts/src/components/dashboard-layout.tsx`

```typescript
'use client';

import { useAuth } from '@repo/auth-client';
import { ReactNode } from 'react';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
  /**
   * Page content
   */
  children: ReactNode;

  /**
   * Application name
   */
  appName?: string;

  /**
   * Navigation items
   */
  navItems?: Array<{
    label: string;
    href: string;
    permission?: string;
  }>;

  /**
   * Show navbar
   */
  showNavbar?: boolean;

  /**
   * Additional className for container
   */
  className?: string;
}

/**
 * Dashboard Layout
 * Main layout for authenticated pages
 * 
 * Features:
 * - Navigation bar
 * - User menu
 * - Responsive design
 * - Loading state
 */
export function DashboardLayout({
  children,
  appName,
  navItems = [],
  showNavbar = true,
  className = '',
}: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {showNavbar && <Navbar appName={appName} items={navItems} />}

      {/* Main Content */}
      <main className={className || 'py-6'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Optional: Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 {appName || 'Service Provider'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

---

### Task 6: Create Auth Layout

**File**: `packages/layouts/src/components/auth-layout.tsx`

```typescript
import { ReactNode } from 'react';

interface AuthLayoutProps {
  /**
   * Page content
   */
  children: ReactNode;

  /**
   * Application name
   */
  appName?: string;

  /**
   * Show branding/logo
   */
  showBranding?: boolean;
}

/**
 * Auth Layout
 * Layout for authentication pages (login, register, etc.)
 * 
 * Features:
 * - Centered content
 * - Clean design
 * - Branded background
 */
export function AuthLayout({
  children,
  appName = 'Service Provider',
  showBranding = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Branding */}
      {showBranding && (
        <div className="absolute top-8 left-8">
          <h2 className="text-2xl font-bold text-gray-800">{appName}</h2>
          <p className="text-sm text-gray-600">Ekosistem Sekolah</p>
        </div>
      )}

      {/* Main content */}
      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
```

---

### Task 7: Create Empty Layout

**File**: `packages/layouts/src/components/empty-layout.tsx`

```typescript
import { ReactNode } from 'react';

interface EmptyLayoutProps {
  /**
   * Page content
   */
  children: ReactNode;

  /**
   * Additional className
   */
  className?: string;
}

/**
 * Empty Layout
 * Minimal layout with no navigation or footer
 * Useful for landing pages, error pages, etc.
 */
export function EmptyLayout({ children, className = '' }: EmptyLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      {children}
    </div>
  );
}
```

---

### Task 8: Create Main Index

**File**: `packages/layouts/src/index.tsx`

```typescript
// Layouts
export { DashboardLayout } from './components/dashboard-layout';
export { AuthLayout } from './components/auth-layout';
export { EmptyLayout } from './components/empty-layout';

// Components
export { Navbar } from './components/navbar';
```

---

### Task 9: Create README

**File**: `packages/layouts/README.md`

````markdown
# Layouts Package

Shared layouts for Service Provider applications.

## Layouts

### DashboardLayout

Main layout for authenticated pages with navigation.

\`\`\`typescript
import { DashboardLayout } from '@repo/layouts';

export default function MyPage() {
  return (
    <DashboardLayout
      appName="My Service"
      navItems={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Students', href: '/students', permission: 'students.read' },
      ]}
    >
      <h1>My Page</h1>
    </DashboardLayout>
  );
}
\`\`\`

### AuthLayout

Layout for authentication pages.

\`\`\`typescript
import { AuthLayout } from '@repo/layouts';

export default function LoginPage() {
  return (
    <AuthLayout appName="My Service">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1>Login</h1>
        {/* Login form */}
      </div>
    </AuthLayout>
  );
}
\`\`\`

### EmptyLayout

Minimal layout with no navigation.

\`\`\`typescript
import { EmptyLayout } from '@repo/layouts';

export default function LandingPage() {
  return (
    <EmptyLayout>
      <div>Landing page content</div>
    </EmptyLayout>
  );
}
\`\`\`

## Components

### Navbar

Standalone navigation bar.

\`\`\`typescript
import { Navbar } from '@repo/layouts';

export function MyLayout({ children }) {
  return (
    <div>
      <Navbar
        appName="My Service"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '/dashboard' },
        ]}
      />
      <main>{children}</main>
    </div>
  );
}
\`\`\`

## Props

### DashboardLayout

- `children`: ReactNode (required)
- `appName`: string (optional)
- `navItems`: Array<{ label, href, permission? }> (optional)
- `showNavbar`: boolean (default: true)
- `className`: string (optional)

### AuthLayout

- `children`: ReactNode (required)
- `appName`: string (optional)
- `showBranding`: boolean (default: true)

### Navbar

- `appName`: string (optional)
- `items`: Array<{ label, href, permission? }> (optional)
- `showUserMenu`: boolean (default: true)

## Features

- ✅ Responsive design
- ✅ Permission-based navigation
- ✅ User menu with logout
- ✅ Mobile menu
- ✅ TypeScript support
- ✅ Tailwind CSS styling
````

---

## 🧪 Testing Instructions

### Test 1: Package Builds

```bash
cd packages/layouts
pnpm type-check
# Should pass
```

### Test 2: Use in App

Create test page:
```typescript
// app/test/page.tsx
import { DashboardLayout } from '@repo/layouts';

export default function TestPage() {
  return (
    <DashboardLayout
      appName="Test App"
      navItems={[
        { label: 'Home', href: '/' },
        { label: 'Test', href: '/test' },
      ]}
    >
      <h1>Test Page</h1>
      <p>Testing layouts package</p>
    </DashboardLayout>
  );
}
```

### Test 3: Responsive Design

1. Open page with layout
2. Resize browser window
3. Verify mobile menu appears
4. Test navigation works

---

## 📸 Expected Results

```
packages/layouts/
├── package.json          ✅
├── tsconfig.json        ✅
├── README.md            ✅
└── src/
    ├── index.tsx        ✅
    └── components/
        ├── navbar.tsx            ✅
        ├── dashboard-layout.tsx  ✅
        ├── auth-layout.tsx       ✅
        └── empty-layout.tsx      ✅
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/auth-client'"

```bash
pnpm install
turbo build
```

### Error: "useAuth must be used within AuthProvider"

Make sure root layout has AuthProvider wrapper.

---

## 💡 Usage Examples

### Example 1: Dashboard with Nav

```typescript
<DashboardLayout
  appName="PPDB"
  navItems={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Applications', href: '/applications' },
    { label: 'Settings', href: '/settings', permission: 'admin.access' },
  ]}
>
  <YourContent />
</DashboardLayout>
```

### Example 2: Custom Container

```typescript
<DashboardLayout className="py-0">
  <div className="bg-white min-h-screen">
    Full width content
  </div>
</DashboardLayout>
```

---

## 🔗 Dependencies

- **Depends on**: STORY-023 (Auth Client)
- **Blocks**: STORY-029 (can use in test app)

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] Dashboard layout implemented
- [ ] Auth layout implemented
- [ ] Navbar component created
- [ ] Responsive design working
- [ ] README complete
- [ ] pnpm install works
- [ ] pnpm type-check passes
- [ ] Can be imported in SP apps
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
