'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function UsersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role && role !== 'all') {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search by name or email..."
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <select
        defaultValue={searchParams.get('role') || 'all'}
        onChange={(e) => handleRoleFilter(e.target.value)}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Roles</option>
        <option value="super_admin">Super Admin</option>
        <option value="school_admin">School Admin</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
        <option value="parent">Parent</option>
        <option value="finance_staff">Finance Staff</option>
        <option value="staff">Staff</option>
      </select>
    </div>
  );
}
