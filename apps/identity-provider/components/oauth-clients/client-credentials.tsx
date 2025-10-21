'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface ClientCredentialsProps {
  clientId: string;
  clientSecret?: string;
  showSecret?: boolean;
  secretMessage?: string;
}

export function ClientCredentials({
  clientId,
  clientSecret,
  showSecret = false,
  secretMessage,
}: ClientCredentialsProps) {
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Client Credentials</h2>

      {/* Client ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client ID
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono border border-gray-200">
            {showClientId ? clientId : '••••••••••••••••••••••••••••••••'}
          </code>
          <button
            onClick={() => setShowClientId(!showClientId)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title={showClientId ? 'Hide Client ID' : 'Show Client ID'}
          >
            {showClientId ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {showClientId && (
            <button
              onClick={() => copyToClipboard(clientId, 'clientId')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Copy Client ID"
            >
              {copiedItem === 'clientId' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Client Secret */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Secret
        </label>
        {showSecret && clientSecret ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono border border-gray-200">
              {showClientSecret
                ? clientSecret
                : '••••••••••••••••••••••••••••••••'}
            </code>
            <button
              onClick={() => setShowClientSecret(!showClientSecret)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title={
                showClientSecret ? 'Hide Client Secret' : 'Show Client Secret'
              }
            >
              {showClientSecret ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {showClientSecret && (
              <button
                onClick={() => copyToClipboard(clientSecret, 'clientSecret')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Copy Client Secret"
              >
                {copiedItem === 'clientSecret' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono border border-gray-200 text-gray-400">
                ••••••••••••••••••••••••••••••••
              </code>
              <button
                className="p-2 text-gray-300 cursor-not-allowed rounded"
                disabled
                title="Secret cannot be retrieved"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
            {secretMessage && (
              <p className="mt-2 text-sm text-gray-500">{secretMessage}</p>
            )}
          </div>
        )}
      </div>

      {showSecret && clientSecret && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            <span>Important: Save Your Client Secret</span>
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>This is the only time the secret will be displayed</li>
            <li>Store it securely in your application</li>
            <li>If you lose it, you'll need to rotate the secret</li>
            <li>Never commit secrets to version control</li>
          </ul>
        </div>
      )}
    </div>
  );
}
