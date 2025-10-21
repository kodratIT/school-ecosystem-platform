import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/oauth-clients/client-form';

export default async function NewOAuthClientPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'super_admin') {
    redirect('/');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register OAuth Client</h1>
        <p className="text-gray-600 mt-1">
          Register a new Service Provider application to enable SSO integration
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ClientForm />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">
          ⚠️ Important Security Notes
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>
            <strong>Client Secret:</strong> Will be shown ONLY ONCE after
            creation. Save it securely!
          </li>
          <li>
            <strong>Redirect URIs:</strong> Must match exactly (including
            protocol and port)
          </li>
          <li>
            <strong>Confidential Clients:</strong> Use for server-side apps that
            can keep secrets
          </li>
          <li>
            <strong>Public Clients:</strong> Use for SPAs and mobile apps
            (cannot keep secrets)
          </li>
          <li>
            <strong>Trusted Apps:</strong> Only enable for first-party
            applications you control
          </li>
        </ul>
      </div>
    </div>
  );
}
