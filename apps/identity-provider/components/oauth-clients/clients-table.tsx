'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface OAuthClient {
  id: string;
  client_id: string;
  name: string;
  is_active: boolean;
  is_confidential: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface ClientsTableProps {
  clients: OAuthClient[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [visibleClientIds, setVisibleClientIds] = useState<Set<string>>(
    new Set()
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Delete OAuth client "${name}"?\n\nThis will immediately revoke access for this application.\n\nThis action CANNOT be undone!`
      )
    ) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/oauth-clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Error: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/oauth-clients/${id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to toggle');
      }

      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Error: ${error.message}`);
    }
  };

  const toggleClientIdVisibility = (id: string) => {
    setVisibleClientIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No OAuth clients registered yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Create your first client to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client Secret
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Used
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {client.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {visibleClientIds.has(client.id)
                      ? client.client_id
                      : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => toggleClientIdVisibility(client.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title={
                      visibleClientIds.has(client.id)
                        ? 'Hide Client ID'
                        : 'Show Client ID'
                    }
                  >
                    {visibleClientIds.has(client.id) ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {visibleClientIds.has(client.id) && (
                    <button
                      onClick={() =>
                        copyToClipboard(client.client_id, `id-${client.id}`)
                      }
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy Client ID"
                    >
                      {copiedId === `id-${client.id}` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-400">
                    ••••••••••••••••••••
                  </code>
                  <div className="group relative">
                    <button
                      className="text-gray-300 cursor-not-allowed"
                      disabled
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                      Secret is hashed and cannot be retrieved. Use "Rotate
                      Secret" to generate a new one.
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.is_confidential ? 'Confidential' : 'Public'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    client.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.last_used_at
                  ? new Date(client.last_used_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button
                  onClick={() => router.push(`/oauth-clients/${client.id}`)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(client.id)}
                  className="text-yellow-600 hover:text-yellow-900"
                >
                  {client.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={deleting === client.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deleting === client.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
