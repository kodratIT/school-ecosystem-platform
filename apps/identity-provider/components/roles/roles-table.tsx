'use client';

import {
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Users,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Role {
  id: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  created_at: string;
  role_permissions?: { count: number }[];
}

interface RolesTableProps {
  roles: Role[];
}

export function RolesTable({ roles }: RolesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {roles.map((role) => {
        const permissionCount = role.role_permissions?.[0]?.count || 0;

        return (
          <div
            key={role.id}
            className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  {role.is_system && (
                    <Badge variant="secondary" className="mt-1">
                      System Role
                    </Badge>
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
                    <Link href={`/roles/${role.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  {!role.is_system && (
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {role.description && (
              <p className="mt-4 text-sm text-gray-600">{role.description}</p>
            )}

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{permissionCount} permissions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(role.created_at)}</span>
                </div>
              </div>
            </div>

            <Link href={`/roles/${role.id}`}>
              <Button variant="outline" className="mt-4 w-full" size="sm">
                Manage Permissions
              </Button>
            </Link>
          </div>
        );
      })}

      {roles.length === 0 && (
        <div className="col-span-full rounded-lg border-2 border-dashed p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No roles yet
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first role.
          </p>
          <Link href="/roles/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
