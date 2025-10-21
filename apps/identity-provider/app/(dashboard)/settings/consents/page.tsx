'use client';

import { useState, useEffect } from 'react';
import { Shield, Trash2, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface Consent {
  id: string;
  client_id: string;
  client_name: string;
  client_description: string;
  client_logo_url?: string;
  scopes: string[];
  granted_at: string;
  last_used_at?: string;
}

export default function ConsentsPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setError(null);
      const response = await fetch('/api/user/consents');
      if (!response.ok) {
        throw new Error('Failed to load consents');
      }
      const data = await response.json();
      setConsents(data);
    } catch (err) {
      console.error('Failed to load consents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load consents');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (consentId: string, clientName: string) => {
    if (
      !confirm(
        `Revoke access for "${clientName}"?\n\nYou will need to re-authorize if you use this application again.`
      )
    ) {
      return;
    }

    setRevoking(consentId);
    try {
      const response = await fetch(`/api/user/consents/${consentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke consent');
      }

      await loadConsents();
    } catch (err) {
      console.error('Failed to revoke consent:', err);
      alert(err instanceof Error ? err.message : 'Failed to revoke consent');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">App Permissions</h1>
          <p className="text-gray-600 mt-2">
            Manage applications that have access to your account
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">App Permissions</h1>
          <p className="text-gray-600 mt-2">
            Manage applications that have access to your account
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                Error Loading Permissions
              </h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
              <button
                onClick={loadConsents}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">App Permissions</h1>
        <p className="text-gray-600 mt-2">
          Manage applications that have access to your account
        </p>
      </div>

      {consents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No App Permissions
          </h3>
          <p className="text-gray-600">
            No applications currently have access to your account
          </p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <strong>Security Tip:</strong> Regularly review and revoke
                  access for applications you no longer use.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* App Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {consent.client_logo_url ? (
                        <img
                          src={consent.client_logo_url}
                          alt={consent.client_name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                          {consent.client_name[0].toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consent.client_name}
                        </h3>
                        {consent.client_description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {consent.client_description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Granted{' '}
                              {new Date(
                                consent.granted_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {consent.last_used_at && (
                            <span>
                              • Last used{' '}
                              {new Date(
                                consent.last_used_at
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Permissions:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {consent.scopes.map((scope) => (
                              <span
                                key={scope}
                                className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Revoke Button */}
                    <button
                      onClick={() =>
                        handleRevoke(consent.id, consent.client_name)
                      }
                      disabled={revoking === consent.id}
                      className="ml-4 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                    >
                      {revoking === consent.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Revoking...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Revoke
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
