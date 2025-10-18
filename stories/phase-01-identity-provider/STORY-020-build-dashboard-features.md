# STORY-020: Build Dashboard Features

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 5  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As an **administrator**, I want to **have a complete dashboard to manage users, schools, roles, and permissions** so that **I can effectively administer the identity system**.

This story creates all core management features for the Identity Provider dashboard.

---

## 🎯 Goals

- User management (CRUD)
- School management (CRUD)
- Role & Permission management
- Audit log viewer
- Dashboard analytics
- Search and filtering
- Bulk operations
- Export functionality

---

## ✅ Acceptance Criteria

- [ ] User management complete
- [ ] School management complete  
- [ ] Role & Permission management
- [ ] Audit log viewer
- [ ] Dashboard with stats
- [ ] Search functionality
- [ ] Filtering and sorting
- [ ] Pagination working
- [ ] Export to CSV
- [ ] Mobile responsive
- [ ] Permission-based access

---

## 📋 Tasks

### Task 1: User Management - List Page

**File:** `apps/identity-provider/app/(dashboard)/users/page.tsx`

```typescript
import { Suspense } from 'react';
import { getUsersBySchool } from '@repo/database-identity';
import { getCurrentUser } from '@/lib/auth-utils';
import { UsersTable } from '@/components/users/users-table';
import { UsersFilters } from '@/components/users/users-filters';
import { Button } from '@repo/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; page?: string };
}) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  // Fetch users
  const users = await getUsersBySchool(
    currentUser.schoolId!,
    searchParams.role
  );

  // Filter by search
  const filteredUsers = searchParams.search
    ? users.filter(u =>
        u.name.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
        u.email.toLowerCase().includes(searchParams.search!.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <UsersFilters />

      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable users={filteredUsers} />
      </Suspense>
    </div>
  );
}
```

---

### Task 2: User Table Component

**File:** `apps/identity-provider/components/users/users-table.tsx`

```typescript
'use client';

import { useState } from 'react';
import type { User } from '@repo/types';
import { formatDate } from '@repo/utils';
import { MoreHorizontal, Edit, Trash2, Ban } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@repo/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="rounded-lg border bg-white">
      {selectedUsers.length > 0 && (
        <div className="border-b bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedUsers.length} user(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Bulk Edit
              </Button>
              <Button variant="outline" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                  className="rounded border-gray-300"
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{user.name}</p>
                  {user.phone && (
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.is_active ? 'success' : 'error'}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Ban className="mr-2 h-4 w-4" />
                      Ban User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
}
```

---

### Task 3: User Form Component

**File:** `apps/identity-provider/components/users/user-form.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select } from '@repo/ui/select';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['school_admin', 'teacher', 'student', 'parent', 'finance_staff']),
  password: z.string().min(8).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export function UserForm({ initialData, onSubmit }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            id="role"
            {...register('role')}
          >
            <option value="school_admin">School Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="finance_staff">Finance Staff</option>
          </Select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {!initialData && (
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
            <p className="mt-1 text-sm text-gray-500">
              Minimum 8 characters
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save User'}
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

---

### Task 4: School Management Page

**File:** `apps/identity-provider/app/(dashboard)/schools/page.tsx`

```typescript
import { requireRole } from '@/lib/auth-utils';
import { getActiveSchools } from '@repo/database-identity';
import { SchoolsGrid } from '@/components/schools/schools-grid';
import { Button } from '@repo/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function SchoolsPage() {
  // Only super_admin can access
  await requireRole('super_admin');

  const schools = await getActiveSchools();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-gray-600">
            Manage schools in the ecosystem
          </p>
        </div>

        <Link href="/schools/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>

      <SchoolsGrid schools={schools} />
    </div>
  );
}
```

---

### Task 5: Audit Log Viewer

**File:** `apps/identity-provider/app/(dashboard)/audit/page.tsx`

```typescript
import { requireRole } from '@/lib/auth-utils';
import { getAuditLogs } from '@repo/database-identity';
import { AuditLogsTable } from '@/components/audit/audit-logs-table';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { action?: string; user?: string };
}) {
  // Require admin role
  await requireRole(['super_admin', 'school_admin']);

  const logs = await getAuditLogs({
    action: searchParams.action,
    userId: searchParams.user,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-600">
          Track all important actions and changes
        </p>
      </div>

      <AuditLogsTable logs={logs} />
    </div>
  );
}
```

---

### Task 6: Enhanced Dashboard

**File:** `apps/identity-provider/components/dashboard/enhanced-stats.tsx`

```typescript
import { getSupabaseClient } from '@repo/database-identity';
import { Users, Building2, Activity, Shield } from 'lucide-react';

export async function EnhancedStats({ schoolId }: { schoolId?: string }) {
  const supabase = getSupabaseClient();

  // Get real counts
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalSchools },
    { count: totalRoles },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('schools').select('*', { count: 'exact', head: true }),
    supabase.from('roles').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      label: 'Active Users',
      value: activeUsers || 0,
      icon: Activity,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      label: 'Schools',
      value: totalSchools || 0,
      icon: Building2,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      label: 'Roles',
      value: totalRoles || 0,
      icon: Shield,
      change: '0%',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
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
            <p
              className={`mt-4 text-sm ${
                stat.changeType === 'positive'
                  ? 'text-green-600'
                  : stat.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {stat.change} from last month
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

---

### Task 7: Search Component

**File:** `apps/identity-provider/components/common/search-bar.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@repo/ui/input';

export function SearchBar({ placeholder = 'Search...' }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10"
      />
    </form>
  );
}
```

---

## 🧪 Testing Instructions

### Test 1: User Management

1. Visit /users
2. Should show list of users
3. Click "Add User"
4. Fill form and submit
5. User should be created
6. Try editing and deleting

---

### Test 2: Search and Filter

1. Type in search box
2. Results should update
3. Apply role filter
4. Table should filter
5. Clear filters
6. All users shown

---

### Test 3: Bulk Operations

1. Select multiple users
2. Bulk action bar should appear
3. Try bulk edit
4. Changes should apply to all

---

### Test 4: Permissions

1. Login as school_admin
2. Should see only school users
3. Login as super_admin
4. Should see all users
5. Try accessing forbidden pages
6. Should show access denied

---

## 📸 Expected Results

```
Dashboard Features:
✅ User management (list, create, edit, delete)
✅ School management
✅ Role & Permission management
✅ Audit log viewer
✅ Real-time stats
✅ Search functionality
✅ Filtering and sorting
✅ Bulk operations
✅ Export to CSV
✅ Permission-based access
```

---

## ❌ Common Errors & Solutions

### Error: "Unauthorized access"

**Cause:** User doesn't have required permissions

**Solution:** Check RBAC implementation

---

### Error: "Database query failed"

**Cause:** Missing RLS policy

**Solution:** Check RLS policies in database

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-013 (Database)
  - STORY-014 (Database package)
  - STORY-016 (RBAC)
  - STORY-017 (IdP App)
- **Blocks**: None (Phase 1 final feature)

---

## 💡 Tips

1. **Permission checks** - Always verify access
2. **Loading states** - Show progress
3. **Error handling** - Clear error messages
4. **Bulk operations** - Make admin tasks easier
5. **Responsive design** - Works on all devices

---

## ✏️ Definition of Done

- [ ] User management complete
- [ ] School management complete
- [ ] Audit log viewer working
- [ ] Dashboard stats real-time
- [ ] Search and filters working
- [ ] Bulk operations implemented
- [ ] Export functionality
- [ ] Permission-based access
- [ ] Mobile responsive
- [ ] Tests passing

---

**Created**: 2024  
**Story Owner**: Development Team
