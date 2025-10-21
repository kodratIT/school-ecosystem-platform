'use client';

import { MoreHorizontal, Edit, Trash2, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string | null;
  created_at: string;
}

interface PermissionsTableProps {
  permissions: Permission[];
}

export function PermissionsTable({ permissions }: PermissionsTableProps) {
  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete permission');
      }

      window.location.reload();
    } catch (error) {
      alert('Error deleting permission');
      console.error(error);
    }
  };

  // Group by resource
  const grouped = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([resource, perms]) => (
        <div
          key={resource}
          className="overflow-hidden rounded-lg border bg-white shadow-sm"
        >
          {/* Header */}
          <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold capitalize text-gray-900">
                  {resource}
                </h3>
                <p className="text-xs text-gray-600">
                  {perms.length} permission{perms.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Table with proper spacing */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    <div style={{ minWidth: '150px' }}>Action</div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    <div style={{ minWidth: '300px' }}>Description</div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700">
                    <div style={{ minWidth: '80px' }}>Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {perms.map((permission) => (
                  <tr
                    key={permission.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {permission.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {permission.description || '-'}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/permissions/${permission.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDeletePermission(permission.id)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {permissions.length === 0 && (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No permissions found
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Create your first permission to get started.
          </p>
          <Link href="/permissions/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
