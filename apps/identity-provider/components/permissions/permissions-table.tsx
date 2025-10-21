'use client';

import { MoreHorizontal, Edit, Trash2, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <div key={resource} className="rounded-lg border bg-white shadow-sm">
          {/* Header */}
          <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3">
            <div className="flex items-center justify-between">
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-48" />
                <col />
                <col className="w-32" />
              </colgroup>
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Action</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {perms.map((permission) => (
                  <tr
                    key={permission.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className="inline-flex bg-blue-100 text-blue-700"
                      >
                        {permission.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {permission.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/permissions/${permission.id}`}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600"
                              onClick={() =>
                                handleDeletePermission(permission.id)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
