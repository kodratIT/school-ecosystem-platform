'use client';

import { useState } from 'react';

export default function TestUserInfoPage() {
  const [accessToken, setAccessToken] = useState('');
  const [response, setResponse] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testUserInfo = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/oidc/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`Error ${res.status}: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResponse(data);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OIDC UserInfo Endpoint Test</h1>
      <p className="text-gray-600 mb-6">
        Test the OpenID Connect UserInfo endpoint with an access token
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Access Token
          </label>
          <textarea
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={4}
            placeholder="Paste access token here..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Get an access token from the SSO token exchange flow
          </p>
        </div>

        <button
          onClick={testUserInfo}
          disabled={!accessToken || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test UserInfo Endpoint'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <pre className="text-sm text-red-600 whitespace-pre-wrap overflow-auto">
              {error}
            </pre>
          </div>
        )}

        {response && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ UserInfo Response
            </h3>
            <pre className="text-sm bg-white p-4 rounded overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            📘 How to Get Access Token
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
            <li>
              <strong>Create OAuth Client:</strong> Go to{' '}
              <a href="/oauth-clients/new" className="underline">
                /oauth-clients/new
              </a>{' '}
              and create a test client
            </li>
            <li>
              <strong>Authorize:</strong> Visit{' '}
              <code className="bg-blue-100 px-1 rounded">
                /api/sso/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code
              </code>
            </li>
            <li>
              <strong>Exchange Code:</strong> POST to{' '}
              <code className="bg-blue-100 px-1 rounded">/api/sso/token</code>{' '}
              with code, client_id, and client_secret
            </li>
            <li>
              <strong>Copy Access Token:</strong> Extract access_token from the
              response
            </li>
            <li>
              <strong>Test Here:</strong> Paste the access token above and click
              Test
            </li>
          </ol>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">
            🔍 Scope-Based Claims
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Scope</th>
                <th className="text-left py-2">Claims Returned</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b">
                <td className="py-2">
                  <code className="bg-gray-200 px-1 rounded">openid</code>
                </td>
                <td className="py-2">sub (always returned)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">
                  <code className="bg-gray-200 px-1 rounded">profile</code>
                </td>
                <td className="py-2">
                  name, given_name, family_name, picture, locale, updated_at,
                  etc.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">
                  <code className="bg-gray-200 px-1 rounded">email</code>
                </td>
                <td className="py-2">email, email_verified</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">
                  <code className="bg-gray-200 px-1 rounded">phone</code>
                </td>
                <td className="py-2">phone_number, phone_number_verified</td>
              </tr>
              <tr>
                <td className="py-2">
                  <code className="bg-gray-200 px-1 rounded">school</code>
                </td>
                <td className="py-2">
                  role, school_id, school_name, department
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
