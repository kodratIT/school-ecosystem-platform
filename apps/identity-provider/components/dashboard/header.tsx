'use client';

import { Bell, Search } from 'lucide-react';
import { SignOutButton } from '../auth/signout-button';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, schools..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className="relative rounded-lg p-2 hover:bg-gray-100"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 border-l pl-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              {user.role && (
                <p className="text-xs text-gray-500 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              )}
            </div>

            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
