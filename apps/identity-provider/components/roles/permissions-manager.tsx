'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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

      <div className="max-h-96 space-y-4 overflow-y-auto">
        {Object.entries(groupedPermissions).map(([resource, permissions]) => (
          <div key={resource} className="rounded-lg border p-4">
            <h3 className="mb-3 font-medium capitalize">{resource}</h3>
            <div className="space-y-2">
              {permissions.map((permission) => {
                const isSelected = selected.includes(permission.id);
                return (
                  <label
                    key={permission.id}
                    className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-gray-50"
                  >
                    <div className="relative">
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
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {permission.action}
                      </p>
                      {permission.description && (
                        <p className="text-xs text-gray-500">
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

      <div className="flex gap-2 border-t pt-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Permissions'}
        </Button>
        <p className="self-center text-sm text-gray-600">
          {selected.length} of {allPermissions.length} selected
        </p>
      </div>
    </div>
  );
}
