'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string | null;
}

interface PermissionsManagerProps {
  roleId: string;
  allPermissions: Permission[];
  assignedPermissionIds: string[];
}

export function PermissionsManager({
  roleId,
  allPermissions,
  assignedPermissionIds,
}: PermissionsManagerProps) {
  const [selected, setSelected] = useState<string[]>(assignedPermissionIds);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const togglePermission = (permissionId: string) => {
    if (selected.includes(permissionId)) {
      setSelected(selected.filter((id) => id !== permissionId));
    } else {
      setSelected([...selected, permissionId]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selected }),
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      setMessage('Permissions updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error updating permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.includes('Error')
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selected.length} of {allPermissions.length} permissions selected
          </span>
        </div>
        <Button onClick={handleSave} disabled={loading} size="sm">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Permissions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedPermissions).map(([resource, permissions]) => (
          <div
            key={resource}
            className="rounded-lg border bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2 border-b pb-2">
              <div className="rounded bg-blue-600 p-1">
                <Lock className="h-3 w-3 text-white" />
              </div>
              <h3 className="font-semibold capitalize text-gray-900">
                {resource}
              </h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {permissions.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {permissions.map((permission) => {
                const isSelected = selected.includes(permission.id);
                return (
                  <label
                    key={permission.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePermission(permission.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {isSelected && (
                        <Check className="pointer-events-none absolute inset-0 h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {permission.action}
                      </p>
                      {permission.description && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
