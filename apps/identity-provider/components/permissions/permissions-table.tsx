'use client';

import { MoreHorizontal, Edit, Trash2, Lock } from 'lucide-react';
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
    <div className="space-y-6">
      {Object.entries(grouped).map(([resource, perms]) => (
        <div key={resource} className="rounded-lg border bg-white">
          <div className="border-b bg-gray-50 px-6 py-4">
            <h3 className="font-semibold capitalize text-gray-900">
              {resource}
            </h3>
            <p className="text-sm text-gray-600">
              {perms.length} permission{perms.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="divide-y">
            {perms.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {permission.action}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {resource}
                      </Badge>
                    </div>
                    {permission.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {permission.description}
                      </p>
                    )}
                  </div>
                </div>

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
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
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
