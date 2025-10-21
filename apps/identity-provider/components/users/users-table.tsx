'use client';

import { useState } from 'react';
// Format date helper
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
import { MoreHorizontal, Edit, Trash2, Ban, UserCheck } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  is_active: boolean;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBulkAction = async (
    action: 'activate' | 'deactivate' | 'delete'
  ) => {
    const actionText =
      action === 'activate'
        ? 'activate'
        : action === 'deactivate'
          ? 'deactivate'
          : 'delete';

    if (
      !confirm(
        `Are you sure you want to ${actionText} ${selectedUsers.length} user(s)?`
      )
    ) {
      return;
    }

    setBulkLoading(true);

    try {
      const response = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
        }),
      });

      if (!response.ok) {
        throw new Error('Bulk action failed');
      }

      const data = await response.json();
      alert(data.message);
      window.location.reload();
    } catch (error) {
      alert(`Error performing ${actionText} action`);
      console.error(error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBanUser = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const actionText = currentStatus ? 'ban' : 'activate';

    if (!confirm(`Are you sure you want to ${actionText} this user?`)) {
      return;
    }

    try {
      const response = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: [userId],
        }),
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      window.location.reload();
    } catch (error) {
      alert(`Error ${actionText}ing user`);
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      window.location.reload();
    } catch (error) {
      alert('Error deleting user');
      console.error(error);
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                disabled={bulkLoading}
              >
                {bulkLoading ? 'Processing...' : 'Activate'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkLoading}
              >
                {bulkLoading ? 'Processing...' : 'Deactivate'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkLoading}
              >
                {bulkLoading ? 'Processing...' : 'Delete'}
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
                checked={
                  selectedUsers.length === users.length && users.length > 0
                }
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
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
                  className="h-4 w-4 rounded border-gray-300"
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
                <Badge variant="secondary">{user.role || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
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
                    <DropdownMenuItem
                      onClick={() => handleBanUser(user.id, user.is_active)}
                    >
                      {user.is_active ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate User
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                    >
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
        <div className="p-8 text-center text-gray-500">No users found</div>
      )}
    </div>
  );
}
