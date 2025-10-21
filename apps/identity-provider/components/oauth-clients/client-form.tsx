'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CredentialsModal } from './credentials-modal';

interface ClientFormData {
  name: string;
  description: string;
  homepage_url: string;
  logo_url: string;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
  is_confidential: boolean;
  require_consent: boolean;
  trusted: boolean;
}

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  clientId?: string;
}

interface CreatedClient {
  client_id: string;
  client_secret: string;
  name: string;
}

export function ClientForm({ initialData, clientId }: ClientFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    homepage_url: initialData?.homepage_url || '',
    logo_url: initialData?.logo_url || '',
    redirect_uris: initialData?.redirect_uris || [''],
    post_logout_redirect_uris: initialData?.post_logout_redirect_uris || [''],
    is_confidential: initialData?.is_confidential ?? true,
    require_consent: initialData?.require_consent ?? true,
    trusted: initialData?.trusted ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<CreatedClient | null>(
    null
  );

  const addRedirectUri = () => {
    setFormData({
      ...formData,
      redirect_uris: [...formData.redirect_uris, ''],
    });
  };

  const removeRedirectUri = (index: number) => {
    setFormData({
      ...formData,
      redirect_uris: formData.redirect_uris.filter((_, i) => i !== index),
    });
  };

  const updateRedirectUri = (index: number, value: string) => {
    const updated = [...formData.redirect_uris];
    updated[index] = value;
    setFormData({ ...formData, redirect_uris: updated });
  };

  const addLogoutUri = () => {
    setFormData({
      ...formData,
      post_logout_redirect_uris: [...formData.post_logout_redirect_uris, ''],
    });
  };

  const removeLogoutUri = (index: number) => {
    setFormData({
      ...formData,
      post_logout_redirect_uris: formData.post_logout_redirect_uris.filter(
        (_, i) => i !== index
      ),
    });
  };

  const updateLogoutUri = (index: number, value: string) => {
    const updated = [...formData.post_logout_redirect_uris];
    updated[index] = value;
    setFormData({ ...formData, post_logout_redirect_uris: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = clientId
        ? `/api/oauth-clients/${clientId}`
        : '/api/oauth-clients';

      const method = clientId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          redirect_uris: formData.redirect_uris.filter((uri) => uri.trim()),
          post_logout_redirect_uris: formData.post_logout_redirect_uris.filter(
            (uri) => uri.trim()
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save client');
      }

      // Show modal for new clients with secret
      if (!clientId && data.client.client_secret) {
        setCreatedClient({
          client_id: data.client.client_id,
          client_secret: data.client.client_secret,
          name: data.client.name,
        });
      } else {
        // For updates, just redirect
        router.push('/oauth-clients');
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Application Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="My Application"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe what this application does..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Homepage URL
            </label>
            <input
              type="url"
              value={formData.homepage_url}
              onChange={(e) =>
                setFormData({ ...formData, homepage_url: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) =>
                setFormData({ ...formData, logo_url: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      {/* OAuth Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">OAuth Configuration</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Redirect URIs * (Callback URLs)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Where users will be redirected after authentication
          </p>
          {formData.redirect_uris.map((uri, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                required
                value={uri}
                onChange={(e) => updateRedirectUri(index, e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com/callback"
              />
              {formData.redirect_uris.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRedirectUri(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRedirectUri}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Redirect URI
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Logout Redirect URIs (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Where users will be redirected after logout
          </p>
          {formData.post_logout_redirect_uris.map((uri, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={uri}
                onChange={(e) => updateLogoutUri(index, e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com"
              />
              <button
                type="button"
                onClick={() => removeLogoutUri(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLogoutUri}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Logout URI
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security Settings</h3>

        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.is_confidential}
              onChange={(e) =>
                setFormData({ ...formData, is_confidential: e.target.checked })
              }
              className="mt-1 mr-3"
            />
            <div>
              <span className="text-sm font-medium">Confidential Client</span>
              <p className="text-xs text-gray-500">
                Enable for server-side apps that can keep secrets secure.
                Disable for SPA or mobile apps.
              </p>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.require_consent}
              onChange={(e) =>
                setFormData({ ...formData, require_consent: e.target.checked })
              }
              className="mt-1 mr-3"
            />
            <div>
              <span className="text-sm font-medium">Require User Consent</span>
              <p className="text-xs text-gray-500">
                Show consent screen asking users to approve access to their data
              </p>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.trusted}
              onChange={(e) =>
                setFormData({ ...formData, trusted: e.target.checked })
              }
              className="mt-1 mr-3"
            />
            <div>
              <span className="text-sm font-medium">
                Trusted Application (Skip Consent)
              </span>
              <p className="text-xs text-gray-500">
                ⚠️ Only enable for first-party applications you fully control
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 border-t pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : clientId ? 'Update Client' : 'Create Client'}
        </button>
      </div>

      {/* Credentials Modal */}
      {createdClient && (
        <CredentialsModal
          isOpen={true}
          clientId={createdClient.client_id}
          clientSecret={createdClient.client_secret}
          clientName={createdClient.name}
        />
      )}
    </form>
  );
}
