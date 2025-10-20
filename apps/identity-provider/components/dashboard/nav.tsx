'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, Settings, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DashboardNavProps {
  user: User;
}

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
    href: '/roles',
    label: 'Roles & Permissions',
    icon: Shield,
    roles: ['super_admin', 'school_admin'],
  },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 border-r bg-gray-50 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Identity Provider</h1>
        <p className="text-sm text-gray-500">School Ecosystem</p>
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
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
        <div className="px-3">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">
            {user.role.replace('_', ' ')}
          </p>
        </div>
      </div>
    </aside>
  );
}
