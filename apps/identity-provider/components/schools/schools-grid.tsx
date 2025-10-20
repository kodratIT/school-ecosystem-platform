'use client';

import {
  Building2,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
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

interface School {
  id: string;
  name: string;
  npsn?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  is_active: boolean;
  created_at: string;
}

interface SchoolsGridProps {
  schools: School[];
}

export function SchoolsGrid({ schools }: SchoolsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {schools.map((school) => (
        <div
          key={school.id}
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{school.name}</h3>
                {school.npsn && (
                  <p className="text-sm text-gray-500">NPSN: {school.npsn}</p>
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
                  <Link href={`/schools/${school.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(school.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 space-y-2">
            {school.address && (
              <p className="text-sm text-gray-600">{school.address}</p>
            )}
            {(school.city || school.province) && (
              <p className="text-sm text-gray-600">
                {[school.city, school.province].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>0 users</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(school.created_at).getFullYear()}</span>
              </div>
            </div>
            <Badge variant={school.is_active ? 'default' : 'secondary'}>
              {school.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {(school.phone || school.email || school.website) && (
            <div className="mt-4 space-y-1 border-t pt-4 text-sm">
              {school.phone && (
                <p className="text-gray-600">📞 {school.phone}</p>
              )}
              {school.email && (
                <p className="text-gray-600">✉️ {school.email}</p>
              )}
              {school.website && (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  🌐 Visit Website
                </a>
              )}
            </div>
          )}
        </div>
      ))}

      {schools.length === 0 && (
        <div className="col-span-full rounded-lg border-2 border-dashed p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No schools yet
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first school.
          </p>
          <Link href="/schools/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
