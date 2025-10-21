'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ConsentRequest {
  client: {
    client_id: string;
    name: string;
    description: string;
    logo_url?: string;
  };
  scopes: string[];
  state?: string;
}

const scopeDescriptions: Record<
  string,
  { title: string; description: string }
> = {
  openid: {
    title: 'Verify your identity',
    description: 'Allows the app to verify who you are',
  },
  profile: {
    title: 'Access your profile',
    description: 'Includes your name, username, and profile picture',
  },
  email: {
    title: 'Access your email address',
    description: 'Read your email address',
  },
  phone: {
    title: 'Access your phone number',
    description: 'Read your phone number',
  },
  address: {
    title: 'Access your postal address',
    description: 'Read your full address',
  },
  offline_access: {
    title: 'Access your data while offline',
    description: "Keep access to your data even when you're not using the app",
  },
};

export default function ConsentPage() {
  const router = useRouter();
  const [consent, setConsent] = useState<ConsentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load consent request from session
    fetch('/api/consent/request')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load consent request');
        return res.json();
      })
      .then((data) => {
        setConsent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load consent request:', err);
        setError(err.message || 'Failed to load consent request');
        setLoading(false);
      });
  }, []);

  const handleAllow = async () => {
    if (!consent) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: consent.client.client_id,
          scopes: consent.scopes,
          approved: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to grant consent');
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('Failed to grant consent:', err);
      setError(err instanceof Error ? err.message : 'Failed to grant consent');
      setSubmitting(false);
    }
  };

  const handleDeny = async () => {
    if (!consent) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: consent.client.client_id,
          approved: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to deny consent');
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('Failed to deny consent:', err);
      setError(err instanceof Error ? err.message : 'Failed to deny consent');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading authorization request...</p>
        </div>
      </div>
    );
  }

  if (error || !consent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Invalid Request
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'No consent request found'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Authorization Request</h1>
          </div>
          <p className="text-blue-100">
            An application wants to access your account
          </p>
        </div>

        {/* App Info */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            {consent.client.logo_url ? (
              <img
                src={consent.client.logo_url}
                alt={consent.client.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                {consent.client.name[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {consent.client.name}
              </h2>
              {consent.client.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {consent.client.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            This app would like to:
          </h3>
          <div className="space-y-3">
            {consent.scopes.map((scope) => {
              const info = scopeDescriptions[scope] || {
                title: scope,
                description: `Access ${scope}`,
              };
              return (
                <div key={scope} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{info.title}</p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning */}
        <div className="px-6 pb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Only approve if you trust this
                  application. You can revoke access anytime from your account
                  settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={handleDeny}
            disabled={submitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Deny
          </button>
          <button
            onClick={handleAllow}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Allow'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
