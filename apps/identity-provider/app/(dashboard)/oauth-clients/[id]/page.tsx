import { getCurrentUser } from '@/lib/auth-utils';
import { getOAuthClientById } from '@repo/database-identity';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/oauth-clients/client-form';
import { RotateSecretButton } from '@/components/oauth-clients/rotate-secret-button';
import { ClientCredentials } from '@/components/oauth-clients/client-credentials';
import Link from 'next/link';
import { ArrowLeft, Settings, Key, Info } from 'lucide-react';

export default async function EditOAuthClientPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'super_admin') {
    redirect('/');
  }

  const client = await getOAuthClientById(params.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Back Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/oauth-clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <div className="bg-gray-100 group-hover:bg-gray-200 rounded-lg p-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back to OAuth Clients</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                OAuth Client Configuration
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3">{client.name}</h1>
            <p className="text-blue-100 text-lg">
              Manage client configuration, credentials, and security settings
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    client.is_active ? 'bg-green-400' : 'bg-red-400'
                  } animate-pulse`}
                />
                <span className="text-sm font-medium">
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  {client.is_confidential ? 'Confidential' : 'Public'} Client
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credentials Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Client Credentials
                  </h2>
                  <p className="text-sm text-gray-600">
                    Use these credentials to authenticate your application
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ClientCredentials
                clientId={client.client_id}
                showSecret={false}
                secretMessage="Client secret is hashed and cannot be retrieved. Use 'Rotate Secret' in the sidebar to generate a new one."
              />
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Client Configuration
                  </h2>
                  <p className="text-sm text-gray-600">
                    Update client settings and permissions
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ClientForm initialData={client} clientId={client.id} />
            </div>
          </div>
        </div>

        {/* Right Column - Security & Actions */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 rounded-lg p-2">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900">Quick Info</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-blue-700 font-medium">Created</p>
                <p className="text-blue-900">
                  {new Date(client.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Last Updated</p>
                <p className="text-blue-900">
                  {new Date(client.updated_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {client.last_used_at && (
                <div>
                  <p className="text-blue-700 font-medium">Last Used</p>
                  <p className="text-blue-900">
                    {new Date(client.last_used_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rotate Secret Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-yellow-100 rounded-lg p-2">
                <Key className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  Rotate Client Secret
                </h3>
                <p className="text-sm text-yellow-800">
                  Generate a new secret and invalidate the old one
                </p>
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2 text-xs text-yellow-900">
                <span className="text-yellow-600 font-bold">⚠️</span>
                <span>
                  <strong>Warning:</strong> All apps using the old secret will
                  immediately stop working.
                </span>
              </div>
            </div>
            <RotateSecretButton clientId={client.id} clientName={client.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
