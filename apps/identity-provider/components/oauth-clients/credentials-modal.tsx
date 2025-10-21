'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  clientId: string;
  clientSecret: string;
  clientName: string;
}

export function CredentialsModal({
  isOpen,
  clientId,
  clientSecret,
  clientName,
}: CredentialsModalProps) {
  const router = useRouter();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    if (!confirmed) {
      if (
        !confirm(
          'Have you copied the Client Secret?\n\nYou will NOT be able to see it again!'
        )
      ) {
        return;
      }
    }
    router.push('/oauth-clients');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                ✅ OAuth Client Created!
              </h2>
              <p className="text-sm text-gray-600 mt-1">{clientName}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Warning Box */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    ⚠️ IMPORTANT: Save Your Client Secret Now!
                  </h3>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>
                      <strong>This is the ONLY time</strong> the secret will be
                      displayed
                    </li>
                    <li>
                      The secret is <strong>hashed in the database</strong> and
                      cannot be retrieved
                    </li>
                    <li>
                      If you lose it, you must use{' '}
                      <strong>"Rotate Secret"</strong> to generate a new one
                    </li>
                    <li>
                      <strong>Never commit</strong> secrets to version control
                      or share them publicly
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client ID
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-gray-100 px-4 py-3 rounded-lg font-mono border-2 border-gray-300 select-all">
                  {clientId}
                </code>
                <button
                  onClick={() => copyToClipboard(clientId, 'clientId')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  title="Copy Client ID"
                >
                  {copiedItem === 'clientId' ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Client Secret */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Secret{' '}
                <span className="text-red-600 font-bold">(COPY NOW!)</span>
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-yellow-50 px-4 py-3 rounded-lg font-mono border-2 border-yellow-300 select-all">
                  {clientSecret}
                </code>
                <button
                  onClick={() => copyToClipboard(clientSecret, 'clientSecret')}
                  className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 font-medium"
                  title="Copy Client Secret"
                >
                  {copiedItem === 'clientSecret' ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>I confirm that I have saved the Client Secret</strong>{' '}
                  in a secure location. I understand that I will not be able to
                  see it again after closing this window.
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {confirmed ? (
                <span className="text-green-600 font-medium">
                  ✓ You can now close this window
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  ⚠ Please confirm you've saved the secret
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                confirmed
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {confirmed ? 'Continue to Dashboard' : 'I Understand, Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
