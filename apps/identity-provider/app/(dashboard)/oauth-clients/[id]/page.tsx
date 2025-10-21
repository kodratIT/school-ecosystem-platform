import { getCurrentUser } from '@/lib/auth-utils';
import { getOAuthClientById } from '@repo/database-identity';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/oauth-clients/client-form';
import { RotateSecretButton } from '@/components/oauth-clients/rotate-secret-button';
import { ClientCredentials } from '@/components/oauth-clients/client-credentials';

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit OAuth Client</h1>
        <p className="text-gray-600 mt-1">{client.name}</p>
      </div>

      <ClientCredentials
        clientId={client.client_id}
        showSecret={false}
        secretMessage="Client secret is hashed and cannot be retrieved. Use 'Rotate Secret' below to generate a new one."
      />

      <div className="bg-white rounded-lg shadow p-6">
        <ClientForm initialData={client} clientId={client.id} />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">
          🔐 Rotate Client Secret
        </h3>
        <p className="text-sm text-yellow-800 mb-4">
          Generate a new client secret. The old secret will be immediately
          invalidated. All applications using the old secret will stop working.
        </p>
        <RotateSecretButton clientId={client.id} clientName={client.name} />
      </div>
    </div>
  );
}
