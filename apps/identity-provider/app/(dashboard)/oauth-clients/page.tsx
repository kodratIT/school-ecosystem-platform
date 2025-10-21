import { getCurrentUser } from '@/lib/auth-utils';
import { getOAuthClients } from '@repo/database-identity';
import { redirect } from 'next/navigation';
import { ClientsTable } from '@/components/oauth-clients/clients-table';
import Link from 'next/link';

export default async function OAuthClientsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'super_admin') {
    redirect('/');
  }

  const { clients } = await getOAuthClients();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">OAuth Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage Service Provider applications that integrate with your
            Identity Provider
          </p>
        </div>
        <Link
          href="/oauth-clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Register New Client
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ClientsTable clients={clients} />
      </div>

      {clients.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Client secrets are shown only once during creation</li>
            <li>Store client secrets securely in your application</li>
            <li>Use confidential clients for server-side applications</li>
            <li>Disable unused clients to prevent unauthorized access</li>
          </ul>
        </div>
      )}
    </div>
  );
}
