'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Building2,
  Settings,
  Shield,
  ChevronDown,
  Key,
  ScrollText,
} from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface DashboardNavProps {
  user: User;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [isRolesOpen, setIsRolesOpen] = useState(
    pathname.includes('/roles') || pathname.includes('/permissions')
  );

  const hasRoleAccess =
    user.role && ['super_admin', 'school_admin'].includes(user.role);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
      roles: ['super_admin', 'school_admin'],
    },
    {
      href: '/schools',
      label: 'Schools',
      icon: Building2,
      roles: ['super_admin'],
    },
    {
      href: '/audit',
      label: 'Audit Logs',
      icon: ScrollText,
      roles: ['super_admin'],
    },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user.role && item.roles.includes(user.role);
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b p-6">
          <h1 className="text-xl font-bold text-gray-900">Identity Provider</h1>
          <p className="text-sm text-gray-500">School Ecosystem</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Roles & Permissions Dropdown */}
          {hasRoleAccess && (
            <div>
              <button
                onClick={() => setIsRolesOpen(!isRolesOpen)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  pathname.includes('/roles') ||
                  pathname.includes('/permissions')
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <span>Roles & Permissions</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isRolesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Submenu */}
              {isRolesOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                  <Link
                    href="/roles"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === '/roles' || pathname.startsWith('/roles/')
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Roles</span>
                  </Link>
                  <Link
                    href="/permissions"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === '/permissions' ||
                      pathname.startsWith('/permissions/')
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    <span>Permissions</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User Info */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.role && (
              <p className="mt-1 text-xs font-medium capitalize text-blue-600">
                {user.role.replace('_', ' ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
