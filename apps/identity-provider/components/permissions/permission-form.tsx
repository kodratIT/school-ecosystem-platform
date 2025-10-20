'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const permissionSchema = z.object({
  resource: z.string().min(2, 'Resource must be at least 2 characters'),
  action: z.string().min(2, 'Action must be at least 2 characters'),
  description: z.string().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  initialData?: Partial<PermissionFormData>;
  permissionId?: string;
}

export function PermissionForm({
  initialData,
  permissionId,
}: PermissionFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: PermissionFormData) => {
    setError('');
    setLoading(true);

    try {
      const url = permissionId
        ? `/api/permissions/${permissionId}`
        : '/api/permissions';
      const method = permissionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save permission');
      }

      router.push('/permissions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const commonResources = [
    'users',
    'schools',
    'roles',
    'permissions',
    'students',
    'teachers',
    'attendance',
    'grades',
  ];

  const commonActions = [
    'create',
    'read',
    'update',
    'delete',
    'list',
    'export',
    'import',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="resource"
            className="block text-sm font-medium text-gray-700"
          >
            Resource *
          </label>
          <input
            id="resource"
            type="text"
            {...register('resource')}
            list="resources"
            placeholder="e.g., users"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <datalist id="resources">
            {commonResources.map((resource) => (
              <option key={resource} value={resource} />
            ))}
          </datalist>
          {errors.resource && (
            <p className="mt-1 text-sm text-red-600">
              {errors.resource.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            The resource this permission applies to
          </p>
        </div>

        <div>
          <label
            htmlFor="action"
            className="block text-sm font-medium text-gray-700"
          >
            Action *
          </label>
          <input
            id="action"
            type="text"
            {...register('action')}
            list="actions"
            placeholder="e.g., create"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <datalist id="actions">
            {commonActions.map((action) => (
              <option key={action} value={action} />
            ))}
          </datalist>
          {errors.action && (
            <p className="mt-1 text-sm text-red-600">{errors.action.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            The action that can be performed
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Describe what this permission allows..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : permissionId
              ? 'Update Permission'
              : 'Create Permission'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/permissions')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
